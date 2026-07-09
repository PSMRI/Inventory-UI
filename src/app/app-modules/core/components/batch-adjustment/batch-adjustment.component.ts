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
import { BatchSearchService } from '../../services/batch-search.service';
import { ConfirmationService } from '../../services/confirmation.service';

import { Observable } from 'rxjs';
import { SetLanguageComponent } from '../set-language.component';
import { LanguageService } from '../../services/language.service';
import { Z_MODAL_DATA, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { TableDataSource } from 'src/app/app-modules/core/utils/table-data-source';
import { FormsModule } from '@angular/forms';
import { StringValidatorDirective } from '../../directives/stringValidator.directive';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from 'Common-UI/v2/ui/button';
import { ZardInputDirective } from 'Common-UI/v2/ui/input';
import { ZardFormImports } from 'Common-UI/v2/ui/form';
import { ZardCheckboxComponent } from 'Common-UI/v2/ui/checkbox';
import { ZardTableImports } from 'Common-UI/v2/ui/table';
import { ZardPaginatorComponent } from 'Common-UI/v2/ui/paginator';
import { tooltipImports } from 'Common-UI/v2/ui/tooltip';

@Component({
  selector: 'app-batch-adjustment',
  templateUrl: './batch-adjustment.component.html',
  viewProviders: [provideIcons({ lucideX })],
  imports: [
    FormsModule,
    StringValidatorDirective,
    NgIf,
    NgFor,
    NgIcon,
    ZardButtonComponent,
    ZardInputDirective,
    ...ZardFormImports,
    ZardCheckboxComponent,
    ...ZardTableImports,
    ZardPaginatorComponent,
    ...tooltipImports,
    DatePipe,
  ],
})
export class BatchAdjustmentComponent implements OnInit, DoCheck {
  searchTerms!: string;
  noRecordsFlag = false;
  items$!: Observable<any>;
  selectedBatchList: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource = new TableDataSource<any>();
  paginator: unknown = null;
  data: any;

  constructor(
    @Inject(Z_MODAL_DATA) public input: any,
    private confirmationService: ConfirmationService,
    public dialogRef: ZardDialogRef<BatchAdjustmentComponent>,
    public http_service: LanguageService,
    private batchSearchService: BatchSearchService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    this.fetchLanguageResponse();
    this.dataSource.data = this.data.data;
    this.dataSource.paginator = this.paginator;
  }

  search(term: string): void {
    this.items$ = this.batchSearchService.searchAdjustmentBatch(term);
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

  selectBatch(event: any, batch: any) {
    if (event.checked) {
      batch.selected = true;
      this.selectedBatchList.push(batch);
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
