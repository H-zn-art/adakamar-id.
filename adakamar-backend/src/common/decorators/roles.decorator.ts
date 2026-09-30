import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export type RoleType = UserRole | 'ADMIN' | 'PENULIS';
export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleType[]) => SetMetadata(ROLES_KEY, roles);
