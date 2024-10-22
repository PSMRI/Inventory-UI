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
import { Location } from '@angular/common';
import { InventoryService } from '../../shared/service/inventory.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import * as moment from 'moment';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ViewStoreSelfConsumptionDetailsComponent } from './view-store-self-consumption-details/view-store-self-consumption-details.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-view-store-self-consumption',
  templateUrl: './view-store-self-consumption.component.html',
  styleUrls: ['./view-store-self-consumption.component.css'],
})
export class ViewStoreSelfConsumptionComponent implements OnInit, DoCheck {
  _minDate: any;
  _today: any;

  _dateRange: Date[] = [];
  _dateRangePrevious: Date[] = [];

  _consumptionList: any = [];
  _filteredConsumptionList = new MatTableDataSource<any>();
  blankTable = [1, 2, 3, 4, 5];
  filterTerm: any;
  searched = false;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'consumptionID',
    'refNo',
    'reason',
    'createdBy',
    'createdDate',
  ];

  constructor(
    private location: Location,
    private inventoryService: InventoryService,
    private dataStorageService: DataStorageService,
    private http_service: LanguageService,
    private dialog: MatDialog,
    private router: Router,
  ) {}

  ngOnInit() {
    this.setDateDefault();
    this.fetchLanguageResponse();
    this.getPastConsumptions();
  }

  setDateDefault() {
    this._today = new Date();
    this._minDate = new Date();
    this._minDate.setFullYear(this._today.getFullYear() - 1);
    this._dateRange[0] = this._today;
    this._dateRange[1] = this._today;
    console.log(this._dateRange, 'dateRange');
  }

  getPastConsumptions() {
    const obj = this.getViewServiceObject();
    this.inventoryService.viewSelfConsumption(obj).subscribe((res) => {
      this.searched = true;
      this.loadConsumption(res);
    });
  }
  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
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
      facilityID: sessionStorage.getItem('facilityID'),
      fromDate: new Date(
        startDate.valueOf() - 1 * startDate.getTimezoneOffset() * 60 * 1000,
      ),
      toDate: new Date(
        endDate.valueOf() - 1 * endDate.getTimezoneOffset() * 60 * 1000,
      ),
    };
  }

  updateDate() {
    this.getPastConsumptions();

    // }
  }

  loadConsumption(consumptionObject: any) {
    console.log(consumptionObject);
    this._consumptionList = consumptionObject.data;
    this._filteredConsumptionList.data = consumptionObject.data;
    this._filteredConsumptionList.paginator = this.paginator;
    console.log(
      'this._filteredConsumptionList.data',
      this._filteredConsumptionList.data,
    );
    this.filterTerm = '';
  }

  filterConsumptionList(searchTerm: string) {
    if (!searchTerm) {
      this._filteredConsumptionList.data = this._consumptionList;
      this._filteredConsumptionList.paginator = this.paginator;
    } else {
      this._filteredConsumptionList.data = [];
      this._filteredConsumptionList.paginator = this.paginator;

      this._consumptionList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'consumptionID' ||
            key === 'refNo' ||
            key === 'reason' ||
            key === 'createdBy'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this._filteredConsumptionList.data.push(item);
              this._filteredConsumptionList.paginator = this.paginator;

              break;
            }
          }
        }
      });
    }
  }

  loadConsumptionDetails(consumption: any) {
    if (consumption && consumption.consumptionID) {
      this.inventoryService
        .getParticularConsumption(consumption.consumptionID)
        .subscribe((res) => this.popOutConsumption(consumption, res));
    }
  }

  popOutConsumption(consumptionDetails: any, consumptionResponse: any) {
    if (consumptionResponse) {
      const mdDialogRef: MatDialogRef<ViewStoreSelfConsumptionDetailsComponent> =
        this.dialog.open(ViewStoreSelfConsumptionDetailsComponent, {
          width: '1200px',
          height: 'auto',
          panelClass: 'fit-screen',
          data: {
            consumptionDetails: consumptionDetails,
            consumptionItem: consumptionResponse,
          },
          disableClose: false,
        });
      mdDialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.print !== null && result.print === true) {
            if (result.print) {
              const printableData = this.createPrintableData(
                consumptionDetails,
                consumptionResponse,
              );
              this.dataStorageService.selfConsumption = printableData;
              const uRL = 'selfConsumption';
              this.router.navigate(['/inventory/dynamicPrint/', uRL]);
            }
          }
        }
      });
    }
  }

  createPrintableData(consumptionDetails: any, consumptionResponse: any) {
    const facilityDetailStorage: any = sessionStorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailStorage);
    const facilityName = facilityDetail.facilityName;
    const printableData: any = [];
    let i = 0;
    consumptionResponse.data.forEach((batch: any) => {
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
    console.log(
      'consumptionDetails',
      JSON.stringify(consumptionDetails, null, 4),
    );
    const consumptionDetail = Object.assign(
      {
        facilityName: facilityName,
        createDate: moment(consumptionDetails.createdDate).format('DD-MM-YYYY'),
      },
      consumptionDetails,
    );
    console.log('consumptionResponse', JSON.stringify(printableData, null, 4));
    const consumedItem = Object.assign(
      {},
      { title: this.title },
      { headerColumn: this.headerColumn },
      { headerDetail: consumptionDetail },
      { columns: this.columns },
      { printableData: printableData },
    );
    return consumedItem;
  }

  goBack() {
    this.location.back();
  }
  title = {
    modalTitle: '',
    headerTitle: 'Consumed Detail',
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
      columnName: 'Qty dispensed',
    },
  ];
  headerColumn = [
    {
      columnName: 'Consumption ID :',
      keyName: 'consumptionID',
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
      columnName: 'Reason :',
      keyName: 'reason',
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
