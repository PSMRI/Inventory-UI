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
import { Component, OnInit, OnDestroy, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InventoryService } from './../shared/service/inventory.service';
import { ConfirmationService } from './../../core/services/confirmation.service';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchComponent } from '../../core/components/search/search.component';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-medicine-dispense',
  templateUrl: './medicine-dispense.component.html',
  styleUrls: ['./medicine-dispense.component.css'],
})
export class MedicineDispenseComponent implements OnInit, OnDestroy, DoCheck {
  beneficiaryDetailForm!: FormGroup;
  beneficaryDetail: any;

  parentBenID: any;
  parentVisitID: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dateBool = false;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private inventoryService: InventoryService,
    public http_service: LanguageService,
    private dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.beneficiaryDetailForm = this.createBeneficiaryForm();
    //Parent App Calling
    this.checkParentVisits();
    this.fetchLanguageResponse();
  }

  ngOnDestroy() {
    sessionStorage.removeItem('parentBen');
    sessionStorage.removeItem('parentBenVisit');
  }

  createBeneficiaryForm() {
    return this.fb.group({
      medicineDispenseType: { value: '', disabled: true },
      beneficiaryID: { value: '', disabled: false },
      visitCode: { value: '', disabled: true },
      visitID: { value: '', disabled: true },
      beneficiaryName: { value: '', disabled: false },
      beneficiaryAge: { value: '', disabled: false },
      genderName: { value: '', disabled: false },
      doctorName: { value: '', disabled: false },
      reference: { value: '', disabled: false },
      visitDate: { value: '', disabled: true },
    });
  }

  checkParentVisits() {
    this.parentBenID =
      this.sessionstorage.getItem('parentBen') === 'undefined'
        ? undefined
        : this.sessionstorage.getItem('parentBen');
    this.parentVisitID =
      this.sessionstorage.getItem('parentBenVisit') === 'undefined'
        ? undefined
        : this.sessionstorage.getItem('parentBenVisit');
    console.log(this.parentBenID, this.parentVisitID);

    if (this.parentBenID) {
      this.getParentBenVisits();
    }
  }

  getParentBenVisits() {
    this.beneficiaryDetailForm.patchValue({
      beneficiaryID: this.parentBenID,
      medicineDispenseType: 'System',
    });

    this.inventoryService
      .getBeneficaryVisitDetail({
        providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
        beneficiaryID:
          this.beneficiaryDetailForm.controls['beneficiaryID'].value,
      })
      .subscribe(
        (response) => {
          console.log('response', response);
          if (response.statusCode === 200) {
            if (response.data.beneficiaryFlowStatus.length > 0) {
              this.beneficiaryVisitDetailList = response.data;
              console.log(this.beneficiaryVisitDetailList, 'lissss');
              this.beneficiaryDetail = response.data.beneficiaryFlowStatus;
              this.loadCurrentVisit(response.data.beneficiaryFlowStatus);
            } else {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory.norecentvisitavailable,
              );
            }
          } else {
            this.confirmationService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.confirmationService.alert(err, 'error');
        },
      );
  }

  loadCurrentVisit(resp: any) {
    if (this.parentVisitID) {
      resp.forEach((element: any) => {
        if (element.benVisitID === this.parentVisitID) {
          this.dateBool = true;
          this.beneficiaryDetailForm.patchValue({
            visitCode: element,
          });
          this.dateBool = true;
          this.getVisitDetail();
        }
      });
    }
  }

  beneficiaryDetail: any;
  beneficiaryVisitDetailList: any;
  recentBeneficaryVisit: any;
  checkBeneficiary() {
    if (this.beneficiaryDetailForm.controls['beneficiaryID'].value === null) {
      this.nullifyBeneficiaryDetails();
    }

    if (this.beneficiaryDetailForm.controls['beneficiaryID'].value !== null) {
      if (
        this.beneficiaryDetailForm.controls['beneficiaryID'].value.length !== 12
      ) {
        this.nullifyBeneficiaryDetails();
      }
      if (
        this.beneficiaryDetailForm.controls['beneficiaryID'].value.length === 12
      ) {
        this.inventoryService
          .getBeneficaryVisitDetail({
            providerServiceMapID:
              this.sessionstorage.getItem('providerServiceID'),
            beneficiaryID:
              this.beneficiaryDetailForm.controls['beneficiaryID'].value,
          })
          .subscribe(
            (response) => {
              console.log('response', response);
              if (response.statusCode === 200) {
                if (response.data.benVisitDetail.length > 0) {
                  this.beneficiaryVisitDetailList = response.data;
                  this.beneficiaryDetail = response.data.beneficiaryFlowStatus;
                } else {
                  this.confirmationService.alert(
                    this.currentLanguageSet.inventory.norecentvisitavailable,
                  );
                }
              } else {
                this.confirmationService.alert(response.errorMessage, 'error');
              }
            },
            (err) => {
              this.confirmationService.alert(err, 'error');
            },
          );
      }
    }
    // 720088175112
  }
  openSearchDialog() {
    const matDialogRef: MatDialogRef<SearchComponent> = this.dialog.open(
      SearchComponent,
      {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        disableClose: false,
      },
    );

    matDialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('something fishy happening here', result);
        this.beneficiaryDetailForm.patchValue({
          beneficiaryID: result,
        });
        this.checkBeneficiary();
      }
    });
  }

  getVisitDetail() {
    if (this.visitCode !== undefined || this.visitCode !== null) {
      this.beneficiaryDetailForm.patchValue({
        beneficiaryName: this.visitCode.benName,
        beneficiaryAge: this.visitCode.ben_age_val,
        genderName: this.visitCode.genderName,
        doctorName: this.visitCode.agentId,
        visitDate: this.visitCode.visitDate,
        visitID: this.visitCode.benVisitID,
        reference: null,
        medicineDispenseType: 'System',
      });
      this.dateBool = true;
      this.getBeneficiaryDetail();
    } else {
      this.nullifyBeneficiaryDetails();
    }
  }
  nullifyBeneficiaryDetails() {
    this.beneficiaryDetailForm.patchValue({
      medicineDispenseType: null,
      visitCode: null,
      visitDate: null,
      beneficiaryName: null,
      beneficiaryAge: null,
      genderName: null,
      doctorName: null,
      reference: null,
    });
  }

  getBeneficiaryDetail() {
    const facilityDetailfromStorage: any =
      this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailfromStorage);
    const facilityName = facilityDetail.facilityName;
    this.beneficaryDetail = {
      age: this.visitCode.ben_age_val,
      beneficiaryID: this.beneficiaryID,
      benRegID: this.beneficiaryVisitDetailList.beneficiaryRegID,
      // createdBy: this.sessionstorage.getItem('username'),
      createdBy: this.sessionstorage.username,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
      doctorName: this.visitCode.agentId,
      facilityID: this.sessionstorage.getItem('facilityID'),
      gender: this.visitCode.genderName,
      issueType: this.medicineDispenseType,
      patientName: this.visitCode.benName,
      prescriptionID: null,
      reference: this.reference,
      visitID: this.visitCode.benVisitID,
      visitCode: this.visitCode.benVisitCode,
      facilityName: facilityName,
      visitDate: this.visitCode.visitDate,
    };
    this.dateBool = true;
    console.log('ERRR100', this.beneficaryDetail);
  }

  get reference() {
    return this.beneficiaryDetailForm.controls['reference'].value;
  }
  get medicineDispenseType() {
    return this.beneficiaryDetailForm.controls['medicineDispenseType'].value;
  }

  get beneficiaryID() {
    return this.beneficiaryDetailForm.controls['beneficiaryID'].value;
  }

  get beneficiaryName() {
    return this.beneficiaryDetailForm.controls['beneficiaryName'].value;
  }

  get beneficiaryAge() {
    return this.beneficiaryDetailForm.controls['beneficiaryAge'].value;
  }

  get visitDate() {
    return this.beneficiaryDetailForm.controls['visitDate'].value;
  }

  get visitCode() {
    return this.beneficiaryDetailForm.controls['visitCode'].value;
  }

  resetBeneficiaryDetails(event: any) {
    console.log('event', event);
    this.beneficiaryDetailForm.reset();
  }

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
