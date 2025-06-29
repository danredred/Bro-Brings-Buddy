import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, Permissions } from 'src/auth/auth.guard';
import { ApplictionsService } from './applictions.service';

@Controller('applictions')
export class ApplictionsController {
  /*
    GET     /applictions -> all applictions (Admin)
    POST    /applictions/:username  -> add appliction to peasant (Member | Admin) | add appliction to member (Admin)
    DELETE  /applictions/:id  -> close appliction (Only Submmiter)
    GET     /applictions/about-me -> user applictions (Peasant | Member)
    POST    /applictions/approve/:id -> approve appliction (Admin)
    DELETE  /applictions/approve/:id -> delete own application approval (Admin)
    */

  constructor(private applictionService: ApplictionsService) {}

  @UseGuards(AuthGuard)
  @Permissions('ADMIN')
  @Get()
  getAllApplictions() {
    return this.applictionService.getAllApplictions();
  }

  @UseGuards(AuthGuard)
  @Permissions('ADMIN', 'MEMBER')
  @Post('/:username')
  addApliction(
    @Param('username') username: string,
    @Headers('token') token: string,
  ) {
    return this.applictionService.addAppliction(username, token);
  }

  @UseGuards(AuthGuard)
  @Permissions('ADMIN', 'MEMBER')
  @Delete('/:id')
  closeApliction(@Param('id') id: string, @Headers('token') token: string) {
    return this.applictionService.closeApplication(+id, token);
  }

  @UseGuards(AuthGuard)
  @Get('about-me')
  getUserPermission(@Headers('token') token: string) {
    return this.applictionService.getUserApplications(token);
  }

  @UseGuards(AuthGuard)
  @Permissions('ADMIN')
  @Post('approve/:id')
  approveApplication(
    @Param('id') applicationId: string,
    @Headers('token') token: string,
  ) {
    return this.applictionService.approve(+applicationId, token);
  }

  @UseGuards(AuthGuard)
  @Permissions('ADMIN')
  @Delete('approve/:id')
  deapproveApplication(
    @Param('id') applicationId: string,
    @Headers('token') token: string,
  ) {
    return this.applictionService.deapprove(+applicationId, token);
  }
}
