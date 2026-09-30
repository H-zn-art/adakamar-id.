import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email wajib diisi' })
  email: string;

  @IsNotEmpty({ message: 'Kata sandi wajib diisi' })
  @MinLength(6, { message: 'Kata sandi minimal 6 karakter' })
  password: string;
}
