import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApplicationData } from './application/applicationData.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  p:ApplicationData = {
    id: 123,
    submitter: 'Boboa',
    approvers: ['Meny'],
    type: 'TOMEMBER',
    closed: false,
    about: 'Dog',
    created: new Date()
  };
  protected title = 'frontend';
}
