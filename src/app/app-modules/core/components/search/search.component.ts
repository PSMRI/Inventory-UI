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
import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  DoCheck,
} from '@angular/core';
import { ConfirmationService } from '../../services/confirmation.service';
import { CommonService } from '../../services/common-services.service';
import { InventoryService } from '../../../inventory/shared/service/inventory.service';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import { environment } from 'src/environments/environment';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

interface Beneficary {
  firstName: string;
  lastName: any;
  gender: string;
  stateID: string;
  districtID: string | null;
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit, DoCheck {
  beneficiary!: Beneficary;
  genders: any = [];
  states: any = [];
  districts: any = [];
  stateID: any;
  districtID: any;
  countryId = environment.countryId;
  searched = false;
  beneficiaryList: any = [];
  filteredBeneficiaryList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  blankTable = [{}, {}, {}, {}, {}];
  displayedColumns: string[] = [
    'beneficiaryID',
    'benName',
    'genderName',
    'age',
    'fatherName',
    'districtVillage',
    'phoneNo',
    'registeredOn',
  ];

  @ViewChild('newSearchForm') form: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private confirmationService: ConfirmationService,
    public mdDialogRef: MatDialogRef<SearchComponent>,
    private commonService: CommonService,
    public http_service: LanguageService,
    private changeDetectorRef: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createBeneficiaryForm();
    this.callForMasterData();
    this.fetchLanguageResponse();
  }

  AfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  callForMasterData() {
    this.commonService.getRegistrationData().subscribe((res) => {
      if (res && res.statusCode === 200 && res.data) {
        console.log(res);
        this.genders = res.data.m_genders;
        this.states = res.data.states;
      } else {
        this.mdDialogRef.close(false);
      }
    });
  }

  onStateChange() {
    this.beneficiary.districtID = null;

    this.commonService
      .getStateDistricts(this.beneficiary.stateID)
      .subscribe((res) => {
        if (res && res.data && res.statusCode === 200) {
          console.log(res);
          this.districts = res.data;
        } else {
          this.mdDialogRef.close(false);
        }
      });
  }

  createBeneficiaryForm() {
    this.beneficiary = {
      firstName: '',
      lastName: null,
      gender: '',
      stateID: '',
      districtID: '',
    };
  }

  resetBeneficiaryForm() {
    this.form.reset();
    this.beneficiaryList = [];
    this.filteredBeneficiaryList.data = [];
    this.filteredBeneficiaryList.paginator = this.paginator;
    this.searched = false;
  }

  getSearchResult() {
    const dataObj = {
      firstName: this.beneficiary.firstName,
      lastName: this.beneficiary.lastName,
      genderID: this.beneficiary.gender,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
      i_bendemographics: {
        stateID: this.beneficiary.stateID,
        districtID: this.beneficiary.districtID,
      },
    };

    this.commonService.searchBeneficiary(dataObj).subscribe(
      (beneficiaryList) => {
        if (
          !beneficiaryList ||
          !beneficiaryList.data ||
          beneficiaryList.data.length <= 0
        ) {
          this.beneficiaryList = [];
          this.filteredBeneficiaryList.data = [];
          this.filteredBeneficiaryList.paginator = this.paginator;
          this.searched = true;
        } else {
          this.beneficiaryList = this.searchRestruct(beneficiaryList.data, {});
          this.filteredBeneficiaryList.data = this.beneficiaryList;
          this.filteredBeneficiaryList.paginator = this.paginator;
          this.searched = true;
          console.log(this.beneficiaryList, this.filteredBeneficiaryList.data);
        }
      },
      (error) => {
        this.confirmationService.alert(error, 'error');
      },
    );
  }

  searchRestruct(benList: any, benObject: any) {
    const requiredBenData: any = [];
    benList.forEach((element: any, i: any) => {
      requiredBenData.push({
        beneficiaryID: element.beneficiaryID,
        beneficiaryRegID: element.beneficiaryRegID,
        benName: `${element.firstName} ${element.lastName || ''}`,
        genderName: `${element.m_gender.genderName || 'Not Available'}`,
        fatherName: `${element.fatherName || 'Not Available'}`,
        districtName: `${element.i_bendemographics.districtName || 'Not Available'}`,
        villageName: `${element.i_bendemographics.districtBranchName || 'Not Available'}`,
        phoneNo: this.getCorrectPhoneNo(element.benPhoneMaps, benObject),
        age: element.dOB,
        registeredOn: element.createdDate,
      });
    });
    console.log(JSON.stringify(requiredBenData, null, 4), 'yoooo!');

    return requiredBenData;
  }

  getCorrectPhoneNo(phoneMaps: any, benObject: any) {
    let phone;
    if (benObject && !benObject.phoneNo) {
      return phoneMaps.length > 0 ? phoneMaps[0].phoneNo : 'Not Available';
    } else if (benObject && benObject.phoneNo && phoneMaps.length > 0) {
      phoneMaps.forEach((element: any) => {
        if (element.phoneNo === benObject.phoneNo) {
          phone = element.phoneNo;
        }
      });
      return phone || 'Not Available';
    } else if (phoneMaps.length > 0) {
      return phoneMaps[0].phoneNo;
    } else {
      return 'Not Available';
    }
  }

  checkVisit(benID: any) {
    if (benID) {
      this.inventoryService
        .getBeneficaryVisitDetail({
          providerServiceMapID:
            this.sessionstorage.getItem('providerServiceID'),
          beneficiaryID: benID,
        })
        .subscribe((res) => {
          if (res && res.statusCode === 200 && res.data) {
            if (res.data.benVisitDetail && res.data.benVisitDetail.length) {
              this.mdDialogRef.close(benID);
            } else {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory
                  .NoVisitRecordFoundForThisBeneficiary,
                'info',
              );
            }
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.inventory
                .NoVisitRecordFoundForThisBeneficiary,
              'info',
            );
          }
        });
    }
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
