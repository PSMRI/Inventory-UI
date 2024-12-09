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
  Inject,
  OnDestroy,
  DoCheck,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-view-medicine-dispense-details',
  templateUrl: './view-medicine-dispense-details.component.html',
  styleUrls: ['./view-medicine-dispense-details.component.css'],
})
export class ViewMedicineDispenseDetailsComponent
  implements OnInit, OnDestroy, DoCheck
{
  _filterTerm = '';
  _detailedList: any = [];
  blankTable = [1, 2, 3, 4, 5];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  medicineDetailList = new MatTableDataSource<any>();
  _filteredDetailedList = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'patientName',
    'issueType',
    'createdBy',
    'reference',
    'createdDate',
  ];
  itemListColumns: string[] = ['itemName', 'batchNo', 'expiryDate', 'quantity'];

  constructor(
    public dialogRef: MatDialogRef<ViewMedicineDispenseDetailsComponent>,
    public http_service: LanguageService,
    readonly sessionstorage: SessionStorageService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.populateDispenseRecords(this.data);
    this.fetchLanguageResponse();
  }

  ngOnDestroy(): void {
    this.data = '';
  }
  populateDispenseRecords(data: any) {
    if (data && data.dispenseItem && data.dispense) {
      this._detailedList = data.dispenseItem;
      this._filteredDetailedList.data.push(this._detailedList);
      this.dataSource = new MatTableDataSource<any>(
        this._filteredDetailedList.data[0].data,
      );
      this.medicineDetailList.data.push(data.dispense);
    }
  }

  filterDetails(filterTerm: string) {
    console.log(filterTerm);
    if (!filterTerm) {
      this._filteredDetailedList.data = this._detailedList.data;
      this.dataSource = new MatTableDataSource<any>(
        this._filteredDetailedList.data,
      );
    } else {
      this._filteredDetailedList.data = [];
      this._detailedList.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'batchNo' || key === 'itemName' || key === 'quantity') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this._filteredDetailedList.data.push(item);
              this.dataSource = new MatTableDataSource<any>(
                this._filteredDetailedList.data,
              );
              break;
            }
          }
        }
      });
    }
  }

  print() {
    const printableData = this.createPrintableData();
    console.log('printableData', JSON.stringify(printableData, null, 4));
    this.closeModal(printableData);
  }
  closeModal(printableData: any) {
    this.dialogRef.close(printableData);
  }

  createPrintableData() {
    const facilityDetailStrorage: any =
      this.sessionstorage.getItem('facilityDetail');
    const facilityDetail = JSON.parse(facilityDetailStrorage);
    const facilityName = facilityDetail.facilityName;
    const printableData: any = [];
    let i = 0;
    this.data.dispenseItem.data.forEach((dispenseItem: any) => {
      i = i + 1;
      const dispensedItem = {
        sNo: i,
        itemName: dispenseItem.itemName,
        batchNo: dispenseItem.batchNo,
        expiryDate: moment(dispenseItem.expiryDate).format('DD-MM-YYYY'),
        qod: dispenseItem.quantity,
      };
      printableData.push(dispensedItem);
    });

    const beneficiaryDetails = Object.assign(
      {
        facilityName: facilityName,
        visitedDate: moment(this.data.dispense.visitDate).format('DD-MM-YYYY'),
      },
      this.data.dispense,
    );
    const previousDispense = Object.assign(
      {},
      { title: this.title },
      { headerColumn: this.headerColumn },
      { headerDetail: beneficiaryDetails },
      { columns: this.columns },
      { printableData: printableData },
    );
    return previousDispense;
  }

  title = {
    modalTitle: 'Previous Dispense',
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
      columnName: 'Visit Code :',
      keyName: 'visitCode',
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
