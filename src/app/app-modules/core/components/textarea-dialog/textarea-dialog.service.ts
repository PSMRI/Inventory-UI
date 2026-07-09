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
import { Injectable } from '@angular/core';
import { TextareaDialogComponent } from './textarea-dialog.component';
import { ZardDialogService } from 'Common-UI/v2/ui/dialog';
import { Observable } from 'rxjs';
@Injectable()
export class TextareaDialog {
  constructor(public dialog: ZardDialogService) {}

  open(observations: string, length = 500): Observable<any> {
    const dialogRef = this.dialog.create<TextareaDialogComponent, unknown>({
      zContent: TextareaDialogComponent,
      zData: { observations: observations, length: length },
      zWidth: '500px',
      zHideFooter: true,
      zClosable: false,
    });
    return dialogRef.afterClosed();
  }
}
