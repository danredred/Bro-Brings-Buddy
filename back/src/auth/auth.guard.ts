import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Permission } from 'generated/prisma';

import { SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DatabaseService } from 'src/database/database.service';
export const Permissions = (...permissions: Permission[]) =>
  SetMetadata('permissions', permissions);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private reflector: Reflector,
    private readonly databaseService: DatabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const headers = context.switchToHttp().getRequest().headers;
    if (
      !headers.token ||
      !(await this.authService.checkValidToken(headers.token))
    ) {
      return false;
    }

    const permissions = this.reflector.get<Permission[]>(
      'permissions',
      context.getHandler(),
    );

    // if permissions not spesified then just need to be authed
    if (!permissions || !permissions.length) return true;

    const id = this.authService.getUserId(headers.token)!;
    const user = await this.databaseService.user.findUnique({ where: { id } });
    if (user === null) return false;
    return permissions.includes(user.permission);
  }
}
