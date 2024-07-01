import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../Services/auth.service';
import { LoaderComponent } from '../Utility/loader/loader.component';
import { CommonModule } from '@angular/common';
import { SnackbarComponent } from '../Utility/snackbar/snackbar.component';
import { AuthResponse } from '../Model/AuthResponse';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LoaderComponent, SnackbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isLoginMode: boolean = true;
  authService: AuthService = inject(AuthService);
  isLoading: boolean = false;
  errorMessage: string | null = null;
  authObs: Observable<AuthResponse>;
  router: Router = inject(Router);

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onSubmit(form: NgForm) {
    if (this.isLoginMode) {
      this.isLoading = true;
      this.authObs = this.authService.login(form.value.email, form.value.password);
    } else {
      this.isLoading = true;
      this.authObs = this.authService.signup(form.value.email, form.value.password);
    }

    this.authObs.subscribe({
      next: (res) => {
        console.log(res);
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.log(err);
        this.errorMessage = err;
        this.isLoading = false;

        this.hideErrorMessage();
      },
    });

    form.reset();
  }

  private hideErrorMessage() {
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }
}
