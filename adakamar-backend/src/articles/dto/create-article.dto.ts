import { IsNotEmpty, IsString, IsOptional, IsArray } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: 'Judul artikel wajib diisi' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Konten artikel wajib diisi' })
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsNotEmpty({ message: 'Thumbnail foto wajib diisi' })
  @IsString()
  thumbnailUrl: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsArray()
  tagIds?: string[];

  @IsOptional()
  @IsString()
  seoTitle?: string;

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  readingTime?: string;
}
