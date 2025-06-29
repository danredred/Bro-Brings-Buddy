import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEnterDto } from './dto/user-enter.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Permission } from 'generated/prisma';

@Controller('users')
export class UsersController {
  /*
    GET   /users            -> return all users
    GET   /users?permission&noapplication -> return all users with permission
    POST  /users/signup     -> try to add a user and return auth token
    POST  /users/login      -> return auth token
    */

  constructor(private usersService: UsersService) {}
  @UseGuards(AuthGuard)
  @Get()
  showUsers(
    @Headers() header,
    @Query('permission') permission?: Permission,
    @Query('noapplication') noApplication: boolean = false,
  ) {
    return this.usersService.showUsers(permission, noApplication);
  }
  @Post('signup')
  signup(@Body(ValidationPipe) signUpDto: UserEnterDto) {
    return this.usersService.signUp(signUpDto);
  }
  @Post('login')
  login(@Body(ValidationPipe) signUpDto: UserEnterDto) {
    return this.usersService.login(signUpDto);
  }
}
