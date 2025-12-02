import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register
  
 } from './pages/register/register';
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
  {
    path:'register',
    component:Register,
    pathMatch:'full'
  },
 
  { path: '**', redirectTo: '' }
];
