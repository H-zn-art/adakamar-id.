import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('properties/:propertyId/room-types')
export class RoomTypesController {
  constructor(private readonly roomTypesService: RoomTypesService) {}

  // Public: Daftar tipe kamar sebuah penginapan
  @Get()
  async findAll(
    @Param('propertyId') propertyId: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
  ) {
    return this.roomTypesService.findAll(propertyId, { checkIn, checkOut });
  }

  // Admin: Tambah tipe kamar baru
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Param('propertyId') propertyId: string, @Body() body: any) {
    return this.roomTypesService.create(propertyId, body);
  }

  // Admin: Update tipe kamar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.roomTypesService.update(id, body);
  }

  // Admin: Hapus tipe kamar
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomTypesService.remove(id);
  }
}
