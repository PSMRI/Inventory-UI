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
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Injectable()
export class BeneficiaryDetailsService {
  beneficiaryDetails = new BehaviorSubject<any>(null);
  beneficiaryDetails$ = this.beneficiaryDetails.asObservable();

  constructor(
    private http: HttpClient,
    readonly sessionstorage: SessionStorageService,
  ) {}

  getBeneficiaryDetails(beneficiaryRegID: string, benFlowID: string) {
    const url =
      this.sessionstorage.getItem('parentAPI') +
      environment.getBeneficiaryDetail;
    console.log('url', url);
    this.http
      .post(url, { beneficiaryRegID: beneficiaryRegID, benFlowID: benFlowID })
      .subscribe({
        next: (res: any) => {
          console.log('HLNNDba', res.data);
          if (res.data) {
            console.log('HLNN1', res.data);
            this.beneficiaryDetails.next(res.data);
          }
        },
        error: (err) => {
          this.beneficiaryDetails.next(null);
        },
      });
  }

  getBeneficiaryImage(beneficiaryRegID: string) {
    const url =
      this.sessionstorage.getItem('parentAPI') +
      environment.getBeneficiaryImage;
    return this.http.post<any>(url, { beneficiaryRegID: beneficiaryRegID });
  }

  reset() {
    this.beneficiaryDetails.next(null);
  }
}
