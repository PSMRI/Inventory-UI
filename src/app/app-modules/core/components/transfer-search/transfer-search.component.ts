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
import { ItemSearchService } from '../../services/item-search.service';
import { Observable } from 'rxjs';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-transfer-search',
  templateUrl: './transfer-search.component.html',
  styleUrls: ['./transfer-search.component.css'],

  standalone: false,
})
export class TransferSearchComponent implements OnInit, DoCheck {
  private searchTerms!: string;
  items$!: Observable<any>;
  selectedBatchList: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  noRecordsFlag = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns: string[] = [
    'itemCode',
    'itemName',
    'batchNo',
    'itemCategory',
    'itemForm',
    'pharmacologicalCategory',
    'strength',
    'quantityOnHand',
    'expiryDate',
    'action',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    public dialogRef: MatDialogRef<TransferSearchComponent>,
    public http_service: LanguageService,
    private itemSearchService: ItemSearchService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    this.fetchLanguageResponse();
  }

  search(term: string): void {
    this.items$ = this.itemSearchService.searchDrugItemforTransfer(
      term,
      this.input.transferTo,
    );
    this.items$.subscribe((data) => {
      if (data) {
        this.dataSource.data = data.data;
        this.dataSource.paginator = this.paginator;
        this.noRecordsFlag = true;
      } else {
        this.noRecordsFlag = false;
      }
    });
  }

  selectBatch(event: any, batch: any) {
    if (event.checked) {
      this.selectedBatchList.push(batch);
      batch.selected = true;
    } else {
      const index = this.selectedBatchList.indexOf(batch);
      this.selectedBatchList.splice(index, 1);
      batch.selected = false;
    }
  }

  disableSelection(batch: any) {
    const addedStock = this.input.addedStock;
    const temp = addedStock.filter(
      (stock: any) => stock.itemStockEntryID === batch.itemStockEntryID,
    );
    if (temp.length > 0) return true;
    else return false;
  }

  submitBatch() {
    this.dialogRef.close(this.selectedBatchList);
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
