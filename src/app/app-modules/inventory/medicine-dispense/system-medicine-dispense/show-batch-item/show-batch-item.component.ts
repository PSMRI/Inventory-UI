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
import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { InventoryService } from './../../../shared/service/inventory.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-show-batch-item',
  templateUrl: './show-batch-item.component.html',
  styleUrls: ['./show-batch-item.component.css'],
})
export class ShowBatchItemComponent implements OnInit, DoCheck {
  app: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    private inventoryService: InventoryService,
    public http_service: LanguageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public mdDialogRef: MatDialogRef<ShowBatchItemComponent>,
    readonly sessionstorage: SessionStorageService,
  ) {}
  issuedBatchList = new MatTableDataSource<any>();
  beneficaryDetail: any;
  ngOnInit() {
    this.app = this.getApp();

    this.issuedBatchList.data = this.data.batchList;
    this.beneficaryDetail = this.data.beneficaryDetail;
    console.log('tD', this.data);
    console.log('this.beneficaryDetail', this.beneficaryDetail);
    console.log('issuedBatchList', this.issuedBatchList.data);
    this.fetchLanguageResponse();
  }

  getApp() {
    console.log(this.sessionstorage.getItem('host'));
    if (this.sessionstorage.getItem('host')) {
      return this.sessionstorage.getItem('host');
    } else {
      return 'STORE';
    }
  }
  createStockExitList() {
    const stockExitList: any = [];
    this.issuedBatchList.data.forEach((dispenseItem: any) => {
      dispenseItem.itemBatchList.forEach((batch: any) => {
        const dispensedItem = {
          //createdBy: this.sessionstorage.getItem('userID'),
          createdBy: this.sessionstorage.userID,
          itemID: dispenseItem.itemID,
          itemStockEntryID: batch.itemStockEntryID,
          quantity: batch.quantity,
        };
        stockExitList.push(dispensedItem);
      });
    });
    const dispensingItem = {
      issuedBy: this.app,
      ...this.beneficaryDetail,
      itemStockExit: stockExitList,
      vanID: this.sessionstorage.getItem('vanID'),
      parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
    };
    return dispensingItem;
  }

  saveAndUpdateItem() {
    const dispensingItem = this.createStockExitList();
    console.log('dispenseItem', dispensingItem);
    this.inventoryService
      .saveStockExit(dispensingItem)
      .subscribe((response) => {
        this.closeBatchModal(response, this.issuedBatchList.data, null);
      });
  }

  saveUpdateAndPrintItem() {
    const dispensingItem = this.createStockExitList();
    console.log('dispenseItem', dispensingItem);
    this.inventoryService
      .saveStockExit(dispensingItem)
      .subscribe((response) => {
        this.closeBatchModal(response, this.issuedBatchList.data, true);
      });
  }

  closeBatchModal(result: any, issuedBatchList: any, print: any) {
    const modalresult = Object.assign({
      result: result,
      issuedBatchList: issuedBatchList,
      print: print,
    });
    this.mdDialogRef.close(modalresult);
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
