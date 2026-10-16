import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { InquiryStatus } from '@prisma/client';

@Injectable()
export class InquiriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInquiryDto) {
    const property = await this.prisma.property.findUnique({
      where: { id: dto.propertyId },
    });

    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }

    let roomTypeId = dto.roomTypeId || null;
    if (!roomTypeId && dto.roomTypeName) {
      const allRooms = await this.prisma.roomType.findMany({
        where: { propertyId: dto.propertyId },
      });
      const matchRoom = allRooms.find(
        (r) => r.name.toLowerCase().trim() === dto.roomTypeName!.toLowerCase().trim()
      );
      if (matchRoom) roomTypeId = matchRoom.id;
    }

    let checkInDate = dto.checkInDate ? new Date(dto.checkInDate) : null;
    let checkOutDate = dto.checkOutDate ? new Date(dto.checkOutDate) : null;
    if (checkInDate && checkOutDate && checkOutDate <= checkInDate) {
      checkOutDate = new Date(checkInDate.getTime() + 24 * 3600 * 1000);
    }

    const inquiry = await this.prisma.inquiry.create({
      data: {
        propertyId: dto.propertyId,
        roomTypeId,
        roomTypeName: dto.roomTypeName || null,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestEmail: dto.guestEmail,
        checkInDate,
        checkOutDate,
        guestCount: dto.guestCount || 2,
        notes: dto.notes,
        status: InquiryStatus.NEW,
      },
      include: {
        property: {
          select: { name: true, whatsappNumber: true, price: true, slug: true },
        },
        roomType: {
          select: { id: true, name: true, totalUnits: true },
        },
      },
    });

    // Generate formatted WhatsApp URL for the guest (PRD Section 11 & 14)
    const rawNumber = property.whatsappNumber && property.whatsappNumber !== '6281234567890'
      ? property.whatsappNumber
      : '6285795445463';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');
    const phone = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;

    // URL properti untuk referensi admin/pemilik
    const frontendUrl = process.env.FRONTEND_URL || 'https://adakamar.id';
    const propertyUrl = `${frontendUrl.replace(/\/$/, '')}/homestay/${property.slug}`;

    const message = `Halo Pengelola ${property.name}, saya ${dto.guestName} ingin reservasi homestay melalui adakamar.id.\n\n` +
      `📋 Detail Pemesanan:\n` +
      `- Nama Tamu: ${dto.guestName}\n` +
      `- No. WA: ${dto.guestPhone}\n` +
      `- Check-in: ${dto.checkInDate || 'Fleksibel'}\n` +
      `- Check-out: ${dto.checkOutDate || 'Fleksibel'}\n` +
      `- Jumlah Tamu: ${dto.guestCount || 2} Orang\n` +
      (dto.roomTypeName ? `- Tipe Kamar: ${dto.roomTypeName}\n` : '') +
      (dto.notes ? `- Catatan: ${dto.notes}\n` : '') +
      `\n🏠 Penginapan yang Dipesan:\n${property.name}\n${propertyUrl}\n` +
      `\nMohon konfirmasi ketersediaan unit dan total biayanya. Matur nuwun.`;

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

    return {
      inquiry,
      whatsappUrl,
    };
  }

  async findAll(query: { status?: InquiryStatus; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 10 } = query;
    const where: any = {};

    if (status) where.status = status;
    if (search) {
      where.OR = [
        { guestName: { contains: search } },
        { guestPhone: { contains: search } },
        { property: { name: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [total, inquiries, newCount] = await Promise.all([
      this.prisma.inquiry.count({ where }),
      this.prisma.inquiry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          property: {
            select: { id: true, name: true, slug: true, whatsappNumber: true, price: true, originalPrice: true, address: true },
          },
          roomType: {
            select: { id: true, name: true, totalUnits: true },
          },
        },
      }),
      this.prisma.inquiry.count({ where: { status: InquiryStatus.NEW } }),
    ]);

    return {
      data: inquiries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        newInquiries: newCount,
      },
    };
  }

  async updateStatus(id: string, status: InquiryStatus) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry tidak ditemukan.');
    }

    return this.prisma.inquiry.update({
      where: { id },
      data: { status },
    });
  }

  async findByPhone(term: string) {
    if (!term || !term.trim()) {
      return { data: [] };
    }

    const trimmed = term.trim();

    // 1. Cek apakah input berupa KODE RESERVASI (misal: "INQ-MM4Z5T", "MM4Z5T", atau ID inquiry)
    const hasLetters = /[a-zA-Z]/.test(trimmed);
    const startsWithInq = trimmed.toUpperCase().startsWith('INQ');

    if (hasLetters || startsWithInq) {
      const cleanCode = trimmed.replace(/^INQ-?/i, '').trim();

      const orConditions: any[] = [
        { id: trimmed },
        { id: trimmed.toLowerCase() },
      ];

      if (cleanCode && cleanCode.length >= 4) {
        orConditions.push({ id: cleanCode });
        orConditions.push({ id: cleanCode.toLowerCase() });
        orConditions.push({ id: { endsWith: cleanCode.toLowerCase() } });
        orConditions.push({ id: { contains: cleanCode.toLowerCase() } });
      }

      const inquiriesByCode = await this.prisma.inquiry.findMany({
        where: {
          OR: orConditions,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          property: {
            select: { id: true, name: true, slug: true, whatsappNumber: true, price: true, address: true },
          },
          roomType: {
            select: { id: true, name: true },
          },
        },
      });

      if (inquiriesByCode.length > 0) {
        return { data: inquiriesByCode };
      }
    }

    // 2. Cek apakah input berupa NOMOR TELEPON (minimal 8 digit angka murni)
    const clean = trimmed.replace(/[^0-9]/g, '');
    if (clean.length >= 8) {
      const variants = [clean];
      if (clean.startsWith('0')) {
        variants.push('62' + clean.substring(1)); // 08xxx -> 628xxx
      } else if (clean.startsWith('62')) {
        variants.push('0' + clean.substring(2)); // 628xxx -> 08xxx
      }

      const inquiriesByPhone = await this.prisma.inquiry.findMany({
        where: {
          OR: variants.map((v) => ({ guestPhone: { contains: v } })),
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          property: {
            select: { id: true, name: true, slug: true, whatsappNumber: true, price: true, address: true },
          },
          roomType: {
            select: { id: true, name: true },
          },
        },
      });

      return { data: inquiriesByPhone };
    }

    return { data: [] };
  }

  async remove(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry tidak ditemukan.');
    }

    return this.prisma.inquiry.delete({ where: { id } });
  }

  // Public: ambil satu inquiry untuk halaman nota customer
  async findOnePublic(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        property: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
            whatsappNumber: true,
            price: true,
            originalPrice: true,
            images: { where: { isCover: true }, take: 1, select: { imageUrl: true } },
          },
        },
      },
    });

    if (!inquiry) {
      throw new NotFoundException('Nota tidak ditemukan.');
    }

    return inquiry;
  }
}
