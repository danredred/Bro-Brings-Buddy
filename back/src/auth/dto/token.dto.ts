import { Permission } from 'generated/prisma';

export interface TokenDto {
  token: string;
  expiresIn: number;
  username: string;
  permission: Permission;
}
