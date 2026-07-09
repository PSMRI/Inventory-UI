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
  Output,
  EventEmitter,
  OnChanges,
  DoCheck,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
} from '@angular/forms';
import { InventoryService } from './../../shared/service/inventory.service';
import { SelectBatchComponent } from './select-batch/select-batch.component';
import { ConfirmationService } from './../../../core/services/confirmation.service';
import { DataStorageService } from './../../shared/service/data-storage.service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { ZardDialogService, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { TableDataSource } from 'src/app/app-modules/core/utils/table-data-source';
import { SessionStorageService } from 'Common-UI/v2/registrar/services/session-storage.service';
import { ItemDispenseDirective } from '../../../core/directives/item-dispense.directive';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { NullDefaultValueDirective } from '../../../core/directives/null-default-value.directive';
import { StringValidatorDirective } from '../../../core/directives/stringValidator.directive';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideSearch, lucideTrash2 } from '@ng-icons/lucide';
import { ZardButtonComponent } from 'Common-UI/v2/ui/button';
import { ZardFormImports } from 'Common-UI/v2/ui/form';
import { ZardInputDirective } from 'Common-UI/v2/ui/input';
import { ZardTableImports } from 'Common-UI/v2/ui/table';
import { tooltipImports } from 'Common-UI/v2/ui/tooltip';
@Component({
  selector: 'app-manual-medicine-dispense',
  templateUrl: './manual-medicine-dispense.component.html',
  viewProviders: [provideIcons({ lucidePencil, lucideSearch, lucideTrash2 })],
  imports: [
    ReactiveFormsModule,
    ItemDispenseDirective,
    NgIf,
    NgFor,
    NullDefaultValueDirective,
    StringValidatorDirective,
    NgIcon,
    ZardButtonComponent,
    ...ZardFormImports,
    ZardInputDirective,
    ...ZardTableImports,
    ...tooltipImports,
    DatePipe,
  ],
})
export class ManualMedicineDispenseComponent implements OnInit, DoCheck {
  @Input()
  beneficaryDetail: any;

  app: any;

  @Output() resetBeneficiaryDetail: EventEmitter<any> = new EventEmitter();

  manualItemDispenseForm!: FormGroup;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  manualDispenseList = new TableDataSource<any>();
  dataSource = new TableDataSource<any>();
  batchNumberDataList: any = [];
  otherData: any = [];
  paginator: unknown = null;
  displayedColumns: string[] = [
    'SNo',
    'itemName',
    'quantityInHand',
    'quantityDispensed',
    'batchNo',
    'quantityOnBatch',
    'expiryDate',
    'quantityOfDispense',
    'edit',
    'delete',
  ];

  constructor(
    private fb: FormBuilder,
    private dialog: ZardDialogService,
    private router: Router,
    public http_service: LanguageService,
    private confirmationService: ConfirmationService,
    private dataStorageService: DataStorageService,
    private inventoryService: InventoryService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.app = this.getApp();
    this.manualItemDispenseForm = this.initManualDispenseForm();
    this.subscribeToFormChange();
    this.fetchLanguageResponse();
  }

  subscribeToFormChange() {
    this.manualItemDispenseForm.controls['itemID'].valueChanges.subscribe(
      (value) => {
        if (value)
          setTimeout(() => {
            this.selectBatch();
          }, 0);
      },
    );
  }
  getApp() {
    console.log(this.sessionstorage.getItem('host'));
    if (this.sessionstorage.getItem('host')) {
      return this.sessionstorage.getItem('host');
    } else {
      return 'STORE';
    }
  }
  resetDependent() {
    this.manualItemDispenseForm.patchValue({
      itemID: null,
      quantityInHand: null,
      quantityDispensed: null,
    });
  }

  initManualDispenseForm(): FormGroup {
    return this.fb.group({
      itemName: null,
      itemID: null,
      quantityInHand: null,
      quantityDispensed: null,
      batchList: new FormArray([]),
    });
  }

  initBatchForm(): FormGroup {
    return this.fb.group({
      batchNo: null,
      quantityOnBatch: null,
      expiryDate: null,
      entryDate: null,
      quantityOfDispense: null,
    });
  }

