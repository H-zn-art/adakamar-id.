import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InquiryStatus } from '@prisma/client';

@Injectable()
export class RoomTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(propertyId: string, query?: { checkIn?: string; checkOut?: string }) {
    const roomTypes = await this.prisma.roomType.findMany({
      where: { propertyId },
      orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }],
    });

    if (query?.checkIn && query?.checkOut) {
      try {
        const checkInDate = new Date(query.checkIn);
        const checkOutDate = new Date(query.checkOut);

        const results = await Promise.all(
          roomTypes.map(async (rt) => {
            const bookedCount = await this.prisma.inquiry.count({
              where: {
                roomTypeId: rt.id,
                status: { in: [InquiryStatus.CONTACTED, InquiryStatus.IN_PROGRESS] },
                checkInDate: { lt: checkOutDate },
                checkOutDate: { gt: checkInDate },
              },
            });
            const availableUnits = Math.max(0, rt.totalUnits - bookedCount);
            return {
              ...rt,
              bookedUnits: bookedCount,
              availableUnits,
              isAvailable: rt.isAvailable && availableUnits > 0,
            };
          })
        );
        return results;
      } catch {
        // Fallback to normal listing
      }
    }

    return roomTypes.map((rt) => ({
      ...rt,
      bookedUnits: 0,
      availableUnits: rt.isAvailable ? rt.totalUnits : 0,
    }));
  }

  async create(propertyId: string, data: any) {
    const { name, description, capacity, totalUnits, pricePerNight, facilities, isAvailable, sortOrder, imageUrls } = data;
    return this.prisma.roomType.create({
      data: {
        propertyId,
        name,
        description: description || null,
        capacity: capacity ? +capacity : 2,
        totalUnits: totalUnits ? Math.max(1, +totalUnits) : 1,
        pricePerNight: +pricePerNight,
        facilities: facilities || null,
        isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
        sortOrder: sortOrder ? +sortOrder : 0,
        imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      },
    });
  }

  async update(id: string, data: any) {
    const existing = await this.prisma.roomType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipe kamar tidak ditemukan.');

    const { name, description, capacity, totalUnits, pricePerNight, facilities, isAvailable, sortOrder, imageUrls } = data;
    return this.prisma.roomType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(capacity !== undefined && { capacity: +capacity }),
        ...(totalUnits !== undefined && { totalUnits: Math.max(1, +totalUnits) }),
        ...(pricePerNight !== undefined && { pricePerNight: +pricePerNight }),
        ...(facilities !== undefined && { facilities }),
        ...(isAvailable !== undefined && { isAvailable: Boolean(isAvailable) }),
        ...(sortOrder !== undefined && { sortOrder: +sortOrder }),
        ...(imageUrls !== undefined && { imageUrls: Array.isArray(imageUrls) ? imageUrls : [] }),
      },
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.roomType.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Tipe kamar tidak ditemukan.');
    return this.prisma.roomType.delete({ where: { id } });
  }

  // Ambil harga terendah dari semua tipe kamar suatu property
  async getMinPrice(propertyId: string): Promise<number | null> {
    const result = await this.prisma.roomType.aggregate({
      where: { propertyId, isAvailable: true },
      _min: { pricePerNight: true },
    });
    return result._min.pricePerNight ?? null;
  }
}
