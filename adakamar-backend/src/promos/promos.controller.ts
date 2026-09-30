import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { PromosService } from './promos.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('promos')
export class PromosController {
  constructor(private promosService: PromosService) {}

  // Public: List active promos
  @Get()
  async findActive() {
    return this.promosService.findActive();
  }

  // Public: Validate promo coupon code
  @Post('validate')
  async validateCode(@Body() body: { code: string; transactionAmount?: number; amount?: number; subtotal?: number }) {
    const amount = body.transactionAmount ?? body.amount ?? body.subtotal;
    return this.promosService.validateCode(body.code, amount);
  }

  // Public: Increment usedCount setelah kupon berhasil diterapkan pada inquiry tamu
  @Patch('use/:code')
  async usePromo(@Param('code') code: string) {
    return this.promosService.incrementUsage(code);
  }

  // Admin: List all promos
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async findAll() {
    return this.promosService.findAll();
  }

  // Admin: Create promo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() body: any) {
    return this.promosService.create(body);
  }

  // Admin: Update promo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.promosService.update(id, body);
  }

  // Admin: Delete promo
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.promosService.remove(id);
  }

  // Admin: Set penginapan terkait promo (PRD Seksi 13)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/properties')
  async setPromoProperties(
    @Param('id') id: string,
    @Body() body: { propertyIds: string[] },
  ) {
    return this.promosService.setPromoProperties(id, body.propertyIds ?? []);
  }
}
