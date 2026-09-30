import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.facility.findMany({
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(data: { name: string; category?: string; icon?: string; description?: string }) {
    return this.prisma.facility.create({
      data: {
        name: data.name,
        category: data.category || 'Umum',
        icon: data.icon || 'check_circle',
        description: data.description,
      },
    });
  }

  async update(id: string, data: { name?: string; category?: string; icon?: string; description?: string }) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException('Fasilitas tidak ditemukan.');
    }
    return this.prisma.facility.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    const facility = await this.prisma.facility.findUnique({ where: { id } });
    if (!facility) {
      throw new NotFoundException('Fasilitas tidak ditemukan.');
    }
    return this.prisma.facility.delete({ where: { id } });
  }
}
