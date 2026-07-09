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
import { Z_MODAL_DATA, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { TableDataSource } from 'src/app/app-modules/core/utils/table-data-source';
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
  selector: 'app-item-dispense',
  templateUrl: './item-dispense.component.html',
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
export class ItemDispenseComponent implements OnInit, DoCheck {
  searchTerms!: string;
  items$!: Observable<any>;
  selectedItem = null;

  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  dataSource = new TableDataSource<any>();
  noRecordsFlag = false;
  paginator: unknown = null;

  constructor(
    @Inject(Z_MODAL_DATA) public input: any,
    private itemSearchService: ItemSearchService,
    public http_service: LanguageService,
    public dialogRef: ZardDialogRef<ItemDispenseComponent>,
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
