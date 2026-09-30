import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('facilities')
export class FacilitiesController {
  constructor(private facilitiesService: FacilitiesService) {}

  @Get()
  async findAll() {
    return this.facilitiesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() body: { name: string; category?: string; icon?: string; description?: string }) {
    return this.facilitiesService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; category?: string; icon?: string; description?: string },
  ) {
    return this.facilitiesService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.facilitiesService.remove(id);
  }
}
