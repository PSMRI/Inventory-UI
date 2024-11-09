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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { InventoryService } from '../../shared/service/inventory.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-consumption-report',
  templateUrl: './consumption-report.component.html',
  styleUrls: ['./consumption-report.component.css'],
})
export class ConsumptionReportComponent implements OnInit, DoCheck {
  consumptionForm!: FormGroup;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  criteriaHead: any;

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private confirmationService: ConfirmationService,
    private sessionstorage: SessionStorageService,
  ) {}

  today!: Date;
  minEndDate!: Date;
  maxDate!: Date;
  maxEndDate!: Date;
  consumptionList = [];
  dateOffset: any;
  selectedFacilityName = JSON.parse(
    this.sessionstorage.getItem('facilityDetail') || '{}',
  ).facilityName;
  facilities = [this.selectedFacilityName, 'All'];
  //BU40088124 27/7/2022 Added Facility Name dropdown in reports

  ngOnInit() {
    this.createConsumptionForm();
    this.today = new Date();
    this.fetchLanguageResponse();
    this.setSelectedFacility();

    this.dateOffset = 24 * 60 * 60 * 1000;
    // this.maxEndDate = new Date(this.today.setTime(this.today.getTime()));
    this.maxEndDate = new Date();
    this.maxEndDate.setDate(this.today.getDate() - 1);
  }

  createConsumptionForm() {
    this.consumptionForm = this.formBuilder.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      facilityName: [null, Validators.required],
    });
  }

  get startDate() {
    return this.consumptionForm.controls['startDate'].value;
  }

  get endDate() {
    return this.consumptionForm.controls['endDate'].value;
  }

  checkEndDate() {
    console.log('', this.startDate);

    if (this.endDate === null) {
      this.minEndDate = new Date(this.startDate);
      console.log('new Date(this.today.getDate() - 1);', new Date(this.today));
    } else {
      this.consumptionForm.patchValue({
        endDate: null,
      });
      this.minEndDate = new Date(this.startDate);
    }
  }

  searchReport() {
    const startDate: Date = new Date(this.consumptionForm.value.startDate);
    const endDate: Date = new Date(this.consumptionForm.value.endDate);

    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);

    console.log(
      'Data form value...',
      JSON.stringify(this.consumptionForm.value),
    );
    const reqObjForConsumptionReport = {
      startDate: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000,
      ),
      endDate: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000,
      ),
      facilityID:
        this.consumptionForm.value.facilityName === 'All'
          ? null
          : this.sessionstorage.getItem('facilityID'),
    };
    console.log(
      'Data form data',
      JSON.stringify(reqObjForConsumptionReport, null, 4),
    );

    this.inventoryService
      .getConsumptionReports(reqObjForConsumptionReport)
      .subscribe((response) => {
        console.log(
          'Json data of response: ',
          JSON.stringify(response, null, 4),
        );

        if (response.statusCode === 200) {
          this.consumptionList = response.data;
          this.getResponseOfSearchThenDo();
        }
      });
  }
  setSelectedFacility() {
    this.consumptionForm.patchValue({
      facilityName: this.selectedFacilityName,
    });
  }

  downloadReport(downloadFlag: boolean) {
    if (downloadFlag === true) {
      this.searchReport();
    }
  }

  getResponseOfSearchThenDo() {
    const criteria: any = [];
    criteria.push({ Filter_Name: 'Start_Date', value: this.startDate });
    criteria.push({ Filter_Name: 'End_Date', value: this.endDate });
    this.exportToxlsx(criteria);
  }
  exportToxlsx(criteria: any) {
    if (criteria.length > 0) {
      const criteriaArray = criteria.filter(function (obj: any) {
        for (const key in obj) {
          if (obj[key] === null) {
            obj[key] = '';
          }
        }
        return obj;
      });
      if (criteriaArray.length !== 0) {
        this.criteriaHead = Object.keys(criteriaArray[0]);
        console.log('this.criteriaHead', this.criteriaHead);
      }
    }
    if (this.consumptionList.length > 0) {
      const array = this.consumptionList.filter(function (obj: any) {
        for (const key in obj) {
          if (obj[key] === null) {
            obj[key] = '';
          }
          if (obj[key] === 'StoreSelfConsumption') {
            obj[key] = 'Store Self Consumption';
          }
          if (obj[key] === 't_indent') {
            obj[key] = 'Indent';
          }
          if (obj[key] === 'T_StockTransfer') {
            obj[key] = 'StockTransfer';
          }
          if (obj[key] === 'T_PatientIssue ') {
            obj[key] = 'PatientIssue ';
          }
        }
        return obj;
      });
      if (array.length !== 0) {
        const head = Object.keys(array[0]);
        console.log(' head', head);
        const wb_name = 'Consumption Report';

        // below code added to modify the headers

        let i = 65; // starting from 65 since it is the ASCII code of 'A'.
        let count = 0;
        while (i < head.length + 65) {
          let j;
          if (count > 0) {
            j = i - 26 * count;
          } else {
            j = i;
          }
          const cellPosition = String.fromCharCode(j);
          let finalCellName: any;
          if (count === 0) {
            finalCellName = cellPosition + '1';
            console.log(finalCellName);
          } else {
            const newcellPosition = String.fromCharCode(64 + count);
            finalCellName = newcellPosition + cellPosition + '1';
            console.log(finalCellName);
          }
          const newName = this.modifyHeader(head, i);
          // delete report_worksheet[finalCellName].w; report_worksheet[finalCellName].v = newName;
          i++;
          if (i === 91 + count * 26) {
            // i = 65;
            count++;
          }
        }
        // --------end--------

        const workbook = new ExcelJS.Workbook();
        const criteria_worksheet = workbook.addWorksheet('Criteria');
        const report_worksheet = workbook.addWorksheet('Report');

        report_worksheet.addRow(head);
        criteria_worksheet.addRow(this.criteriaHead);

        // Add data
        criteria.forEach((row: { [x: string]: any }) => {
          const rowData: any[] = [];
          this.criteriaHead.forEach((header: string | number) => {
            // console.log("header1", header);
            rowData.push(row[header]);
          });
          criteria_worksheet.addRow(rowData);
        });

        this.consumptionList.forEach((row: { [x: string]: any }) => {
          const rowData: any[] = [];
          head.forEach((header) => {
            // console.log("header2", header);
            rowData.push(row[header]);
          });
          report_worksheet.addRow(rowData);
        });

        // Write to file
        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          saveAs(blob, wb_name + '.xlsx');
          if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, wb_name);
          } else {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.setAttribute('visibility', 'hidden');
            link.download = wb_name.replace(/ /g, '_') + '.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        });
      }
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.consumptionReportdownloaded,
        'success',
      );
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.norecordfound,
      );
    }
  }

  modifyHeader(headers: any, i: any) {
    let modifiedHeader: string;
    modifiedHeader = headers[i - 65]
      .toString()
      .replace(/([A-Z])/g, ' $1')
      .trim();
    modifiedHeader =
      modifiedHeader.charAt(0).toUpperCase() + modifiedHeader.substr(1);
    //console.log(modifiedHeader);
    return modifiedHeader.replace(/I D/g, 'ID');
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
