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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'src/app/app-modules/core/services';
import { InventoryService } from '../../shared/service/inventory.service';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';
@Component({
  selector: 'app-indent-order-worklist',
  templateUrl: './indent-order-worklist.component.html',
  styleUrls: ['./indent-order-worklist.component.css'],
})
export class IndentOrderWorklistComponent implements OnInit {
  isMainStore = false;
  mainFacilityID: any;

  constructor(
    private router: Router,
    private inventoryService: InventoryService,
    private confirmationService: ConfirmationService,
    private sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.showOrderWorklistBasedOnID();
  }

  showOrderWorklistBasedOnID() {
    this.isMainStore = JSON.parse(
      this.sessionstorage.getItem('facilityDetail') || '{}',
    ).isMainFacility;
    this.mainFacilityID = JSON.parse(
      this.sessionstorage.getItem('facilityDetail') || '{}',
    ).mainFacilityID;
    if (
      !this.isMainStore &&
      (this.mainFacilityID !== null || this.mainFacilityID !== undefined)
    ) {
      this.router.navigate(['inventory/subStoreIndentOrderWorklist']);
    } else if (
      this.isMainStore ||
      this.mainFacilityID !== null ||
      this.mainFacilityID !== undefined
    ) {
      this.router.navigate(['/inventory/mainStoreIndentOrderWorklist']);
    }
  }
}
