import { Component, computed, input } from '@angular/core';
import { ApplicationData } from '../applicationData.model';
import { MatPaginatorModule } from '@angular/material/paginator';
import { Application } from '../application';


@Component({
  selector: 'app-applications-list',
  imports: [MatPaginatorModule, Application],
  templateUrl: './applications-list.html',
  styleUrl: './applications-list.css'
})
export class ApplicationsList {
  applications = input.required<ApplicationData[]>()
}
