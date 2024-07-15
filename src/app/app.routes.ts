import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { canActivate } from './routeGuards/authGuard';

export const routes: Routes = [
    { path: '', component: HomeComponent }, 
    { path: 'login', loadChildren: () => import('./login/auth.routes').then(m => m.routes) },
    { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.routes), canActivate: [canActivate] },  
];
