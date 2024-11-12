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
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRoute } from '@angular/router';
import { SetLanguageComponent } from '../components/set-language.component';
import { LanguageService } from './language.service';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Injectable()
export class AuthGuard implements CanActivate {
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private router: Router,
    public http_service: LanguageService,
    private route: ActivatedRoute,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.fetchLanguageResponse();
  }

  canActivate(route: any, state: any) {
    if (sessionStorage.getItem('isAuthenticated')) {
      return true;
    } else {
      alert(this.currentLanguageSet.inventory.youAreNotAuthorised);
      this.router.navigate(['/login']);
      return false;
    }
  }

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
