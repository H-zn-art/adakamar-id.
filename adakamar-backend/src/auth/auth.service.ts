import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) return null;

    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi tidak cocok.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Akun ini telah dinonaktifkan oleh administrator.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existing) {
      throw new ConflictException('Email ini sudah terdaftar di sistem.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: registerDto.name,
        email: registerDto.email,
        password: hashedPassword,
        role: registerDto.role || UserRole.PENULIS,
        phone: registerDto.phone,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return {
      message: 'Registrasi berhasil',
      user,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    return user;
  }

  async updateProfile(
    userId: string,
    data: { name?: string; phone?: string; bio?: string; avatarUrl?: string; oldPassword?: string; newPassword?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;

    if (data.newPassword) {
      if (!data.oldPassword) {
        throw new UnauthorizedException('Kata sandi lama wajib diisi.');
      }
      const isMatch = await bcrypt.compare(data.oldPassword, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Kata sandi lama salah.');
      }
      updateData.password = await bcrypt.hash(data.newPassword, 10);
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        createdAt: true,
      },
    });

    return updated;
  }
}
