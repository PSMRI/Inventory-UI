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
import * as ExcelJS from 'exceljs';

import { InventoryService } from '../../shared/service/inventory.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-low-stock-report',
  templateUrl: './low-stock-report.component.html',
  styleUrls: ['./low-stock-report.component.css'],
})
export class LowStockReportComponent implements OnInit, DoCheck {
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  // Report for the store selected at login (facilityID in session); live stock from the API.
  lowStockList: any[] = [];
  displayedColumns = [
    'slNo',
    'itemName',
    'itemCategory',
    'strength',
    'minStock',
    'quantityInHand',
    'stockStatus',
  ];
  searched = false;

  constructor(
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.fetchLanguageResponse();
    this.searchReport();
  }

  searchReport() {
    const reqObj = { facilityID: this.sessionstorage.getItem('facilityID') };
    this.inventoryService.getLowStockReport(reqObj).subscribe(
      (response: any) => {
        this.searched = true;
        if (response.statusCode === 200) {
          this.lowStockList = response.data || [];
        } else {
          this.lowStockList = [];
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.searched = true;
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  downloadReport() {
    if (!this.lowStockList.length) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.norecordfound,
      );
      return;
    }
    const facility = JSON.parse(
      this.sessionstorage.getItem('facilityDetail') || '{}',
    );
    const workbook = new ExcelJS.Workbook();
    const criteriaSheet = workbook.addWorksheet('Criteria');
    criteriaSheet.addRow(['Filter_Name', 'value']);
    criteriaSheet.addRow(['Store', facility.facilityName || '']);
    criteriaSheet.addRow(['Date', new Date().toLocaleDateString('en-GB')]);

    const reportSheet = workbook.addWorksheet('Report');
    reportSheet.addRow([
      'Sl No',
      'Store',
      'Item Name',
      'Item Category',
      'Strength',
      'Min Stock',
      'Quantity In Hand',
      'Stock Status',
    ]);
    this.lowStockList.forEach((row: any) => {
      reportSheet.addRow([
        row.slNo,
        row.facilityName,
        row.itemName,
        row.itemCategory,
        row.strength,
        row.minStock,
        row.quantityInHand,
        row.stockStatus,
      ]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('visibility', 'hidden');
      link.download = 'Low_Stock_Report.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    this.confirmationService.alert(
      this.currentLanguageSet.inventory.lowStockReportdownloaded,
      'success',
    );
  }

  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
}
