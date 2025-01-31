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
import { InventoryService } from '../../shared/service/inventory.service';
import { ViewStockAdjustmentDraftDetailsComponent } from '../view-stock-adjustment-draft-details/view-stock-adjustment-draft-details.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-view-store-stock-adjustment-draft',
  templateUrl: './view-store-stock-adjustment-draft.component.html',
  styleUrls: ['./view-store-stock-adjustment-draft.component.css'],
})
export class ViewStoreStockAdjustmentDraftComponent implements OnInit, DoCheck {
  today: any;
  fromDate: any;
  toDate: any;
  stockAdjustmentList: any = [];

  filterTerm: any;
  filteredStockAdjustmentList = new MatTableDataSource<any>();
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  // dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'draftID',
    'refNo',
    'draftDescription',
    'createdBy',
    'createdDate',
    'Edit',
    'view',
  ];

  constructor(
    private location: Location,
    private router: Router,
    private dialog: MatDialog,
    private http_service: LanguageService,
    private dataStorageService: DataStorageService,
    private inventoryService: InventoryService,
    readonly sessionstorage: SessionStorageService,
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
    const facilityID: any = this.sessionstorage.getItem('facilityID');
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
      .getStockAdjustmentDraftList(temp)
      .subscribe((response: any) => {
        this.stockAdjustmentList = response;
        console.log('response', response);
        console.log('response.data', response.data);
        this.filteredStockAdjustmentList.data = response.data;
        console.log(
          'this.filteredStockAdjustmentList.data',
          this.filteredStockAdjustmentList.data,
        );

        // console.log("dataSource",this.dataSource.data);
        this.filteredStockAdjustmentList.paginator = this.paginator;
      });
  }

  filterStockAdjustmentList(filterTerm: any) {
    if (!filterTerm) {
      this.filteredStockAdjustmentList.data = this.stockAdjustmentList.data;
      this.filteredStockAdjustmentList = new MatTableDataSource<any>(
        this.filteredStockAdjustmentList.data,
      );
      this.filteredStockAdjustmentList.paginator = this.paginator;
    } else {
      this.filteredStockAdjustmentList.data = [];
      this.stockAdjustmentList.data.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'stockAdjustmentDraftID' ||
            key === 'refNo' ||
            key === 'draftDesc' ||
            key === 'createdBy'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredStockAdjustmentList.data.push(item);
              this.filteredStockAdjustmentList = new MatTableDataSource<any>(
                this.filteredStockAdjustmentList.data,
              );
              this.filteredStockAdjustmentList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  viewStockAdjustmentDraftDetails(draftID: any) {
    this.dialog
      .open(ViewStockAdjustmentDraftDetailsComponent, {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        data: {
          adjustmentID: draftID,
        },
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          console.log(response);
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
    const facilityDetailStrorage: any =
      this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailStrorage);
    const facilityName = facilityDetail.facilityName;
    const adjustedItemList: any = [];
    let i = 0;

    adjustmentDetials.stockAdjustmentItemDraftEdit.forEach((stock: any) => {
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
    });

    const headerDetails = Object.assign(
      {
        facilityName: facilityName,
        createDate: moment(adjustmentDetials.createdDate).format('DD-MM-YYYY'),
      },
      adjustmentDetials,
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
      columnName: 'Adjustment Draft ID :',
      keyName: 'stockAdjustmentDraftID',
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
      columnName: 'Draft Description :',
      keyName: 'draftDesc',
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
