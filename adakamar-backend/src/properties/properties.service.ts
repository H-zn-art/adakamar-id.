import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { Prisma, PropertyStatus, InquiryStatus } from '@prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  async findAll(filters: FilterPropertyDto) {
    const {
      search,
      location,
      locationId,
      category,
      categoryId,
      minPrice,
      maxPrice,
      capacity,
      bedroomCount,
      facilityId,
      sortBy = 'rekomendasi',
      page = 1,
      limit = 12,
    } = filters;

    const where: Prisma.PropertyWhereInput = {
      status: PropertyStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    const locTarget = location || locationId;
    if (locTarget) {
      where.locationArea = {
        OR: [{ slug: locTarget }, { id: locTarget }],
      };
    }

    const catTarget = category || categoryId;
    if (catTarget) {
      where.category = {
        OR: [{ slug: catTarget }, { id: catTarget }],
      };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (capacity) {
      where.capacity = { gte: capacity };
    }

    if (bedroomCount) {
      where.bedroomCount = { gte: bedroomCount };
    }

    if (facilityId) {
      where.facilities = {
        some: { facilityId },
      };
    }

    // Sorting
    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
    if (sortBy === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sortBy === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'terbaru') {
      orderBy = { createdAt: 'desc' };
    } else {
      // Rekomendasi / Popular
      orderBy = { isPopular: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [total, properties] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          locationArea: true,
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          facilities: {
            include: { facility: true },
          },
          roomTypes: { orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }] },
        },
      }),
    ]);

    return {
      data: properties,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(query: { search?: string; page?: number; limit?: number }) {
    const { search, page = 1, limit = 100 } = query;
    const where: Prisma.PropertyWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
      ];
    }
    const skip = (page - 1) * limit;
    const [total, properties] = await Promise.all([
      this.prisma.property.count({ where }),
      this.prisma.property.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          locationArea: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          facilities: { include: { facility: true } },
          roomTypes: { orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }] },
        },
      }),
    ]);
    return { data: properties, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        locationArea: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        facilities: { include: { facility: true } },
        roomTypes: { orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }] },
        reviews: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }
    return property;
  }

  async findBySlug(slug: string) {
    const property = await this.prisma.property.findUnique({
      where: { slug },
      include: {
        locationArea: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        facilities: {
          include: { facility: true },
        },
        roomTypes: { orderBy: [{ sortOrder: 'asc' }, { pricePerNight: 'asc' }] },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!property) {
      throw new NotFoundException(`Penginapan dengan slug '${slug}' tidak ditemukan.`);
    }

    // Hitung ketersediaan unit aktif untuk tiap tipe kamar saat ini
    const activeInquiries = await this.prisma.inquiry.findMany({
      where: {
        propertyId: property.id,
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 3600 * 1000);

    const roomTypesWithAvailability = (property.roomTypes || []).map((rt) => {
      const matching = activeInquiries.filter((inq) => {
        const matchesRoom = inq.roomTypeId
          ? inq.roomTypeId === rt.id
          : Boolean(inq.roomTypeName && inq.roomTypeName.toLowerCase().trim() === rt.name.toLowerCase().trim());
        if (!matchesRoom) return false;

        if (inq.checkInDate && inq.checkOutDate) {
          const inqIn = new Date(inq.checkInDate);
          let inqOut = new Date(inq.checkOutDate);
          if (inqOut <= inqIn) inqOut = new Date(inqIn.getTime() + 24 * 3600 * 1000);
          return inqIn < tomorrow && inqOut > today;
        }

        if (!inq.checkInDate) {
          const diffHours = (Date.now() - new Date(inq.createdAt).getTime()) / (1000 * 3600);
          return diffHours <= 48;
        }
        return false;
      });

      const bookedCount = matching.length;
      const availableUnits = Math.max(0, rt.totalUnits - bookedCount);
      return {
        ...rt,
        bookedUnits: bookedCount,
        availableUnits,
        isAvailable: rt.isAvailable && availableUnits > 0,
      };
    });

    // Similar properties
    const similar = await this.prisma.property.findMany({
      where: {
        id: { not: property.id },
        status: PropertyStatus.ACTIVE,
        OR: [
          { locationId: property.locationId },
          { categoryId: property.categoryId },
        ],
      },
      take: 3,
      include: {
        locationArea: true,
        images: { take: 1 },
      },
    });

    return {
      property: {
        ...property,
        roomTypes: roomTypesWithAvailability,
      },
      similar,
    };
  }

  /**
   * Mengubah daftar ID atau nama fasilitas menjadi daftar facilityId yang valid di database.
   * Jika ada fasilitas yang belum ada di database (misal dari preset atau kustom),
   * otomatis dibuatkan record baru di tabel Facility agar relasi foreign key tidak gagal.
   */
  private async resolveFacilityIds(identifiers: string[]): Promise<string[]> {
    if (!identifiers || !Array.isArray(identifiers) || identifiers.length === 0) return [];

    const cleaned = identifiers
      .map((id) => (typeof id === 'string' ? id.trim() : ''))
      .filter((id) => Boolean(id));

    const uniqueIdentifiers = Array.from(new Set(cleaned));
    const resolvedIds: string[] = [];

    for (const item of uniqueIdentifiers) {
      // 1. Cek apakah item adalah ID fasilitas yang sudah terdaftar
      const byId = await this.prisma.facility.findUnique({ where: { id: item } });
      if (byId) {
        resolvedIds.push(byId.id);
        continue;
      }

      // 2. Cek apakah ada fasilitas dengan nama yang sama
      let byName = await this.prisma.facility.findFirst({
        where: { name: item },
      });
      if (!byName) {
        const allFacs = await this.prisma.facility.findMany();
        byName = allFacs.find((f) => f.name.toLowerCase().trim() === item.toLowerCase().trim()) || null;
      }
      if (byName) {
        resolvedIds.push(byName.id);
        continue;
      }

      // 3. Jika belum ada di tabel facilities, otomatis buat baru agar foreign key aman
      const newFacility = await this.prisma.facility.create({
        data: {
          name: item,
          category: 'Umum',
          icon: 'check_circle',
        },
      });
      resolvedIds.push(newFacility.id);
    }

    return Array.from(new Set(resolvedIds));
  }

  async create(dto: CreatePropertyDto) {
    const slug = this.slugify(dto.name);
    const existing = await this.prisma.property.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictException(`Homestay dengan nama '${dto.name}' sudah terdaftar.`);
    }

    const { facilityIds, imageUrls, ...data } = dto;
    const resolvedFacilityIds = facilityIds && Array.isArray(facilityIds)
      ? await this.resolveFacilityIds(facilityIds)
      : [];

    if (data.locationId === '') data.locationId = undefined;
    if (data.categoryId === '') data.categoryId = undefined;

    return this.prisma.property.create({
      data: {
        ...data,
        slug,
        status: data.status || PropertyStatus.ACTIVE,
        images: imageUrls
          ? {
              create: imageUrls.map((url, idx) => ({
                imageUrl: url,
                sortOrder: idx,
                isCover: idx === 0,
              })),
            }
          : undefined,
        facilities: resolvedFacilityIds.length > 0
          ? {
              create: resolvedFacilityIds.map((fId) => ({
                facilityId: fId,
              })),
            }
          : undefined,
      },
      include: {
        images: true,
        facilities: { include: { facility: true } },
      },
    });
  }

  async update(id: string, dto: Partial<CreatePropertyDto>) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }

    const { facilityIds, imageUrls, ...data } = dto;
    const slug = dto.name ? this.slugify(dto.name) : property.slug;

    if (data.locationId === '') data.locationId = undefined;
    if (data.categoryId === '') data.categoryId = undefined;

    if (imageUrls && Array.isArray(imageUrls)) {
      await this.prisma.propertyImage.deleteMany({ where: { propertyId: id } });
      if (imageUrls.length > 0) {
        await this.prisma.propertyImage.createMany({
          data: imageUrls.map((url, idx) => ({
            propertyId: id,
            imageUrl: url,
            sortOrder: idx,
            isCover: idx === 0,
          })),
        });
      }
    }

    if (facilityIds && Array.isArray(facilityIds)) {
      const resolvedFacilityIds = await this.resolveFacilityIds(facilityIds);
      await this.prisma.propertyFacility.deleteMany({ where: { propertyId: id } });
      if (resolvedFacilityIds.length > 0) {
        await this.prisma.propertyFacility.createMany({
          data: resolvedFacilityIds.map((fId) => ({
            propertyId: id,
            facilityId: fId,
          })),
        });
      }
    }

    return this.prisma.property.update({
      where: { id },
      data: {
        ...data,
        slug,
      },
      include: {
        images: true,
        facilities: { include: { facility: true } },
      },
    });
  }

  async remove(id: string) {
    const property = await this.prisma.property.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }

    return this.prisma.property.delete({ where: { id } });
  }

  generateWhatsAppUrl(
    property: { name: string; whatsappNumber: string; price: number },
    guest: { name: string; checkIn?: string; checkOut?: string; guestCount?: number },
  ) {
    const cleanNumber = property.whatsappNumber.replace(/[^0-9]/g, '');
    const phone = cleanNumber.startsWith('0') ? '62' + cleanNumber.substring(1) : cleanNumber;

    const message = `Halo Pengelola ${property.name}, saya ${guest.name || 'Tamu'} tertarik untuk memesan kamar di ${property.name} melalui adakamar.id.\n\n` +
      `Detail Rencana Menginap:\n` +
      `- Check-in: ${guest.checkIn || '-'}\n` +
      `- Check-out: ${guest.checkOut || '-'}\n` +
      `- Jumlah Tamu: ${guest.guestCount || 2} Orang\n\n` +
      `Apakah unit masih tersedia pada tanggal tersebut? Terima kasih.`;

    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
  }

  async createReview(idOrSlug: string, dto: { guestName: string; rating: number; comment: string }) {
    const property = await this.prisma.property.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }

    const ratingVal = Math.min(5, Math.max(1, Math.round(Number(dto.rating) || 5)));
    const guestName = dto.guestName?.trim() || 'Tamu adakamar.id';
    const comment = dto.comment?.trim() || 'Suasana dan pelayanan homestay sangat autentik dan nyaman.';

    const review = await this.prisma.review.create({
      data: {
        propertyId: property.id,
        guestName,
        rating: ratingVal,
        comment,
      },
    });

    // Recalculate average rating & reviewCount for this property
    const allReviews = await this.prisma.review.findMany({
      where: { propertyId: property.id },
    });
    const newCount = allReviews.length;
    const newAvg = Number(
      (allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1)
    );

    await this.prisma.property.update({
      where: { id: property.id },
      data: {
        rating: newAvg,
        reviewCount: newCount,
      },
    });

    return {
      review,
      newRating: newAvg,
      reviewCount: newCount,
    };
  }

  async getReviews(idOrSlug: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!property) {
      throw new NotFoundException('Penginapan tidak ditemukan.');
    }

    return this.prisma.review.findMany({
      where: { propertyId: property.id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
