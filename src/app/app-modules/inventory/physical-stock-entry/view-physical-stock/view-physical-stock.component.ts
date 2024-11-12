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
import { ViewPhysicalStockDetailsComponent } from './view-physical-stock-details/view-physical-stock-details.component';
import { Location } from '@angular/common';
import { InventoryService } from '../../shared/service/inventory.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-view-physical-stock',
  templateUrl: './view-physical-stock.component.html',
  styleUrls: ['./view-physical-stock.component.css'],
})
export class ViewPhysicalStockComponent implements OnInit, DoCheck {
  _minDate: any;
  _today: any;

  _dateRange: Date[] = [];
  _dateRangePrevious: Date[] = [];

  _stockEntryList: any = [];
  _filteredStockEntryList = new MatTableDataSource<any>();
  blankTable = [1, 2, 3, 4, 5];
  filterTerm: any;

  searched = false;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'entryID',
    'refNo',
    'status',
    'createdBy',
    'createdDate',
  ];

  constructor(
    private location: Location,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    private dataStorageService: DataStorageService,
    readonly sessionstorage: SessionStorageService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.setDateDefault();
    this.fetchLanguageResponse();
    this.getPastEntries();
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
    this.inventoryService.viewPhysicalStockEntry(obj).subscribe((res) => {
      this.loadEntries(res);
      this.searched = true;
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

  updateDate() {
    this.getPastEntries();
  }

  loadEntries(entriesObject: any) {
    console.log(entriesObject);
    console.log('ENTRIES' + entriesObject.data);
    this._stockEntryList = entriesObject.data;
    this._filteredStockEntryList.data = entriesObject.data;
    this._filteredStockEntryList.paginator = this.paginator;
    console.log('P1' + this._filteredStockEntryList);
    console.log('length', this._filteredStockEntryList.data.length);
    this.filterTerm = '';
  }

  filterConsumptionList(searchTerm: string) {
    if (!searchTerm) {
      this._filteredStockEntryList.data = this._stockEntryList;
      this._filteredStockEntryList.paginator = this.paginator;
    } else {
      this._filteredStockEntryList.data = [];
      this._filteredStockEntryList.paginator = this.paginator;
      this._stockEntryList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'phyEntryID' ||
            key === 'refNo' ||
            key === 'status' ||
            key === 'createdBy'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              console.log('ITEM', +item);
              this._filteredStockEntryList.data.push(item);
              this._filteredStockEntryList.paginator = this.paginator;
              console.log('P2' + this._filteredStockEntryList.data);
              break;
            }
          }
        }
      });
    }
  }

  loadEntryDetails(entry: any) {
    if (entry && entry.phyEntryID) {
      this.inventoryService
        .getParticularStockEntry(entry.phyEntryID)
        .subscribe((res) => this.popOutEntryDetails(entry, res));
    }
  }

  popOutEntryDetails(entry: any, stockEntryResponse: any) {
    console.warn(entry, stockEntryResponse);
    if (stockEntryResponse) {
      const matDialogRef: MatDialogRef<ViewPhysicalStockDetailsComponent> =
        this.dialog.open(ViewPhysicalStockDetailsComponent, {
          width: '1200px',
          height: 'auto',
          panelClass: 'fit-screen',
          data: { stockEntry: entry, entryDetails: stockEntryResponse },
          disableClose: false,
        });
      matDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.print !== null && result.print === true) {
            if (result.print) {
              const printableData = this.createPrintableData(
                entry,
                stockEntryResponse,
              );
              this.dataStorageService.physicalStock = printableData;
              const uRL = 'physicalStock';
              this.router.navigate(['/inventory/dynamicPrint/', uRL]);
            }
          }
        }
      });
    }
  }
  createPrintableData(entry: any, stockEntryResponse: any) {
    const facilityDetl: any = this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetl);
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
        itemName: batch.item.itemName,
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

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  title = {
    modalTitle: '',
    headerTitle: 'Stock Entry Detail',
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
      columnName: 'Stock Entry ID :',
      keyName: 'phyEntryID',
    },
    {
      columnName: 'Facility ID :',
      keyName: 'facilityID',
    },
    {
      columnName: 'Reference No :',
      keyName: 'refNo',
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
