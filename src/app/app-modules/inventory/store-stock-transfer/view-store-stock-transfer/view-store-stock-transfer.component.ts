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
import { Component, OnInit, ViewChild, DoCheck } from '@angular/core';
import { ViewStoreStockTransferDetailsComponent } from './view-store-stock-transfer-details/view-store-stock-transfer-details.component';
import { Location } from '@angular/common';
import { InventoryService } from '../../shared/service/inventory.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';
@Component({
  selector: 'app-view-store-stock-transfer',
  templateUrl: './view-store-stock-transfer.component.html',
  styleUrls: ['./view-store-stock-transfer.component.css'],
})
export class ViewStoreStockTransferComponent implements OnInit, DoCheck {
  _minDate: any;
  _today: any;

  _dateRange: Date[] = [];
  _dateRangePrevious: Date[] = [];

  _stockEntryList = [];
  _filteredStockEntryList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  blankTable = [1, 2, 3, 4, 5];
  filterTerm: any;
  ourStore: any;
  searched = false;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private location: Location,
    private inventoryService: InventoryService,
    private dataStorageService: DataStorageService,
    private dialog: MatDialog,
    private http_service: LanguageService,
    private router: Router,
    private sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.setDateDefault();
    this.fetchLanguageResponse();

    this.getPastEntries();
    this.ourStore = this.sessionstorage.getItem('facilityID');
  }

  setDateDefault() {
    this._today = new Date();
    this._minDate = new Date();
    this._minDate.setFullYear(this._today.getFullYear() - 1);
    this._dateRange[0] = this._today;
    this._dateRange[1] = this._today;
    console.log(this._dateRange, 'dateRange');
  }

  getPastEntries() {
    const obj = this.getViewServiceObject();
    this.inventoryService.viewStockTransferEntry(obj).subscribe((res) => {
      this.searched = true;
      this.loadEntries(res);
    });
  }

  getViewServiceObject() {
    const startDate: Date = new Date(this._dateRange[0]);
    startDate.setHours(0);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);

    const endDate: Date = new Date(this._dateRange[1]);
    endDate.setHours(23);
    endDate.setMinutes(59);
    endDate.setSeconds(59);
    endDate.setMilliseconds(0);

    return {
      facilityID: this.sessionstorage.getItem('facilityID'),
      fromDate: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000,
      ),
      toDate: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000,
      ),
    };
  }
  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  updateDate() {
    this.getPastEntries();

    // }
  }

  loadEntries(entriesObject: any) {
    console.log('entriesObj', entriesObject);
    const newObject: any = [];
    if (entriesObject) {
      entriesObject.data.forEach((element: any) => {
        newObject.push({
          refNo: element.refNo,
          stockTransferID: element.stockTransferID,
          transferFromID: element.transferFromFacilityID,
          transferToID: element.transferToFacilityID,
          transferFromFacility: element.transferFromFacility.facilityName,
          transferToFacility: element.transferToFacility.facilityName,
          createdBy: element.createdBy,
          createdDate: element.createdDate || 'Not Available',
        });
      });
    }
    this._stockEntryList = newObject;
    this._filteredStockEntryList.data = newObject;
    this._filteredStockEntryList.paginator = this.paginator;
    console.log(
      'this._filteredStockEntryList.dataJK',
      this._filteredStockEntryList.data,
    );
    this.filterTerm = '';
  }

  filterConsumptionList(searchTerm: string) {
    if (!searchTerm) {
      this._filteredStockEntryList.data = this._stockEntryList;
      this._filteredStockEntryList.paginator = this.paginator;
    } else {
      this._filteredStockEntryList.data = [];
      this._filteredStockEntryList.paginator = this.paginator;
      this._stockEntryList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'refNo' ||
            key === 'stockTransferID' ||
            key === 'transferFromFacility' ||
            key === 'transferToFacility' ||
            key === 'createdBy'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this._filteredStockEntryList.data.push(item);
              this._filteredStockEntryList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  loadEntryDetails(entry: any) {
    if (entry && entry.stockTransferID) {
      this.inventoryService
        .getParticularStockTransferEntry(entry.stockTransferID)
        .subscribe((res) => this.popOutEntryDetails(entry, res));
    }
  }

  popOutEntryDetails(entry: any, stockEntryResponse: any) {
    console.warn(entry, stockEntryResponse);
    if (stockEntryResponse) {
      const mdDialogRef: MatDialogRef<ViewStoreStockTransferDetailsComponent> =
        this.dialog.open(ViewStoreStockTransferDetailsComponent, {
          width: '1200px',
          height: 'auto',
          panelClass: 'fit-screen',
          data: { stockEntry: entry, entryDetails: stockEntryResponse },
          disableClose: false,
        });
      mdDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.print !== null && result.print === true) {
            if (result.print) {
              const printableData = this.createPrintableData(
                entry,
                stockEntryResponse,
              );
              this.dataStorageService.stockTransfer = printableData;
              const uRL = 'stockTransfer';
              this.router.navigate(['/inventory/dynamicPrint/', uRL]);
            }
          }
        }
      });
    }
  }

  createPrintableData(entry: any, stockEntryResponse: any) {
    const facilityDetailStorage: any =
      this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailStorage);
    const facilityName = facilityDetail.facilityName;
    const printableData: any = [];
    let i = 0;
    console.log(
      'stockEntryResponse',
      JSON.stringify(stockEntryResponse, null, 4),
    );
    stockEntryResponse.data.forEach((batch: any) => {
      i = i + 1;
      const consumedBatch = {
        sNo: i,
        itemName: batch.itemName,
        batchNo: batch.batchNo,
        expiryDate: moment(batch.expiryDate).format('DD-MM-YYYY'),
        qod: batch.quantity,
      };
      printableData.push(consumedBatch);
    });
    console.log('consumptionDetails', JSON.stringify(entry, null, 4));
    const entryDetails = Object.assign(
      {
        facilityName: facilityName,
        createDate: moment(entry.createdDate).format('DD-MM-YYYY'),
      },
      entry,
    );
    console.log('consumptionResponse', JSON.stringify(printableData, null, 4));
    const stockEntered = Object.assign(
      {},
      { title: this.title },
      { headerColumn: this.headerColumn },
      { headerDetail: entryDetails },
      { columns: this.columns },
      { printableData: printableData },
    );
    return stockEntered;
  }

  goBack() {
    this.location.back();
  }

  title = {
    modalTitle: '',
    headerTitle: 'Stock Transfer Detail',
    tableTitle: '',
  };
  columns = [
    {
      keyName: 'sNo',
      columnName: 'S No.',
    },
    {
      keyName: 'itemName',
      columnName: 'Item Name',
    },
    {
      keyName: 'batchNo',
      columnName: 'Batch No',
    },
    {
      keyName: 'expiryDate',
      columnName: 'Expiry Date',
    },
    {
      keyName: 'qod',
      columnName: 'Quantity',
    },
  ];
  headerColumn = [
    {
      columnName: 'Stock Transfer ID :',
      keyName: 'stockTransferID',
    },
    {
      columnName: 'Reference No :',
      keyName: 'refNo',
    },
    {
      columnName: 'Transfer From ID :',
      keyName: 'transferFromID',
    },

    {
      columnName: 'Transfer From Facility :',
      keyName: 'transferFromFacility',
    },
    {
      columnName: 'Transfer To ID :',
      keyName: 'transferToID',
    },
    {
      columnName: 'Transfer To Facility :',
      keyName: 'transferToFacility',
    },

    {
      columnName: 'Created By :',
      keyName: 'createdBy',
    },
    {
      columnName: 'Created Date :',
      keyName: 'createDate',
    },
  ];

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
