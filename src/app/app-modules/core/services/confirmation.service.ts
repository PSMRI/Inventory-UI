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

import { CommonDialogComponent } from '../components/common-dialog/common-dialog.component';
import { Injectable, Inject, DOCUMENT } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Observable } from 'rxjs';

@Injectable()
export class ConfirmationService {
  constructor(
    private dialog: MatDialog,
    @Inject(DOCUMENT) doc: any,
  ) {}

  public confirm(
    title: string,
    message: string,
    btnOkText = 'OK',
    btnCancelText = 'Cancel',
  ): Observable<boolean> {
    const config = new MatDialogConfig();
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      {
        width: '420px',
        disableClose: false,
      },
    );
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;
    dialogRef.componentInstance.confirmAlert = true;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = false;

    return dialogRef.afterClosed();
  }

  public alert(
    message: string,
    status = 'info',
    btnOkText = 'OK',
  ): MatDialogRef<CommonDialogComponent> {
    const config = {
      width: '420px',
    };
    const dialogRef = this.dialog.open(CommonDialogComponent, config);
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.status = status.toLowerCase();
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = true;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = false;
    return dialogRef;
  }

  public remarks(
    message: string,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'Submit',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const config = {
      width: '420px',
    };
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      config,
    );
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = true;
    dialogRef.componentInstance.editRemarks = false;
    dialogRef.componentInstance.btnCancelText = btnCancelText;

    return dialogRef.afterClosed();
  }

  public editRemarks(
    message: string,
    comments: string,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'Submit',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      { width: '60%' },
    );
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = true;
    dialogRef.componentInstance.comments = comments;
    dialogRef.componentInstance.btnCancelText = btnCancelText;

    return dialogRef.afterClosed();
  }

  public notify(
    message: string,
    mandatories: any,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'OK',
  ): Observable<any> {
    const config = {
      width: '420px',
    };
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      config,
    );
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = false;
    dialogRef.componentInstance.notify = true;
    dialogRef.componentInstance.mandatories = mandatories;
    return dialogRef.afterClosed();
  }

  public choice(
    message: string,
    values: any,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'Confirm',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const config = {
      width: '420px',
    };
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      config,
    );
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = false;
    dialogRef.componentInstance.notify = false;
    dialogRef.componentInstance.choice = true;
    dialogRef.componentInstance.values = values;
    return dialogRef.afterClosed();
  }

  public startTimer(
    title: string,
    message: string,
    timer: number,
    btnOkText = 'Continue',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const config = new MatDialogConfig();
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      {
        width: '420px',
        disableClose: true,
      },
    );
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;
    dialogRef.componentInstance.confirmAlert = false;
    dialogRef.componentInstance.alert = false;
    dialogRef.componentInstance.remarks = false;
    dialogRef.componentInstance.editRemarks = false;
    dialogRef.componentInstance.sessionTimeout = true;
    dialogRef.componentInstance.updateTimer(timer);
    return dialogRef.afterClosed();
  }

  public provideDraftDescription(
    message: string,
    comments: string,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'Confirm',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const dialogRef: MatDialogRef<CommonDialogComponent> = this.dialog.open(
      CommonDialogComponent,
      { width: '60%' },
    );
    dialogRef.componentInstance.message = message;
    dialogRef.componentInstance.comments = comments;
    dialogRef.componentInstance.btnOkText = btnOkText;
    dialogRef.componentInstance.btnCancelText = btnCancelText;
    dialogRef.componentInstance.provideDraftDesc = true;
    return dialogRef.afterClosed();
  }
}
