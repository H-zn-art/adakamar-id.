import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleTagsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAll() {
    return this.prisma.articleTag.findMany({
      include: {
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const tag = await this.prisma.articleTag.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            article: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag artikel '${slug}' tidak ditemukan.`);
    }

    return tag;
  }

  async create(data: {
    name: string;
    parentCategory?: string;
    colorAccent?: string;
    isTrending?: boolean;
  }) {
    const slug = this.slugify(data.name);
    return this.prisma.articleTag.create({
      data: {
        name: data.name,
        slug,
        parentCategory: data.parentCategory || 'Arsitektur & Budaya Jawa',
        colorAccent: data.colorAccent || '#9f3c16',
        isTrending: data.isTrending ?? false,
      },
    });
  }

  async update(
    id: string,
    data: {
      name?: string;
      parentCategory?: string;
      colorAccent?: string;
      isTrending?: boolean;
    },
  ) {
    const tag = await this.prisma.articleTag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag artikel tidak ditemukan.');
    }
    const slug = data.name ? this.slugify(data.name) : tag.slug;
    return this.prisma.articleTag.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
    });
  }

  async remove(id: string) {
    const tag = await this.prisma.articleTag.findUnique({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag artikel tidak ditemukan.');
    }
    return this.prisma.articleTag.delete({ where: { id } });
  }
}
