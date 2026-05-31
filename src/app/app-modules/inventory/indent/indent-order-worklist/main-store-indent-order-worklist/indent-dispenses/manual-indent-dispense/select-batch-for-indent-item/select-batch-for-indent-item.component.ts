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
import {
  MatDialogRef,
  MatDialog,
  MatDialogConfig,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl, FormArray } from '@angular/forms';
import { InventoryService } from 'src/app/app-modules/inventory/shared/service/inventory.service';
import { ConfirmationService } from '../../../../../../../core/services/confirmation.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-select-batch-for-indent-item',
  templateUrl: './select-batch-for-indent-item.component.html',
  styleUrls: ['./select-batch-for-indent-item.component.css'],

  standalone: false,
})
export class SelectBatchForIndentItemComponent implements OnInit, DoCheck {
  batchForm!: FormGroup;
  batchlist: any = [];
  itemBatchList = [];
  filteredBatchList: any[] = [];
  masterItemBatchList: any[] = [];
  selectedBatchList: any[] = [];
  today!: Date;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  batchFormArray: any[] = [];
  displayedColumns = [
    'SNo',
    'batchNo',
    'qtyinBatch',
    'qtytoDispensed',
    'expiryDate',
    'action',
  ];
  dataSource = new MatTableDataSource<any>();

  constructor(
    private confirmationService: ConfirmationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public mdDialogRef: MatDialogRef<SelectBatchForIndentItemComponent>,
    private fb: FormBuilder,
    public http_service: LanguageService,
    private inventoryService: InventoryService,
  ) {}
  title: any;
  buttonSaveAndUpdate: any;
  ngOnInit() {
    this.fetchLanguageResponse();
    console.log('Data received in modal window', this.data);
    this.batchForm = this.fb.group({
      item: [''],
      itemName: [''],
      itemID: [''],
      quantityInHand: [''],
      quantityDispensed: [''],
      quantityRequired: [''],
      batchList: this.fb.array([]),
    });
    this.itemBatchList = this.data.batchList;
    this.masterItemBatchList = this.data.batchList;
    if (this.data.editIndex !== null) {
      this.setEditValue();
      this.handleAddBatch();
      this.handleBatchData();
      this.title =
        this.currentLanguageSet.inventory.editBatchSelectionForIndentItem;
      this.buttonSaveAndUpdate = this.currentLanguageSet.inventory.update;
    } else {
      this.setValue();
      this.handleAddBatch();
      this.title =
        this.currentLanguageSet.inventory.batchSelectionForIndentItem;
      this.buttonSaveAndUpdate = this.currentLanguageSet.inventory.save;
    }

    this.initBatchForm();
    this.batchFormArray = this.batchForm.value;
    this.loadstroreStockTableData();
  }

  loadstroreStockTableData() {
    const dataFromFun: any = this.stroreStockTableData();
    this.dataSource.data = dataFromFun;
  }

  setEditValue() {
    this.batchForm.patchValue({
      item: this.data.indentItem,
      quantityInHand: this.data.indentItem.qOH,
      quantityDispensed: this.data.editableItem.quantityDispensed,
      quantityRequired: this.data.indentItem.requiredQty,
    });
  }
  setValue() {
    this.batchForm.patchValue({
      quantityRequired: this.data.indentItem.requiredQty,
      item: this.data.indentItem,
      quantityInHand: this.data.indentItem.qOH,
    });
  }

  createBatchForm() {
    return this.fb.group({
      item: [''],
      itemName: [''],
      itemID: [''],
      quantityInHand: [''],
      quantityDispensed: [''],
      quantityRequired: [''],
      batchList: new FormArray([]),
    });
  }
  get quantityDispensed() {
    return this.batchForm.controls['quantityDispensed'].value;
  }
  get quantityRequired() {
    return this.batchForm.controls['quantityRequired'].value;
  }

