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
import { Router } from '@angular/router';
import { InventoryService } from '../shared/service/inventory.service';
import {
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
  AbstractControl,
} from '@angular/forms';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { Component, DoCheck, OnInit } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import * as moment from 'moment';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
@Component({
  selector: 'app-store-stock-transfer',
  templateUrl: './store-stock-transfer.component.html',
  styleUrls: ['./store-stock-transfer.component.css'],
  animations: [
    trigger('enterAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class StoreStockTransferComponent implements OnInit, DoCheck {
  stockTransferForm!: FormGroup;
  arrayHead!: FormArray;
  facilityID: any;
  stores: any = [];
  filterStore: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource!: MatTableDataSource<AbstractControl>;
  displayedColumns: string[] = [
    'itemName',
    'batchID',
    'qOH',
    'adjustmentType',
    'action',
  ];

  constructor(
    private inventoryService: InventoryService,
    private alertService: ConfirmationService,
    private fb: FormBuilder,
    private router: Router,
    private http_service: LanguageService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.checkFacility();
  }

  ngOnInit() {
    this.getAllStore();
    this.stockTransferForm = this.createStockTransferForm();
    this.setArrayHead();
    this.updateTodaysData();
    this.fetchLanguageResponse();
  }

  stroreStockTransferTableData(): any {
    return (this.stockTransferForm.get('itemArray') as FormArray).controls;
  }

  checkFacility() {
    this.facilityID = this.sessionstorage.getItem('facilityID');
    console.log('CSKDHONI**', this.facilityID);
    if (this.facilityID === null || this.facilityID <= 0) {
      this.router.navigate(['/inventory']);
    }
  }

  getAllStore() {
    const serviceProviderId = this.sessionstorage.getItem('providerServiceID');
    this.inventoryService.getAllStore(serviceProviderId).subscribe((data) => {
      console.log('data****', data);
      const newArr: any = Object.entries(data).map(([key, value]) => value);
      console.log('newArr****', newArr);
      this.stores = newArr[0].filter((item: any) => item.deleted === false);
      console.log('stores$$$', this.stores);
      this.filterStore = this.filterSubStore(this.stores, this.facilityID);
      console.log('filterStore&&&&&', this.filterStore);
    });
  }

  filterSubStore(storeList: any, facilityID: any) {
    const source = storeList.filter(
      (item: any) => item.facilityID === Number(facilityID),
    );

    const children = [];
    const queue = [];
    queue.push(source[0]);

    while (queue.length > 0) {
      const front = queue.shift();
      children.push(front);
      storeList.forEach((item: any) => {
        if (item.mainFacilityID && item.mainFacilityID === front.facilityID)
          queue.push(item);
      });
    }

    const index = children.indexOf(source[0]);
    children.splice(index, 1);

    const parent = storeList.filter(
      (item: any) =>
        source[0].mainFacilityID &&
        item.facilityID === source[0].mainFacilityID,
    );
    const sibling = storeList.filter(
      (item: any) =>
        source[0].mainFacilityID &&
        item.mainFacilityID === source[0].mainFacilityID,
    );

    const index2 = sibling.indexOf(source[0]);
    sibling.splice(index2, 1);

    const final = new Set(parent.concat(sibling).concat(children));
    return Array.from(final);
  }

  createStockTransferForm() {
    return this.fb.group({
      dated: { value: null, disabled: true },
      referenceNumber: [null, Validators.required],
      transferTo: [null, Validators.required],
      createdBy: [null, Validators.required],
      providerServiceMapID: [null, Validators.required],
      itemArray: new FormArray([this.createItem()]),
    });
  }

  createItem() {
    return this.fb.group({
      batchNo: [null, Validators.required],
      itemStockEntryID: [null, Validators.required],
      itemName: [null, Validators.required],
      qoh: [null, Validators.required],
      quantity: [null, Validators.required],
    });
  }

  setArrayHead() {
    this.arrayHead = this.stockTransferForm.controls['itemArray'] as FormArray;
  }

  updateTodaysData() {
    this.stockTransferForm.patchValue({
      dated: moment(new Date()).format('DD/MM/YYYY'),
      createdBy: this.sessionstorage.getItem('username'),
      // createdBy: this.sessionstorage.username,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
    });
  }

  addTransfer() {
    if (this.arrayHead.valid) {
      this.arrayHead.push(this.createItem());
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.pleaseenterthevaluesfirst,
        'info',
      );
    }
  }

  removeTransfer(index: any, length: any) {
    const stockArray = this.stockTransferForm.controls[
      'itemArray'
    ] as FormArray;
    if (stockArray.length > 1) {
      stockArray.removeAt(index);
    }

    if (index === 0 && length === 1) {
      stockArray.reset();
      stockArray?.reset();
      stockArray.enable();
    }
  }

  matcher(control: any, form: any) {
    const isSubmitted = form && form.submitted;
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || isSubmitted)
    );
  }

  resetForm() {
    this.resetItemArray();
    this.stockTransferForm.reset();
    this.updateTodaysData();
  }

  resetItemArray() {
    this.stockTransferForm.removeControl('itemArray');
    this.stockTransferForm.addControl(
      'itemArray',
      new FormArray([this.createItem()]),
    );
    this.setArrayHead();
  }

  checkReferences() {
    if (
      this.stockTransferForm.value.referenceNumber &&
      this.stockTransferForm.value.transferTo
    ) {
      return true;
    } else {
      this.resetItemArray();
      return false;
    }
  }

  checkQuantityAvailable(index: any) {
    if (
      this.arrayHead.at(index).value.quantity >
      this.arrayHead.at(index).value.qoh
    ) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.transferquantitycannotbegreater,
        'info',
      );
      this.arrayHead.at(index).patchValue({
        quantity: null,
      });
    }
  }

  submitTransfers() {
    console.log(this.stockTransferForm.value);
    this.inventoryService
      .saveStockTransfer(this.serviceDataMapper(this.stockTransferForm.value))
      .subscribe((res) => {
        if (res && res.data.response) {
          this.confirmationService.alert(
            this.currentLanguageSet.inventory.savedsuccessfully,
            'success',
          );
          this.resetForm();
        }
      });
  }

  serviceDataMapper(formValues: any) {
    return {
      createdBy: formValues.createdBy,
      refNo: formValues.referenceNumber,
      providerServiceMapID: formValues.providerServiceMapID,
      transferFromFacilityID: this.facilityID,
      vanID: this.sessionstorage.getItem('vanID'),
      parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
      transferToFacilityID: formValues.transferTo.facilityID,
      itemStockExit: this.mapItemsForService(
        formValues.itemArray,
        formValues.createdBy,
      ),
    };
  }

  mapItemsForService(itemArray: any, createdBy: any) {
    const itemStockExit: any = [];
    itemArray.forEach((element: any) => {
      itemStockExit.push({
        createdBy: createdBy,
        itemStockEntryID: element.itemStockEntryID,
        quantity: element.quantity,
      });
    });
    return itemStockExit;
  }

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
