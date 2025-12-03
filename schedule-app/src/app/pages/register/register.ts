import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';


import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; 
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Auth} from '../../services/auth';  
import { RegisterRequest } from '../../models/auth-models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  
  private fb = inject(FormBuilder);
  private authService = inject(Auth); 
  private router = inject(Router);

  // Updated to match your HTML fields
  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', Validators.required],
    birthDate: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
   
    return password && confirm && password === confirm ? null : { passwordMismatch: true };
  }
   
  onSubmit() {
    if (this.registerForm.invalid) return;

    // Prepare data (exclude confirmPassword)
    const requestData: RegisterRequest = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      email: this.registerForm.value.email,
      gender: this.registerForm.value.gender,
      birthDate: this.registerForm.value.birthDate,
      password: this.registerForm.value.password,
      confirmPassword:this.registerForm.value.confirmPassword
    };

    this.authService.register(requestData).subscribe({
      next: (response) => {
        console.log('Register Successful', response);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        alert('Register failed. Please try again.');
      }
    });
  }
}