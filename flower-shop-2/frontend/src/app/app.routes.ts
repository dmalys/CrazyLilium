import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { 
    path: 'home', 
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) 
  },
  { 
    path: 'shop', 
    loadComponent: () => import('./pages/shop/shop.component').then(m => m.ShopComponent) 
  },
  { 
    path: 'about', 
    loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) 
  },
  { 
    path: 'contact', 
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent) 
  },
  { 
    path: 'forum', 
    loadComponent: () => import('./pages/forum/forum.component').then(m => m.ForumComponent) 
  },
  { 
    path: 'cart', 
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent) 
  },
  { 
    path: 'admin', 
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent) 
  },
  { path: '**', redirectTo: '/home' }
];

