import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { InquiryStatus, UserRole } from '@prisma/client';

@Controller('inquiries')
export class InquiriesController {
  constructor(private inquiriesService: InquiriesService) {}

  // Public: Tamu submit inquiry & dapatkan link WhatsApp terformat
  @Post()
  async create(@Body() dto: CreateInquiryDto) {
    return this.inquiriesService.create(dto);
  }

  // Public: Tamu tracking reservasi berdasarkan kode reservasi atau nomor telepon (tanpa login)
  @Get('track')
  async trackByPhone(
    @Query('phone') phone?: string,
    @Query('query') query?: string,
    @Query('code') code?: string,
  ) {
    const term = query || code || phone || '';
    return this.inquiriesService.findByPhone(term);
  }

  // Public: Melihat nota reservasi berdasarkan ID (untuk customer)
  @Get('nota/:id')
  async getNotaPublic(@Param('id') id: string) {
    return this.inquiriesService.findOnePublic(id);
  }

  // Admin: Melihat daftar inquiry tamu
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  async findAll(
    @Query('status') status?: InquiryStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.inquiriesService.findAll({ status, search, page: page ? +page : 1, limit: limit ? +limit : 10 });
  }

  // Admin: Update status inquiry
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: InquiryStatus,
  ) {
    return this.inquiriesService.updateStatus(id, status);
  }

  // Admin: Delete inquiry
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.inquiriesService.remove(id);
  }
}
