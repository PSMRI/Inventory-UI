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
  NgForm,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { ConfirmationService } from 'src/app/app-modules/core/services';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { InventoryService } from 'src/app/app-modules/inventory/shared/service/inventory.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';

@Component({
  selector: 'app-reject-item-from-mainstore-model',
  templateUrl: './reject-item-from-mainstore-model.component.html',
  styleUrls: ['./reject-item-from-mainstore-model.component.css'],

  standalone: false,
})
export class RejectItemFromMainstoreModelComponent implements OnInit, DoCheck {
  rejectRequestForm!: FormGroup;
  inputObj: any;
  rejectOrderList: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    public dialogRef: MatDialogRef<RejectItemFromMainstoreModelComponent>,
    public http_service: LanguageService,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.rejectRequestForm = this.createRejectRequestForm();
    console.log('input', this.input);
    this.fetchLanguageResponse();
  }
  createRejectRequestForm() {
    return this.fb.group({
      rejectReason: [null, Validators.required],
    });
  }
  get rejectReason() {
    return this.rejectRequestForm.controls['rejectReason'].value;
  }

  rejectIndentRequest() {
    this.inputObj = this.input.rejectItem;
    const rejectOrderObj = {
      indentID: this.inputObj.indentID,
      fromFacilityID: this.inputObj.toFacilityID,
      fromFacilityName: this.inputObj.fromFacilityName,
      toFacilityID: this.inputObj.fromFacilityID,
      refNo: this.inputObj.refNo,
      orderDate: this.inputObj.orderDate,
      reason: this.inputObj.reason,
      userID: this.inputObj.userID,
      providerServiceMapID: this.inputObj.providerServiceMapID,
      status: this.inputObj.status,
      deleted: this.inputObj.deleted,
      processed: this.inputObj.processed,
      createdBy: this.inputObj.createdBy,
      createdDate: this.inputObj.createdDate,
      lastModDate: this.inputObj.lastModDate,
      vanID: this.inputObj.vanID,
      parkingPlaceID: this.inputObj.parkingPlaceID,
      vanSerialNo: this.inputObj.vanSerialNo,
      action: 'Rejected',
      rejectedReason: this.rejectReason,
    };
    this.rejectOrderList.push(rejectOrderObj);

    this.inventoryService
      .rejectIndentOrder(this.rejectOrderList)
      .subscribe((rejectIndentResponse) => {
        if (rejectIndentResponse.statusCode === 200) {
          this.confirmationService.alert(
            rejectIndentResponse.data.response,
            'success',
          );
          this.dialogRef.close(true);
        }
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
