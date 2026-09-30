import { Module } from '@nestjs/common';
import { ArticleTagsService } from './article-tags.service';
import { ArticleTagsController } from './article-tags.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ArticleTagsController],
  providers: [ArticleTagsService],
  exports: [ArticleTagsService],
})
export class ArticleTagsModule {}
