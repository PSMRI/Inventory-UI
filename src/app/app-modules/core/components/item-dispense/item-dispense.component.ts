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
import { ConfirmationService } from '../../services/confirmation.service';

import { Observable } from 'rxjs';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-item-dispense',
  templateUrl: './item-dispense.component.html',
  styleUrls: ['./item-dispense.component.css'],

  standalone: false,
})
export class ItemDispenseComponent implements OnInit, DoCheck {
  searchTerms!: string;
  items$!: Observable<any>;
  selectedItem = null;

  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource = new MatTableDataSource<any>();
  noRecordsFlag = false;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    private itemSearchService: ItemSearchService,
    public http_service: LanguageService,
    public dialogRef: MatDialogRef<ItemDispenseComponent>,
    private confirmationService: ConfirmationService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    console.log('this.input', this.input);
    this.fetchLanguageResponse();
  }

  search(term: string): void {
    this.items$ = this.itemSearchService.getItemDetailsByName(term);
    if (term === '%%') {
      this.items$.subscribe((data) => {
        if (data) {
          this.dataSource.data = data.data;
          this.dataSource.paginator = this.paginator;
          this.noRecordsFlag = true;
        } else {
          this.noRecordsFlag = false;
        }
      });
    } else if (term) {
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
  }

  selectSelectedItem(selectedItem: any) {
    const dispenseItemList: any = this.input.dispenseItemList.data;
    console.log(
      'this.input.dispenseItemList.data',
      this.input.dispenseItemList.data,
    );
    console.log('dispenseItemList', dispenseItemList);

    const temp = dispenseItemList.filter(
      (item: any) => item.itemID === selectedItem.item.itemID,
    );

    if (temp.length <= 0) this.dialogRef.close(selectedItem);
    else
      this.confirmationService.alert(
        this.currentLanguageSet.inventory.itemAdded,
      );
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
