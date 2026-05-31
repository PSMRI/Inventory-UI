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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';

@Component({
  selector: 'app-main-store-item-model',
  templateUrl: './main-store-item-model.component.html',
  styleUrls: ['./main-store-item-model.component.css'],

  standalone: false,
})
export class MainStoreItemModelComponent implements OnInit, DoCheck {
  mainStoreIndentDetails: any;
  mainStoreBatchWiseItemList: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns = ['index', 'itemName', 'requiredQuantity', 'remarks'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    public dialogRef: MatDialogRef<MainStoreItemModelComponent>,
    public http_service: LanguageService,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    if (this.input) {
      this.getMainStoreItemListDetailsForIndentID(this.input.itemListDetails);
    }
    this.fetchLanguageResponse();
  }
  getMainStoreItemListDetailsForIndentID(input: any) {
    this.mainStoreIndentDetails = input;
    console.log('input', input);
    const viewItemReqObj = {
      indentID: input.indentID,
      fromFacilityID: input.fromFacilityID,
    };
    this.inventoryService
      .viewItemListForMainStore(viewItemReqObj)
      .subscribe((viewItemResponse) => {
        this.mainStoreBatchWiseItemList = viewItemResponse.data;
        console.log(
          'this.mainStoreBatchWiseItemList nowwwwwwwwwwwwwwwwwwwwwww',
          this.mainStoreBatchWiseItemList,
        );
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
