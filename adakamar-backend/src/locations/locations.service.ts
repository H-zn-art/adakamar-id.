import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  /**
   * Generate slug unik — jika sudah ada, append counter (-2, -3, ...)
   */
  private async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const base = this.slugify(name);
    let slug = base;
    let counter = 2;

    while (true) {
      const existing = await this.prisma.locationArea.findUnique({
        where: { slug },
      });

      // Tidak ada duplikat, atau duplikat adalah data yang sedang diedit
      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${base}-${counter}`;
      counter++;
    }
  }

  async findAll() {
    return this.prisma.locationArea.findMany({
      include: {
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findBySlug(slug: string) {
    const location = await this.prisma.locationArea.findUnique({
      where: { slug },
      include: {
        properties: {
          include: {
            images: { take: 1 },
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Kawasan '${slug}' tidak ditemukan.`);
    }

    return location;
  }

  async create(data: {
    name: string;
    district?: string;
    description?: string;
    imageUrl?: string;
    latitude?: number;
    longitude?: number;
  }) {
    const slug = await this.generateUniqueSlug(data.name);

    try {
      return await this.prisma.locationArea.create({
        data: {
          name: data.name,
          slug,
          district: data.district,
          description: data.description,
          imageUrl: data.imageUrl,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Kawasan dengan nama serupa sudah ada. Coba nama yang berbeda.`);
      }
      throw err;
    }
  }

  async update(
    id: string,
    data: {
      name?: string;
      district?: string;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    const location = await this.prisma.locationArea.findUnique({ where: { id } });
    if (!location) {
      throw new NotFoundException('Lokasi tidak ditemukan.');
    }

    // Generate slug baru jika nama berubah, exclude ID yang sedang diedit
    const slug = data.name
      ? await this.generateUniqueSlug(data.name, id)
      : location.slug;

    try {
      return await this.prisma.locationArea.update({
        where: { id },
        data: {
          name: data.name ?? location.name,
          slug,
          district: data.district ?? location.district,
          description: data.description ?? location.description,
          imageUrl: data.imageUrl ?? location.imageUrl,
          latitude: data.latitude !== undefined ? data.latitude : location.latitude,
          longitude: data.longitude !== undefined ? data.longitude : location.longitude,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw new ConflictException(`Kawasan dengan nama serupa sudah ada.`);
      }
      throw err;
    }
  }

  async remove(id: string) {
    const location = await this.prisma.locationArea.findUnique({ where: { id } });
    if (!location) {
      throw new NotFoundException('Lokasi tidak ditemukan.');
    }
    return this.prisma.locationArea.delete({ where: { id } });
  }
}
