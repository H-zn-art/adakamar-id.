import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PromosService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.promo.findMany({
      orderBy: { endDate: 'desc' },
    });
  }

  async findActive() {
    const now = new Date();
    return this.prisma.promo.findMany({
      where: {
        isActive: true,
        endDate: { gte: now },
      },
      orderBy: { endDate: 'asc' },
      // PRD Seksi 10: sertakan penginapan terkait
      include: {
        properties: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                images: { select: { imageUrl: true, sortOrder: true }, orderBy: { sortOrder: 'asc' }, take: 1 },
                locationArea: { select: { name: true } },
              },
            },
          },
        },
      },
    });
  }

  async validateCode(code: string, transactionAmount?: number) {
    const now = new Date();
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.isActive) {
      throw new BadRequestException('Kode kupon promo tidak valid atau telah berakhir.');
    }

    if (promo.endDate < now) {
      throw new BadRequestException('Kupon promo telah melewati masa berlaku.');
    }

    if (promo.usedCount >= promo.quota) {
      throw new BadRequestException('Kuota penggunaan kupon promo ini telah habis.');
    }

    if (transactionAmount && promo.minTransaction && transactionAmount < promo.minTransaction) {
      throw new BadRequestException(
        `Minimal transaksi untuk kupon ini adalah Rp ${promo.minTransaction.toLocaleString('id-ID')}.`,
      );
    }

    let discount = 0;
    if (transactionAmount) {
      if (promo.discountPercent) {
        discount = Math.round((transactionAmount * promo.discountPercent) / 100);
      } else if (promo.discountAmount) {
        discount = promo.discountAmount;
      }
    }

    return {
      valid: true,
      promo,
      calculatedDiscount: discount,
    };
  }

  async create(data: {
    code: string;
    title: string;
    description?: string;
    discountPercent?: number;
    discountAmount?: number;
    minTransaction?: number;
    quota?: number;
    startDate: string;
    endDate: string;
    terms?: string;
  }) {
    return this.prisma.promo.create({
      data: {
        ...data,
        code: data.code.toUpperCase(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
      },
    });
  }

  async update(id: string, data: any) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) {
      throw new NotFoundException('Promo tidak ditemukan.');
    }

    const payload: any = { ...data };
    if (data.code) payload.code = data.code.toUpperCase();
    if (data.startDate) payload.startDate = new Date(data.startDate);
    if (data.endDate) payload.endDate = new Date(data.endDate);

    return this.prisma.promo.update({
      where: { id },
      data: payload,
    });
  }

  async remove(id: string) {
    const promo = await this.prisma.promo.findUnique({ where: { id } });
    if (!promo) {
      throw new NotFoundException('Promo tidak ditemukan.');
    }
    return this.prisma.promo.delete({ where: { id } });
  }

  // PRD Seksi 13: Set penginapan terkait promo
  async setPromoProperties(promoId: string, propertyIds: string[]) {
    const promo = await this.prisma.promo.findUnique({ where: { id: promoId } });
    if (!promo) throw new NotFoundException('Promo tidak ditemukan.');

    // Replace all existing property relations
    await this.prisma.promoProperty.deleteMany({ where: { promoId } });

    if (propertyIds.length > 0) {
      await this.prisma.promoProperty.createMany({
        data: propertyIds.map((propertyId) => ({ promoId, propertyId })),
        skipDuplicates: true,
      });
    }

    return this.prisma.promo.findUnique({
      where: { id: promoId },
      include: {
        properties: {
          include: { property: { select: { id: true, name: true, slug: true } } },
        },
      },
    });
  }

  // Increment usedCount saat kupon berhasil digunakan oleh tamu
  async incrementUsage(code: string) {
    const promo = await this.prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) throw new NotFoundException('Kode kupon tidak ditemukan.');
    if (!promo.isActive) throw new BadRequestException('Kupon sudah tidak aktif.');
    if (promo.usedCount >= promo.quota) throw new BadRequestException('Kuota kupon telah habis.');

    return this.prisma.promo.update({
      where: { code: code.toUpperCase() },
      data: { usedCount: { increment: 1 } },
      select: {
        id: true,
        code: true,
        title: true,
        usedCount: true,
        quota: true,
      },
    });
  }
}
