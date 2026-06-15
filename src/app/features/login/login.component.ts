import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="login-wrap">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="brand">
            <span class="nosh">Nosh</span><span class="mesh">Mesh</span>
            <div class="sub">Restaurant Dashboard</div>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="email"/>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password"/>
            </mat-form-field>

            @if (error()) {
              <p class="error-msg">{{ error() }}</p>
            }

            <button mat-flat-button color="primary" class="full submit-btn"
                    type="submit" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"/>
              } @else {
                Sign in
              }
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-wrap {
      height: 100vh; display: flex;
      align-items: center; justify-content: center;
      background: #f5f5f5;
    }
    .login-card { width: 380px; padding: 16px; }
    .brand { text-align: center; padding: 16px 0 24px; }
    .nosh  { font-size: 32px; font-weight: 800; color: #e8390e; }
    .mesh  { font-size: 32px; font-weight: 800; color: #1a1a1a; }
    .sub   { font-size: 13px; color: #888; margin-top: 4px; }
    .full  { width: 100%; }
    .submit-btn { margin-top: 8px; height: 44px; }
    .error-msg  { color: #c62828; font-size: 13px; margin: 4px 0 8px; }
  `],
})
export class LoginComponent {
  form!: UntypedFormGroup;
  loading = signal(false);
  error   = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.nonNullable.group({
      email:    ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.error.set(e?.error?.message ?? 'Login failed');
        this.loading.set(false);
      },
    });
  }
}
