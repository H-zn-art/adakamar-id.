import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  // Public: Ambil pengaturan umum (SEO, nama web, kontak)
  @Get()
  async getAll() {
    return this.settingsService.getAll();
  }

  // Admin: Ubah pengaturan website
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put()
  async updateMultiple(@Body() body: Record<string, string>) {
    return this.settingsService.updateMultiple(body);
  }
}
