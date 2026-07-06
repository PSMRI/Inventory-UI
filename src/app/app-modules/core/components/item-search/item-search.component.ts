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
import { Z_MODAL_DATA, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { StringValidatorDirective } from '../../directives/stringValidator.directive';
import { NgIf, NgFor } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { ZardButtonComponent } from 'Common-UI/v2/ui/button';
import { ZardInputDirective } from 'Common-UI/v2/ui/input';
import { ZardFormImports } from 'Common-UI/v2/ui/form';
import { ZardTableImports } from 'Common-UI/v2/ui/table';
import { ZardPaginatorComponent } from 'Common-UI/v2/ui/paginator';
import { tooltipImports } from 'Common-UI/v2/ui/tooltip';

@Component({
  selector: 'app-item-search',
  templateUrl: './item-search.component.html',
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
    ...ZardTableImports,
    ZardPaginatorComponent,
    ...tooltipImports,
  ],
})
export class ItemSearchComponent implements OnInit, DoCheck {
  searchTerms!: string;
  items$!: Observable<any>;
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  noRecordsFlag = false;
  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'itemCode',
    'itemName',
    'itemCategory',
    'itemForm',
    'pharmacologicalCategory',
    'strength',
    'action',
  ];

  constructor(
    @Inject(Z_MODAL_DATA) public input: any,
    public http_service: LanguageService,
    public dialogRef: ZardDialogRef<ItemSearchComponent>,
    private itemSearchService: ItemSearchService,
  ) {}

  ngOnInit() {
    this.search(this.input.searchTerm);
    this.fetchLanguageResponse();
  }

  search(term: string): void {
    this.items$ = this.itemSearchService.searchDrugItem(term);
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
