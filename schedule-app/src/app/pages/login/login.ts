// login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth} from '../../services/auth';  

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  loading = false;

  loginForm: FormGroup = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;

    this.auth.login(this.loginForm.value).subscribe({
      next: (response: any) => {
       
        console.log('Login successful, token saved!');

       const role = this.auth.getUserRole(); 

        if (role === 'Admin') {
           this.router.navigate(['/admin']);  
         } else if (role === 'Worker') {
         this.router.navigate(['/worker']); 
        } else {
      
      this.router.navigate(['/']); 
    }
      },
      error: (err) => {
        this.loading = false;
        alert('Login failed: ' + (err.error?.message || 'Invalid credentials'));
      },
      complete: () => this.loading = false
    });
  }
}