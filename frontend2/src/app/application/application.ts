import { Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { type ApplicationData  } from './applicationData.model';
import { DatePipe } from '@angular/common';
import { UserProfile } from "../shared/user-profile/user-profile";
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ApplicationService } from './application.service';

@Component({
  selector: 'app-application',
  imports: [
    MatCardModule,
    DatePipe,
    UserProfile,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatProgressBarModule
  ],
  templateUrl: './application.html',
  styleUrl: './application.css',
})
export class Application {
  constructor(private applicationService: ApplicationService){}
  app = input.required<ApplicationData>();
  approvalPercent = computed(()=>{
    const required = (this.app().type ==='TOMEMBER')? 2 : this.applicationService.adminCount
    if (required){
      return 100 * this.app().voted.length / required
    }
    return 100 * this.app().voted.length / 2;
  })
}
