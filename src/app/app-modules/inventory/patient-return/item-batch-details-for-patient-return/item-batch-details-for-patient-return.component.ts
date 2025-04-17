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
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  DoCheck,
  ViewChild,
} from '@angular/core';
import {
  NgForm,
  FormBuilder,
  FormArray,
  Validators,
  FormGroup,
} from '@angular/forms';
import { InventoryService } from '../../../inventory/shared/service/inventory.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { SearchComponent } from '../../../core/components/search/search.component';
import { Router } from '@angular/router';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { PatientReturnBatchDetailsComponent } from '../patient-return-batch-details/patient-return-batch-details.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-item-batch-details-for-patient-return',
  templateUrl: './item-batch-details-for-patient-return.component.html',
  styleUrls: ['./item-batch-details-for-patient-return.component.css'],
})
export class ItemBatchDetailsForPatientReturnComponent
  implements OnInit, DoCheck
{
  @Input()
  itemMasterList: any;

  @Input()
  benRegId: any;

  @Output()
  resetBenDetails: EventEmitter<any> = new EventEmitter();

  itemReturnForm!: FormGroup;
  batchList = new MatTableDataSource<any>();
  selectedItemList: any = [];
  filterItemList: any = [];
  selectedBatchList = new MatTableDataSource<any>();
  patientReturnList: any = [];

  searched = false;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  hide = false;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'sNo',
    'itemName',
    'batchNo',
    'issuedQuantity',
    'dateofIssue',
    'returnQuantity',
    'edit',
    'delete',
  ];
  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private http_service: LanguageService,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private router: Router,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.itemReturnForm = this.createItemReturnForm();
    this.fetchLanguageResponse();
    if (this.itemMasterList.length > 0) {
      this.filterItemList = this.itemMasterList;
    } else {
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.itemnotIssuedforthebeneficiary,
      );
    }
    console.log('itemListttttt......', this.itemMasterList, this.benRegId);
  }

  createItemReturnForm() {
    return this.fb.group({
      itemName: null,
      batchList: new FormArray([]),
    });
  }

  get itemName() {
    return this.itemReturnForm.controls['itemName'].value;
  }

  getBatchDetail(formvalue: any, editIndex: any) {
    let batchReq;
    let data: any;
    if (editIndex === null) {
      batchReq = {
        benRegID: this.benRegId,
        itemID: formvalue.itemID,
        facilityID: this.sessionstorage.getItem('facilityID'),
      };
      data = this.itemReturnForm.value;
      console.log('Data if editIndex is null', data);
    } else {
      batchReq = {
        benRegID: this.benRegId,
        itemID: formvalue.itemName.itemID,
        facilityID: this.sessionstorage.getItem('facilityID'),
      };
      data = formvalue;
      console.log('Data if editIndex is not null', data);
    }
    this.inventoryService.getBatchDetails(batchReq).subscribe((response) => {
      console.log('Response of item batch list', response);
      if (response.statusCode === 200) {
        this.batchList.data = response.data;
        this.popOutBenAndItemDetails(this.batchList.data, data, editIndex);
      }
      console.log('Batchlist::', JSON.stringify(this.batchList.data, null, 4));
    });
  }

  popOutBenAndItemDetails(batchList: any, formvalue: any, editIndex: any) {
    console.warn(batchList);
    const itemName = formvalue.itemName;
    console.log('Itemmmmm', itemName);
    const matDialogRef: MatDialogRef<PatientReturnBatchDetailsComponent> =
      this.dialog.open(PatientReturnBatchDetailsComponent, {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        data: {
          batchList: batchList,
          editIndex: editIndex,
          editBatch: formvalue,
        },
        disableClose: false,
      });
    matDialogRef.afterClosed().subscribe((selectedBatchList: any) => {
      if (selectedBatchList) {
        if (editIndex !== null) {
          this.selectedBatchList.data.splice(editIndex, 1);
          this.selectedBatchList.data.push(selectedBatchList.value);
          this.selectedBatchList.paginator = this.paginator;
          console.log(
            ' this.selectedBatchList.data',
            this.selectedBatchList.data,
          );
          this.itemReturnForm.patchValue({
            itemName: null,
          });
        } else {
          this.selectedBatchList.data.push(selectedBatchList.value);
          this.selectedBatchList.paginator = this.paginator;
          console.log(
            ' this.selectedBatchList.data',
            this.selectedBatchList.data,
          );
          this.itemReturnForm.patchValue({
            itemName: null,
          });
          const filterItemMasterList = this.filterItemList;
          this.filterItem(itemName, filterItemMasterList);
        }
      } else {
        this.itemReturnForm.patchValue({
          itemName: null,
        });
      }
    });
  }

  removeAddedItem(i: any) {
    const removedItem = this.selectedBatchList.data[i];
    console.log('removedItem', removedItem);
    // console.log("removedItem", removedItem);
    this.filterItemList.push(removedItem.itemName);
    this.selectedBatchList.data.splice(i, 1);
    this.selectedBatchList.paginator = this.paginator;
  }

  filterItem(itemName: any, filterItemMasterList: any) {
    this.selectedItemList.push(itemName);
    console.log('selectedItemList', this.selectedItemList);
    this.filterItemList = [];
    this.filterItemList = filterItemMasterList.filter((item: any) => {
      if (itemName && itemName.itemName && itemName.itemName !== null) {
        return itemName.itemName !== item.itemName;
      }
    });
  }
  openSearchDialog() {
    const mdDialogRef: MatDialogRef<SearchComponent> = this.dialog.open(
      SearchComponent,
      {
        width: '1200px',
        height: 'auto',
        panelClass: 'fit-screen',
        disableClose: false,
      },
    );
  }
  editItem(item: any, i: any) {
    this.getBatchDetail(item, i);
  }

  manipulateFinalData() {
    const finalData: any = [];
    this.selectedBatchList.data.forEach((item: any) => {
      item.batchList.forEach((batch: any) => {
        const returnQuantity = batch.returnQuantity;
        const createdBy = this.sessionstorage.getItem('userName');
        // const createdBy = this.sessionstorage.userName;
        const batchNo = Object.assign(batch.batchNo, {
          returnQuantity,
          createdBy,
        });
        finalData.push(batchNo);
      });
    });
    console.log('finalData', finalData);
    this.savePatientReturnBatch(finalData);
  }

  savePatientReturnBatch(finalData: any) {
    this.inventoryService
      .updateQuantityReturned(finalData)
      .subscribe((response) => {
        if (response.statusCode === 200) {
          this.confirmationService.alert(response.data.response, 'success');
          this.resetFieldsAfterSubmit();
          this.resetBenDetails.emit(false);
        }
      });
  }

  resetFieldsAfterSubmit() {
    this.itemReturnForm.reset();
    this.selectedBatchList.data = [];
    this.selectedBatchList.paginator = this.paginator;
  }
  resetOnClear() {
    this.resetFieldsAfterSubmit();
    this.resetBenDetails.emit(false);
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
}
