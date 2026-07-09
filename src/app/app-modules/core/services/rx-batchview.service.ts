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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Injectable, ViewContainerRef, Inject, DOCUMENT } from '@angular/core';

import { Observable } from 'rxjs';
import { RxBatchViewComponent } from '../components/rx-batch-view/rx-batch-view.component';

@Injectable()
export class BatchViewService {
  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) doc: any,
  ) {}

  public batches(prescribed: any, items: any, selection: any): Observable<any> {
    const dialogRef: MatDialogRef<RxBatchViewComponent> = this.dialog.open(
      RxBatchViewComponent,
      {
        width: '80%',
        disableClose: false,
      },
    );
    dialogRef.componentInstance.prescribed = prescribed;
    dialogRef.componentInstance.items = items;
    dialogRef.componentInstance.editSelection = selection;

    return dialogRef.afterClosed();
  }
}
