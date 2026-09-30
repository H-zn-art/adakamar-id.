import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('locations')
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get()
  async findAll() {
    return this.locationsService.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.locationsService.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      district?: string;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.locationsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      district?: string;
      description?: string;
      imageUrl?: string;
      latitude?: number;
      longitude?: number;
    },
  ) {
    return this.locationsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.locationsService.remove(id);
  }
}
