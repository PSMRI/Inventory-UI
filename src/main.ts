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
import { importProvidersFrom } from '@angular/core';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withHashLocation } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { provideZard } from 'Common-UI/v2/ui/provider';
import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app.routes';

// Root singleton services (formerly provided in main.ts alongside the modules).
import { AuthenticationService } from './app/login/authentication.service';
import { LanguageService } from './app/app-modules/core/services/language.service';
import { AuthService } from './app/app-modules/core/services/auth.service';
import { FaciltyService } from './app/facility-selection/facilty.service';
import { HttpInterceptorService } from './app/app-modules/core/services/http-interceptor.service';

// Former CoreModule.forRoot() singleton services.
import { AuthGuard } from './app/app-modules/core/services/auth-guard.service';
import { BatchSearchService } from './app/app-modules/core/services/batch-search.service';
import { BeneficiaryDetailsService } from './app/app-modules/core/services/beneficiary-details.service';
import { CommonService } from './app/app-modules/core/services/common-services.service';
import { ConfirmationService } from './app/app-modules/core/services/confirmation.service';
import { ItemSearchService } from './app/app-modules/core/services/item-search.service';
import { BatchViewService } from './app/app-modules/core/services/rx-batchview.service';
import { SpinnerService } from './app/app-modules/core/services/spinner.service';
import { TextareaDialog } from './app/app-modules/core/components/textarea-dialog/textarea-dialog.service';
import { CaptchaService } from './app/app-modules/core/services/captcha.service';

// Former lazy feature-module providers (InventoryModule / RxModule). Provided at
// the root so they stay app-wide singletons and remain resolvable inside
// dialog-opened components (route/module-scoped providers are not visible to
// overlay-created components).
import { DataStorageService } from './app/app-modules/inventory/shared/service/data-storage.service';
import { InventoryMasterService } from './app/app-modules/inventory/shared/service/inventory-master.service';
import { InventoryService } from './app/app-modules/inventory/shared/service/inventory.service';
import { PrescribedDrugService } from './app/app-modules/rx/shared/service/prescribed-drug.service';

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, FormsModule, ReactiveFormsModule),
    provideRouter(appRoutes, withHashLocation()),
    // Zard custom event-manager plugins ({key} multi-key, .outside, .debounce
    // template event syntax used by the Zard components).
    provideZard(),
    provideHttpClient(withInterceptorsFromDi()),
    AuthenticationService,
    LanguageService,
    AuthService,
    FaciltyService,
    HttpInterceptorService,
    // Former CoreModule.forRoot() providers.
    ConfirmationService,
    BatchViewService,
    TextareaDialog,
    AuthGuard,
    SpinnerService,
    CommonService,
    ItemSearchService,
    BatchSearchService,
    BeneficiaryDetailsService,
    CaptchaService,
    // Former InventoryModule / RxModule providers.
    InventoryService,
    InventoryMasterService,
    DataStorageService,
    PrescribedDrugService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpInterceptorService,
      multi: true,
    },
    provideAnimations(),
  ],
}).catch((err) => console.error(err));
