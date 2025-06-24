import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class UserEnterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(16)
  password: string;
}
