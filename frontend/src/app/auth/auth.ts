import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, MinLengthValidator, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [ReactiveFormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  isLoginMode = signal(true)
  form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl('', { validators: [Validators.minLength(6)] }),
  });

  onSubmit() {
    console.log(this.form);
    this.form.reset()
  }
  onSwitchMode(){
    this.isLoginMode.update((mode=>!mode));
    this.form.reset()
  }
}
