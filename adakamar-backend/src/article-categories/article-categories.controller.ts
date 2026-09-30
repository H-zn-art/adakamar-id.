import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ArticleCategoriesService } from './article-categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('article-categories')
export class ArticleCategoriesController {
  constructor(private service: ArticleCategoriesService) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  async create(
    @Body()
    body: {
      name: string;
      icon?: string;
      colorAccent?: string;
      description?: string;
      showInNav?: boolean;
      showInFeatured?: boolean;
    },
  ) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      icon?: string;
      colorAccent?: string;
      description?: string;
      showInNav?: boolean;
      showInFeatured?: boolean;
    },
  ) {
    return this.service.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
