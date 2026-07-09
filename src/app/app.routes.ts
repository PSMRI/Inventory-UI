/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ServiceComponent } from 'src/service/service.component';
import { AuthGuard } from './app-modules/core/services/auth-guard.service';
import { FacilitySelectionComponent } from './facility-selection/facility-selection.component';
import { LoadStoreDetailsComponent } from './load-store-details/load-store-details.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SetPasswordComponent } from './set-password/set-password.component';
import { SetSecurityQuestionsComponent } from './set-security-questions/set-security-questions.component';
import { RedirInComponent } from './redir-in/redir-in.component';
export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'redirin',
    component: RedirInComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'set-security-questions',
    component: SetSecurityQuestionsComponent,
  },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
  },
  {
    path: 'set-password',
    component: SetPasswordComponent,
    // canActivate: [AuthGuard],
  },
  {
    path: 'service',
    component: ServiceComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'facility',
    component: FacilitySelectionComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'loadStores',
    component: LoadStoreDetailsComponent,
  },
  {
    path: 'inventory',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./app-modules/inventory/inventory.routes').then(
        (x) => x.inventoryRoutes,
      ),
  },

  {
    path: 'rx',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./app-modules/rx/rx.routes').then((x) => x.rxRoutes),
  },
];
