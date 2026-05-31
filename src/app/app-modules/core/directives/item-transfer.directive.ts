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
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TransferSearchComponent } from '../components/transfer-search/transfer-search.component';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: '[appItemTransfer]',

  standalone: false,
})
export class ItemTransferDirective {
  @Input()
  previousSelected: any;

  @Input()
  stockForm!: FormGroup;

  @HostListener('keydown.enter') onKeyDown() {
    this.openDialog();
  }

  @HostListener('click') onClick() {
    if (this.el.nativeElement.nodeName !== 'INPUT') this.openDialog();
  }

  constructor(
    private el: ElementRef,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) {}

  openDialog(): void {
    const searchTerm = this.stockForm.value.itemName;
    const transferTo =
      this.stockForm?.parent?.parent?.value.transferTo.facilityID;

    const dialogRef = this.dialog.open(TransferSearchComponent, {
      width: '1200px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: {
        searchTerm: searchTerm,
        transferTo: transferTo,
        addedStock: this.previousSelected,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const formArray = this.stockForm.parent as FormArray;
        const len = formArray.length;
        for (let i = len - 1, j = 0; i < len + result.length - 1; i++, j++) {
          (<FormGroup>formArray.at(i)).controls['itemStockEntryID'].setValue(
            result[j].itemStockEntryID,
          );
          (<FormGroup>formArray.at(i)).controls['batchNo'].setValue(
            result[j].batchNo,
          );
          (<FormGroup>formArray.at(i)).controls['qoh'].setValue(
            result[j].quantityInHand,
          );

          (<FormGroup>formArray.at(i)).controls['itemName'].setValue(
            result[j].item.itemName,
          );
          (<FormGroup>formArray.at(i)).controls['itemName'].disable();
          (<FormGroup>formArray.at(i)).controls['quantity'].enable();
          (<FormGroup>formArray.at(i)).markAsDirty();

          if (formArray.length < len + result.length - 1)
            formArray.push(this.createItem());
        }
      }
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
}
