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
import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationStart,
  NavigationEnd,
  NavigationError,
} from '@angular/router';
import { Location } from '@angular/common';
import { SpinnerService } from '../app-modules/core/services/spinner.service';

import { SessionStorageService } from '../app-modules/core/services/session-storage.service';
import { AuthenticationService } from '../login/authentication.service';
@Component({
  selector: 'app-redir-in',
  templateUrl: './redir-in.component.html',
  styleUrls: ['./redir-in.component.css'],
})
export class RedirInComponent implements OnInit {
  externalSession = {
    host: '',
    protocol: '',
    auth: '',
    fallbackURL: '',
    returnURL: '',
    parentApp: '',
    facility: '',
    ben: '',
    visit: '',
    flowID: '',
    benRegID: '',
    vanID: '',
    parkingPlaceID: '',
    inventoryServiceName: '',
    parentAPI: '',
    currentLanguage: '',
    healthID: '',
  };

  fallback: any;
  requiredRole = 'Pharmacist';

  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
    private route: ActivatedRoute,
    private location: Location,
    private authService: AuthenticationService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    sessionStorage.removeItem('parentBen');
    sessionStorage.removeItem('parentBenVisit');
    sessionStorage.removeItem('isExternal');
    sessionStorage.removeItem('host');
    sessionStorage.removeItem('fallback');
    sessionStorage.removeItem('return');
    localStorage.removeItem('facilityDetail');
    localStorage.removeItem('inventoryServiceName');
    this.setRouteStrate();
    this.getExternalSession();
  }
  setRouteStrate() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.spinnerService.show();
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => this.spinnerService.hide(), 500);
      } else if (event instanceof NavigationError) {
        setTimeout(() => this.spinnerService.hide(), 500);
      } else {
        setTimeout(() => this.spinnerService.hide());
      }
    });
  }

  getExternalSession() {
    this.route.queryParams.subscribe((params) => {
      this.externalSession.host =
        params['host'] === 'undefined' ? undefined : params['host'];
      this.externalSession.protocol =
        params['protocol'] === 'undefined' ? undefined : params['protocol'];
      this.externalSession.auth =
        params['user'] === 'undefined' ? undefined : params['user'];
      this.externalSession.fallbackURL =
        params['fallback'] === 'undefined' ? undefined : params['fallback'];
      this.externalSession.returnURL =
        params['back'] === 'undefined' ? undefined : params['back'];
      this.externalSession.parentApp =
        params['app'] === 'undefined' ? undefined : params['app'];
      this.externalSession.facility =
        params['facility'] === 'undefined' ? undefined : params['facility'];
      this.externalSession.ben =
        params['ben'] === 'undefined' ? undefined : params['ben'];
      this.externalSession.visit =
        params['visit'] === 'undefined' ? undefined : params['visit'];
      this.externalSession.flowID =
        params['flow'] === 'undefined' ? undefined : params['flow'];
      this.externalSession.benRegID =
        params['reg'] === 'undefined' ? undefined : params['reg'];
      this.externalSession.vanID =
        params['vanID'] === 'undefined' ? undefined : params['vanID'];
      this.externalSession.parkingPlaceID =
        params['ppID'] === 'undefined' ? undefined : params['ppID'];
      this.externalSession.inventoryServiceName =
        params['serviceName'] === 'undefined'
          ? undefined
          : params['serviceName'];
      this.externalSession.parentAPI =
        params['parentAPI'] === 'undefined' ? undefined : params['parentAPI'];
      this.externalSession.currentLanguage =
        params['currentLanguage'] === 'undefined'
          ? 'English'
          : params['currentLanguage'];
      this.externalSession.healthID =
        params['healthID'] === 'undefined' ? undefined : params['healthID'];
    });
    console.log('PSMRI', this.externalSession);
    this.storeSession();
  }

  storeSession() {
    this.sessionstorage.setItem(
      'fallback',
      `${this.externalSession.protocol}//${this.externalSession.host}#${this.externalSession.fallbackURL}`,
    );
    this.sessionstorage.setItem(
      'return',
      `${this.externalSession.protocol}//${this.externalSession.host}#${this.externalSession.returnURL}`,
    );
    this.sessionstorage.setItem(
      'parentLogin',
      `${this.externalSession.protocol}//${this.externalSession.host}`,
    );
    this.sessionstorage.setItem('isExternal', 'true');
    this.sessionstorage.setItem('host', `${this.externalSession.parentApp}`);
    sessionStorage.setItem('key', this.externalSession.auth);
    this.sessionstorage.setItem('facilityID', this.externalSession.facility);
    this.sessionstorage.setItem('parentBen', this.externalSession.ben);
    this.sessionstorage.setItem('parentBenVisit', this.externalSession.visit);
    this.sessionstorage.setItem('benFlowID', this.externalSession.flowID);
    this.sessionstorage.setItem('vanID', this.externalSession.vanID);
    this.sessionstorage.setItem(
      'parkingPlaceID',
      this.externalSession.parkingPlaceID,
    );
    this.sessionstorage.setItem(
      'inventoryServiceName',
      this.externalSession.inventoryServiceName,
    );
    this.sessionstorage.setItem('parentAPI', this.externalSession.parentAPI);
    this.sessionstorage.setItem(
      'currentLanguage',
      this.externalSession.currentLanguage,
    );
    this.sessionstorage.setItem('healthID', this.externalSession.healthID);
    this.fallback = this.sessionstorage.getItem('fallback');

    this.checkSession();
  }

  checkSession() {
    if (
      this.externalSession.auth &&
      this.externalSession.flowID &&
      this.externalSession.ben &&
      this.externalSession.facility &&
      this.externalSession.returnURL &&
      this.externalSession.benRegID &&
      this.externalSession.vanID &&
      this.externalSession.parkingPlaceID
    ) {
      // session check
      this.getSession();
    } else if (
      this.externalSession.fallbackURL &&
      this.externalSession.host &&
      this.externalSession.protocol
    ) {
      console.log(this.externalSession, 'exter');
      this.deleteParentSessioning();
      window.location.href = this.fallback;
    } else {
      // go back
      this.location.back();
    }
  }

  deleteParentSessioning() {
    sessionStorage.removeItem('parentBen');
    sessionStorage.removeItem('parentBenVisit');
    sessionStorage.removeItem('isExternal');
    sessionStorage.removeItem('host');
    sessionStorage.removeItem('fallback');
    sessionStorage.removeItem('return');
    localStorage.removeItem('benFlowID');
    localStorage.removeItem('parkingPlaceID');
    localStorage.removeItem('vanID');
    localStorage.removeItem('inventoryServiceName');
    localStorage.removeItem('facilityDetail');
  }

  getSession() {
    this.authService.getSessionExists().subscribe((res) => {
      if (res && res.statusCode === 200) {
        this.checkANDSetAuthenticatedDetails(res.data);
      } else if (res.statusCode === 5002) {
        this.deleteParentSessioning();
        console.log(res, 'fallback');
        window.location.href = this.fallback;
      }
    });
  }

  checkANDSetAuthenticatedDetails(loginDataResponse: any) {
    this.sessionstorage.setItem(
      'isAuthenticatedToTM',
      loginDataResponse.isAuthenticated,
    );

    let serviceData;
    if (loginDataResponse.previlegeObj) {
      serviceData = loginDataResponse.previlegeObj.filter((item: any) => {
        return item.serviceName === this.externalSession.inventoryServiceName;
      })[0];
      if (serviceData !== null) {
        this.checkMappedRoleForService(loginDataResponse, serviceData);
      }
    } else {
      this.deleteParentSessioning();
      window.location.href = this.fallback;
    }
  }

  roleArray: any = [];
  checkMappedRoleForService(loginDataResponse: any, serviceData: any) {
    console.error('serviceData', serviceData);
    this.roleArray = [];
    let roleData;
    if (serviceData.roles) {
      console.log('serviceData.roles', serviceData.roles);

      roleData = serviceData.roles;
      if (roleData.length > 0) {
        roleData.forEach((role: any) => {
          role.serviceRoleScreenMappings.forEach((serviceRole: any) => {
            this.roleArray.push(serviceRole.screen.screenName);
          });
        });
        if (this.roleArray && this.roleArray.length > 0) {
          this.sessionstorage.setItem('role', JSON.stringify(this.roleArray));
          sessionStorage.setItem(
            'isAuthenticated',
            loginDataResponse.isAuthenticated,
          );
          // localStorage.setItem('username', loginDataResponse.userName);
          // localStorage.setItem('userName', loginDataResponse.userName);
          // localStorage.setItem('userID', loginDataResponse.userID);
          this.sessionstorage.userID = loginDataResponse.userID;
          this.sessionstorage.userName = loginDataResponse.userName;
          this.sessionstorage.username = loginDataResponse.userName;
          this.sessionstorage.setItem(
            'designation',
            loginDataResponse.designation.designationName,
          );
          console.log('this.roleArray', this.roleArray);
          this.sessionstorage.setItem(
            'providerServiceID',
            serviceData.providerServiceMapID,
          );
          this.sessionstorage.setItem(
            'services',
            JSON.stringify({
              serviceID:
                serviceData.roles[0].serviceRoleScreenMappings[0]
                  .providerServiceMapping.serviceID,
              serviceName: serviceData.serviceName,
            }),
          );
          this.getFacility();
        } else {
          this.deleteParentSessioning();
          window.location.href = this.fallback;
        }
      } else {
        this.deleteParentSessioning();
        window.location.href = this.fallback;
      }
    } else {
      this.deleteParentSessioning();
      window.location.href = this.fallback;
    }
  }

  getFacility() {
    this.authService
      .getFacilityDetails(this.externalSession.facility)
      .subscribe((res) => {
        if (res && res.statusCode === 200 && res.data) {
          this.sessionstorage.setItem(
            'facilityDetail',
            JSON.stringify(res.data),
          );
          this.router.navigate([
            '/rx/disperse/' + this.externalSession.benRegID,
          ]);
        } else {
          window.location.href = this.fallback;
        }
      });
  }
}
