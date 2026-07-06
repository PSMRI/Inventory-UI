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
import { ZardDialogService, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { Observable } from 'rxjs';

@Injectable()
export class ConfirmationService {
  constructor(
    private dialog: ZardDialogService,
    @Inject(DOCUMENT) doc: any,
  ) {}

  private createDialog(
    zWidth: string,
    zMaskClosable: boolean,
  ): ZardDialogRef<CommonDialogComponent> {
    const dialogRef = this.dialog.create<CommonDialogComponent, unknown>({
      zContent: CommonDialogComponent,
      zWidth,
      zMaskClosable,
      zHideFooter: true,
      zClosable: false,
    });
    const instance = dialogRef.componentInstance!;
    instance.confirmAlert = false;
    instance.alert = false;
    instance.remarks = false;
    instance.editRemarks = false;
    return dialogRef;
  }

  public confirm(
    title: string,
    message: string,
    btnOkText = 'OK',
    btnCancelText = 'Cancel',
  ): Observable<boolean> {
    const dialogRef = this.createDialog('420px', true);
    const instance = dialogRef.componentInstance!;
    instance.title = title;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.btnCancelText = btnCancelText;
    instance.confirmAlert = true;

    return dialogRef.afterClosed();
  }

  public alert(
    message: string,
    status = 'info',
    btnOkText = 'OK',
  ): ZardDialogRef<CommonDialogComponent> {
    const dialogRef = this.createDialog('420px', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.status = status.toLowerCase();
    instance.btnOkText = btnOkText;
    instance.alert = true;
    return dialogRef;
  }

  public remarks(
    message: string,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'Submit',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const dialogRef = this.createDialog('420px', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.remarks = true;
    instance.btnCancelText = btnCancelText;

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
    const dialogRef = this.createDialog('60%', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.editRemarks = true;
    instance.comments = comments;
    instance.btnCancelText = btnCancelText;

    return dialogRef.afterClosed();
  }

  public notify(
    message: string,
    mandatories: any,
    titleAlign = 'center',
    messageAlign = 'center',
    btnOkText = 'OK',
  ): Observable<any> {
    const dialogRef = this.createDialog('420px', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.notify = true;
    instance.mandatories = mandatories;
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
    const dialogRef = this.createDialog('420px', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.btnCancelText = btnCancelText;
    instance.notify = false;
    instance.choice = true;
    instance.values = values;
    return dialogRef.afterClosed();
  }

  public startTimer(
    title: string,
    message: string,
    timer: number,
    btnOkText = 'Continue',
    btnCancelText = 'Cancel',
  ): Observable<any> {
    const dialogRef = this.createDialog('420px', false);
    const instance = dialogRef.componentInstance!;
    instance.title = title;
    instance.message = message;
    instance.btnOkText = btnOkText;
    instance.btnCancelText = btnCancelText;
    instance.sessionTimeout = true;
    instance.updateTimer(timer);
    dialogRef.disableClose = true;
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
    const dialogRef = this.createDialog('60%', true);
    const instance = dialogRef.componentInstance!;
    instance.message = message;
    instance.comments = comments;
    instance.btnOkText = btnOkText;
    instance.btnCancelText = btnCancelText;
    instance.provideDraftDesc = true;
    return dialogRef.afterClosed();
  }
}
