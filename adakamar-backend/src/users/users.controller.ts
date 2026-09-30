import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Post()
  async create(@Body() body: { name: string; email: string; password?: string; role?: UserRole; bio?: string; phone?: string }) {
    return this.usersService.createUser(body);
  }

  @Post('writers')
  async createWriter(@Body() body: { name: string; email: string; password?: string; bio?: string; phone?: string }) {
    return this.usersService.createWriter(body);
  }

  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() body: { name?: string; phone?: string; bio?: string },
  ) {
    return this.usersService.updateProfile(id, body);
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    return this.usersService.toggleActive(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}

