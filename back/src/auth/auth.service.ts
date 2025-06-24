import { Header, Injectable, OnModuleDestroy } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { TokenDto } from './dto/token.dto';
import { Permission } from 'generated/prisma';

const tokenValidTime = 4 * 60 * 60; //4H valid time

async function sha256(message: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

function bytesToString(bytes: Uint8Array) {
  const array = Array.from(new Uint8Array(bytes));
  return array.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export interface AuthToken {
  userId: number;
  token: string;
  expirationDate: Date;
}

@Injectable()
export class AuthService implements OnModuleDestroy {
  private tokens: AuthToken[] = [];

  // clears
  private interval = setInterval(() => this.removeExpiredTokens(), 60 * 1000);

  constructor(private readonly databaseService: DatabaseService) {}

  onModuleDestroy() {
    this.interval.close();
  }

  private removeExpiredTokens() {
    let userIds: number[] = [];
    this.tokens = this.tokens.filter((token) => {
      if (
        token.expirationDate > new Date() &&
        !userIds.find((value) => value === token.userId)
      ) {
        userIds.push(token.userId);
        return true;
      }
      return false;
    });
  }

  async addToken(
    userId: number,
    username: string,
    permission: Permission,
  ): Promise<TokenDto> {
    const expirationDate = new Date(Date.now() + tokenValidTime * 1000);
    const token = bytesToString(
      await sha256(
        username + Date.now() + expirationDate.toDateString + userId,
      ),
    );
    this.tokens = this.tokens.filter((t) => t.userId !== userId);
    this.tokens.push({ token, expirationDate, userId }); // Add the token to the list
    console.log({ permission, token, expiresIn: tokenValidTime, username });
    return { permission, token, expiresIn: tokenValidTime, username };
  }

  async checkValidToken(token: string) {
    const id = this.tokens.find(
      (t) => t.token === token && t.expirationDate > new Date(),
    )?.userId;
    if (id === undefined) return false;
    return (
      (await this.databaseService.user.findUnique({ where: { id } })) !== null
    );
  }

  getUserId(token: string) {
    const p = this.tokens.find((t) => t.token == token);
    return this.tokens.find((t) => t.token == token)?.userId;
  }
}
