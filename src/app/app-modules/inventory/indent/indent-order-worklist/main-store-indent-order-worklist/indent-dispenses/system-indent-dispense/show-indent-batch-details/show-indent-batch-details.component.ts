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
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
@Component({
  selector: 'app-show-indent-batch-details',
  templateUrl: './show-indent-batch-details.component.html',
  styleUrls: ['./show-indent-batch-details.component.css'],

  standalone: false,
})
export class ShowIndentBatchDetailsComponent implements OnInit, DoCheck {
  issuedBatchList: any[] = [];
  itemDetails: any;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns = [
    'SNo',
    'itemName',
    'batchNo',
    'quantityInHand',
    'expiryDate',
    'quantity',
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public http_service: LanguageService,
    public mdDialogRef: MatDialogRef<ShowIndentBatchDetailsComponent>,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.issuedBatchList = this.data.batchList;
      this.itemDetails = this.data.itemDetails;
      console.log('itemDetails', this.itemDetails);
      console.log('issuedBatchList', this.issuedBatchList);
    }
    this.fetchLanguageResponse();
  }

  saveAndUpdateItem() {
    const finalValue = {
      issuedBatchList: this.data.batchList,
      itemDetails: this.data.itemDetails,
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
