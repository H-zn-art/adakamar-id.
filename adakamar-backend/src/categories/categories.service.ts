import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAll() {
    return this.prisma.propertyCategory.findMany({
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.propertyCategory.findUnique({
      where: { slug },
      include: {
        properties: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Kategori '${slug}' tidak ditemukan.`);
    }

    return category;
  }

  async create(data: { name: string; icon?: string; description?: string }) {
    const slug = this.slugify(data.name);
    return this.prisma.propertyCategory.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  async update(id: string, data: { name?: string; icon?: string; description?: string }) {
    const category = await this.prisma.propertyCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan.');
    }
    const slug = data.name ? this.slugify(data.name) : category.slug;
    return this.prisma.propertyCategory.update({
      where: { id },
      data: { ...data, slug },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.propertyCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException('Kategori tidak ditemukan.');
    }
    return this.prisma.propertyCategory.delete({ where: { id } });
  }
}
