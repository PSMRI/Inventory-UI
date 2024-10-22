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
import { ConfirmationService } from '../../core/services/confirmation.service';
import { InventoryService } from '../shared/service/inventory.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormArray,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

export interface PeriodicElement {
  itemName: string;
  index: number;
  batchNo: number;
  quantityInHand: string;
  quantity: string;
  delete: string;
  addButton: string;
}

@Component({
  selector: 'app-store-self-consumption',
  templateUrl: './store-self-consumption.component.html',
  styleUrls: ['./store-self-consumption.component.css'],
})
export class StoreSelfConsumptionComponent implements OnInit, DoCheck {
  storeSelfConsumptionForm!: FormGroup;
  facilityID: any;
  providerServiceMapID: any;
  createdBy: any;
  currentLanguageSet: any;
  languageComponent: any;

  displayedColumns: string[] = [
    'index',
    'itemName',
    'batchNo',
    'quantityInHand',
    'quantity',
    'delete',
  ];
  private subs: Subscription;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    private alertService: ConfirmationService,
    private sessionstorage: SessionStorageService,
  ) {
    this.subs = this.inventoryService
      .getDialogClosedObservable()
      .subscribe(() => {
        this.loadStockConsumptionData();
      });
  }
  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    // this.createdBy = sessionStorage.getItem('username');
    this.createdBy = this.sessionstorage.username;
    this.facilityID = sessionStorage.getItem('facilityID');
    this.fetchLanguageResponse();
    this.providerServiceMapID = sessionStorage.getItem('providerServiceID');

    if (this.facilityID === null || this.facilityID <= 0) {
      this.router.navigate(['/inventory']);
    }

    this.storeSelfConsumptionForm = this.fb.group({
      referenceNumber: [''],
      dispenseReason: [''],
      dispensedStock: this.fb.array([]),
    });
    this.initDispensedStock();
    this.loadStockConsumptionData();
  }
  loadStockConsumptionData() {
    const dataFromFun: any = this.storeSelfTableData();
    console.log('dataFromFun####', dataFromFun);
    this.dataSource.data = dataFromFun;
  }

  storeSelfTableData(): any {
    return (this.storeSelfConsumptionForm.get('dispensedStock') as FormArray)
      .controls;
  }

  createStoreSelfConsumptionForm() {
    return this.fb.group({
      referenceNumber: null,
      dispenseReason: null,
    });
  }

  initDispensedStock() {
    const frmSelfArr = this.storeSelfConsumptionForm.get(
      'dispensedStock',
    ) as FormArray;
    frmSelfArr.push(
      this.fb.group({
        itemStockEntryID: [''],
        batchNo: ['', Validators.required],
        itemID: ['', Validators.required],
        itemName: ['', Validators.required],
        quantityInHand: [''],
        quantity: ['', Validators.required],
      }),
    );
  }

  initDispensedStockForm() {
    return this.fb.group({
      itemStockEntryID: [''],
      batchNo: ['', Validators.required],
      itemID: ['', Validators.required],
      itemName: ['', Validators.required],
      quantityInHand: [''],
      quantity: ['', Validators.required],
    });
  }
  get physicalStock() {
    return this.storeSelfConsumptionForm.get('dispensedStock') as FormArray;
  }

  addDispensedStock() {
    this.physicalStock.push(this.initDispensedStockForm());
    this.loadStockConsumptionData();
  }

  checkValidity(stock?: FormGroup) {
    if (stock) {
      const tempValid = stock.value;
      // console.log('tempValid', tempValid)
      if (tempValid.quantity) {
        return false;
      } else {
        return true;
      }
    }
  }

  removeDispensedStock(index: any, stock?: FormGroup) {
    const stockForm = this.storeSelfConsumptionForm.get(
      'dispensedStock',
    ) as FormArray;
    console.log('stockForm', stockForm);
    console.log('stock', stock);

    if (stockForm.length > 1) {
      stockForm.removeAt(index);
      this.loadStockConsumptionData();
    } else {
      if (stock) {
        stock.reset();
        stock.controls['itemName'].enable();
      }
    }
  }

  saveSelfConsumptionStock() {
    const temp = JSON.parse(
      JSON.stringify(this.storeSelfConsumptionForm.value),
    );
    const itemStockExit = temp.dispensedStock.map((item: any) => {
      item = {
        ...item,
        createdBy: this.createdBy,
        facilityID: this.facilityID,
      };
      return item;
    });
    const requestBody = {
      issueType: 'Manual',
      refNo: temp.referenceNumber,
      reason: temp.dispenseReason,
      itemStockExit: itemStockExit,
      facilityID: this.facilityID,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
      dispensedStock: undefined,
      vanID: sessionStorage.getItem('vanID'),
      parkingPlaceID: sessionStorage.getItem('parkingPlaceID'),
    };
    this.inventoryService.storeSelfConsumption(requestBody).subscribe(
      (response) => {
        if (response.statusCode === 200) {
          this.alertService.alert(
            this.currentLanguageSet.inventory.savedsuccessfully,
            'success',
          );
          this.reset();
        } else this.alertService.alert(response.status, 'error');
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  reset() {
    this.storeSelfConsumptionForm.reset();
    this.resetStoreSelfConsumptionFormArray();
    this.addDispensedStock();
  }

  resetStoreSelfConsumptionFormArray() {
    const dispensedStockArray = this.storeSelfConsumptionForm.get(
      'dispensedStock',
    ) as FormArray;
    dispensedStockArray.controls.length = 0;
  }

  validateRequestedQuantity(stock: FormGroup) {
    const quantityInHand = stock.value.quantityInHand;
    const requestedQuantity = stock.value.quantity;

    if (requestedQuantity <= 0) {
      this.alertService.alert(
        this.currentLanguageSet.inventory.quantitycannotbenegativeorzero,
      );
      stock.controls['quantity'].setValue(null);
    } else if (requestedQuantity > quantityInHand) {
      this.alertService.alert(
        this.currentLanguageSet.inventory.insufficientquantityinthisbatch,
      );
      stock.controls['quantity'].setValue(null);
    }
  }

  removeAllDispensedStock(dispensedStockArray: FormArray) {
    while (dispensedStockArray.length > 1) {
      dispensedStockArray.removeAt(0);
    }
    dispensedStockArray.enable();
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
