import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationType, Prisma } from 'generated/prisma';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';

const friendlyQueryReturnFormmating = {
  include: {
    approvingUsers: { select: { username: true } },
    submitterUser: { select: { username: true } },
    aboutUser: { select: { username: true } },
  },
  omit: { aboutUserId: true, submitterUserId: true },
};

@Injectable()
export class ApplictionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async getAllApplictions() {
    return await this.databaseService.application.findMany({
      ...friendlyQueryReturnFormmating,
    });
  }

  async addAppliction(targetUserName: string, token: string) {
    const aboutUser = await this.databaseService.user.findUnique({
      where: { username: targetUserName },
    });
    if (aboutUser === null) {
      throw new NotFoundException(
        'Target user is missing. Try to search for him',
      );
    } else if (
      // Check if user already have an application
      (
        await this.databaseService.application.findMany({
          where: { aboutUserId: aboutUser.id, status: 'PENDING' },
        })
      ).length !== 0
    ) {
      throw new ConflictException(
        'An pending application for this users already exists',
      );
    }
    const submitterUser = await this.getUser(token);

    if (
      aboutUser.permission === 'MEMBER' &&
      submitterUser.permission !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'You are too simple to understand the ways of upgrading a member',
      );
    } else if (aboutUser.permission === 'ADMIN') {
      throw new ConflictException('Only God can make a king👑');
    }
    const type: ApplicationType =
      aboutUser.permission === 'MEMBER' ? 'TOADMIN' : 'TOMEMBER';
    const application: Prisma.ApplicationCreateInput = {
      aboutUser: { connect: aboutUser },
      submitterUser: { connect: submitterUser },
      type: type,
    };
    if (submitterUser.permission === 'ADMIN') {
      application.approvingUsers = { connect: submitterUser };
    }
    // create in the DB
    return await this.databaseService.application.create({
      data: application,
      ...friendlyQueryReturnFormmating,
    });
  }

  async getUserApplications(token: string) {
    const id = this.authService.getUserId(token)!;
    return await this.databaseService.application.findMany({
      where: { OR: [{ aboutUserId: id }, { submitterUserId: id }] },
      ...friendlyQueryReturnFormmating,
    });
  }

  async approve(applicationId: number, token: string) {
    const app = await this.getUsersDataOfApplication(applicationId);
    const user = await this.getUser(token);
    if (app.approvingUsers.some((userA) => userA.id === user.id)) {
      throw new ConflictException('You already aproved this');
    }

    //update the application

    return await this.databaseService.application.update({
      where: { id: applicationId },
      data: { approvingUsers: { connect: { id: user.id } } },
      ...friendlyQueryReturnFormmating,
    });
  }

  async deapprove(applicationId: number, token: string) {
    const app = await this.getUsersDataOfApplication(applicationId);
    const user = await this.getUser(token);
    if (!app.approvingUsers.filter((userA) => userA.id === user.id).length) {
      throw new ConflictException("You didn't aprove");
    }

    return await this.databaseService.application.update({
      where: { id: applicationId },
      data: { approvingUsers: { disconnect: { id: user.id } } },
      ...friendlyQueryReturnFormmating,
    });
  }

  async checkAprovales(id: number): Promise<boolean> {
    const app = await this.databaseService.application.findUnique({
      where: { id },
      select: { approvingUsers: true, type: true, aboutUserId: true },
    });
    const totalAdminCount = await this.databaseService.user.count({
      where: { permission: 'ADMIN' },
    });
    if (app!.type === 'TOADMIN') {
      if (app!.approvingUsers.length !== totalAdminCount) {
        return false;
      }
      await this.databaseService.user.update({
        where: { id: app!.aboutUserId },
        data: { permission: 'ADMIN' },
      });
    } else {
      let needed = 2;
      if (totalAdminCount < 2) {
        needed = totalAdminCount;
      }

      if (app!.approvingUsers.length >= needed) {
        await this.databaseService.user.update({
          where: { id: app!.aboutUserId },
          data: { permission: 'MEMBER' },
        });
      } else {
        return false;
      }
    }
    await this.databaseService.application.update({
      where: { id },
      data: { status: 'APPROVED' },
    });
    return true;
  }

  private async getUser(token: string) {
    const userId = this.authService.getUserId(token)!;
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (user === null) {
      throw new NotFoundException('You are not existing');
    }
    return user;
  }

  private async getUsersDataOfApplication(applicationId: number) {
    const app = await this.databaseService.application.findUnique({
      where: { id: applicationId, status: 'PENDING' },
      select: { approvingUsers: true, submitterUserId: true },
    });
    if (null === app) {
      throw new NotFoundException('Did not found the application');
    }
    return app;
  }

  async closeApplication(applicationId: number, token: string) {
    const app = await this.getUsersDataOfApplication(applicationId);
    const user = await this.getUser(token);
    if (app.submitterUserId !== user.id) {
      throw new ConflictException('You are not the submitter');
    }
    return await this.databaseService.application.update({
      where: { id: applicationId },
      data: { status: 'CLOSED' },
      ...friendlyQueryReturnFormmating,
    });
  }

  async getApplication(applicationId: number) {
    const app = await this.databaseService.application.findUnique({
      where: { id: applicationId },
      ...friendlyQueryReturnFormmating,
    });
    if (null === app) {
      throw new NotFoundException('Did not found the application');
    }
    return app;
  }
}
