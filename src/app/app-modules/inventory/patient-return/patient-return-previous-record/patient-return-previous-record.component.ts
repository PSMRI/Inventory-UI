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
import { DataStorageService } from '../../shared/service/data-storage.service';
import { InventoryService } from '../../shared/service/inventory.service';
import { Location, NgIf } from '@angular/common';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/v2/registrar/services/session-storage.service';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import {
  MatDatepickerInput,
  MatDatepickerToggle,
  MatDatepicker,
} from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import {
  MatCard,
  MatCardContent,
  MatCardActions,
} from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatPaginator } from '@angular/material/paginator';
import { MatTooltip } from '@angular/material/tooltip';
import { ISTDatePipe } from '../../../core/pipes/ist-date.pipe';

@Component({
  selector: 'app-patient-return-previous-record',
  templateUrl: './patient-return-previous-record.component.html',
  styleUrls: ['./patient-return-previous-record.component.css'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatPrefix,
    MatDatepicker,
    NgIf,
    MatButton,
    MatCard,
    MatCardContent,
    MatIcon,
    MatSuffix,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatPaginator,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatCardActions,
    MatTooltip,
    ISTDatePipe,
  ],
})
export class PatientReturnPreviousRecordComponent implements OnInit, DoCheck {
  today: any;
  fromDate: any;
  toDate: any;
  patientReturnList: any = [];

  filterTerm: any;
  filteredPatientReturnList = new MatTableDataSource<any>();
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private location: Location,
    private dialog: MatDialog,
    private router: Router,
    private http_service: LanguageService,
    private dataStorageService: DataStorageService,
    readonly sessionstorage: SessionStorageService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.initializeDate();
    this.fetchLanguageResponse();
  }

  initializeDate() {
    this.fromDate = new Date();
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate = new Date();

    this.fromDate.setHours(0);
    this.fromDate.setMinutes(0);
    this.fromDate.setSeconds(0);
    this.fromDate.setMilliseconds(0);

    this.toDate.setHours(23);
    this.toDate.setMinutes(59);
    this.toDate.setSeconds(59);
    this.toDate.setMilliseconds(0);

    this.today = new Date();
    this.viewRecords();
  }

  viewRecords() {
    const facilityID = this.sessionstorage.getItem('facilityID');
    const startDate: Date = new Date(this.fromDate);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate: Date = new Date(this.toDate);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);

    const temp = {
      fromDate: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000,
      ),
      toDate: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000,
      ),
      facilityID: facilityID ? +facilityID : undefined,
    };

    this.inventoryService.getPatientReturnList(temp).subscribe((response) => {
      console.log('res..', response);
      this.patientReturnList = response.data.slice();
      console.log('patientReturnList', this.patientReturnList);
      this.filteredPatientReturnList.data = response.data.slice();
      console.log(
        'filteredPatientReturnList',
        this.filteredPatientReturnList.data,
      );
    });
  }

  goBack() {
    this.location.back();
  }

  filterPatientReturnList(filterTerm: any) {
    if (!filterTerm)
      this.filteredPatientReturnList.data = this.patientReturnList.slice();
    else {
      this.filteredPatientReturnList.data = [];
      this.patientReturnList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'itemName' ||
            key === 'batchNo' ||
            key === 'dateofIssue' ||
            key === 'patientName' ||
            key === 'returnDate'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredPatientReturnList.data.push(item);
              break;
            }
          }
        }
      });
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
