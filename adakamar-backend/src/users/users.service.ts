import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole) {
    const where: any = {};
    if (role) where.role = role;

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: { articles: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createUser(data: { name: string; email: string; password?: string; role?: UserRole; bio?: string; phone?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new ConflictException('Email ini sudah terdaftar.');
    }

    const defaultPassword = data.password || 'adakamar123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role || UserRole.PENULIS,
        bio: data.bio,
        phone: data.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async createWriter(data: { name: string; email: string; password?: string; bio?: string; phone?: string }) {
    return this.createUser({ ...data, role: UserRole.PENULIS });
  }

  async toggleActive(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  }

  async updateProfile(id: string, data: { name?: string; phone?: string; bio?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: UserRole;
      isActive?: boolean;
      bio?: string;
      phone?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    if (data.email && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw new ConflictException('Email ini sudah digunakan oleh akun lain.');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.password && data.password.trim().length > 0) {
      updateData.password = await bcrypt.hash(data.password.trim(), 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bio: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Pengguna tidak ditemukan.');
    }

    return this.prisma.user.delete({ where: { id } });
  }
}
