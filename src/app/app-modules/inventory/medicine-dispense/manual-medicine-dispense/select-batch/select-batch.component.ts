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
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-select-batch',
  templateUrl: './select-batch.component.html',
  styleUrls: ['./select-batch.component.css'],

  standalone: false,
})
export class SelectBatchComponent implements OnInit, DoCheck {
  batchForm!: FormGroup;
  today!: Date;

  itemBatchList: any = [];
  masterItemBatchList = [];
  enableEditMode = false;
  editBatchList: any;
  selectedBatchList: any = [];
  filteredBatchList: any = [];
  languageComponent: any;
  currentLanguageSet: any;
  editBatchBool = false;

  constructor(
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    public http_service: LanguageService,
    public mdDialogRef: MatDialogRef<SelectBatchComponent>,
  ) {}
  dataSource = new MatTableDataSource<any>();
  title!: string;

  ngOnInit() {
    this.fetchLanguageResponse();
    if (
      this.data !== undefined &&
      this.data !== null &&
      this.data.batchList !== undefined &&
      this.data.batchList !== null
    ) {
      this.masterItemBatchList = this.data.batchList;
      this.itemBatchList = this.data.batchList;
    }
    this.batchForm = this.createBatchForm();
    if (this.data.editIndex !== null) {
      this.title = this.currentLanguageSet.inventory.editBatchSelection;
    } else {
      this.title = this.currentLanguageSet.itemDispense.batchSelection;
    }
    this.title;
    console.log('this.data', this.data);

    if (this.data.editBatch !== null) {
      if (this.data.editBatch.batchList.length > 0) {
        this.enableEditMode = true;
        this.editBatchList = this.data.editBatch;
        this.batchForm.patchValue(this.data.editBatch);
        this.addBatch();
        this.handleBatchData();
      } else {
        this.addBatch();
        this.editableBatch(this.data.editBatch);
      }
    } else {
      this.editBatchList = [];
      this.addBatch();
    }
    this.loadManualDispense();
  }

  editableBatch(editBatchList: any) {
    this.editBatchList = editBatchList;
    this.batchForm.patchValue(editBatchList);
  }

  handleBatchData() {
    this.editBatchBool = true;
    const formBatchList = <FormArray>this.batchForm.controls['batchList'];
    const temp = this.data.editBatch.batchList.slice();

    for (let i = 0; i < temp.length; i++) {
      const batchArray = this.masterItemBatchList.filter((item: any) => {
        return item.batchNo === temp[i].batchNo.batchNo;
      });

      if (batchArray.length > 0) {
        temp[i].batchNo = batchArray[0];
      }

      if (temp[i].batchNo.batchNo) {
        const k: any = formBatchList.get('' + i);
        k.patchValue(temp[i]);
        k.markAsTouched();
        this.getQuantityAndFilterItem(temp[i].batchNo, i);
      }
      if (i + 1 < temp.length) {
        this.addBatch();
      }
    }
  }

  createBatchForm() {
    return this.fb.group({
      item: null,
      itemName: null,
      itemID: null,
      quantityInHand: null,
      quantityDispensed: null,
      batchList: new FormArray([]),
    });
  }

  getQuantityAndFilterItem(selectedBatch: any, i: any, batchForm?: FormGroup) {
    const selectedBatchList = this.selectedBatchList[i];
    console.log('selectedBatch', selectedBatch);
    this.filteredBatchList.map((item: any, t: any) => {
      const index = item.indexOf(selectedBatch);
      if (index !== -1 && t !== i) {
        item = item.splice(index, 1);
      }
    });
    this.selectedBatchList[i] = selectedBatch;
    if (this.editBatchBool) {
      const expiryDate = (this.today = new Date(selectedBatch.expiryDate));
      if (batchForm !== undefined) {
        batchForm.patchValue({
          quantityOnBatch: selectedBatch.value.quantityInHand,
          expiryDate: expiryDate,
          quantityOfDispense: null,
        });
      }
      const quantityOnBatch = selectedBatch.quantityInHand;
    } else {
      const expiryDate = (this.today = new Date(
        selectedBatch.value.expiryDate,
      ));
      if (batchForm !== undefined) {
        batchForm.patchValue({
          quantityOnBatch: selectedBatch.value.quantityInHand,
          expiryDate: expiryDate,
          quantityOfDispense: null,
        });
      }
      const quantityOnBatch = selectedBatch.value.quantityInHand;
    }
  }

