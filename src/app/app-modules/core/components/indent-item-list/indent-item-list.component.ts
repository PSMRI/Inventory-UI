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
import { ConfirmationService } from '../../services/confirmation.service';
import { Observable } from 'rxjs';
import { BatchSearchService } from '../../services/batch-search.service';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogClose,
  MatDialogContent,
} from '@angular/material/dialog';
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
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { StringValidatorDirective } from '../../directives/stringValidator.directive';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-indent-item-list',
  templateUrl: './indent-item-list.component.html',
  styleUrls: ['./indent-item-list.component.css'],
  imports: [
    MatIconButton,
    MatDialogClose,
    MatTooltip,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    StringValidatorDirective,
    MatButton,
    CdkScrollable,
    MatDialogContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatCheckbox,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    NgIf,
    MatPaginator,
  ],
})
export class IndentItemListComponent implements OnInit, DoCheck {
  searchTerms!: string;
  items!: Observable<any>;
  selectedItemList: any = [];
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  noRecordsFlag = false;

  displayedColumns = [
    'itemCode',
    'itemName',
    'itemCategory',
    'itemForm',
    'strength',
    'quantityOnHand',
    'action',
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA) public input: any,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<IndentItemListComponent>,
    public http_service: LanguageService,
    private batchSearchService: BatchSearchService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    this.fetchLanguageResponse();
  }

  search(term: string): void {
    this.items = this.batchSearchService.searchItem(term);
    // this.items.subscribe((data) => {
    //   if (data) {
    //     this.dataSource.data = data.data;
    //     this.dataSource.paginator = this.paginator;
    //     this.noRecordsFlag = true;
    //   } else {
    //     this.noRecordsFlag = false;
    //   }
    // });
    if (term === '%%') {
      this.items.subscribe((data) => {
        if (data) {
          this.dataSource.data = data.data;
          this.dataSource.paginator = this.paginator;
          this.noRecordsFlag = true;
        } else {
          this.noRecordsFlag = false;
        }
      });
    } else if (term) {
      this.items.subscribe((data) => {
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
  selectItem(event: any, item: any) {
    if (event.checked) {
      item.selected = true;
      this.selectedItemList.push(item);
    } else {
      const index = this.selectedItemList.indexOf(item);
      this.selectedItemList.splice(index, 1);
      item.selected = false;
    }
  }
  disableSelection(item: any) {
    const addedIndent = this.input.addedIndent;
    const temp = addedIndent.filter(
      (indent: any) => indent.itemName === item.itemName,
    );
    if (temp.length > 0) return true;
    else return false;
  }
  submitIndentList() {
    this.dialogRef.close(this.selectedItemList);
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
