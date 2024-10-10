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
import {
  FormBuilder,
  FormArray,
  FormGroup,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { ConfirmationService } from './../../services/confirmation.service';
import { LanguageService } from '../../services/language.service';
import { SetLanguageComponent } from '../set-language.component';
import { MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-rx-batch-view',
  templateUrl: './rx-batch-view.component.html',
  styleUrls: ['./rx-batch-view.component.css'],
})
export class RxBatchViewComponent implements OnInit, DoCheck {
  public items: any;
  public prescribed: any;
  public editSelection!: any;
  dispensed: any;
  itemsForm!: FormGroup;
  alertDays = 30;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  constructor(
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<RxBatchViewComponent>,
    private http_service: LanguageService,
  ) {}
  ngOnInit() {
    this.fetchLanguageResponse();
    console.log(this.items);
    this.itemsForm = this.fb.group({});
    this.loadtoForm(this.items);
  }

  loadtoForm(items: any) {
    const formArray = this.initBatchListArray(items, this.editSelection);
    console.log('this.editSelection', this.editSelection);
    this.itemsForm?.addControl('formArray', formArray);
    this.setDispensed(formArray.value);
  }
  setDispensed(formArray: any, index = -1) {
    this.checkQuant(formArray, index);
    let quantity = 0;
    formArray.map((arr: any) => (quantity += +arr.quantity));
    console.log(quantity, ' quant');
    console.log(formArray);
    const formItemsTick = <FormArray>this.itemsForm?.controls['formArray'];
    if (quantity <= this.prescribed) {
      this.dispensed = quantity;
    } else if (index >= 0) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.dispenseQuantityPrescribed,
        'warn',
      );
      const formItems = <FormArray>this.itemsForm?.controls['formArray'];
      const currentGroup: FormGroup = <FormGroup>formItems?.at(index);
      currentGroup.patchValue({
        quantity: null,
      });
    }
    formItemsTick.at(index).get('selection')?.disable();
  }

  checkQuant(formArrayVals: any, index: any) {
    console.log(formArrayVals, index);
    if (index !== -1) {
      if (
        formArrayVals[index].quantity === '' ||
        formArrayVals[index].quantity === null ||
        formArrayVals[index].quantity === 0 ||
        formArrayVals[index].quantity === '0' ||
        formArrayVals[index].quantity === undefined
      ) {
        const formItems = <FormArray>this.itemsForm.controls['formArray'];
        formItems.at(index).patchValue({ selection: false });
      } else {
        const formItems = <FormArray>this.itemsForm.controls['formArray'];
        formItems.at(index).patchValue({ selection: true });
        formItems.at(index).get('selection')?.disable();
      }
    }
  }

  save() {
    const formItems = <FormArray>this.itemsForm.controls['formArray'];
    if (!formItems.invalid) {
      console.log('formItems1', formItems.value);
      formItems.value.forEach((item: any) => {
        const newExpDate: any = new Date(item.expiryDate);
        console.log('newExpDate', newExpDate);
        item.expiryDate = newExpDate;
      });
      console.log('formItems2', formItems.value);
      const finalBatchItemDetails: BatchItemDetail[] = [];
      formItems.controls.forEach((control: any) => {
        const {
          batchNo,
          expiresIn,
          expiryDate,
          itemStockEntryID,
          quantity,
          quantityInHand,
          selection,
        } = control.value;

        const batchItemDetails: BatchItemDetail = {
          batchNo,
          expiresIn,
          expiryDate,
          itemStockEntryID,
          quantity,
          quantityInHand,
          selection,
        };
        batchItemDetails.selection = control.controls.selection.value;
        finalBatchItemDetails.push(batchItemDetails);
      });
      this.dialogRef.close({
        selectionBatchList: finalBatchItemDetails,
        batchList: finalBatchItemDetails.filter(
          (item) => item.selection === true,
        ),
        dispensed: this.dispensed > 0 ? this.dispensed : null,
      });
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.detailsRequired,
        'warn',
      );
    }
  }

  enableBatch(val: any, index: any) {
    const selection = val.selection;
    this.setEnable(index);
  }

  setEnable(index: any) {
    const formItems = <FormArray>this.itemsForm.controls['formArray'];
    formItems.at(index).patchValue({
      selection: true,
    });
  }

  checkboxChange(event: any, index: any) {
    if (!event.checked) {
      const formItems = <FormArray>this.itemsForm.controls['formArray'];
      const currentGroup: FormGroup = <FormGroup>formItems.at(index);
      currentGroup.patchValue({
        quantity: null,
      });
      this.setDispensed(formItems.value, index);
    }
  }

  initBatchListElement(batch: any, selection: any): FormGroup {
    const expDate: any = new DatePipe('en-US');

    const formatedExpDate: any = expDate.transform(
      batch.expiryDate,
      'MM/dd/yyyy',
    );
    return this.fb.group({
      expiryDate: formatedExpDate,
      batchNo: batch.batchNo,
      quantity: batch.quantity,
      quantityInHand: batch.qty || batch.quantityInHand,
      expiresIn: batch.expiresIn,
      itemStockEntryID: batch.itemStockEntryID,
      selection: batch.selection || selection === '1' ? true : false,
    });
  }

  initBatchListArray(batchList: any, selection: any): FormArray {
    const batches: FormArray = this.fb.array([]);
    batchList.forEach((element: any) => {
      batches.push(this.initBatchListElement(element, selection));
    });
    return batches;
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

  getRxBatch(): AbstractControl[] | null {
    const getRxBatch = this.itemsForm.get('formArray') as FormArray;
    if (getRxBatch) {
      getRxBatch.get('selection')?.disable();
    }
    return getRxBatch instanceof FormArray ? getRxBatch.controls : null;
  }
  // -----End------
}

interface BatchItemDetail {
  batchNo: string | null;
  expiresIn: number | null;
  expiryDate: Date | null;
  itemStockEntryID: number | null;
  quantity: number | null;
  quantityInHand: number | null;
  selection?: boolean;
}
