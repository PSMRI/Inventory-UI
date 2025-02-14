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
  RouteReuseStrategy,
  DefaultUrlSerializer,
  ActivatedRouteSnapshot,
  DetachedRouteHandle,
} from '@angular/router';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  handlers: { [key: string]: DetachedRouteHandle } = {};

  routesToBeReuse: any = [];
  // "medicineDispense/View", "storeSelfConsumption/View", "physicalStockEntry/View", "storeStockTransfer/View", "storeStockAdjustment/view", "storeStockAdjustmentDraft/view"
  constructor(readonly sessionstorage: SessionStorageService) {}

  calcKey(route: ActivatedRouteSnapshot) {
    let next: any = route;
    let url = '';
    while (next) {
      if (next.url) {
        url = next.url.join('/');
      }
      next = next.firstChild;
    }
    return url;
  }

  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (!route.routeConfig || route.routeConfig.loadChildren) {
      return false;
    }

    if (this.routesToBeReuse.includes(this.calcKey(route))) {
      return true;
    }

    return false;
  }

  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
    this.handlers[this.calcKey(route)] = handle;
  }

  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    if (!sessionStorage.getItem('key')) {
      this.handlers = {};
      return false;
    }
    const url = this.calcKey(route);
    return (
      !!route.routeConfig &&
      !route.routeConfig.loadChildren &&
      !!this.handlers[this.calcKey(route)]
    );
  }

  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    if (!route.routeConfig) return null;
    if (route.routeConfig.loadChildren) return null;
    return this.handlers[this.calcKey(route)];
  }

  shouldReuseRoute(
    future: ActivatedRouteSnapshot,
    curr: ActivatedRouteSnapshot,
  ): boolean {
    return this.calcKey(curr) === this.calcKey(future);
  }
}
