import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { AuthService } from "../Services/auth.service";
import { inject } from "@angular/core";
import { Observable, map, take } from "rxjs";

export const canActivate = (router: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const route = inject(Router);

  return authService.user.pipe(take(1), map((user) => {
    const loggedIn = user ? true : false;

    if (loggedIn) {
      return true; 
    } else {
      return route.createUrlTree(['/login']);
    }

  }))
}