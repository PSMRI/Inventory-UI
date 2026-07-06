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
import { Component, OnInit, Inject, DoCheck } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { SetLanguageComponent } from '../set-language.component';
import { Z_MODAL_DATA, ZardDialogRef } from 'Common-UI/v2/ui/dialog';
import { FormsModule } from '@angular/forms';
import { ZardInputDirective } from 'Common-UI/v2/ui/input';

@Component({
  selector: 'app-textarea-dialog',
  templateUrl: './textarea-dialog.component.html',
  imports: [FormsModule, ZardInputDirective],
})
export class TextareaDialogComponent implements OnInit, DoCheck {
  languageComponent!: SetLanguageComponent;
  currentLanguageSet: any;

  constructor(
    public dialogRef: ZardDialogRef<TextareaDialogComponent>,
    public http_service: LanguageService,
    @Inject(Z_MODAL_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.fetchLanguageResponse();
  }

  // AV40085804 29/09/2021 Integrating Multilingual Functionality -----Start-----
  ngDoCheck() {
    this.fetchLanguageResponse();
  }

  fetchLanguageResponse() {
    this.languageComponent = new SetLanguageComponent(this.http_service);
    this.languageComponent.setLanguage();
    this.currentLanguageSet = this.languageComponent.currentLanguageObject;
  }
  // -----End------
}
