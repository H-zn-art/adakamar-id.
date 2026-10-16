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

    // Ambil seluruh inquiry aktif untuk properti ini (status: NEW, CONTACTED, IN_PROGRESS)
    const activeInquiries = await this.prisma.inquiry.findMany({
      where: {
        propertyId,
        status: { in: [InquiryStatus.NEW, InquiryStatus.CONTACTED, InquiryStatus.IN_PROGRESS] },
      },
      select: {
        id: true,
        roomTypeId: true,
        roomTypeName: true,
        checkInDate: true,
        checkOutDate: true,
        createdAt: true,
      },
    });

    let qIn: Date | null = null;
    let qOut: Date | null = null;

    if (query?.checkIn && query?.checkOut) {
      try {
        qIn = new Date(query.checkIn);
        qOut = new Date(query.checkOut);
        if (qOut <= qIn) {
          qOut = new Date(qIn.getTime() + 24 * 3600 * 1000);
        }
      } catch {
        qIn = null;
        qOut = null;
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);

    return roomTypes.map((rt) => {
      const matchingInquiries = activeInquiries.filter((inq) => {
        // Cocokkan ID tipe kamar, atau fallback nama jika ID belum tersimpan
        const matchesRoom = inq.roomTypeId
          ? inq.roomTypeId === rt.id
          : Boolean(inq.roomTypeName && inq.roomTypeName.toLowerCase().trim() === rt.name.toLowerCase().trim());

        if (!matchesRoom) return false;

        // Jika user memilih tanggal check-in dan check-out
        if (qIn && qOut) {
          if (inq.checkInDate && inq.checkOutDate) {
            const inqIn = new Date(inq.checkInDate);
            let inqOut = new Date(inq.checkOutDate);
            if (inqOut <= inqIn) {
              inqOut = new Date(inqIn.getTime() + 24 * 3600 * 1000);
            }
            // Overlap rentang tanggal
            return inqIn < qOut && inqOut > qIn;
          }
          // Jika inquiry fleksibel / tanpa tanggal, pertahankan pemotongan unit selama 48 jam pertama
          if (!inq.checkInDate) {
            const diffHours = (Date.now() - new Date(inq.createdAt).getTime()) / (1000 * 3600);
            return diffHours <= 48;
          }
          return false;
        }

        // Jika user belum memilih tanggal (tampilan umum ketersediaan saat ini / hari ini)
        if (inq.checkInDate && inq.checkOutDate) {
          const inqIn = new Date(inq.checkInDate);
          let inqOut = new Date(inq.checkOutDate);
          if (inqOut <= inqIn) {
            inqOut = new Date(inqIn.getTime() + 24 * 3600 * 1000);
          }
          return inqIn < tomorrow && inqOut > today;
        }

        if (!inq.checkInDate) {
          const diffHours = (Date.now() - new Date(inq.createdAt).getTime()) / (1000 * 3600);
          return diffHours <= 48;
        }

        return false;
      });

      const bookedCount = matchingInquiries.length;
      const availableUnits = Math.max(0, rt.totalUnits - bookedCount);

      return {
        ...rt,
        bookedUnits: bookedCount,
        availableUnits,
        isAvailable: rt.isAvailable && availableUnits > 0,
      };
    });
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
