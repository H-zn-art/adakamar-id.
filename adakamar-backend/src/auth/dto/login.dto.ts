import { IsEmail, IsNotEmpty, IsOptional, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '@prisma/client';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Peran tidak valid' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Peran tidak valid' })
  expectedRole?: UserRole;
}
