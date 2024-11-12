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
import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { DataStorageService } from '../../shared/service/data-storage.service';
import { ViewStockAdjustmentDetailsComponent } from '../view-stock-adjustment-details/view-stock-adjustment-details.component';
import { InventoryService } from '../../shared/service/inventory.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-view-store-stock-adjustment',
  templateUrl: './view-store-stock-adjustment.component.html',
  styleUrls: ['./view-store-stock-adjustment.component.css'],
})
export class ViewStoreStockAdjustmentComponent implements OnInit, DoCheck {
  today: any;
  fromDate: any;
  toDate: any;
  stockAdjustmentList: any = [];
  ResponseWar: any = [];
  _minDate: any;
  filterTerm: any;
  filteredStockAdjustmentList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'stockAdjustmentID',
    'refNo',
    'createdBy',
    'createdDate',
    'view',
  ];

  constructor(
    private location: Location,
    private dialog: MatDialog,
    private http_service: LanguageService,
    private router: Router,
    private dataStorageService: DataStorageService,
    readonly sessionstorage: SessionStorageService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.fromDate = new Date();
    this.fromDate.setHours(0, 0, 0, 0);
    this.toDate = new Date();

    this.today = new Date();
    this.viewRecords();
    this.fetchLanguageResponse();
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

    this.inventoryService
      .getStockAdjustmentList(temp)
      .subscribe((response: any) => {
        this.stockAdjustmentList = response;
        this.ResponseWar = response;
        this.filteredStockAdjustmentList.data.push(response);
        this.dataSource = new MatTableDataSource<any>(
          this.filteredStockAdjustmentList.data[0].data,
        );
        console.log('dataSourcePart2', this.dataSource.data);
        this.dataSource.paginator = this.paginator;
        console.log('WEEEEE', this.dataSource.data);
      });
  }

  filterStockAdjustmentList(filterTerm: any) {
    if (!filterTerm) {
      // this.viewRecords();
      console.log('stockAdjustmentList', this.stockAdjustmentList);
      console.log(
        'filteredStockAdjustmentList',
        this.filteredStockAdjustmentList.data,
      );
      this.filteredStockAdjustmentList.data.push(this.stockAdjustmentList);
      const len = this.filteredStockAdjustmentList.data.length;
      this.dataSource = new MatTableDataSource<any>(
        this.filteredStockAdjustmentList.data[len - 1].data,
      );
      this.dataSource.paginator = this.paginator;
    } else {
      this.filteredStockAdjustmentList.data = [];
      this.stockAdjustmentList.data.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'stockAdjustmentDraftID' ||
            key === 'stockAdjustmentID' ||
            key === 'refNo' ||
            key === 'reason' ||
            key === 'createdBy'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredStockAdjustmentList.data.push(item);
              this.dataSource = new MatTableDataSource<any>(
                this.filteredStockAdjustmentList.data,
              );
              this.dataSource.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  viewStockAdjustmentDetails(adjustmentID: any) {
    this.dialog
      .open(ViewStockAdjustmentDetailsComponent, {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        data: {
          adjustmentID: adjustmentID,
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          const printableData = this.createPrintableData(response);
          this.dataStorageService.adjustment = printableData;
          const URL = 'adjustment';
          this.router.navigate(['/inventory/dynamicPrint/', URL]);
        }
      });
  }

  goBack() {
    this.location.back();
  }

  goToUpdateAdjustmentDraft(draftID: any) {
    this.router.navigate(['inventory/storeStockAdjustment/update', draftID]);
  }

  createPrintableData(adjustmentDetials: any) {
    const facilityDetailStorage: any =
      this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailStorage);
    const facilityName = facilityDetail.facilityName;
    const adjustedItemList: any = [];
    let i = 0;
    console.log('adjustmentDetials', adjustmentDetials);
    console.log('adjustmentDetials', adjustmentDetials.data);

    adjustmentDetials.data.stockAdjustmentItemDraftEdit.forEach(
      (stock: any) => {
        i = i + 1;
        const temp = {
          sNo: i,
          itemName: stock.itemName,
          batchID: stock.batchID,
          quantityInHand: stock.quantityInHand,
          adjustedQuantity: stock.adjustedQuantity,
          adjustmentType:
            stock.isAdded !== undefined && stock.isAdded ? 'Receipt' : 'Issue',
          reason: stock.reason,
        };
        adjustedItemList.push(temp);
      },
    );

    const headerDetails = Object.assign(
      {
        facilityName: facilityName,
        createDate: moment(adjustmentDetials.createdDate).format('DD-MM-YYYY'),
      },
      adjustmentDetials.data,
    );
    const printableData = Object.assign(
      {},
      { title: this.title },
      { headerColumn: this.headerColumn },
      { headerDetail: headerDetails },
      { columns: this.columns },
      { printableData: adjustedItemList },
    );
    return printableData;
  }

  setDateDefault() {
    this.today = new Date();
    this._minDate = new Date();
    this._minDate.setFullYear(this.today.getFullYear() - 1);
  }

  title = {
    modalTitle: '',
    headerTitle: 'Adjustment Detail',
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
      keyName: 'batchID',
      columnName: 'Batch No',
    },
    {
      keyName: 'quantityInHand',
      columnName: 'Quantity on Hand',
    },
    {
      keyName: 'adjustedQuantity',
      columnName: 'Adjusted Quantity',
    },
    {
      keyName: 'adjustmentType',
      columnName: 'Adjustment Type',
    },
    {
      columnName: 'Reason',
      keyName: 'reason',
    },
  ];

  headerColumn = [
    {
      columnName: 'Adjustment ID :',
      keyName: 'stockAdjustmentID',
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
