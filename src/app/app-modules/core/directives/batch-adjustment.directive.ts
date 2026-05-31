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
import { Directive, HostListener, Input, ElementRef } from '@angular/core';
import { BatchAdjustmentComponent } from '../components/batch-adjustment/batch-adjustment.component';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InventoryService } from '../../inventory/shared/service/inventory.service';

@Directive({
  selector: '[appBatchAdjustment]',

  standalone: false,
})
export class BatchAdjustmentDirective {
  @Input()
  previousSelected: any;

  @Input()
  stockForm!: FormGroup;

  @HostListener('keyup.enter') onKeyDown() {
    this.openDialog();
  }

  @HostListener('click') onClick() {
    if (this.el.nativeElement.nodeName !== 'INPUT') this.openDialog();
  }

  constructor(
    private el: ElementRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private inventoryService: InventoryService,
  ) {}

  openDialog(): void {
    const searchTerm = this.stockForm.value.itemName;
    console.log('SEACHTEREM', searchTerm);

    const dialogRef = this.dialog.open(BatchAdjustmentComponent, {
      width: '1200px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: { searchTerm: searchTerm, addedStock: this.previousSelected },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const formArray = this.stockForm.parent as FormArray;
        const len = formArray.length;

        console.log(formArray + ' ' + len);

        for (let i = len - 1, j = 0; i < len + result.length - 1; i++, j++) {
          (<FormGroup>formArray.at(i)).controls['itemStockEntryID'].setValue(
            result[j].itemStockEntryID,
          );
          (<FormGroup>formArray.at(i)).controls['batchID'].setValue(
            result[j].batchNo,
          );
          (<FormGroup>formArray.at(i)).controls['itemID'].setValue(
            result[j].item.itemID,
          );
          (<FormGroup>formArray.at(i)).controls['itemName'].setValue(
            result[j].item.itemName,
          );
          (<FormGroup>formArray.at(i)).controls['quantityInHand'].setValue(
            result[j].quantityInHand,
          );
          (<FormGroup>formArray.at(i)).controls['itemName'].disable();
          // (<FormGroup>formArray.at(i)).controls['quantity'].enable();
          (<FormGroup>formArray.at(i)).markAsDirty();
          if (formArray.length < len + result.length - 1) {
            formArray.push(this.initStockAdjustmentList());
            this.inventoryService.dialogClosed();
          }
        }
      }
    });
  }

  initStockAdjustmentList() {
    return this.fb.group({
      itemStockEntryID: null,
      itemID: null,
      itemName: null,
      batchID: null,
      quantityInHand: null,
      adjustmentType: null,
      adjustedQuantity: null,
      qohAfterAdjustment: null,
      reason: null,
      deleted: false,
    });
  }
}
