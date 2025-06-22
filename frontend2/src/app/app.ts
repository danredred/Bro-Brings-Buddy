import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Application } from "./application/application";
import { ApplicationData } from './application/applicationData.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Application],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  p:ApplicationData = {
    id: 123,
    submitter: 'Boboa',
    voted: ['Meny'],
    type: 'TOMEMBER',
    closed: false,
    about: 'Dog',
    created: new Date()
  };
  protected title = 'frontend';
}
