import {
  ConflictException,
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { Permission, Prisma } from 'generated/prisma';
import { DatabaseService } from 'src/database/database.service';
import { UserEnterDto } from './dto/user-enter.dto';
import { sha256 } from 'src/helper';
import { AuthService } from 'src/auth/auth.service';

export interface AuthToken {
  userId: number;
  token: string;
  expirationDate: Date;
}

const forbiddenNames = ['approve/', '🦧', 'king', 'popo']

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private authService: AuthService,
  ) {}
  async signUp(userAuthDto: UserEnterDto) {
    if (
      null !==
      (await this.databaseService.user.findFirst({
        where: { username: userAuthDto.username },
      }))
    ) {
      console.log(
        await this.databaseService.user.findFirst({
          where: { username: userAuthDto.username },
        }),
      );
      throw new ConflictException('USERNAME_EXSITS');
    }
  
    for(let name of forbiddenNames.values()){
      if (userAuthDto.username.toLowerCase().includes(name)) {
        throw new NotAcceptableException('USERNAME_BAD')
      }
    }

    // create a DTO with hashed password
    const createUserDto: Prisma.UserCreateInput = {
      username: userAuthDto.username,
      password: await sha256(userAuthDto.password),
    };
    const ret = await this.databaseService.user.create({
      data: createUserDto,
    });
    return await this.authService.addToken(ret.id, ret.username, ret.permission);
  }

  async showUsers(permission?:Permission, noApplication:boolean=false) {
    const where:any = {};

    if (permission){
      where.permission=permission
    
    }
    if(noApplication){
      where.application={none:{status:'PENDING'}}
    }
    const users = await this.databaseService.user.findMany({where})
    
    let ret:string[] = []
    for( let i of users.values()){
      ret.push(i.username)
    }
    return ret;
  }

  async login(userAuthDto: UserEnterDto) {
    const passwordHash = await sha256(userAuthDto.password);
    const ret = await this.databaseService.user.findUnique({
      where: { username: userAuthDto.username, password: passwordHash },
    });
    if (ret === null) {
      // Error if no matching user
      throw new NotFoundException('INVALID_USER_CREDENTIAL');
    }
    return await this.authService.addToken(ret.id, ret.username, ret.permission);
  }
}
