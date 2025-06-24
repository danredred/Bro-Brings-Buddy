import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  imports: [],
  template:'<div [style.background-color]="backgroundColor()">{{userLetter()}}</div>',
  //templateUrl: './user-profile.html',
  styleUrl: './user-profile.css',
})
export class UserProfile {
  username = input.required<string>();
  userLetter = computed(() => {
    if (!this.username()||!this.username().length) {
      // Avoid axcessing index in empty string
      return '🦧';
    }
    return this.username().charAt(0).toUpperCase();
  });

  backgroundColor = computed(() => {
    let hash = 0;
    for (let i = 0; i < this.username().length; i++) {
      hash = this.username().charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  });
}
