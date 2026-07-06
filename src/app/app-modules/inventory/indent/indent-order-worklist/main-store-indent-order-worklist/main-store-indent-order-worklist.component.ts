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
import { ZardDialogService } from 'Common-UI/v2/ui/dialog';
import { InventoryService } from '../../../shared/service/inventory.service';
import { MainStoreItemModelComponent } from './main-store-item-model/main-store-item-model.component';
import { RejectItemFromMainstoreModelComponent } from './reject-item-from-mainstore-model/reject-item-from-mainstore-model.component';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { TableDataSource } from 'src/app/app-modules/core/utils/table-data-source';
import { SessionStorageService } from 'Common-UI/v2/registrar/services/session-storage.service';
import { NgIf, DatePipe } from '@angular/common';
import { UtcDatePipe } from '../../../utc-date.pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideEye } from '@ng-icons/lucide';
import { cardImports } from 'Common-UI/v2/ui/card';
import { ZardButtonComponent } from 'Common-UI/v2/ui/button';
import { ZardTableImports } from 'Common-UI/v2/ui/table';
import { ZardPaginatorComponent } from 'Common-UI/v2/ui/paginator';
import { tooltipImports } from 'Common-UI/v2/ui/tooltip';

@Component({
  selector: 'app-main-store-indent-order-worklist',
  templateUrl: './main-store-indent-order-worklist.component.html',
  viewProviders: [provideIcons({ lucideEye })],
  imports: [
    NgIf,
    NgIcon,
    ...cardImports,
    ZardButtonComponent,
    ...ZardTableImports,
    ZardPaginatorComponent,
    ...tooltipImports,
    DatePipe,
    UtcDatePipe,
  ],
})
export class MainStoreIndentOrderWorklistComponent implements OnInit, DoCheck {
  enableDispensary = false;
  isMainStore = false;
  enableIndentReceipt = false;

  mainstoreOrderlist = new TableDataSource<any>();
  paginator: unknown = null;
  mainStoreItemList: any = [];
  orderReqObject: any;
  rejectOrderList = [];

  mainFacilityID: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource!: TableDataSource<any>;
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
    private dialog: ZardDialogService,
    public http_service: LanguageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.orderReqObject = {
      facilityID: this.sessionstorage.getItem('facilityID'),
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
    this.dialog.create<MainStoreItemModelComponent, unknown>({
      zContent: MainStoreItemModelComponent,
      zData: {
        itemListDetails: orderList,
      },
      zWidth: '1200px',
      zHideFooter: true,
      zClosable: false,
    });
  }
  viewItemListDetailsForDispense(itemData: any) {
    console.log('itemData***********', itemData);
    this.sessionstorage.setItem('toFacilityID', itemData.fromFacilityID);
    this.sessionstorage.setItem('fromFacilityName', itemData.fromFacilityName);
    this.sessionstorage.setItem('fromFacilityID', itemData.toFacilityID);
    this.router.navigate([
      '/inventory/mainStoreIndentDispenses/',
      itemData.fromFacilityID,
      itemData.indentID,
    ]);
  }
  rejectIndent(rejectOrder: any) {
    const dialogRef = this.dialog.create<
      RejectItemFromMainstoreModelComponent,
      unknown
    >({
      zContent: RejectItemFromMainstoreModelComponent,
      zData: {
        rejectItem: rejectOrder,
      },
      zWidth: '600px',
      zHideFooter: true,
      zClosable: false,
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
      this.sessionstorage.getItem('facilityDetail') || '{}',
    ).isMainFacility;
    this.mainFacilityID = JSON.parse(
      this.sessionstorage.getItem('facilityDetail') || '{}',
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
