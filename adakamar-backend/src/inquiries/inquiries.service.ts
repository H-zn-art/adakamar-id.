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

    const inquiry = await this.prisma.inquiry.create({
      data: {
        propertyId: dto.propertyId,
        guestName: dto.guestName,
        guestPhone: dto.guestPhone,
        guestEmail: dto.guestEmail,
        checkInDate: dto.checkInDate ? new Date(dto.checkInDate) : null,
        checkOutDate: dto.checkOutDate ? new Date(dto.checkOutDate) : null,
        guestCount: dto.guestCount || 2,
        notes: dto.notes,
        status: InquiryStatus.NEW,
      },
      include: {
        property: {
          select: { name: true, whatsappNumber: true, price: true, slug: true },
        },
      },
    });

    // Generate formatted WhatsApp URL for the guest (PRD Section 11 & 14)
    const cleanNumber = property.whatsappNumber.replace(/[^0-9]/g, '');
    const phone = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;

    // URL properti untuk referensi admin/pemilik
    const propertyUrl = `https://adakamar.id/homestay/${property.slug}`;

    const message = `Halo Pengelola ${property.name}, saya ${dto.guestName} ingin reservasi homestay melalui adakamar.id.\n\n` +
      `📋 Detail Pemesanan:\n` +
      `- Nama Tamu: ${dto.guestName}\n` +
      `- No. WA: ${dto.guestPhone}\n` +
      `- Check-in: ${dto.checkInDate || 'Fleksibel'}\n` +
      `- Check-out: ${dto.checkOutDate || 'Fleksibel'}\n` +
      `- Jumlah Tamu: ${dto.guestCount || 2} Orang\n` +
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

  async remove(id: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) {
      throw new NotFoundException('Inquiry tidak ditemukan.');
    }

    return this.prisma.inquiry.delete({ where: { id } });
  }
}
