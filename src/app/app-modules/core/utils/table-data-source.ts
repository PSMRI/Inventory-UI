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

/**
 * Drop-in replacement for Angular Material's TableDataSource covering the
 * surface this app uses (`data`, `filter`, `filteredData`, `filterPredicate`,
 * `paginator`). Templates iterate `.data` (via z-paginator's zData), so —
 * unlike TableDataSource, whose filtering only affected the mat-table
 * render pipe — `data` returns the filtered view while a filter is active,
 * preserving the user-visible behaviour of the original screens.
 */
export class TableDataSource<T = any> {
  private rawData: T[] = [];
  private currentFilter = '';
  filteredData: T[] = [];

  /** Same default predicate shape as TableDataSource. */
  filterPredicate: (row: T, filter: string) => boolean = (row, filter) =>
    JSON.stringify(row).toLowerCase().includes(filter.trim().toLowerCase());

  /** Kept so legacy `dataSource.paginator = ...` assignments stay harmless. */
  paginator: unknown = null;
  sort: unknown = null;

  constructor(initialData?: T[]) {
    if (initialData) {
      this.data = initialData;
    }
  }

  get data(): T[] {
    return this.currentFilter ? this.filteredData : this.rawData;
  }

  set data(value: T[]) {
    this.rawData = value ?? [];
    this.applyFilter();
  }

  get filter(): string {
    return this.currentFilter;
  }

  set filter(value: string) {
    this.currentFilter = value ?? '';
    this.applyFilter();
  }

  private applyFilter(): void {
    this.filteredData = this.currentFilter
      ? this.rawData.filter((row) =>
          this.filterPredicate(row, this.currentFilter),
        )
      : [...this.rawData];
  }
}
