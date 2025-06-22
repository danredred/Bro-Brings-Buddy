import { Component, input } from '@angular/core';
import { UserProfile } from '../user-profile/user-profile';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-user',
  imports: [UserProfile,MatCardModule],
  templateUrl: './user.html',
  styleUrl: './user.css'
})
export class User {
  username = input.required<string>()
}
