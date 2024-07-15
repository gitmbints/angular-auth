import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthResponse } from '../Model/AuthResponse';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { User } from '../Model/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http: HttpClient = inject(HttpClient);
  user: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  router: Router = inject(Router);
  private tokenExpireTimer: any;

  constructor() {}

  signup(email: string, password: string) {
    const data = { email: email, password: password, returnSecureToken: true };
    return this.http
      .post<AuthResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDfD7K0SiuMDOTiGrUX7lH_ts7hkLZKJQE',
        data
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.handleCreateUser(res);
        })
      );
  }

  login(email: string, password: string) {
    const data = { email: email, password: password, returnSecureToken: true };
    return this.http
      .post<AuthResponse>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDfD7K0SiuMDOTiGrUX7lH_ts7hkLZKJQE',
        data
      )
      .pipe(
        catchError(this.handleError),
        tap((res) => {
          this.handleCreateUser(res);
        })
      );
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/login']);
    localStorage.removeItem('userData');

    if (this.tokenExpireTimer) {
      clearTimeout(this.tokenExpireTimer);
    }

    this.tokenExpireTimer = null;
  }

  autoLogin() {
    const user = JSON.parse(localStorage.getItem('userData'));

    if (!user) {
      return;
    }

    const loadedUser = new User(
      user.email,
      user.id,
      user._token,
      user._expiresIn
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const timer = new Date(user._expiresIn).getTime() - new Date().getTime();
      this.autoLogout(timer);
    }
  }

  autoLogout(expireTime: number) {
    this.tokenExpireTimer = setTimeout(() => {
      this.logout();
    }, expireTime);
  }

  private handleCreateUser(res) {
    const user = new User(
      res.email,
      res.localId,
      res.idToken,
      new Date(new Date().getTime() + +res.expiresIn * 1000)
    );
    this.user.next(user);

    this.autoLogout(+res.expiresIn * 1000);

    localStorage.setItem('userData', JSON.stringify(user));
  }

  private handleError(err) {
    console.log(err);
    let errorMessage = 'An error occurred during registration';

    if (!err.error || !err.error.error) {
      return throwError(() => errorMessage);
    }

    switch (err.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage =
          'The email address is already in use by another account.';
        break;
      case 'OPERATION_NOT_ALLOWED':
        errorMessage = 'Password sign-in is disabled for this project.';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER':
        errorMessage =
          'We have blocked all requests from this device due to unusual activity.';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Email and password do not match';
        break;
      case 'USER_DISABLED':
        errorMessage =
          'The user account has been disabled by an administrator.';
    }

    return throwError(() => errorMessage);
  }
}