  get quantityInHand() {
    return this.manualItemDispenseForm.controls['quantityInHand'].value;
  }

  selectBatch() {
    const batchList = <FormArray>(
      this.manualItemDispenseForm.controls['batchList']
    );
    const batchListLength = batchList.length;
    if (batchList && batchListLength > 0) {
      for (let j = 0; j <= batchListLength; j++) {
        batchList.removeAt(0);
      }
      this.getItemBatchList(null, this.manualItemDispenseForm.value);
    } else {
      this.getItemBatchList(null, this.manualItemDispenseForm.value);
    }
  }

  getItemBatchList(editIndex: any, formValue: any) {
    let itemBatchList = [];
    const requestObjectGetBatchList = {
      facilityID: this.sessionstorage.getItem('facilityID'),
      itemID: formValue.itemID,
    };
    this.inventoryService.getItemBatchList(requestObjectGetBatchList).subscribe(
      (response) => {
        if (response.statusCode === 200) {
          if (response.data.length > 0) {
            itemBatchList = response.data;
            this.openModalTOSelectBatch(editIndex, formValue, itemBatchList);
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.inventory.noBatchavailableforthisItem,
            );
          }
        } else {
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  openModalTOSelectBatch(editIndex: any, formValue: any, itemBatchList: any) {
    console.log('formValue', formValue);
    this.inventoryService.dialogClosed();
    const mdDialogRef: ZardDialogRef<SelectBatchComponent> = this.dialog.create<
      SelectBatchComponent,
      unknown
    >({
      zContent: SelectBatchComponent,
      zData: {
        batchList: itemBatchList,
        editBatch: formValue,
        editIndex: editIndex,
      },
      zWidth: '1200px',
      zMaskClosable: true,
      zHideFooter: true,
      zClosable: false,
    });
    mdDialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        console.log("result['batchList']", result.value['batchList']);
        if (editIndex !== null) {
          this.batchNumberDataList = [];
          this.otherData = [];
          this.manualDispenseList.data.splice(editIndex, 1);
          this.manualDispenseList.data.push(result.value);
          this.manualDispenseList.paginator = this.paginator;
          this.manualDispenseList.data.forEach((manualDispenseItem: any) => {
            this.batchNumberDataList = [];
            this.otherData = [];
            manualDispenseItem.batchList.forEach((batchItem: any) => {
              this.batchNumberDataList.push(batchItem.batchNo);
              this.otherData.push(batchItem.quantityOfDispense);
            });
            manualDispenseItem['batchNo'] = this.batchNumberDataList;
            manualDispenseItem['quantityOfDispense'] = this.otherData;
            console.log('manualDispenseList', this.manualDispenseList.data);
          });
          this.manualItemDispenseForm.reset();
        } else {
          this.manualDispenseList.data.push(result.value);
          this.manualDispenseList.paginator = this.paginator;
          this.manualDispenseList.data.forEach((manualDispenseItem: any) => {
            this.batchNumberDataList = [];
            this.otherData = [];
            manualDispenseItem.batchList.forEach((batchItem: any) => {
              this.batchNumberDataList.push(batchItem.batchNo);
              this.otherData.push(batchItem.quantityOfDispense);
            });
            manualDispenseItem['batchNo'] = this.batchNumberDataList;
            manualDispenseItem['quantityOfDispense'] = this.otherData;
            console.log('manualDispenseList', this.manualDispenseList.data);
          });
          this.manualItemDispenseForm.reset();
        }
      }
    });
  }

  removeManualDispenseItem(i: any) {
    this.manualDispenseList.data.splice(i, 1);
    this.manualDispenseList.paginator = this.paginator;
  }

  editItem(item: any, i: any) {
    this.getItemBatchList(i, item);
  }

