import { Routes } from '@angular/router';
import { Login } from './pages/login/login';

export const routes: Routes = [
     { 
    path: '', 
    component: Login,      
    pathMatch: 'full'              
  },
  { 
    path: 'login', 
    redirectTo: '',                 
    pathMatch: 'full'
  },
 
  { path: '**', redirectTo: '' }
];
