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
import { Router } from '@angular/router';
import { ConfirmationService } from 'src/app/app-modules/core/services';
import { MatDialog } from '@angular/material/dialog';
import { SubStoreItemModelComponent } from './sub-store-item-model/sub-store-item-model.component';
import { InventoryService } from '../../../shared/service/inventory.service';
import { DataStorageService } from '../../../shared/service/data-storage.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-sub-store-indent-order-worklist',
  templateUrl: './sub-store-indent-order-worklist.component.html',
  styleUrls: ['./sub-store-indent-order-worklist.component.css'],
})
export class SubStoreIndentOrderWorklistComponent implements OnInit, DoCheck {
  substoreOrderlist = new MatTableDataSource<any>();
  orderReqObject: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns = [
    'SNo',
    'indentID',
    'referenceNo',
    'requestDate',
    'view',
    'edit',
    'action',
  ];
  constructor(
    private inventoryService: InventoryService,
    private dialog: MatDialog,
    public http_service: LanguageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private dataStorageService: DataStorageService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.orderReqObject = {
      fromFacilityID: this.sessionstorage.getItem('facilityID'),
    };
    this.showSubstoreOrderWorklist(this.orderReqObject);
    this.fetchLanguageResponse();
  }
  showSubstoreOrderWorklist(orderReqObject: any) {
    this.inventoryService
      .showSubStoreOrderWorklist(orderReqObject)
      .subscribe((orderlistRes) => {
        this.substoreOrderlist.data = orderlistRes.data;
        this.substoreOrderlist.paginator = this.paginator;
      });
  }
  cancelIndent(indentOrder: any) {
    console.log(indentOrder);

    this.inventoryService
      .cancelIndentRequest(indentOrder)
      .subscribe((cancelResponse) => {
        if (cancelResponse.statusCode === 200) {
          this.confirmationService.alert(
            cancelResponse.data.response,
            'success',
          );
          this.showSubstoreOrderWorklist(this.orderReqObject);
        } else {
          this.confirmationService.alert(cancelResponse.errorMessage);
        }
      });
  }

  viewItemListDetails(orderlist: any) {
    this.dialog.open(SubStoreItemModelComponent, {
      width: '1200px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: {
        itemListDetails: orderlist,
      },
    });
  }
  routeToRaiseRequest() {
    this.router.navigate(['/inventory/indentRequest']);
  }
  receiveIndent(acceptorder: any) {
    console.log('acceptorder', acceptorder);
    this.inventoryService
      .receiveIndentOrder(acceptorder)
      .subscribe((acceptOrderResponse) => {
        if (acceptOrderResponse.statusCode === 200) {
          this.confirmationService.alert(
            acceptOrderResponse.data.response,
            'success',
          );
          this.showSubstoreOrderWorklist(this.orderReqObject);
        } else {
          this.confirmationService.alert(acceptOrderResponse.errorMessage);
        }
      });
  }
  goToUpdateIndentRequest(indentDetails: any) {
    console.log('indentDetails', indentDetails);
    this.dataStorageService.indentDetails = indentDetails;
    this.router.navigate(['inventory/indentRequest/']);
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