  stockExitList: any = [];
  createStockExitList() {
    this.manualDispenseList.data.forEach((dispenseItem: any) => {
      dispenseItem.batchList.forEach((batch: any) => {
        const dispensedItem = {
          createdBy: this.sessionstorage.getItem('userID'),
          // createdBy: this.sessionstorage.userID,
          itemID: batch.batchNo.itemID,
          itemStockEntryID: batch.batchNo.itemStockEntryID,
          quantity: batch.quantityOfDispense,
        };
        this.stockExitList.push(dispensedItem);
      });
    });
    const dispensingItem = Object.assign(
      {},
      { issuedBy: this.app },
      this.beneficaryDetail,
      { itemStockExit: this.stockExitList },
      {
        vanID: this.sessionstorage.getItem('vanID'),
        parkingPlaceID: this.sessionstorage.getItem('parkingPlaceID'),
      },
    );
    return dispensingItem;
  }
  save(print: any) {
    this.saveItem(print);
  }
  saveItem(print: any) {
    const dispensingItem = this.createStockExitList();
    console.log('dispensingItem', dispensingItem);
    this.inventoryService.saveStockExit(dispensingItem).subscribe(
      (response) => {
        if (response.statusCode === 200) {
          if (print) {
            this.saveAndPrintPage();
          } else {
            this.confirmationService.alert(
              this.currentLanguageSet.inventory.savedsuccessfully,
              'success',
            );
            this.manualDispenseList.data = [];
            this.manualDispenseList.paginator = this.paginator;
            this.manualItemDispenseForm.reset();
            this.resetBeneficiaryDetails();
          }
        } else {
          this.confirmationService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.confirmationService.alert(err, 'error');
      },
    );
  }

  resetBeneficiaryDetails() {
    console.log('event', event);
    this.resetBeneficiaryDetail.emit();
  }

  createPrintableData() {
    const printableData: any = [];
    let i = 0;
    this.manualDispenseList.data.forEach((dispenseItem: any) => {
      dispenseItem.batchList.forEach((batch: any) => {
        console.log('batch', batch);
        i = i + 1;
        const dispensedItem = {
          sNo: i,
          itemName: dispenseItem.itemName,
          batchNo: batch.batchNo.batchNo,
          expiryDate: moment(batch.expiryDate).format('DD-MM-YYYY'),
          qod: batch.quantityOfDispense,
        };
        printableData.push(dispensedItem);
      });
    });
    const beneficaryDetail = Object.assign(
      {
        visitedDate: moment(this.beneficaryDetail.visitDate).format(
          'DD-MM-YYYY',
        ),
      },
      this.beneficaryDetail,
    );
    console.log('beneficaryDetail', JSON.stringify(beneficaryDetail, null, 4));

    const manualDispenseItem = Object.assign(
      {},
      { title: this.title },
      { headerColumn: this.headerColumn },
      { headerDetail: beneficaryDetail },
      { columns: this.columns },
      { printableData: printableData },
    );
    return manualDispenseItem;
  }

  title = {
    modalTitle: 'Manual Dispense',
    headerTitle: 'Dispense Detail',
    tableTitle: 'Dispensed Item',
  };

  columns = [
    {
      keyName: 'sNo',
      columnName: 'S No.',
    },
    {
      keyName: 'itemName',
      columnName: 'Item Name',
    },
    {
      keyName: 'batchNo',
      columnName: 'Batch No',
    },
    {
      keyName: 'expiryDate',
      columnName: 'Expiry Date',
    },
    {
      keyName: 'qod',
      columnName: 'Qty dispensed',
    },
  ];

  headerColumn = [
    {
      columnName: 'Name :',
      keyName: 'patientName',
    },
    {
      columnName: 'Beneficiary ID :',
      keyName: 'beneficiaryID',
    },
    {
      columnName: 'Gender :',
      keyName: 'gender',
    },
    {
      columnName: 'Age :',
      keyName: 'age',
    },
    {
      columnName: 'Visit ID :',
      keyName: 'visitID',
    },
    {
      columnName: 'Visit Date :',
      keyName: 'visitedDate',
    },
    {
      columnName: 'Doctor Name :',
      keyName: 'doctorName',
    },
    {
      columnName: 'Issued By :',
      keyName: 'createdBy',
    },
    {
      columnName: 'Reference :',
      keyName: 'reference',
    },
  ];

  saveAndPrintPage() {
    const manualDispenseItem = this.createPrintableData();
    this.dataStorageService.manualDispenseItem = manualDispenseItem;
    const uRL = 'manualDispenseItem';
    this.router.navigate(['/inventory/dynamicPrint/', uRL]);
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
