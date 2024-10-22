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
import { Component, DoCheck, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { FaciltyService } from './facilty.service';
import { ConfirmationService } from '../app-modules/core/services';
import { SetLanguageComponent } from '../app-modules/core/components/set-language.component';
import { LanguageService } from '../app-modules/core/services/language.service';

@Component({
  selector: 'app-facility-selection',
  templateUrl: './facility-selection.component.html',
  styleUrls: ['./facility-selection.component.css'],
})
export class FacilitySelectionComponent implements OnInit, DoCheck {
  serviceProviderId: any;
  designation: any;
  stores: any = [];
  enableContinue = false;
  facilities: any = [];
  subFacilities: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  isMainStoreBool: any;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private faciltyService: FaciltyService,
    private http_service: LanguageService,
    private confirmationService: ConfirmationService,
  ) {}

  facilityForm = this.fb.group({
    isMainStore: '',
    facility: '',
    subFacility: '',
  });

  ngOnInit() {
    localStorage.removeItem('facilityDetail');
    localStorage.removeItem('facilityID');
    this.fetchLanguageResponse();
    this.serviceProviderId = sessionStorage.getItem('providerServiceID');
    this.getAllStores();
  }

  getAllStores() {
    this.faciltyService
      .getAllStores(this.serviceProviderId)
      .subscribe((data: any) => {
        this.stores = data.data;
      });
  }

  checkStores() {
    this.subFacilities = [];
    this.facilities = [];
    this.facilityForm.patchValue({
      facility: null,
      subFacility: null,
    });
    this.getFacility();
  }

  toContinue() {
    const isMainStore: any = this.facilityForm.controls['isMainStore'].value;
    const facility: any = this.facilityForm.controls['facility'].value;
    const subFacility: any = this.facilityForm.controls['subFacility'].value;
    if (
      this.facilityForm.controls.isMainStore.value === 'true' &&
      this.facilityForm.controls.facility.value
    ) {
      this.enableContinue = true;
      sessionStorage.setItem('facilityID', facility.facilityID);
      sessionStorage.setItem('facilityDetail', JSON.stringify(facility));
    } else if (isMainStore === 'false' && facility && subFacility) {
      this.enableContinue = true;
      sessionStorage.setItem('facilityID', subFacility.facilityID);
      sessionStorage.setItem('facilityDetail', JSON.stringify(subFacility));
      this.getFacilityMappedVanID(subFacility.facilityID);
    } else {
      this.enableContinue = false;
    }
  }

  getFacility() {
    this.facilities = this.stores.filter((facility: any) => {
      if (facility.isMainFacility === true && facility.deleted === false) {
        return facility;
      }
    });
  }

  getSubFacility() {
    const facility: any = this.facilityForm.controls['facility'].value;
    this.facilityForm.patchValue({ subFacility: null });
    this.subFacilities = [];
    this.subFacilities = this.stores.filter((subFacility: any) => {
      if (
        !subFacility.deleted &&
        subFacility.mainFacilityID &&
        subFacility.mainFacilityID === facility.facilityID
      ) {
        return subFacility;
      }
    });
  }

  vanID: any;
  parkingPlaceID: any;

  getFacilityMappedVanID(facilityID: any) {
    this.faciltyService.getVanByStoreID(facilityID).subscribe((res: any) => {
      if (res.statusCode === 200 && res.data) {
        this.vanID = res.data.vanID;
        this.parkingPlaceID = res.data.parkingPlaceID;
      }
    });
  }
  proceedFurther() {
    this.designation = 'Pharmacist';
    if (this.vanID && this.parkingPlaceID) {
      sessionStorage.setItem('vanID', this.vanID);
      sessionStorage.setItem('parkingPlaceID', this.parkingPlaceID);
    }
    this.routeToDesignation(this.designation);
  }

  routeToDesignation(designation: any) {
    switch (designation) {
      case 'Pharmacist':
        this.router.navigate(['/loadStores']);
        break;
      default:
    }
  }

  //AN40085822 29/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  //--End--
}
