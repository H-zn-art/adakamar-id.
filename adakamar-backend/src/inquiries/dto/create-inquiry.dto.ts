import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateInquiryDto {
  @IsNotEmpty({ message: 'ID Penginapan wajib diisi' })
  @IsString()
  propertyId: string;

  @IsNotEmpty({ message: 'Nama tamu wajib diisi' })
  @IsString()
  guestName: string;

  @IsNotEmpty({ message: 'Nomor WhatsApp tamu wajib diisi' })
  @IsString()
  guestPhone: string;

  @IsOptional()
  @IsString()
  guestEmail?: string;

  @IsOptional()
  checkInDate?: string;

  @IsOptional()
  checkOutDate?: string;

  @IsOptional()
  @IsNumber()
  guestCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
