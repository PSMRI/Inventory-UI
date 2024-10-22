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
import { ConfirmationService } from 'src/app/app-modules/core/services';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../../shared/service/inventory.service';
import { MainStoreItemModelComponent } from './main-store-item-model/main-store-item-model.component';
import { RejectItemFromMainstoreModelComponent } from './reject-item-from-mainstore-model/reject-item-from-mainstore-model.component';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-main-store-indent-order-worklist',
  templateUrl: './main-store-indent-order-worklist.component.html',
  styleUrls: ['./main-store-indent-order-worklist.component.css'],
})
export class MainStoreIndentOrderWorklistComponent implements OnInit, DoCheck {
  enableDispensary = false;
  isMainStore = false;
  enableIndentReceipt = false;

  mainstoreOrderlist = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mainStoreItemList: any = [];
  orderReqObject: any;
  rejectOrderList = [];

  mainFacilityID: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'SNo',
    'indentID',
    'referenceNo',
    'requestDate',
    'view',
    'action',
  ];

  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    public http_service: LanguageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.orderReqObject = {
      facilityID: sessionStorage.getItem('facilityID'),
    };
    this.showMainStoreOrderWorklist(this.orderReqObject);
    this.navigateToIndentReceipt();
    this.fetchLanguageResponse();
  }
  showMainStoreOrderWorklist(orderReqObject: any) {
    this.inventoryService
      .showMainstoreOrderWorklist(orderReqObject)
      .subscribe((orderlistRes) => {
        this.mainstoreOrderlist.data = orderlistRes.data;
        this.mainstoreOrderlist.paginator = this.paginator;
      });
  }

  viewItemListDetails(orderList: any) {
    this.dialog.open(MainStoreItemModelComponent, {
      width: '1200px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: {
        itemListDetails: orderList,
      },
    });
  }
  viewItemListDetailsForDispense(itemData: any) {
    console.log('itemData***********', itemData);
    window.sessionStorage.setItem('toFacilityID', itemData.fromFacilityID);
    window.sessionStorage.setItem(
      'fromFacilityName',
      itemData.fromFacilityName,
    );
    window.sessionStorage.setItem('fromFacilityID', itemData.toFacilityID);
    this.router.navigate([
      '/inventory/mainStoreIndentDispenses/',
      itemData.fromFacilityID,
      itemData.indentID,
    ]);
  }
  rejectIndent(rejectOrder: any) {
    const dialogRef = this.dialog.open(RejectItemFromMainstoreModelComponent, {
      width: '600px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: {
        rejectItem: rejectOrder,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log('result', result);

      if (result) {
        this.showMainStoreOrderWorklist(this.orderReqObject);
      }
    });
  }
  navigateToIndentReceipt() {
    this.isMainStore = JSON.parse(
      sessionStorage.getItem('facilityDetail') || '{}',
    ).isMainFacility;
    this.mainFacilityID = JSON.parse(
      sessionStorage.getItem('facilityDetail') || '{}',
    ).mainFacilityID;

    if (this.isMainStore && this.mainFacilityID !== undefined) {
      // this.mainFacilityID !== null ||
      this.enableIndentReceipt = true;
    }
  }

  routingPath() {
    this.router.navigate(['inventory/subStoreIndentOrderWorklist']);
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
