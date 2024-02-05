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
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { InventoryService } from './../../../inventory/shared/service/inventory.service';
import { ConfirmationService } from './../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';

@Component({
  selector: 'app-patient-return-batch-details',
  templateUrl: './patient-return-batch-details.component.html',
  styleUrls: ['./patient-return-batch-details.component.css'],
})
export class PatientReturnBatchDetailsComponent implements OnInit, DoCheck {
  batchForm!: FormGroup;
  today!: Date;

  itemBatchList: any = [];
  masterItemBatchList = [];
  enableEditMode = false;
  editBatchList: any;
  selectedBatchList: any = [];
  filteredBatchList: any = [];

  title!: string;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    public dialogRef: MatDialogRef<PatientReturnBatchDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
  ) {}
  filterItemList: any = [];
  ngOnInit() {
    this.fetchLanguageResponse();
    this.batchForm = this.createBatchForm();
    console.log('Data', this.data);
    this.filterItemList.push(this.data.editBatch.itemName);
    this.initAfterNg();
  }

  initAfterNg() {
    if (this.data !== undefined) {
      this.masterItemBatchList = this.data.batchList;
      this.itemBatchList = this.data.batchList;
      if (this.data.editIndex != null) {
        this.title = this.currentLanguageSet.inventory.editBatchSelection;
      } else {
        this.title = this.currentLanguageSet.itemDispense.batchSelection;
        const item = this.data.editBatch;
        console.log('Item', JSON.stringify(item, null, 4));
        // this.setItem(item);
      }
      this.title;
      console.log('this.data', this.data);
      if (this.data.editBatch != null) {
        if (
          this.data.editBatch.batchList &&
          this.data.editBatch.batchList.length > 0
        ) {
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
    }
  }

  setItem(editBatch: any) {
    console.log('editBatch', editBatch.itemName.itemName);
    const item = editBatch.itemName.itemName;
    this.batchForm.patchValue({
      itemName: editBatch.itemName.itemName,
      itemDetails: editBatch.itemName,
    });
  }

  createBatchForm() {
    return this.formBuilder.group({
      itemName: null,
      itemDetails: null,
      batchList: this.formBuilder.array([]),
    });
  }

  editableBatch(editBatchList: any) {
    this.editBatchList = editBatchList;
    this.batchForm.patchValue(editBatchList);
  }

  handleBatchData() {
    const formBatchList = <FormArray>this.batchForm.controls['batchList'];
    const temp = this.data.editBatch.batchList.slice();

    for (let i = 0; i < temp.length; i++) {
      const batchArray = this.masterItemBatchList.filter((item: any) => {
        return item.batchNo == temp[i].batchNo.batchNo;
      });

      if (batchArray.length > 0) {
        temp[i].batchNo = batchArray[0];
      }

      if (temp[i].batchNo.batchNo) {
        const k = formBatchList.get('' + i);
        if (k) {
          k.patchValue(temp[i]);
          k.markAsTouched();
          this.getQuantityAndFilterItem(temp[i].batchNo, i);
        } else {
          throw new Error('Form control at index ${i} is null');
        }
      }
      if (i + 1 < temp.length) {
        this.addBatch();
      }
    }
  }

  initBatchForm(): FormGroup {
    return this.formBuilder.group({
      batchNo: null,
      issuedQuantity: null,
      dateOfIssue: null,
      returnQuantity: null,
    });
  }

  getQuantityAndFilterItem(selectedBatch: any, i: any, batchForm?: FormGroup) {
    console.log('selectedBatch', selectedBatch);

    const selectedBatchList = this.selectedBatchList[i];
    this.filteredBatchList.map((item: any, t: any) => {
      console.log('item, t', item, t);

      const index = item.indexOf(selectedBatch);
      console.log('index', index);

      if (index != -1 && t != i) {
        console.log('item', item);

        item = item.splice(index, 1);
      }
    });
    console.log('filteredBatchList', this.filteredBatchList);

    this.selectedBatchList[i] = selectedBatch;

    const dateOfIssue = (this.today = new Date(selectedBatch.dateofIssue));
    if (batchForm != undefined) {
      batchForm.patchValue({
        issuedQuantity: selectedBatch.issuedQuantity,
        dateOfIssue: dateOfIssue,
        returnQuantity: null,
      });
    }
    // const quantityOnBatch = selectedBatch.quantityInHand;
  }

  // calculateDispenseQuantity() {
  //   const batchList = <FormArray>this.batchForm.controls['batchList'];
  //   const batchListValue = batchList.value;
  //   let totalQuantity = 0;
  //   batchListValue.filter((quantity) => {
  //     if (quantity.returnQuantity && quantity.returnQuantity != null) {
  //       totalQuantity = +(totalQuantity) + (+quantity.returnQuantity);
  //     }
  //   })
  //   this.batchForm.patchValue({ quantityDispensed: totalQuantity });
  // }
  addBatch() {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const tempBatch = batchList.value;
    if (this.itemBatchList.length > tempBatch.length) {
      if (this.itemBatchList) {
        const resultBatch = this.itemBatchList.filter((batch: any) => {
          const batchArray = tempBatch.filter((item: any) => {
            if (
              item.batchNo &&
              item.batchNo != null &&
              item.batchNo.batchNo != null
            ) {
              return item.batchNo.batchNo == batch.batchNo;
            }
          });
          const batchFlag = batchArray.length == 0 ? true : false;
          return batchFlag;
        });
        this.filteredBatchList.push(resultBatch.slice());
      }
      batchList.push(this.initBatchForm());
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.nofurtherbatchesavailable,
      );
    }
  }

  removeBatch(i: any, batchForm: any) {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    if (batchList.length == 1 && !!batchForm) {
      batchForm.patchValue({
        batchNo: null,
        issuedQuantity: null,
        dateOfIssue: null,
        returnQuantity: null,
      });
      // this.calculateDispenseQuantity();
    } else {
      const removedBatch = this.selectedBatchList[i];
      this.filteredBatchList.map((item: any, t: any) => {
        if (t != i && removedBatch) {
          item.push(removedBatch);
        }
      });
      this.selectedBatchList.splice(i, 1);
      this.filteredBatchList.splice(i, 1);
      batchList.removeAt(i);
      // this.calculateDispenseQuantity();
    }
  }

  checkValidity(batchForm: FormGroup) {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const tempBatch = batchForm.value;
    if (batchList.length != this.masterItemBatchList.length) {
      if (tempBatch.returnQuantity) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  checkQuantity(batch?: FormGroup) {
    if (batch) {
      const quantity = batch.value.returnQuantity;
      if (batch.value.returnQuantity == 0) {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory
            .pleaseenterquantitygreaterthanzeroandlessthanorequaltoQtyinBatch,
        );
        batch.patchValue({ returnQuantity: null });
        batch.markAsPristine();
      } else if (batch.value.issuedQuantity < batch.value.returnQuantity) {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory
            .pleaseenterquantitylessthanorequaltoQtyinBatch,
        );
        batch.patchValue({ returnQuantity: null });
        batch.markAsPristine();
      }
    }
  }
  saveAndUpdateItem() {
    this.dialogRef.close(this.batchForm);
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
