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
  DoCheck,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { InventoryService } from './../../../inventory/shared/service/inventory.service';
import { SetLanguageComponent } from 'src/app/app-modules/core/components/set-language.component';
import { LanguageService } from 'src/app/app-modules/core/services/language.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-benificiary-details',
  templateUrl: './benificiary-details.component.html',
  styleUrls: ['./benificiary-details.component.css'],

  standalone: false,
})
export class BenificiaryDetailsComponent
  implements OnInit, DoCheck, AfterViewInit
{
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  beneficiaryDetailsList = new MatTableDataSource<any>();
  // beneficiaryDetailsList: any = [];
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;
  displayedColumns: string[] = [
    'beneficiaryID',
    'beneficiaryName',
    'age',
    'gender',
  ];

  constructor(
    private inventoryService: InventoryService,
    private http_service: LanguageService,
    public dialogRef: MatDialogRef<BenificiaryDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit() {
    console.log('Data', this.data);
    this.beneficiaryDetailsList.data = this.data.beneficiaryDetailsList;
    this.beneficiaryDetailsList.paginator = this.paginator;
    this.fetchLanguageResponse();
    console.log('this.ben', this.beneficiaryDetailsList.data);
  }

  loadbeneficiaryDetails(beneficiary: any) {
    this.dialogRef.close(beneficiary);
  }
  ngAfterViewInit() {
    this.beneficiaryDetailsList.data = this.data.beneficiaryDetailsList;
    this.beneficiaryDetailsList.paginator = this.paginator;
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
