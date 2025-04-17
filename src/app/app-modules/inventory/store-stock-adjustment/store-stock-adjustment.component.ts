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
import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  AbstractControl,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { SetLanguageComponent } from '../../core/components/set-language.component';
import { LanguageService } from '../../core/services/language.service';
import { ConfirmationService } from '../../core/services/confirmation.service';
import { InventoryService } from '../shared/service/inventory.service';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-store-stock-adjustment',
  templateUrl: './store-stock-adjustment.component.html',
  styleUrls: ['./store-stock-adjustment.component.css'],
})
export class StoreStockAdjustmentComponent
  implements OnInit, DoCheck, OnDestroy
{
  storeStockAdjustmentForm!: FormGroup;
  adjustmentTypeList = ['Issue', 'Receipt'];
  draftID: any;

  editMode = false;
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  isMainStore = false;
  lastUpdatedStockDate: any;
  displayedColumns: string[] = [
    'index',
    'itemName',
    'batchID',
    'quantityOnHand',
    'adjustmentType',
    'adjustmentQuantity',
    'qOHAfterAdjustment',
    'reason',
    'action',
  ];
  stockItemName: any;
  private subs: Subscription;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private http_service: LanguageService,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService,
    private inventoryService: InventoryService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.subs = this.inventoryService
      .getDialogClosedObservable()
      .subscribe(() => {
        this.loadStockAdjData();
      });
  }
  dataSource = new MatTableDataSource<any>();

  ngOnInit() {
    this.storeStockAdjustmentForm = this.fb.group({
      refNo: [''],
      adjustmentDate: { value: new Date(), disabled: true },
      stockAdjustmentDraftID: [null],
      draftDesc: [''],
      stockAdjustmentList: this.fb.array([]),
    });
    this.initStockAdjustmentList();
    this.draftID = this.route.snapshot.paramMap.get('draftID');
    this.fetchLanguageResponse();

    if (this.draftID) {
      this.editMode = true;
      this.getStockAdjustmentDraftDetails(this.draftID);
    } else {
      this.editMode = false;
      // this.loadStockAdjData();
    }

    const isMainStore: any = this.sessionstorage.getItem('facilityDetail');
    this.isMainStore = JSON.parse(isMainStore).isMainFacility;
    this.showLastUpdatedStockLog();
    this.loadStockAdjData();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  loadStockAdjData() {
    const dataFromFun: any = this.stroreStockTableData();
    console.log('dataFromFun####', dataFromFun);
    this.dataSource.data = dataFromFun;
  }

  createStoreStockAdjustmentForm() {
    return this.fb.group({
      refNo: null,
      adjustmentDate: { value: new Date(), disabled: true },
      stockAdjustmentDraftID: null,
      draftDesc: null,
    });
  }

  initStockAdjustmentList() {
    const frmArrStoreAdj = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
    frmArrStoreAdj.push(
      this.fb.group({
        itemStockEntryID: [''],
        itemID: [''],
        itemName: [''],
        batchID: [''],
        quantityInHand: [''],
        adjustmentType: [''],
        adjustedQuantity: [''],
        qohAfterAdjustment: [''],
        reason: [''],
        deleted: [null],
        stockAdjustmentDraftID: [null],
        sADraftItemMapID: [null],
      }),
    );
  }
  initPhysicalStockForm() {
    return this.fb.group({
      itemStockEntryID: [''],
      itemID: [''],
      itemName: [''],
      batchID: [''],
      quantityInHand: [''],
      adjustmentType: [''],
      adjustedQuantity: [''],
      qohAfterAdjustment: [''],
      reason: [''],
      deleted: [null],
      stockAdjustmentDraftID: [null],
      sADraftItemMapID: [null],
    });
  }

  stroreStockTableData(): any {
    return (
      this.storeStockAdjustmentForm.get('stockAdjustmentList') as FormArray
    ).controls;
  }

  get stockAdjustmentList() {
    return this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
  }

  refresh(event: any, stock: any) {
    console.log('event##', event);
    stock.controls['itemName'].setValue(event.target.value);
    console.log('stock', stock);
    console.log('STOCK##', stock);
    this.dataSource.data = this.stroreStockTableData();
  }
  addToStockAdjustmentList() {
    this.stockAdjustmentList.push(this.initPhysicalStockForm());
    this.loadStockAdjData();
  }

  removeFromStockAdjustmentList(index: any, stockForm?: FormGroup) {
    const stockArrForm = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;

    if (stockArrForm.length > 1) {
      stockArrForm.removeAt(index);
      this.loadStockAdjData();
    } else {
      if (stockForm) {
        stockForm.reset();
        stockForm.controls['itemName'].enable();
      }
    }
  }

  submitStockAdjustmentDraft(storeStockAdjustmentForm: FormGroup) {
    const storeStockAdjustment = JSON.parse(
      JSON.stringify(storeStockAdjustmentForm.value),
    );

    const otherDetails = {
      createdBy: this.sessionstorage.getItem('username'),
      modifiedBy: this.sessionstorage.getItem('username'),
      // createdBy: this.sessionstorage.username,
      // modifiedBy: this.sessionstorage.username,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
      facilityID: this.sessionstorage.getItem('facilityID'),
      vanID: this.sessionstorage.getItem('vanID'),
      parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
    };

    const stockAdjustmentItemDraft =
      storeStockAdjustment.stockAdjustmentList.map((item: any) => {
        item.isAdded = item.adjustmentType === 'Receipt' ? true : false;
        item.adjustedQuantity = item.adjustedQuantity
          ? +item.adjustedQuantity
          : 0;
        item.adjustmentType = undefined;
        item = Object.assign({}, item, otherDetails);
        return item;
      });

    const temp = Object.assign({}, storeStockAdjustment, otherDetails, {
      stockAdjustmentItemDraft: stockAdjustmentItemDraft,
      stockAdjustmentList: undefined,
    });

    this.confirmationService
      .provideDraftDescription(
        this.currentLanguageSet.inventory.draftDescription,
        temp.draftDesc,
      )
      .subscribe((draftDesc) => {
        temp.draftDesc = draftDesc;

        this.inventoryService
          .saveStockAdjustmentDraft(temp)
          .subscribe((response) => {
            if (temp.stockAdjustmentDraftID) {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory.updatedSuccessfully,
                'success',
              );
              this.storeStockAdjustmentForm.reset({
                adjustmentDate: new Date(),
              });
              this.location.back();
            } else {
              this.confirmationService.alert(
                this.currentLanguageSet.inventory.savedsuccessfully,
                'success',
              );
              this.storeStockAdjustmentForm.reset();
              this.storeStockAdjustmentForm.reset({
                adjustmentDate: new Date(),
              });
              this.resetStockAdjustmentFormArray();
            }
          });
      });
  }

  submitStockAdjustmentFinal(storeStockAdjustmentForm: FormGroup) {
    const storeStockAdjustment = JSON.parse(
      JSON.stringify(storeStockAdjustmentForm.value),
    );

    const otherDetails = {
      createdBy: this.sessionstorage.getItem('username'),
      // createdBy: this.sessionstorage.username,
      providerServiceMapID: this.sessionstorage.getItem('providerServiceID'),
      facilityID: this.sessionstorage.getItem('facilityID'),
      vanID: this.sessionstorage.getItem('vanID'),
      parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
    };

    const stockAdjustmentItemDraft =
      storeStockAdjustment.stockAdjustmentList.map((item: any) => {
        item.isAdded = item.adjustmentType === 'Receipt' ? true : false;
        item.adjustedQuantity = item.adjustedQuantity
          ? +item.adjustedQuantity
          : 0;
        item.adjustmentType = undefined;
        item = Object.assign({}, item, otherDetails);
        return item;
      });

    const temp = Object.assign({}, storeStockAdjustment, otherDetails, {
      stockAdjustmentItem: stockAdjustmentItemDraft,
      stockAdjustmentList: undefined,
    });

    this.inventoryService.saveStockAdjustment(temp).subscribe((response) => {
      if (temp.stockAdjustmentDraftID) {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory.savedsuccessfully,
          'success',
        );
        this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
        this.location.back();
      } else {
        this.confirmationService.alert(
          this.currentLanguageSet.inventory.savedsuccessfully,
          'success',
        );
        this.storeStockAdjustmentForm.reset();
        this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
        this.resetStockAdjustmentFormArray();
      }
    });
  }
  getStockAdjustmentDraftDetails(draftID: any) {
    const temp = parseInt(draftID);
    console.log('draftID', draftID);
    console.log('temp', temp);
    this.inventoryService
      .getStockAdjustmentDraftDetails(temp)
      .subscribe((response) => {
        const stockAdjusmentList = response.data.stockAdjustmentItemDraftEdit;
        const stockAdjustmentFormArray = this.storeStockAdjustmentForm.controls[
          'stockAdjustmentList'
        ] as FormArray;
        console.log('stockAdjusmentList', stockAdjusmentList);
        console.log('stockAdjustmentFormArray', stockAdjustmentFormArray);

        for (let i = 0; i < stockAdjusmentList.length; i++) {
          stockAdjusmentList[i].adjustmentType = stockAdjusmentList[i].isAdded
            ? 'Receipt'
            : 'Issue';
          stockAdjusmentList[i].stockAdjustmentDraftID =
            response.data.stockAdjustmentDraftID;
          stockAdjustmentFormArray.at(i).patchValue(stockAdjusmentList[i]);
          (<FormGroup>stockAdjustmentFormArray.at(i)).controls[
            'itemName'
          ].disable();
          this.calculateQOHAfterAdjustment(
            stockAdjustmentFormArray.at(i) as FormGroup,
          );
          if (stockAdjustmentFormArray.length < stockAdjusmentList.length)
            this.addToStockAdjustmentList();
        }
        // this.loadStockAdjData();

        this.storeStockAdjustmentForm.patchValue({
          adjustmentDate: new Date(response.data.createdDate),
          refNo: response.data.refNo,
          stockAdjustmentDraftID: response.data.stockAdjustmentDraftID,
          draftDesc: response.data.draftDesc,
        });
        this.loadStockAdjData();
      });
  }

  calculateQOHAfterAdjustment(stockForm: FormGroup) {
    const qoh = parseInt(stockForm.value.quantityInHand) || 0;
    const adjustedQuantity = parseInt(stockForm.value.adjustedQuantity) || 0;
    const adjustmentType = stockForm.value.adjustmentType;

    if (adjustmentType === 'Receipt') {
      if (qoh >= 0 && adjustedQuantity >= 0)
        stockForm.patchValue({ qohAfterAdjustment: qoh + adjustedQuantity });
    } else if (adjustmentType === 'Issue') {
      console.log('loose');
      if (qoh > 0 && adjustedQuantity >= 0 && adjustedQuantity <= qoh)
        console.log('win');
      stockForm.patchValue({ qohAfterAdjustment: qoh - adjustedQuantity });
    }
  }

  resetStockAdjustmentFormArray() {
    const stockAdjustmentFormArray = this.storeStockAdjustmentForm.get(
      'stockAdjustmentList',
    ) as FormArray;
    stockAdjustmentFormArray.controls.length = 0;
    this.addToStockAdjustmentList();
  }

  resetStoreStockAdjustmentForm() {
    this.storeStockAdjustmentForm.reset({ adjustmentDate: new Date() });
    this.resetStockAdjustmentFormArray();
  }

  goBack() {
    this.location.back();
  }

  //AN40085822 29/9/2021 Integrating Multilingual Functionality --Start--
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  //--End--

  addEAushadhiStock() {
    const reqObj = {
      facilityID: this.sessionstorage.getItem('facilityID'),
    };
    this.inventoryService.addEAushadhiItemsToAmrit(reqObj).subscribe(
      (response) => {
        if (
          response !== null &&
          response !== undefined &&
          response.statusCode === 200
        ) {
          this.confirmationService.alert(response.data.response, 'success');
          this.showLastUpdatedStockLog();
        } else {
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }
  showLastUpdatedStockLog() {
    const reqObj = {
      facilityID: this.sessionstorage.getItem('facilityID'),
    };
    this.inventoryService.showLastUpdatedStockLogs(reqObj).subscribe(
      (logResponse) => {
        console.log('response stock', logResponse);
        if (
          logResponse !== null &&
          logResponse !== undefined &&
          logResponse.statusCode === 200
        ) {
          if (logResponse.data.lastSuccessDate)
            this.lastUpdatedStockDate = new Date(
              logResponse.data.lastSuccessDate,
            );
          else this.lastUpdatedStockDate = null;
        } else {
          this.confirmationService.alert(logResponse.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }
}
