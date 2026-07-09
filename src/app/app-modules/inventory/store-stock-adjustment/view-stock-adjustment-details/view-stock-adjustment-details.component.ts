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
import { Z_MODAL_DATA, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { InventoryService } from '../../shared/service/inventory.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISTDatePipe } from '../../../core/pipes/ist-date.pipe';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideX } from '@ng-icons/lucide';
import { ZardInputDirective } from 'Common-UI/v2/ui/input';
import { ZardButtonComponent } from 'Common-UI/v2/ui/button';
import { ZardTableImports } from 'Common-UI/v2/ui/table';
import { ZardPaginatorComponent } from 'Common-UI/v2/ui/paginator';
import { tooltipImports } from 'Common-UI/v2/ui/tooltip';

@Component({
  selector: 'app-view-stock-adjustment-details',
  templateUrl: './view-stock-adjustment-details.component.html',
  viewProviders: [provideIcons({ lucideSearch, lucideX })],
  imports: [
    NgIf,
    NgFor,
    NgIcon,
    FormsModule,
    ZardInputDirective,
    ZardButtonComponent,
    ...ZardTableImports,
    ZardPaginatorComponent,
    ...tooltipImports,
    ISTDatePipe,
  ],
})
export class ViewStockAdjustmentDetailsComponent implements OnInit, DoCheck {
  filterTerm!: string;

  stock: any;
  adjustmentList: any = [];
  filteredAdjustmentList = new MatTableDataSource<any>();
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  stockAdjustmentList = new MatTableDataSource<any>();
  dataSource = new MatTableDataSource<any>();
  dataSource2 = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'stockAdjustmentID',
    'refNo',
    'createdBy',
    'createdDate',
  ];

  storeListColumns: string[] = [
    'itemName',
    'batchNo',
    'quantityOnHand',
    'adjustmentType',
    'adjustedQuantity',
    'reason',
  ];

  constructor(
    private http_service: LanguageService,
    @Inject(Z_MODAL_DATA) public input: any,
    public dialogRef: ZardDialogRef<ViewStockAdjustmentDetailsComponent>,
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
      .getStockAdjustmentDetails(temp)
      .subscribe((response) => {
        this.stock = response;
        console.log('response##', response);
        this.stockAdjustmentList.data.push(this.stock);
        console.log(
          ' this.stockAdjustmentList.data',
          this.stockAdjustmentList.data,
        );
        console.log(
          'this.stockAdjustmentList.data',
          this.stockAdjustmentList.data,
        );
        this.dataSource = new MatTableDataSource<any>(
          this.stockAdjustmentList.data,
        );
        this.adjustmentList.push(response.data.stockAdjustmentItemDraftEdit);
        this.filteredAdjustmentList.data.push(this.stock);
        this.dataSource2 = new MatTableDataSource<any>(
          this.filteredAdjustmentList.data[0].data.stockAdjustmentItemDraftEdit,
        );
        this.dataSource2.paginator = this.paginator;
      });
  }

  filterDetails(filterTerm: any) {
    if (!filterTerm) {
      this.filteredAdjustmentList.data = this.adjustmentList;
      console.log('CC', this.filteredAdjustmentList.data);
      this.dataSource2 = new MatTableDataSource<any>(
        this.filteredAdjustmentList.data[0],
      );
      this.dataSource2.paginator = this.paginator;
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
                break;
              }
            }
            if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
              this.filteredAdjustmentList.data.push(item);
              console.log('Real', this.filteredAdjustmentList.data[0]);
              this.dataSource2 = new MatTableDataSource<any>(
                this.filteredAdjustmentList.data,
              );
              this.dataSource2.paginator = this.paginator;
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
