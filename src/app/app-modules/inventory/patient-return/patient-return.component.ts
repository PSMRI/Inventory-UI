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
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { InventoryService } from './../../inventory/shared/service/inventory.service';
import { ConfirmationService } from './../../core/services/confirmation.service';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from '../../core/services/language.service';
import { BenificiaryDetailsComponent } from './benificiary-details/benificiary-details.component';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-patient-return',
  templateUrl: './patient-return.component.html',
  styleUrls: ['./patient-return.component.css'],
})
export class PatientReturnComponent implements OnInit, DoCheck {
  patientReturnForm!: FormGroup;
  beneficiaryDetailsList: any = [];

  itemMasterList: any = [];
  benSelected = false;

  selectedItemList = [];
  filterItemList = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    readonly sessionstorage: SessionStorageService,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.patientReturnForm = this.createPatientReturnForm();
    this.fetchLanguageResponse();
  }

  createPatientReturnForm() {
    return this.fb.group({
      beneficiaryIDOrPhoneNumber: null,
      beneficiaryID: [{ value: null, disabled: true }],
      benRegId: null,
      name: [{ value: null, disabled: true }],
      age: [{ value: null, disabled: true }],
      gender: [{ value: null, disabled: true }],
    });
  }

  get beneficiaryIDOrPhoneNumber() {
    return this.patientReturnForm.controls['beneficiaryIDOrPhoneNumber'].value;
  }

  get beneficiaryID() {
    return this.patientReturnForm.controls['beneficiaryID'].value;
  }

  get name() {
    return this.patientReturnForm.controls['name'].value;
  }

  get age() {
    return this.patientReturnForm.controls['age'].value;
  }

  get gender() {
    return this.patientReturnForm.controls['gender'].value;
  }

  get benRegId() {
    return this.patientReturnForm.controls['benRegId'].value;
  }

  initpatientReturnList() {
    return this.fb.group({
      itemName: null,
      batchID: null,
      issueQuantity: null,
      dateOfIssue: null,
      returnQuantity: null,
    });
  }

  identityQuickSearch(beneficiaryIDOrPhoneNumber: string) {
    if (beneficiaryIDOrPhoneNumber.length === 10) {
      this.phoneNumberSearch(beneficiaryIDOrPhoneNumber);
    } else if (beneficiaryIDOrPhoneNumber.length === 12) {
      this.beneficiarySearch(beneficiaryIDOrPhoneNumber);
    }
  }

  openBenDetailsModal() {
    const mdDialogRef: MatDialogRef<BenificiaryDetailsComponent> =
      this.dialog.open(BenificiaryDetailsComponent, {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        data: {
          beneficiaryDetailsList: this.beneficiaryDetailsList,
        },
        disableClose: false,
      });
    mdDialogRef.afterClosed().subscribe((benificiary) => {
      if (benificiary) {
        this.patchData(benificiary);
        this.itemSearch(benificiary);
      }
    });
  }

  phoneNumberSearch(phoneNumber: any) {
    this.inventoryService
      .getBeneficiaryByPhoneNumber({
        phoneNo: phoneNumber,
      })
      .subscribe((response) => {
        console.log('response', response);
        this.reponseDataCheck(response);
      });
  }

  reponseDataCheck(response: any) {
    if (response.statusCode === 200) {
      if (response.data.length > 0) {
        this.beneficiaryDetailsList = response.data;
        this.openBenDetailsModal();
      } else {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory.nobeneficiarydetailsavailable,
        );
      }
    }
  }
  beneficiarySearch(beneficiaryID: any) {
    this.inventoryService
      .getBeneficiaryByBeneficiaryID({
        beneficiaryID: beneficiaryID,
      })
      .subscribe((response) => {
        console.log('response', response);
        this.reponseDataCheck(response);
      });
  }
  openSearchDialog() {}
  patchData(benDetails: any) {
    this.patientReturnForm.patchValue({
      beneficiaryID: benDetails.beneficiaryID,
      benRegId: benDetails.beneficiaryRegID,
      name: benDetails.firstName
        ? benDetails.firstName
        : '' + benDetails.lastName
          ? benDetails.lastName
          : '',
      age: benDetails.age,
      gender: benDetails.m_gender.genderName,
    });
  }

  itemSearch(beneficiary: any) {
    console.log('Beneficiary details..', beneficiary);
    if (beneficiary !== undefined) {
      this.inventoryService
        .getItemList({
          benRegID: beneficiary.beneficiaryRegID,
          facilityID: this.sessionstorage.getItem('facilityID'),
        })
        .subscribe((response) => {
          console.log(this.itemMasterList);

          this.itemMasterList = response.data;
          this.benSelected = true;

          this.filterItemList = response.data;
        });
    }
  }

  resetBenDetails(event: any) {
    console.log('event', event);
    this.benSelected = false;
    this.patientReturnForm.reset();
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
