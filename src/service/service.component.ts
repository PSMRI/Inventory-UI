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
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css'],
})
export class ServiceComponent implements OnInit {
  servicesList: any = [];
  selectedService: any = '';

  constructor(
    private router: Router,
    private sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    const servicesListStore = this.sessionstorage.getItem('services');
    if (servicesListStore !== null) {
      this.servicesList = JSON.parse(servicesListStore);
    }
  }
  handleKeyselectService(event: KeyboardEvent, service: any): void {
    if (
      event.key === 'Enter' ||
      event.key === 'Spacebar' ||
      event.key === ' '
    ) {
      this.selectService(service);
    }
  }

  /** This section id for select the service */
  selectService(service: any): void {
    this.sessionstorage.setItem('providerServiceID', service.providerServiceID);
    this.sessionstorage.setItem('apimanClientKey', service.apimanClientKey);
    this.router.navigate(['/facility']);
    this.selectedService = '';
  }
}
