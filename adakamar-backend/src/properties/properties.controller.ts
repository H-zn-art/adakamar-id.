import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { FilterPropertyDto } from './dto/filter-property.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('properties')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  // Public Search & Listing (only ACTIVE)
  @Get()
  async findAll(@Query() filters: FilterPropertyDto) {
    return this.propertiesService.findAll(filters);
  }

  // Admin List All Properties (all statuses)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async findAllAdmin(
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.propertiesService.findAllAdmin({ search, page: page ? +page : 1, limit: limit ? +limit : 100 });
  }

  // Admin Get Property Detail by ID
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/detail/:id')
  async findByIdAdmin(@Param('id') id: string) {
    return this.propertiesService.findById(id);
  }

  // Public Detail
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.propertiesService.findBySlug(slug);
  }

  // Admin Create Property
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(dto);
  }

  // Admin Update Property
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: Partial<CreatePropertyDto>) {
    return this.propertiesService.update(id, dto);
  }

  // Admin Delete Property
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.propertiesService.remove(id);
  }

  // Generate WhatsApp Message URL (Public)
  @Post(':slug/whatsapp-url')
  async generateWhatsApp(
    @Param('slug') slug: string,
    @Body() body: { guestName: string; checkIn?: string; checkOut?: string; guestCount?: number },
  ) {
    const { property } = await this.propertiesService.findBySlug(slug);
    const url = this.propertiesService.generateWhatsAppUrl(property, {
      name: body.guestName,
      checkIn: body.checkIn,
      checkOut: body.checkOut,
      guestCount: body.guestCount,
    });
    return { url };
  }

  // Public: Get Reviews for a Property
  @Get(':idOrSlug/reviews')
  async getReviews(@Param('idOrSlug') idOrSlug: string) {
    return this.propertiesService.getReviews(idOrSlug);
  }

  // Public: Submit Review for a Property
  @Post(':idOrSlug/reviews')
  async createReview(
    @Param('idOrSlug') idOrSlug: string,
    @Body() body: { guestName: string; rating: number; comment: string },
  ) {
    return this.propertiesService.createReview(idOrSlug, body);
  }
}
