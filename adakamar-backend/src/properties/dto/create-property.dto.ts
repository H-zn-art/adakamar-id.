import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum } from 'class-validator';
import { PropertyStatus } from '@prisma/client';

export class CreatePropertyDto {
  @IsNotEmpty({ message: 'Nama homestay wajib diisi' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Deskripsi homestay wajib diisi' })
  @IsString()
  description: string;

  @IsNotEmpty({ message: 'Harga per malam wajib diisi' })
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  originalPrice?: number;

  @IsNotEmpty({ message: 'Alamat lengkap wajib diisi' })
  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  locationId?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  bedroomCount?: number;

  @IsOptional()
  @IsNumber()
  bathroomCount?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsNotEmpty({ message: 'Nomor WhatsApp pengelola wajib diisi' })
  @IsString()
  whatsappNumber: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsArray()
  facilityIds?: string[];

  @IsOptional()
  @IsArray()
  imageUrls?: string[];

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsNumber()
  reviewCount?: number;
}
