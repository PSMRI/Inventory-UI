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
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { InventoryService } from '../../shared/service/inventory.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-yearly-report',
  templateUrl: './yearly-report.component.html',
  styleUrls: ['./yearly-report.component.css'],
})
export class YearlyReportComponent implements OnInit, DoCheck {
  yearlyForm!: FormGroup;
  currentLanguageSet: any;
  languageComponent: any;
  criteriaHead: any;

  constructor(
    private formBuilder: FormBuilder,
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  today!: Date;
  minEndDate!: Date;
  maxDate!: Date;
  maxEndDate!: Date;
  consumptionList = [];
  dateOffset: any;

  years: any[] = [];
  yy!: number;
  selectedFacilityName = JSON.parse(
    this.sessionstorage.getItem('facilityDetail') || '{}',
  ).facilityName;
  facilities = [this.selectedFacilityName, 'All'];

  //BU40088124 27/7/2022 Added Facility Name dropdown in reports

  ngOnInit() {
    this.createYearlyForm();
    this.getYear();
    this.fetchLanguageResponse();
    this.setSelectedFacility();
  }

  createYearlyForm() {
    this.yearlyForm = this.formBuilder.group({
      year: [null, Validators.required],
      facilityName: [null, Validators.required],
    });
  }

  get year() {
    return this.yearlyForm.controls['year'].value;
  }

  getYear() {
    const today = new Date();
    this.yy = today.getFullYear();
    for (let i = this.yy; i >= this.yy - 100; i--) {
      this.years.push(i);
    }
  }

  searchReport() {
    console.log('Data form value...', JSON.stringify(this.yearlyForm.value));
    const reqObjForYearlyReport = {
      year: this.yearlyForm.value.year,
      facilityID:
        this.yearlyForm.value.facilityName === 'All'
          ? null
          : this.sessionstorage.getItem('facilityID'),
    };
    console.log(
      'Data form data',
      JSON.stringify(reqObjForYearlyReport, null, 4),
    );

    this.inventoryService
      .getYearlyReports(reqObjForYearlyReport)
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
    this.yearlyForm.patchValue({ facilityName: this.selectedFacilityName });
  }

  downloadReport(downloadFlag: boolean) {
    if (downloadFlag === true) {
      this.searchReport();
    }
  }

  getResponseOfSearchThenDo() {
    const criteria: any = [];
    criteria.push({ Filter_Name: 'Year', value: this.year });
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
      const headers = [
        'slNo',
        'year',
        'facilityName',
        'itemName',
        'itemCategory',
        'batchNo',
        'unitCostPrice',
        'expiryDate',
        'openingStock',
        'quantityReceived',
        'dispensedQuantity',
        'adjustmentReceipt',
        'adjustmentIssue',
        'closingStock',
      ];
      const array = this.consumptionList.filter(function (obj: any) {
        for (const key in obj) {
          if (obj[key] === null) {
            obj[key] = '';
          }
        }
        return obj;
      });
      if (array.length !== 0) {
        console.log(' head', headers);
        const wb_name = 'Yearly Report';

        // below code added to modify the headers

        let i = 65; // starting from 65 since it is the ASCII code of 'A'.
        let count = 0;
        while (i < headers.length + 65) {
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
          const newName = this.modifyHeader(headers, i);
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

        report_worksheet.addRow(headers);
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
          headers.forEach((header) => {
            // console.log("header2", header);
            rowData.push(row[header]);
          });
          report_worksheet.addRow(rowData);
        });

        workbook.xlsx.writeBuffer().then((buffer) => {
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          if (navigator.msSaveBlob) {
            saveAs(blob, wb_name + '.xlsx');
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
        this.currentLanguageSet.inventory.yearlyReportdownloaded,
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
