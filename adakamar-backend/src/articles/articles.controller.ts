import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ReviewArticleDto } from './dto/review-article.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ArticleStatus, UserRole } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  // Public Listing of Published Articles
  @Get()
  async findAllPublished(
    @Query('category') category?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.articlesService.findAllPublished({ category, tag, search, page: page ? +page : 1, limit: limit ? +limit : 9 });
  }

  // Penulis: Get My Articles
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async findMyArticles(
    @CurrentUser() user: any,
    @Query('status') status?: ArticleStatus,
  ) {
    return this.articlesService.findMyArticles(user.id, status);
  }

  // Admin: Get All Articles with Stats
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/all')
  async findAllForAdmin(
    @Query('status') status?: ArticleStatus,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.articlesService.findAllForAdmin({ status, search, page: page ? +page : 1, limit: limit ? +limit : 10 });
  }

  // Public Detail by Slug
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  // Penulis & Admin: Create Article
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() dto: CreateArticleDto,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.create(dto, user.id);
  }

  // Penulis & Admin: Edit Article
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateArticleDto>,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.update(id, dto, user);
  }

  // Penulis: Submit Article for Review
  @UseGuards(JwtAuthGuard)
  @Patch(':id/submit-review')
  async submitForReview(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.submitForReview(id, user);
  }

  // Admin: Review Article (Approve or Reject with Revision Notes)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id/review')
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewArticleDto,
  ) {
    return this.articlesService.review(id, dto);
  }

  // Delete Article
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.remove(id, user);
  }

  // Admin: Set related properties for an article (PRD Seksi 28 — Hubungan Artikel & Penginapan)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/properties')
  async setArticleProperties(
    @Param('id') id: string,
    @Body() body: { propertyIds: string[] },
  ) {
    return this.articlesService.setArticleProperties(id, body.propertyIds ?? []);
  }
}
