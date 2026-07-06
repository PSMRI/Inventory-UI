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
  Directive,
  HostListener,
  Inject,
  Input,
  ElementRef,
} from '@angular/core';

import { NgControl, FormGroup } from '@angular/forms';

import { ItemDispenseComponent } from './../components/item-dispense/item-dispense.component';
import { ZardDialogService } from 'Common-UI/v2/ui/dialog';

@Directive({ selector: '[appItemDispense]' })
export class ItemDispenseDirective {
  @Input()
  stockForm!: FormGroup;

  @Input()
  dispenseItemList: any;

  @HostListener('keyup.enter') onKeyDown() {
    this.openDialog();
  }

  @HostListener('click') onClick() {
    if (this.el.nativeElement.nodeName !== 'INPUT') this.openDialog();
  }

  constructor(
    private el: ElementRef,
    private dialog: ZardDialogService,
  ) {}

  openDialog(): void {
    const searchTerm = this.stockForm.value.itemName;

    console.log(this.stockForm);

    const dialogRef = this.dialog.create<ItemDispenseComponent, unknown>({
      zContent: ItemDispenseComponent,
      zData: {
        searchTerm: searchTerm,
        dispenseItemList: this.dispenseItemList,
      },
      zWidth: '1200px',
      zHideFooter: true,
      zClosable: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.stockForm.controls['itemName'].setValue(result.item.itemName);
        this.stockForm.controls['quantityInHand'].setValue(
          result.quantityInHand,
        );
        this.stockForm.controls['itemID'].setValue(result.item.itemID);
      }
    });
  }
}
