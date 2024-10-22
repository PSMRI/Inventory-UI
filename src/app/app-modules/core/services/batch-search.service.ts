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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable()
export class BatchSearchService {
  constructor(private http: HttpClient) {}

  searchItemBatch(searchTerms: string) {
    const body = {
      itemName: searchTerms,
      facilityID: sessionStorage.getItem('facilityID'),
    };

    return this.http.post<any>(environment.searchBatchUrl, body);
  }

  searchAdjustmentBatch(searchTerms: string) {
    const body = {
      itemName: searchTerms,
      facilityID: sessionStorage.getItem('facilityID'),
    };

    return this.http.post<any>(environment.searchBatchUrl, body);
  }
  searchItem(searchTerm: string) {
    const reqObj = {
      itemName: searchTerm,
      facilityID: sessionStorage.getItem('facilityID'),
    };
    return this.http.post<any>(environment.searchItemListUrl, reqObj);
  }
}
