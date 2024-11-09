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
import {
  Component,
  OnInit,
  OnChanges,
  DoCheck,
  ChangeDetectorRef,
} from '@angular/core';
import { InventoryService } from '../shared/service/inventory.service';
import {
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-physical-stock-entry',
  templateUrl: './physical-stock-entry.component.html',
  styleUrls: ['./physical-stock-entry.component.css'],
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
export class PhysicalStockEntryComponent implements OnInit, OnChanges, DoCheck {
  stockItemName: any;
  physicalStockEntryForm!: FormGroup;
  matTableStockForm!: FormGroup;
  isDisabled = true;
  otherDetails: any;
  physicalStockList: any = [];
  physicalStockTableDataList: any = [];
  today!: Date;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'index',
    'itemName',
    'quantity',
    'totalCostPrice',
    'batchNo',
    'expiryDate',
    'actions',
  ];
  stockEntryDate = new FormControl(new Date());

  constructor(
    private changeDetectorRefs: ChangeDetectorRef,
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    private dialogService: ConfirmationService,
    private fb: FormBuilder,
    private sessionstorage: SessionStorageService,
  ) {}
  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    this.otherDetails = {
      // createdBy: this.sessionstorage.getItem('username'),
      createdBy: this.sessionstorage.username,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
      // userId: this.sessionstorage.getItem('userID'),
      userId: this.sessionstorage.userID,
      facilityID: this.sessionstorage.getItem('facilityID'),
      vanID: this.sessionstorage.getItem('vanID'),
      parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
    };

    this.today = new Date();
    this.fetchLanguageResponse();
    this.physicalStockEntryForm = this.fb.group({
      referenceNumber: [''],
      stockEntryDate: [''],
      physicalStock: this.fb.array([]),
    });
    this.initPhysicalStock();

    console.log('this.physicalStockEntryForm', this.physicalStockEntryForm);

    console.log('form1', this.physicalStockEntryForm);
    this.loadStockData();
  }

  loadStockData() {
    const dataFromFun: any = this.physicalStockTableData();
    this.dataSource.data = dataFromFun;
  }

  ngOnChanges() {
    console.log('form2', this.physicalStockEntryForm);
  }

  createPhysicalStockEntryForm() {
    return this.fb.group({
      referenceNumber: null,
      stockEntryDate: null,
    });
  }

  get isMedical() {
    return this.physicalStockEntryForm.controls['isMedical'].value;
  }

  initPhysicalStock() {
    const frmArr = this.physicalStockEntryForm.get(
      'physicalStock',
    ) as FormArray;
    frmArr.push(
      this.fb.group({
        batchNo: ['', Validators.compose([Validators.required])],
        expiryDate: [''],
        itemID: ['', Validators.required],
        itemName: ['', Validators.required],
        quantity: ['', Validators.required],
        totalCostPrice: ['', Validators.required],
        isMedical: [''],
      }),
    );
  }

  initPhysicalStockForm() {
    return this.fb.group({
      batchNo: ['', Validators.compose([Validators.required])],
      expiryDate: [''],
      itemID: ['', Validators.required],
      itemName: ['', Validators.required],
      quantity: ['', Validators.required],
      totalCostPrice: ['', Validators.required],
      isMedical: [''],
    });
  }

  physicalStockTableData(): any {
    return (this.physicalStockEntryForm.get('physicalStock') as FormArray)
      .controls;
  }
  refresh(event: any, stock: any) {
    console.log('event##', event);
    stock.controls['itemName'].setValue(event.target.value);
  }
  get physicalStock() {
    return this.physicalStockEntryForm.get('physicalStock') as FormArray;
  }

  addStock() {
    this.physicalStock.push(this.initPhysicalStockForm());
    this.loadStockData();
  }

  removeStock(index: any, stock?: FormGroup) {
    const stockForm = this.physicalStockEntryForm.get(
      'physicalStock',
    ) as FormArray;
    console.log('stockForm', stockForm);
    console.log('stock', stock);

    if (stockForm.length > 1) {
      stockForm.removeAt(index);
      this.loadStockData();
    } else {
      if (stock) {
        stock.reset();
        stock.controls['itemName'].enable();
      }
    }
  }

  savePhysicalStock() {
    console.log('FORMSTOCK', this.physicalStockEntryForm);
    const physicalStockEntry = JSON.parse(
      JSON.stringify(this.physicalStockEntryForm.value),
    );

    physicalStockEntry.physicalStock.map((item: any) => {
      item.createdBy = this.otherDetails.createdBy;
      item.facilityID = this.otherDetails.facilityID;
    });

    const temp = Object.assign({}, physicalStockEntry, this.otherDetails, {
      refNo: physicalStockEntry.referenceNumber,
      status: 'Active',
      itemStockEntry: physicalStockEntry.physicalStock,
      physicalStock: undefined,
      referenceNumber: undefined,
    });

    this.inventoryService.savePhysicalStock(temp).subscribe(
      (response) => {
        if (
          response.statusCode === 200 &&
          response.data &&
          response.data.phyEntryID
        ) {
          this.dialogService.alert(
            this.currentLanguageSet.inventory.savedsuccessfully,
            'success',
          );
          this.reset();
        } else this.dialogService.alert(response.status, 'error');
      },
      (err) => {
        this.dialogService.alert(err, 'error');
      },
    );
  }

  reset() {
    this.physicalStockEntryForm.reset();
    this.resetPhysicalStockFormArray();
    this.addStock();
  }

  resetPhysicalStockFormArray() {
    const physicalStockArray = this.physicalStockEntryForm.get(
      'physicalStock',
    ) as FormArray;
    physicalStockArray.controls.length = 0;
  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  removeAllPhysicalStock(physicalStockArray: FormArray) {
    while (physicalStockArray.length > 1) {
      physicalStockArray.removeAt(0);
    }
  }

  checkForDuplicateBatch(stockForm: FormGroup, index: any) {
    const stockList =
      this.physicalStockEntryForm.controls['physicalStock'].value;
    const itemID = stockForm.value.itemID;
    const batchNo = stockForm.value.batchNo;

    const temp = stockList.filter((stock: any, i: any) => {
      if (i !== index)
        return (
          itemID &&
          stock.itemID === itemID &&
          batchNo &&
          stock.batchNo === batchNo
        );
      else return false;
    });

    if (temp.length > 0) {
      this.dialogService.alert(
        this.currentLanguageSet.inventory.batchalreadypresent,
        'warn',
      );
      stockForm.controls['batchNo'].reset();
    }
  }

  getPhysicalStockControls() {
    const physicalStockArray = this.physicalStockEntryForm.get(
      'physicalStock',
    ) as FormArray;
    return physicalStockArray.controls;
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
