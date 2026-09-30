import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ReviewArticleDto, ReviewAction } from './dto/review-article.dto';
import { ArticleStatus, Prisma, UserRole } from '@prisma/client';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  // Public Listing of Published Articles
  async findAllPublished(query: { category?: string; tag?: string; search?: string; page?: number; limit?: number }) {
    const { category, tag, search, page = 1, limit = 9 } = query;

    const where: Prisma.ArticleWhereInput = {
      status: ArticleStatus.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag },
        },
      };
    }

    const skip = (page - 1) * limit;

    const [total, articles] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        // Sort by publishedAt desc (newly published first), fallback to updatedAt
        orderBy: [
          { publishedAt: 'desc' },
          { updatedAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
          category: true,
          tags: { include: { tag: true } },
        },
      }),
    ]);

    return {
      data: articles,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Public Article Detail by Slug (PUBLISHED only) + Increment Views
  async findBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true, bio: true },
        },
        category: true,
        tags: { include: { tag: true } },
        // PRD Seksi 28: Sertakan penginapan terkait dalam artikel
        properties: {
          orderBy: { sortOrder: 'asc' },
          include: {
            property: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                originalPrice: true,
                rating: true,
                reviewCount: true,
                address: true,
                capacity: true,
                bedroomCount: true,
                bathroomCount: true,
                status: true,
                isFeatured: true,
                category: { select: { name: true, slug: true } },
                locationArea: { select: { name: true, slug: true } },
                images: {
                  where: { isCover: true },
                  take: 1,
                  select: { imageUrl: true },
                },
              },
            },
          },
        },
      },
    });

    if (!article) {
      throw new NotFoundException(`Artikel '${slug}' tidak ditemukan.`);
    }

    // Only PUBLISHED articles are accessible publicly
    if (article.status !== ArticleStatus.PUBLISHED) {
      throw new NotFoundException(`Artikel '${slug}' tidak ditemukan atau belum dipublikasikan.`);
    }

    // Increment views asynchronously
    this.prisma.article
      .update({
        where: { id: article.id },
        data: { views: { increment: 1 } },
      })
      .catch(() => {});

    // Related articles (PUBLISHED only, same category)
    const related = await this.prisma.article.findMany({
      where: {
        id: { not: article.id },
        status: ArticleStatus.PUBLISHED,
        categoryId: article.categoryId,
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
      include: {
        author: { select: { name: true } },
        category: true,
      },
    });

    // Flatten related properties for easier frontend consumption
    const relatedProperties = article.properties.map((ap) => ap.property);

    return {
      article: {
        ...article,
        relatedProperties, // flattened array for frontend
      },
      related,
    };
  }

  // Admin: Set related properties for an article (PRD Seksi 28)
  async setArticleProperties(articleId: string, propertyIds: string[]) {
    const article = await this.prisma.article.findUnique({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    // Replace all existing relations
    await this.prisma.articleProperty.deleteMany({ where: { articleId } });

    if (propertyIds.length > 0) {
      await this.prisma.articleProperty.createMany({
        data: propertyIds.map((propertyId, index) => ({
          articleId,
          propertyId,
          sortOrder: index,
        })),
        skipDuplicates: true,
      });
    }

    return this.prisma.article.findUnique({
      where: { id: articleId },
      include: {
        properties: {
          orderBy: { sortOrder: 'asc' },
          include: { property: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
  }

  // Penulis: Get My Articles
  async findMyArticles(authorId: string, status?: ArticleStatus) {
    const where: Prisma.ArticleWhereInput = { authorId };
    if (status) where.status = status;

    return this.prisma.article.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  // Admin: Get All Articles with Full Metrics
  async findAllForAdmin(query: { status?: ArticleStatus; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 10 } = query;
    const where: Prisma.ArticleWhereInput = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { name: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, articles, countDraft, countPending, countPublished, countRevision] = await Promise.all([
      this.prisma.article.count({ where }),
      this.prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        include: {
          author: { select: { id: true, name: true, email: true, avatarUrl: true } },
          category: true,
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.article.count({ where: { status: ArticleStatus.DRAFT } }),
      this.prisma.article.count({ where: { status: ArticleStatus.PENDING_REVIEW } }),
      this.prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
      this.prisma.article.count({ where: { status: ArticleStatus.REVISION_REQUIRED } }),
    ]);

    return {
      data: articles,
      stats: {
        total,
        draft: countDraft,
        pendingReview: countPending,
        published: countPublished,
        revisionRequired: countRevision,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Penulis / Admin: Create Article
  async create(dto: CreateArticleDto, authorId: string) {
    const slug = this.slugify(dto.title);
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Artikel dengan judul '${dto.title}' sudah ada.`);
    }

    const { tagIds, ...data } = dto;

    return this.prisma.article.create({
      data: {
        ...data,
        slug,
        authorId,
        status: ArticleStatus.DRAFT,
        tags: tagIds
          ? {
              create: tagIds.map((tId) => ({ tagId: tId })),
            }
          : undefined,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  // Edit Article (Owner Penulis or Admin)
  async update(id: string, dto: Partial<CreateArticleDto>, user: { id: string; role: UserRole }) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    // PRD Boundary: Penulis can only edit own articles
    if (user.role === UserRole.PENULIS && article.authorId !== user.id) {
      throw new ForbiddenException('Anda tidak diizinkan menyunting naskah milik penulis lain.');
    }

    // PRD Boundary: Penulis cannot edit article if it's currently PENDING_REVIEW
    if (user.role === UserRole.PENULIS && article.status === ArticleStatus.PENDING_REVIEW) {
      throw new ForbiddenException(
        'Naskah sedang dalam antrean tinjauan redaksi. Anda tidak dapat mengubah naskah sebelum direview atau dikembalikan oleh Admin.',
      );
    }

    const { tagIds, ...data } = dto;
    const slug = dto.title ? this.slugify(dto.title) : article.slug;

    if (tagIds !== undefined) {
      await this.prisma.articleTagPivot.deleteMany({ where: { articleId: id } });
      if (tagIds.length > 0) {
        await this.prisma.articleTagPivot.createMany({
          data: tagIds.map((tagId) => ({ articleId: id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    return this.prisma.article.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  // Penulis: Submit Article for Review
  async submitForReview(id: string, user: { id: string; role: UserRole }) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    if (user.role === UserRole.PENULIS && article.authorId !== user.id) {
      throw new ForbiddenException('Anda hanya dapat mengajukan naskah milik Anda sendiri.');
    }

    return this.prisma.article.update({
      where: { id },
      data: { status: ArticleStatus.PENDING_REVIEW },
    });
  }

  // Admin: Review Article (Approve or Request Revision)
  async review(id: string, dto: ReviewArticleDto) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    const isApprove =
      dto.action === ReviewAction.APPROVE ||
      dto.status === ArticleStatus.PUBLISHED ||
      dto.status === 'PUBLISHED' ||
      dto.status === 'APPROVE';

    if (isApprove) {
      return this.prisma.article.update({
        where: { id },
        data: {
          status: ArticleStatus.PUBLISHED,
          publishedAt: new Date(),
          revisionNotes: null,
        },
      });
    } else {
      return this.prisma.article.update({
        where: { id },
        data: {
          status: ArticleStatus.REVISION_REQUIRED,
          revisionNotes: dto.revisionNotes || 'Mohon perbaiki naskah sesuai panduan editorial Jogja.',
        },
      });
    }
  }

  // Delete Article (Admin or Author if Draft)
  async remove(id: string, user: { id: string; role: UserRole }) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new NotFoundException('Artikel tidak ditemukan.');
    }

    if (user.role === UserRole.PENULIS && article.authorId !== user.id) {
      throw new ForbiddenException('Anda tidak memiliki izin menghapus naskah ini.');
    }

    return this.prisma.article.delete({ where: { id } });
  }
}
