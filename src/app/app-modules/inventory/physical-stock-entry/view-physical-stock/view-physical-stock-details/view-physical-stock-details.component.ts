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

import {
  MatTableDataSource,
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
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DatePipe } from '@angular/common';
import { ISTDatePipe } from '../../../../core/pipes/ist-date.pipe';

@Component({
  selector: 'app-view-physical-stock-details',
  templateUrl: './view-physical-stock-details.component.html',
  styleUrls: ['./view-physical-stock-details.component.css'],
  imports: [
    MatIcon,
    MatTooltip,
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
    MatFormField,
    MatInput,
    FormsModule,
    MatSuffix,
    MatPaginator,
    MatButton,
    DatePipe,
    ISTDatePipe,
  ],
})
export class ViewPhysicalStockDetailsComponent
  implements OnInit, OnDestroy, DoCheck, AfterViewInit
{
  _filterTerm = '';
  _detailedList: any = [];
  _filteredDetailedList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  // blankTable = [1, 2, 3, 4, 5];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSourceList = new MatTableDataSource<any>();

  constructor(
    private http_service: LanguageService,
    public dialogRef: MatDialogRef<ViewPhysicalStockDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.populateStockEntryItems(this.data);
    this.fetchLanguageResponse();
  }

  ngOnDestroy(): void {
    this.data = '';
  }
  ngAfterViewInit() {
    this._filteredDetailedList.paginator = this.paginator;
  }
  populateStockEntryItems(data: any) {
    console.log(data);
    if (data && data.entryDetails && data.stockEntry) {
      console.log('this.paginator2', this.paginator);
      const entries = data.entryDetails;
      const stockEntries = JSON.parse(JSON.stringify(data.stockEntry));
      this.dataSourceList.data.push(stockEntries);
      this._detailedList = entries.data;
      this._filteredDetailedList.data = entries.data;
      this._filteredDetailedList.paginator = this.paginator;
      console.log('this.paginator', this.paginator);
      console.log(
        'this._filteredDetailedList.paginator',
        this._filteredDetailedList.paginator,
      );
    }
  }

  filterDetails(filterTerm: string) {
    console.log(filterTerm);
    if (!filterTerm) {
      this._filteredDetailedList.data = this._detailedList;
      this._filteredDetailedList.paginator = this.paginator;
    } else {
      this._filteredDetailedList.data = [];
      this._filteredDetailedList.paginator = this.paginator;
      this._detailedList.forEach((item: any) => {
        for (const key in item) {
          if (key !== 'item') {
            if (key === 'batchNo' || key === 'quantity') {
              const value: string = '' + item[key];
              if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
                this._filteredDetailedList.data.push(item);
                this._filteredDetailedList.paginator = this.paginator;
                break;
              }
            }
          }

          if (key === 'item') {
            const value: string = '' + item.item.itemName;
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this._filteredDetailedList.data.push(item);
              this._filteredDetailedList.paginator = this.paginator;
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
