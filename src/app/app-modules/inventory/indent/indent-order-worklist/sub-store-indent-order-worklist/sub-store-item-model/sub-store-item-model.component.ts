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
import { InventoryService } from 'src/app/app-modules/inventory/shared/service/inventory.service';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
} from '@angular/material/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
} from '@angular/material/table';
import { ISTDatePipe } from '../../../../../core/pipes/ist-date.pipe';

@Component({
  selector: 'app-sub-store-item-model',
  templateUrl: './sub-store-item-model.component.html',
  styleUrls: ['./sub-store-item-model.component.css'],
  imports: [
    MatIconButton,
    MatDialogClose,
    MatTooltip,
    MatIcon,
    NgIf,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    ISTDatePipe,
  ],
})
export class SubStoreItemModelComponent implements OnInit, DoCheck {
  batchWiseItemList: any = [];
  indentDetails: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns = [
    'SNo',
    'itemName',
    'quantityOnHand',
    'requiredQuantity',
    'remarks',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    public http_service: LanguageService,
    public dialogRef: MatDialogRef<SubStoreItemModelComponent>,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    if (this.input) {
      this.getItemListDetailsForIndentID(this.input.itemListDetails);
    }
    this.fetchLanguageResponse();
  }
  getItemListDetailsForIndentID(input: any) {
    this.indentDetails = input;
    const viewItemReqObj = {
      indentID: input.indentID,
      fromFacilityID: input.fromFacilityID,
    };
    this.inventoryService
      .viewItemListForSubStore(viewItemReqObj)
      .subscribe((viewItemResponse) => {
        this.batchWiseItemList = viewItemResponse.data;
      });
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
