import { Module } from '@nestjs/common';
import { ApplictionsController } from './applictions.controller';
import { ApplictionsService } from './applictions.service';
import { AuthModule } from 'src/auth/auth.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  controllers: [ApplictionsController],
  providers: [ApplictionsService],
  imports: [AuthModule, DatabaseModule],
})
export class ApplictionsModule {}
