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
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ItemSearchComponent } from '../components/item-search/item-search.component';

@Directive({
  selector: '[appItemSearch]',

  standalone: false,
})
export class ItemSearchDirective {
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
    private dialog: MatDialog,
  ) {}

  openDialog(): void {
    const searchTerm = this.stockForm.controls['itemName'].value;
    const dialogRef = this.dialog.open(ItemSearchComponent, {
      width: '1200px',
      height: 'auto',
      panelClass: 'fit-screen',
      data: { searchTerm: searchTerm },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('result', result);
        this.stockForm.controls['itemName'].setValue(result.itemName);
        this.stockForm.controls['itemName'].disable();
        this.stockForm.controls['itemID'].setValue(result.itemID);

        if (this.stockForm.controls['isMedical'])
          this.stockForm.controls['isMedical'].setValue(result.isMedical);
        this.stockForm.markAsDirty();
      }
    });
  }
}