  addBatch(select: boolean) {
    console.log(
      'this.quantityDispensed ',
      this.quantityDispensed > this.quantityRequired,
      this.quantityDispensed,
      this.quantityRequired,
    );
    if (select === true) {
      if (
        this.quantityDispensed !== this.quantityRequired &&
        this.quantityDispensed < this.quantityRequired
      ) {
        this.handleAddBatch();
        this.showPopUp();
      } else {
        if (this.quantityDispensed <= this.quantityRequired) {
          this.confirmationService.alert(
            this.currentLanguageSet.inventory.requiredQuantityDispensed,
          );
        } else {
          this.confirmationService.alert(
            this.currentLanguageSet.inventory
              .dispenseQuantityAndRequiredQuantity,
          );
        }
      }
    } else {
      this.handleAddBatch();
    }
  }

  get batchList() {
    return this.batchForm.get('batchList') as FormArray;
  }

  stroreStockTableData(): any {
    return (this.batchForm.get('batchList') as FormArray).controls;
  }

  tempBatch: any;
  handleAddBatch() {
    // const batchList = <FormArray>this.batchForm.controls['batchList'];
    this.tempBatch = this.batchList.value;
    if (this.itemBatchList.length > this.tempBatch.length) {
      if (this.itemBatchList) {
        const resultBatch = this.itemBatchList.filter((batch: any) => {
          const batchArray = this.tempBatch.filter(
            (item: { batchNo: { batchNo: null } | null }) => {
              if (
                item.batchNo &&
                item.batchNo !== null &&
                item.batchNo.batchNo !== null
              ) {
                return item.batchNo.batchNo === batch.batchNo;
              }
            },
          );
          const batchFlag = batchArray.length === 0 ? true : false;
          return batchFlag;
        });
        this.filteredBatchList.push(resultBatch.slice());
        console.log('filteredBatchList', this.filteredBatchList);
      }
      this.batchList.push(
        this.fb.group({
          batchNo: null,
          quantityOnBatch: null,
          expiryDate: null,
          quantityOfDispense: null,
        }),
      );
      this.loadstroreStockTableData();
    }
  }
  showPopUp() {
    if (this.itemBatchList.length === this.tempBatch.length) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.nofurtherbatchesavailable,
      );
    }
  }

  handleBatchData() {
    const formBatchList = <FormArray>this.batchForm.controls['batchList'];
    console.log('formBatchList', formBatchList);
    const temp = this.data.editableItem.batchList.slice();
    console.log('Temp', temp);
    for (let i = 0; i < temp.length; i++) {
      const batchArray = this.masterItemBatchList.filter((item: any) => {
        return item.batchNo === temp[i].batchNo.batchNo;
      });

      if (batchArray.length > 0) {
        temp[i].batchNo = batchArray[0];
      }

      if (temp[i].batchNo.batchNo) {
        const k = formBatchList.get('' + i);
        k?.patchValue(temp[i]);
        k?.markAsTouched();
        this.getQuantityAndFilterItem(temp[i].batchNo, i);
      }
      if (i + 1 < temp.length) {
        this.addBatch(false);
      }
    }
  }

  initBatchForm(): FormGroup {
    return this.fb.group({
      batchNo: null,
      quantityOnBatch: null,
      expiryDate: null,
      quantityOfDispense: null,
    });
  }

  getQuantityAndFilterItem(
    selectedBatch: { expiryDate: string | number | Date; quantityInHand: any },
    i: number,
    batchForm?: FormGroup,
  ) {
    const selectedBatchList = this.selectedBatchList[i];
    this.filteredBatchList.map((item, t) => {
      const index = item.indexOf(selectedBatch);
      if (index !== -1 && t !== i) {
        item = item.splice(index, 1);
      }
    });
    this.selectedBatchList[i] = selectedBatch;

    const expiryDate = (this.today = new Date(selectedBatch.expiryDate));
    if (batchForm !== undefined) {
      batchForm.patchValue({
        quantityOnBatch: selectedBatch.quantityInHand,
        expiryDate: expiryDate,
        quantityOfDispense: null,
      });
    }
    const quantityOnBatch = selectedBatch.quantityInHand;
  }

  calculateDispenseQuantity() {
    const batchList = <FormArray>this.batchForm.controls['batchList'];
    const batchListValue = batchList.value;
    let totalQuantity = 0;
    batchListValue.filter(
      (quantity: { quantityOfDispense: string | number | null }) => {
        if (
          quantity.quantityOfDispense &&
          quantity.quantityOfDispense !== null
        ) {
          totalQuantity = +totalQuantity + +quantity.quantityOfDispense;
        }
      },
    );
    this.batchForm.patchValue({ quantityDispensed: totalQuantity });
  }

  checkQuantity(batch?: FormGroup) {
    const quantity = batch?.value.quantityOfDispense;
    if (batch?.value.quantityOfDispense === 0) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory
          .pleaseenterquantitygreaterthanzeroandlessthanorequaltoQtyinBatch,
      );
      batch.patchValue({ quantityOfDispense: null });
      batch.markAsPristine();
    }
    if (batch?.value.quantityOnBatch < batch?.value.quantityOfDispense) {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory
          .pleaseenterquantitylessthanorequaltoQtyinBatch,
      );
      batch?.patchValue({ quantityOfDispense: null });
      batch?.markAsPristine();
    }
  }

  // removeBatch(
  //   i: any,
  //   batchForm: any
  // ) {
  //   const batchList = this.batchForm.get('batchList') as FormArray;
  //   if (batchList.length === 1 && !!batchForm) {
  //     batchForm.patchValue({
  //       batchNo: null,
  //       quantityOnBatch: null,
  //       expiryDate: null,
  //       entryDate: null,
  //       quantityOfDispense: null,
  //     });
  //     this.calculateDispenseQuantity();
  //     this.loadstroreStockTableData();
  //   } else {
  //     const removedValue = this.selectedBatchList[i];
  //     this.filteredBatchList.map((item, t) => {
  //       if (t !== i && removedValue) {
  //         item.push(removedValue);
  //       }
  //     });
  //     this.selectedBatchList.splice(i, 1);
  //     this.filteredBatchList.splice(i, 1);
  //     // batchList.removeAt(i);
  //     this.calculateDispenseQuantity();
  //     this.loadstroreStockTableData();
  //   }
  // }

  // removeBatch(i: any, batchForm: FormGroup) {
  //   const selectBatchForm = this.batchForm.get('batchList') as FormArray;

  //   if (selectBatchForm.length > 1) {
  //     selectBatchForm.removeAt(i);
  //     this.loadstroreStockTableData();
  //   } else {
  //     const removedBatch = this.selectedBatchList[i];
  //     this.filteredBatchList.map((item: any, t: any) => {
  //       if (t !== i && removedBatch) {
  //         item.push(removedBatch);
  //       }
  //     });
  //     this.selectedBatchList.splice(i, 1);
  //     this.filteredBatchList.splice(i, 1);
  //     // selectBatchForm.removeAt(i);
  //     selectBatchForm.reset();
  //   }
  // }

  removeBatch(i: any, batchForm: FormGroup) {
    const selectBatchForm = this.batchForm.get('batchList') as FormArray;
    if (selectBatchForm.length > 1) {
      selectBatchForm.removeAt(i);
      this.loadstroreStockTableData();
    } else {
      if (batchForm) {
        batchForm.reset();
        batchForm.controls['itemName'].enable();
      }
    }
  }

  saveAndUpdateItem() {
    if (this.quantityDispensed <= this.quantityRequired) {
      if (
        this.quantityDispensed < this.quantityRequired &&
        this.masterItemBatchList.length !== 0
      ) {
        this.confirmationService
          .confirm(
            'info',
            'You are dispensing less than required quantity. Do you want to proceed further?',
            'Yes',
            'No',
          )
          .subscribe((res) => {
            if (res) {
              this.closeModal();
            }
          });
      } else {
        if (this.masterItemBatchList.length !== 0) {
          this.closeModal();
        }
      }
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.dispenseQuantityAndRequiredQuantity,
      );
    }
  }
  closeModal() {
    const finalValue = {
      batchDetails: this.batchForm.value,
      itemDetails: this.data.indentItem,
    };
    this.mdDialogRef.close(finalValue);
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
