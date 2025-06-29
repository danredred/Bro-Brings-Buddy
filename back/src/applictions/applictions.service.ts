import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationType, Prisma, Status } from 'generated/prisma';
import { AuthService } from 'src/auth/auth.service';
import { DatabaseService } from 'src/database/database.service';

export interface ApplicationReturnData {
  id: number;
  submitter: string;
  approvers: string[];
  type: ApplicationType;
  status: Status;
  about: string;
  created: Date;
}

function formatForReturn(data): ApplicationReturnData {
  return {
    id: data.id,
    submitter: data.submitterUser.username,
    approvers: data.approvingUsers.map((user) => user.username),
    type: data.type,
    status: data.status,
    about: data.aboutUser.username,
    created: data.createdDate,
  };
}

@Injectable()
export class ApplictionsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly authService: AuthService,
  ) {}

  async getAllApplictions() {
    const applictions = await this.databaseService.application.findMany({
      include: {
        aboutUser: true,
        approvingUsers: true,
        submitterUser: true,
      },
    });
    // create a return compatable array
    const ret: ApplicationReturnData[] = [];
    for (const app of applictions.values()) {
      ret.push(formatForReturn(app));
    }
    return ret;
  }

  async addAppliction(targetUserName, token) {
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
    const app = await this.databaseService.application.create({
      data: application,
      include: {
        aboutUser: true,
        approvingUsers: true,
        submitterUser: true,
      },
    });
    return formatForReturn(app);
  }

  async getUserApplications(token: string) {
    const id = this.authService.getUserId(token)!;
    const applications = await this.databaseService.application.findMany({
      where: { OR: [{ aboutUserId: id }, { submitterUserId: id }] },
      include: {
        aboutUser: true,
        approvingUsers: true,
        submitterUser: true,
      },
    });
    // create a return compatable array
    const ret: ApplicationReturnData[] = [];
    for (const app of applications.values()) {
      ret.push(formatForReturn(app));
    }
    return ret;
  }

  async approve(applicationId: number, token: string) {
    const app = await this.getApplication(applicationId);
    const user = await this.getUser(token);
    if (app.approvingUsers.some((userA) => userA.id === user.id)) {
      throw new ConflictException('You already aproved this');
    }

    //update the application
    await this.databaseService.application.update({
      where: { id: applicationId },
      data: { approvingUsers: { connect: { id: user.id } } },
    });

    // call the checking function
    await this.checkAprovales(applicationId);
    return formatForReturn(
      await this.databaseService.application.findUnique({
        where: { id: applicationId },
        include: {
          aboutUser: true,
          approvingUsers: true,
          submitterUser: true,
        },
      }),
    );
  }

  async deapprove(applicationId: number, token: string) {
    const app = await this.getApplication(applicationId);
    const user = await this.getUser(token);
    if (!app.approvingUsers.filter((userA) => userA.id === user.id).length) {
      throw new ConflictException("You didn't aprove");
    }

    return formatForReturn(
      await this.databaseService.application.update({
        where: { id: applicationId },
        data: { approvingUsers: { disconnect: { id: user.id } } },
        include: {
          aboutUser: true,
          approvingUsers: true,
          submitterUser: true,
        },
      }),
    );
  }

  private async checkAprovales(id: number) {
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

  private async getApplication(applicationId: number) {
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
    const app = await this.getApplication(applicationId);
    const user = await this.getUser(token);
    if (app.submitterUserId !== user.id) {
      throw new ConflictException('You are not the submitter');
    }

    return formatForReturn(
      await this.databaseService.application.update({
        where: { id: applicationId },
        data: { status: 'CLOSED' },
        include: {
          aboutUser: true,
          approvingUsers: true,
          submitterUser: true,
        },
      }),
    );
  }
}
