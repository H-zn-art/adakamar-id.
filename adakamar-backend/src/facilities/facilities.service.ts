import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FacilitiesService {
  constructor(private prisma: PrismaService) {}

  private getFacilityIcon(name: string): string {
    const n = (name || '').toLowerCase();
    if (n.includes('ac') || n.includes('air conditioner')) return 'ac_unit';
    if (n.includes('water heater') || n.includes('air panas')) return 'hot_tub';
    if (n.includes('kamar mandi')) return 'shower';
    if (n.includes('shower')) return 'shower';
    if (n.includes('kloset') || n.includes('bidet')) return 'wc';
    if (n.includes('wastafel')) return 'wash';
    if (n.includes('handuk')) return 'shower';
    if (n.includes('tv') || n.includes('smart tv')) return 'tv';
    if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet')) return 'wifi';
    if (n.includes('kolam') || n.includes('renang') || n.includes('pool')) return 'pool';
    if (n.includes('dapur') || n.includes('masak') || n.includes('kulkas')) return 'kitchen';
    if (n.includes('dispenser') || n.includes('minum')) return 'local_drink';
    if (n.includes('sarapan') || n.includes('makan')) return 'restaurant';
    if (n.includes('parkir') && n.includes('motor')) return 'two_wheeler';
    if (n.includes('parkir') || n.includes('mobil')) return 'local_parking';
    if (n.includes('pendopo') || n.includes('bale') || n.includes('gazebo')) return 'deck';
    if (n.includes('mesin cuci') || n.includes('cuci')) return 'local_laundry_service';
    if (n.includes('cctv') || n.includes('keamanan') || n.includes('security')) return 'security';
    if (n.includes('akses')) return 'lock_open';
    if (n.includes('sholat') || n.includes('mushola') || n.includes('masjid')) return 'mosque';
    if (n.includes('cermin') || n.includes('rias')) return 'face_retouching_natural';
    if (n.includes('kasur') || n.includes('bed') || n.includes('king') || n.includes('twin')) return 'bed';
    if (n.includes('meja') || n.includes('kerja')) return 'desk';
    if (n.includes('lemari')) return 'inventory_2';
    if (n.includes('kipas')) return 'mode_fan';
    if (n.includes('balkon') || n.includes('teras')) return 'balcony';
    if (n.includes('taman')) return 'yard';
    if (n.includes('bbq')) return 'outdoor_grill';
    return 'check_circle';
  }

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
        icon: data.icon || this.getFacilityIcon(data.name),
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
