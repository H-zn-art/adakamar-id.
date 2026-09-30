import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleCategoriesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAll() {
    return this.prisma.articleCategory.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.articleCategory.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori artikel '${slug}' tidak ditemukan.`);
    }

    return category;
  }

  async create(data: {
    name: string;
    icon?: string;
    colorAccent?: string;
    description?: string;
    showInNav?: boolean;
    showInFeatured?: boolean;
  }) {
    const slug = this.slugify(data.name);
    return this.prisma.articleCategory.create({
      data: {
        name: data.name,
        slug,
        icon: data.icon || 'explore',
        colorAccent: data.colorAccent || '#9f3c16',
        description: data.description,
        showInNav: data.showInNav ?? true,
        showInFeatured: data.showInFeatured ?? true,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      icon?: string;
      colorAccent?: string;
      description?: string;
      showInNav?: boolean;
      showInFeatured?: boolean;
    },
  ) {
    const category = await this.prisma.articleCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori artikel tidak ditemukan.');
    }
    const slug = data.name ? this.slugify(data.name) : category.slug;
    return this.prisma.articleCategory.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.articleCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori artikel tidak ditemukan.');
    }
    return this.prisma.articleCategory.delete({ where: { id } });
  }
}
