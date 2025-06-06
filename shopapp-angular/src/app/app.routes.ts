import { Routes } from '@angular/router';
import * as path from 'node:path';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {DetailProductComponent} from './components/detail-product/detail-product.component';
import {OrderComponent} from './components/order/order.component';
import {UserProfileComponent} from './components/user-profile/user-profile.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products/:id', component: DetailProductComponent },
  // { path: 'orders', component: OrderComponent,canActivate:[AuthGuardFn] },
  // { path: 'user-profile', component: UserProfileComponent, canActivate:[AuthGuardFn] },
  // { path: 'orders/:id', component: OrderDetailComponent },

  //Admin
  // {
  //   path: 'admin',
  //   component: AdminComponent,
  //   canActivate:[AdminGuardFn]
  // },
];
