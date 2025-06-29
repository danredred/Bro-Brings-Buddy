import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  providers: [AuthService],
  imports: [DatabaseModule],
  exports: [AuthService],
})
export class AuthModule {}
