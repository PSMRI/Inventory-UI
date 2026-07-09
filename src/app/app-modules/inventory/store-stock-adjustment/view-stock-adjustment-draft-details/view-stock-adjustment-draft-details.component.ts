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
import { Component, OnInit, Inject, DoCheck, ViewChild } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
} from '@angular/material/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { InventoryService } from '../../shared/service/inventory.service';
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
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { NgIf } from '@angular/common';
import { MatFormField, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { ISTDatePipe } from '../../../core/pipes/ist-date.pipe';

@Component({
  selector: 'app-view-stock-adjustment-draft-details',
  templateUrl: './view-stock-adjustment-draft-details.component.html',
  styleUrls: ['./view-stock-adjustment-draft-details.component.css'],
  imports: [
    MatIcon,
    MatDialogClose,
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
    NgIf,
    MatFormField,
    MatInput,
    FormsModule,
    MatSuffix,
    MatButton,
    ISTDatePipe,
  ],
})
export class ViewStockAdjustmentDraftDetailsComponent
  implements OnInit, DoCheck
{
  filterTerm!: string;

  stock: any;
  adjustmentList: any = [];
  filteredAdjustmentList = new MatTableDataSource<any>();
  currentLanguageSet: any;
  languageComponent!: SetLanguageComponent;
  stockAdjustmentDraftList = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  newDataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'stockAdjustmentDraftID',
    'refNo',
    'draftDescription',
    'createdBy',
    'createdDate',
  ];

  adjustmentListColumns: string[] = [
    'itemName',
    'batchNo',
    'quantityOnHand',
    'adjustmentType',
    'adjustedQuantity',
    'reason',
  ];

  constructor(
    private http_service: LanguageService,
    @Inject(MAT_DIALOG_DATA) public input: any,
    public dialogRef: MatDialogRef<ViewStockAdjustmentDraftDetailsComponent>,
    private inventoryService: InventoryService,
  ) {}

  ngOnInit() {
    this.fetchLanguageResponse();
    if (this.input && this.input.adjustmentID) {
      this.getStockAdjustmentDetails(this.input.adjustmentID);
    }
  }

  getStockAdjustmentDetails(adjustmentID: any) {
    const temp = parseInt(adjustmentID);
    this.inventoryService
      .getStockAdjustmentDraftDetails(temp)
      .subscribe((response) => {
        this.stock = response;
        this.stockAdjustmentDraftList.data.push(this.stock);
        console.log(
          ' this.stockAdjustmentDraftList.data',
          this.stockAdjustmentDraftList.data,
        );
        this.dataSource = new MatTableDataSource<any>(
          this.stockAdjustmentDraftList.data,
        );
        this.adjustmentList.push(response.stockAdjustmentItemDraftEdit);
        this.filteredAdjustmentList.data.push(this.stock);
        this.newDataSource = new MatTableDataSource<any>(
          this.filteredAdjustmentList.data[0].data.stockAdjustmentItemDraftEdit,
        );
        this.newDataSource.paginator = this.paginator;
      });
  }

  filterDetails(filterTerm: any) {
    if (!filterTerm) {
      this.filteredAdjustmentList.data = this.adjustmentList;
      this.newDataSource = new MatTableDataSource<any>(
        this.filteredAdjustmentList.data[0],
      );
      this.newDataSource.paginator = this.paginator;
    } else {
      this.filteredAdjustmentList.data = [];
      this.adjustmentList[0].forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'itemName' ||
            key === 'batchID' ||
            key === 'reason' ||
            key === 'quantityInHand' ||
            key === 'adjustedQuantity' ||
            key === 'isAdded'
          ) {
            const value: string = '' + item[key];
            if (key === 'isAdded') {
              if (
                'receipt'.indexOf(filterTerm.toLowerCase()) >= 0 &&
                item[key]
              ) {
                this.filteredAdjustmentList.data.push(item);
                break;
              } else if (
                'issue'.indexOf(filterTerm.toLowerCase()) >= 0 &&
                !item[key]
              ) {
                this.filteredAdjustmentList.data.push(item);
                this.newDataSource = new MatTableDataSource<any>(
                  this.filteredAdjustmentList.data,
                );
                this.newDataSource.paginator = this.paginator;
                break;
              }
            }
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredAdjustmentList.data.push(item);
              break;
            }
          }
        }
      });
    }
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