  calculateDispenseQuantity() {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const batchListValue = batchList.value;
    let totalQuantity = 0;
    batchListValue.filter((quantity: any) => {
      if (quantity.quantityOfDispense && quantity.quantityOfDispense !== null) {
        totalQuantity = +totalQuantity + +quantity.quantityOfDispense;
      }
    });
    this.batchForm.patchValue({ quantityDispensed: totalQuantity });
  }

  loadManualDispense() {
    const dataFromFun: any = this.getBatchListTableData();
    this.dataSource.data = dataFromFun;
    console.log('TEST##', this.dataSource.data);
  }

  getBatchListTableData(): any {
    return (this.batchForm.get('batchList') as FormArray).controls;
  }

  get batchList() {
    return this.batchForm.get('batchList') as FormArray;
  }

  addBatch() {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const tempBatch = batchList.value;
    if (this.itemBatchList.length > tempBatch.length) {
      if (this.itemBatchList) {
        const resultBatch = this.itemBatchList.filter((batch: any) => {
          const batchArray = tempBatch.filter((item: any) => {
            if (
              item.batchNo &&
              item.batchNo !== null &&
              item.batchNo.batchNo !== null
            ) {
              return item.batchNo.batchNo === batch.batchNo;
            }
          });
          const batchFlag = batchArray.length === 0 ? true : false;
          return batchFlag;
        });
        this.filteredBatchList.push(resultBatch.slice());
      }
      batchList.push(this.initBatchForm());
      this.loadManualDispense();
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.nofurtherbatchesavailable,
      );
    }
  }

  initBatchForm() {
    return this.fb.group({
      batchNo: null,
      quantityOnBatch: null,
      expiryDate: null,
      quantityOfDispense: null,
    });
  }

  removeBatch(i: any, batchForm: any) {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    if (batchList.length === 1 && !!batchForm) {
      batchForm.patchValue({
        batchNo: null,
        quantityOnBatch: null,
        expiryDate: null,
        entryDate: null,
        quantityOfDispense: null,
      });
      this.calculateDispenseQuantity();
      this.loadManualDispense();
    } else {
      const removedValue = this.selectedBatchList[i];
      this.filteredBatchList.map((item: any, t: any) => {
        if (t !== i && removedValue) {
          item.push(removedValue);
        }
      });
      this.selectedBatchList.splice(i, 1);
      this.filteredBatchList.splice(i, 1);
      batchList.removeAt(i);
      this.calculateDispenseQuantity();
      this.loadManualDispense();
    }
  }

  checkValidity(batchForm: FormGroup) {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const tempBatch = batchForm.value;
    if (batchList.length !== this.masterItemBatchList.length) {
      if (tempBatch.quantityOfDispense) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  checkQuantity(batch: FormGroup) {
    const quantity = batch.value.quantityOfDispense;
    if (batch.value.quantityOfDispense === 0) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory
          .pleaseenterquantitygreaterthanzeroandlessthanorequaltoQtyinBatch,
      );
      batch.patchValue({ quantityOfDispense: null });
      batch.markAsPristine();
    } else if (batch.value.quantityOnBatch < batch.value.quantityOfDispense) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory
          .pleaseenterquantitylessthanorequaltoQtyinBatch,
      );
      batch.patchValue({ quantityOfDispense: null });
      batch.markAsPristine();
    }
  }
  saveAndUpdateItem() {
    this.mdDialogRef.close(this.batchForm);
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
