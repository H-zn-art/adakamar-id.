import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty({ message: 'Nama lengkap wajib diisi' })
  @IsString()
  name: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Peran harus ADMIN atau PENULIS' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  phone?: string;
}
