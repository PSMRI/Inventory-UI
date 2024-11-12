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
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';

import { InventoryService } from './../../../../../shared/service/inventory.service';
import { ConfirmationService } from './../../../../../../core/services/confirmation.service';

import { ShowIndentBatchDetailsComponent } from './show-indent-batch-details/show-indent-batch-details.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-system-indent-dispense',
  templateUrl: './system-indent-dispense.component.html',
  styleUrls: ['./system-indent-dispense.component.css'],
})
export class SystemIndentDispenseComponent implements OnInit, DoCheck {
  mainStoreItemList: any;
  displayedColumns = [
    'SNo',
    'itemName',
    'qOH',
    'batchNo',
    'quantityInHand',
    'expiryDate',
    'quantity',
    'delete',
  ];
  displayedColumns1 = [
    'index',
    'itemName',
    'requiredQuantity',
    'remarks',
    'action',
  ];
  batchlist = [];
  systemDispenseList: any[] = [];
  mainStoreItemListForDispense: any = [];
  languageComponent: any;
  currentLanguageSet: any;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public http_service: LanguageService,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private activatedRoute: ActivatedRoute,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.getItemList();
    this.fetchLanguageResponse();
  }

  manipulateMainStoreItem() {
    if (this.mainStoreItemList && this.mainStoreItemList.length > 0) {
      const selectedFlag = false;
      this.mainStoreItemList.forEach((dispenseItem: any) => {
        const itemdata = Object.assign(dispenseItem, { selectedFlag });
        console.log('itemdata +++++++++++ in system', itemdata);
        this.mainStoreItemListForDispense.push(itemdata);
        console.log(
          'this.mainStoreItemListForDispense ************in system',
          this.mainStoreItemListForDispense,
        );
      });
    } else {
      console.log('mainstoreItemList is empty');
    }
  }

  getItemList() {
    const viewItemReqObj = {
      indentID: this.activatedRoute.snapshot.params['indentID'],
      fromFacilityID: this.activatedRoute.snapshot.params['toFacilityID'],
    };
    this.inventoryService
      .viewItemListForMainStore(viewItemReqObj)
      .subscribe((viewItemResponse) => {
        if (viewItemResponse.statusCode === 200) {
          this.mainStoreItemList = viewItemResponse.data;
          this.manipulateMainStoreItem();
        }
      });
  }

  createItemList(item: any) {
    const itemList = [];
    const itemObj = {
      itemID: item.itemID,
      quantity: item.requiredQty,
    };
    itemList.push(itemObj);
    return itemList;
  }

  allocateBatch(item: any) {
    const itemList = this.createItemList(item);
    console.log('itemList in system', JSON.stringify(itemList, null, 4));
    this.inventoryService.allocateBatch(itemList).subscribe(
      (response) => {
        if (response.statusCode === 200) {
          if (response.data.length > 0) {
            const itemBatchList = response.data;
            this.openModalToShowBatchList(itemBatchList, item);
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.inventory.itembatchlistisempty,
              'error',
            );
          }
        } else {
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  openModalToShowBatchList(itemBatchList: any, item: any) {
    const mdDialogRef: MatDialogRef<ShowIndentBatchDetailsComponent> =
      this.dialog.open(ShowIndentBatchDetailsComponent, {
        data: {
          batchList: itemBatchList,
          itemDetails: item,
        },
        width: 0.8 * window.innerWidth + 'px',
        panelClass: 'dialog-width',
        disableClose: false,
      });
    mdDialogRef.afterClosed().subscribe(
      (result) => {
        console.log('result', result);
        if (result) {
          console.log('result', JSON.stringify(result));
          result.issuedBatchList.forEach((itemBatchList: any) => {
            const bachList = Object.assign({}, itemBatchList, {
              itemDetails: result.itemDetails,
            });
            console.log('bachList in system dispense', bachList);
            this.disableBatchSelcetion(
              itemBatchList,
              this.mainStoreItemListForDispense,
            );
            this.systemDispenseList.push(bachList);
            console.log(
              'systemDispenseList**********',
              JSON.stringify(this.systemDispenseList, null, 4),
            );
          });
          console.log(
            'systemDispenseList**********',
            JSON.stringify(this.systemDispenseList, null, 4),
          );
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  disableBatchSelcetion(selectedItem: any, mainStoreItemList: any) {
    this.mainStoreItemListForDispense = mainStoreItemList.filter(
      (dispenseItem: any) => {
        if (selectedItem.itemName === dispenseItem.itemName) {
          const selectedFlag = true;
          Object.assign(dispenseItem, {
            selectedFlag: selectedFlag,
          });
          return dispenseItem;
        } else {
          return dispenseItem;
        }
      },
    );
    console.log(
      'mainStoreItemListForDispense',
      this.mainStoreItemListForDispense,
    );
  }

  removeSystemDispenseItem(deletedItem: any, deleteIndex: any) {
    this.systemDispenseList.splice(deleteIndex, 1);
    this.enableBatchSelection(deletedItem, this.mainStoreItemListForDispense);
  }

  enableBatchSelection(deletedItem: any, mainStoreItemList: any) {
    console.log('deletedItem', deletedItem);
    this.mainStoreItemListForDispense = mainStoreItemList.filter(
      (dispenseItem: any) => {
        if (deletedItem.itemDetails.itemName === dispenseItem.itemName) {
          const selectedFlag = false;
          Object.assign(dispenseItem, {
            selectedFlag: selectedFlag,
          });
          return dispenseItem;
        } else {
          return dispenseItem;
        }
      },
    );
    console.log(
      'mainStoreItemListForDispense',
      this.mainStoreItemListForDispense,
    );
  }
  batchListDetails: any[] = [];

  saveDispenseList() {
    let itemDetailsObj: any;
    console.log(
      'This.manual dispense list..',
      JSON.stringify(this.systemDispenseList, null, 4),
    );

    const currentDate = new Date();
    console.log('currentDate', currentDate);
    const currentDateManipulated = new Date(
      currentDate.valueOf() - 1 * currentDate.getTimezoneOffset() * 60 * 1000,
    );

    console.log('currentDateManipulated', currentDateManipulated);

    this.systemDispenseList.forEach((itemData) => {
      console.log('itemData', itemData);

      itemData.itemBatchList.forEach((batchData: any) => {
        const reqObjForBatchList = {
          indentOrderID: itemData.itemDetails.indentOrderID,
          indentID: itemData.itemDetails.indentID,
          itemID: itemData.itemDetails.itemID,
          itemName: itemData.itemDetails.itemName,
          issuedQty: batchData.quantity,
          issueDate: currentDateManipulated,
          remarks: itemData.itemDetails.remarks,
          providerServiceMapID: itemData.itemDetails.providerServiceMapID,
          vanID: itemData.itemDetails.vanID,
          deleted: itemData.itemDetails.deleted,
          processed: itemData.itemDetails.processed,
          createdBy: itemData.itemDetails.createdBy,
          createdDate: itemData.itemDetails.createdDate,
          fromFacilityID: this.sessionstorage.getItem('fromFacilityID'),
          fromFacilityName: this.sessionstorage.getItem('fromFacilityName'),
          toFacilityID: this.sessionstorage.getItem('toFacilityID'),
          parkingPlaceID: itemData.itemDetails.parkingPlaceID,
          action: 'Issued',
          itemStockEntryID: batchData.itemStockEntryID,
          unitCostPrice: null,
          batchNo: batchData.batchNo,
          expiryDate: batchData.expiryDate,
        };
        this.batchListDetails.push(reqObjForBatchList);
      });
    });
    console.log('systemDispenseList.length', this.systemDispenseList.length);
    console.log(
      'mainStoreItemListForDispense.length',
      this.mainStoreItemListForDispense.length,
    );
    if (
      this.systemDispenseList.length !==
      this.mainStoreItemListForDispense.length
    ) {
      this.confirmationService
        .confirm(
          'info',
          'All items are not selected. Do you want to proceed further?',
          'Yes',
          'No',
        )
        .subscribe((res) => {
          if (res) {
            this.saveAPICall();
          }
        });
    }
    if (
      this.systemDispenseList.length ===
      this.mainStoreItemListForDispense.length
    ) {
      this.saveAPICall();
    }
  }
  saveAPICall() {
    this.inventoryService
      .saveDispenseList(this.batchListDetails)
      .subscribe((response) => {
        console.log('Response for save data', response);
        if (response.statusCode === 200) {
          this.confirmationService.alert(response.data.response, 'success');
          this.router.navigate(['/inventory/mainStoreIndentOrderWorklist']);
          this.resetLocalstorageData();
        }
      });
  }
  resetLocalstorageData() {
    localStorage.removeItem('fromFacilityID');
    localStorage.removeItem('fromFacilityName');
    localStorage.removeItem('toFacilityID');
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
