import { Module } from '@nestjs/common';
import { RoomTypesController } from './room-types.controller';
import { RoomTypesService } from './room-types.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RoomTypesController],
  providers: [RoomTypesService],
  exports: [RoomTypesService],
})
export class RoomTypesModule {}
