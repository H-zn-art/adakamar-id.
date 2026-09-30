import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PropertiesModule } from './properties/properties.module';
import { ArticlesModule } from './articles/articles.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { FacilitiesModule } from './facilities/facilities.module';
import { LocationsModule } from './locations/locations.module';
import { CategoriesModule } from './categories/categories.module';
import { PromosModule } from './promos/promos.module';
import { SettingsModule } from './settings/settings.module';
import { ArticleCategoriesModule } from './article-categories/article-categories.module';
import { ArticleTagsModule } from './article-tags/article-tags.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    ArticlesModule,
    InquiriesModule,
    FacilitiesModule,
    LocationsModule,
    CategoriesModule,
    PromosModule,
    SettingsModule,
    ArticleCategoriesModule,
    ArticleTagsModule,
  ],
})
export class AppModule {}
