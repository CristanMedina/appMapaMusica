import { Routes } from '@angular/router';
import { BottomTabBarComponent } from './components/bottom-tab-bar/bottom-tab-bar.component';

export const routes: Routes = [
  {
    path: '',
    component: BottomTabBarComponent,
    children: [
        {
        path: 'signup',
        loadComponent: () => import('./pages/signup/signup.page').then( m => m.SignupPage)
        },
        {
            path: 'login',
            loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
        },
        {
            path: 'profile',
            loadComponent: () => import('./pages/profile/profile.page').then( m => m.ProfilePage)
        },
        {
            path: 'events',
            loadComponent: () => import('./pages/events/events.page').then( m => m.EventsPage)
        },
        {
            path: 'map',
            loadComponent: () => import('./pages/map/map.page').then( m => m.MapPage),
        },
        {
            path: '',
            redirectTo: 'map',
            pathMatch: 'full'
        }
    ]
  },
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full'
  }
];
