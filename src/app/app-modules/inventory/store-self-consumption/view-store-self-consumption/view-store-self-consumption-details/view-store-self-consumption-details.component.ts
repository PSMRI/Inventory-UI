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
  AfterViewInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';

@Component({
  selector: 'app-view-store-self-consumption-details',
  templateUrl: './view-store-self-consumption-details.component.html',
  styleUrls: ['./view-store-self-consumption-details.component.css'],
})
export class ViewStoreSelfConsumptionDetailsComponent
  implements OnInit, OnDestroy, DoCheck, AfterViewInit
{
  _filterTerm = '';
  _detailedList: any = [];
  _filteredDetailedList = new MatTableDataSource<any>();
  _dataStoreSelfList = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  // blankTable = [1, 2, 3, 4, 5];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'consumptionID',
    'refNo',
    'reason',
    'createdBy',
    'createdDate',
  ];
  displayedColviewSelf: string[] = [
    'itemName',
    'batchNo',
    'quantity',
    'expiryDate',
  ];

  constructor(
    private http_service: LanguageService,
    public dialogRef: MatDialogRef<ViewStoreSelfConsumptionDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.populateConsumedItems(this.data);
    this.fetchLanguageResponse();
    this._dataStoreSelfList.data.push(this.data);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.data = '';
  }
  populateConsumedItems(data: any) {
    if (data && data.consumptionItem && data.consumptionDetails) {
      this._detailedList = data.consumptionItem;
      console.log('this._detailedList', this._detailedList);
      this._filteredDetailedList.data.push(this._detailedList);
      console.log(
        ' this._filteredDetailedList.data2',
        this._filteredDetailedList.data[0].data,
      );
      this.dataSource = new MatTableDataSource<any>(
        this._filteredDetailedList.data[0].data,
      );
      this.dataSource.paginator = this.paginator;
      console.log(' this.dataSource ', this.dataSource.data);
    }
  }

  filterDetails(filterTerm: string) {
    console.log(filterTerm);
    if (!filterTerm) {
      this._filteredDetailedList.data = this._detailedList.data;
      this.dataSource = new MatTableDataSource<any>(
        this._filteredDetailedList.data,
      );
      this.dataSource.paginator = this.paginator;
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
              this.dataSource.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  print() {
    this.closeViewModal();
  }

  closeViewModal() {
    const modalresult = Object.assign({ print: true });
    this.dialogRef.close(modalresult);
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
