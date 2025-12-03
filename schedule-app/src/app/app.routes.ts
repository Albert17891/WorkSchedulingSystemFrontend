import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register
  
 } from './pages/register/register';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard';
import { WorkerDashboard } from './pages/worker-dashboard/worker-dashboard';
import { roleGuard } from './guards/role-guard';

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
 { 
    path: 'admin', 
    component: AdminDashboard,
    canActivate: [roleGuard],
    data: { role: 'Admin' } 
  },
  { 
    path: 'worker', 
    component: WorkerDashboard,
    canActivate: [roleGuard],
    data: { role: 'Worker' } 
  },
  { path: '**', redirectTo: '' }
];
