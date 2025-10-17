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
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './services/auth-guard.service';
import { BatchSearchService } from './services/batch-search.service';
import { BeneficiaryDetailsService } from './services/beneficiary-details.service';
import { CommonService } from './services/common-services.service';
import { ConfirmationService } from './services/confirmation.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { ItemSearchService } from './services/item-search.service';
import { BatchViewService } from './services/rx-batchview.service';
import { SpinnerService } from './services/spinner.service';
import { SetLanguageComponent } from './components/set-language.component';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MaterialModule } from './material.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchComponent } from './components/search/search.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { ItemSearchDirective } from './directives/item-search.directive';
import { ItemSearchComponent } from './components/item-search/item-search.component';
import { DisableFormControlDirective } from './directives/disableFormControl.directive';
import { HttpInterceptorService } from './services/http-interceptor.service';
import { AppFooterComponent } from './components/app-footer/app-footer.component';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { myEmailDirective } from './directives/email/myEmail.directive';
import { myMobileNumberDirective } from './directives/MobileNumber/myMobileNumber.directive';
import { myNameDirective } from './directives/name/myName.directive';
import { myPasswordDirective } from './directives/password/myPassword.directive';
import { ISTDatePipe } from './pipes/ist-date.pipe';
import { BatchAdjustmentComponent } from './components/batch-adjustment/batch-adjustment.component';
import { BatchSearchDirective } from './directives/batch-search.directive';
import { BatchSearchComponent } from './components/batch-search/batch-search.component';
import { BeneficiaryDetailsComponent } from './components/beneficiary-details/beneficiary-details.component';
import { IndentItemListComponent } from './components/indent-item-list/indent-item-list.component';
import { ItemDispenseComponent } from './components/item-dispense/item-dispense.component';
import { RxBatchViewComponent } from './components/rx-batch-view/rx-batch-view.component';
import { ShowCommitAndVersionDetailsComponent } from './components/show-commit-and-version-details/show-commit-and-version-details.component';
import { TextareaDialogComponent } from './components/textarea-dialog/textarea-dialog.component';
import { TransferSearchComponent } from './components/transfer-search/transfer-search.component';
import { BatchAdjustmentDirective } from './directives/batch-adjustment.directive';
import { StringValidatorDirective } from './directives/stringValidator.directive';
import { NullDefaultValueDirective } from './directives/null-default-value.directive';
import { ItemDispenseDirective } from './directives/item-dispense.directive';
import { ItemTransferDirective } from './directives/item-transfer.directive';
import { IndentDispenseDirective } from './directives/indent-dispense.directive';
import { IndentRequestDirective } from './directives/indent-request.directive';
import { MinNumberValidatorDirective } from './directives/minNumberValidator.directive';
import { NumberValidatorDirective } from './directives/numberValidator.directive';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatGridListModule } from '@angular/material/grid-list';
import { TextareaDialog } from './components/textarea-dialog/textarea-dialog.service';
import { CaptchaComponent } from './components/captcha/captcha.component';
import { CaptchaService } from './services/captcha.service';
@NgModule({
  imports: [
    HttpClientModule,
    CommonModule,
    MaterialModule,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatListModule,
    MatSelectModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatGridListModule,
  ],
  declarations: [
    CommonDialogComponent,
    TextareaDialogComponent,
    SpinnerComponent,
    AppFooterComponent,
    AppHeaderComponent,
    myEmailDirective,
    myMobileNumberDirective,
    SetLanguageComponent,
    myNameDirective,
    myPasswordDirective,
    StringValidatorDirective,
    NullDefaultValueDirective,
    NumberValidatorDirective,
    DisableFormControlDirective,
    ItemSearchComponent,
    ItemSearchDirective,
    MinNumberValidatorDirective,
    TransferSearchComponent,
    ItemTransferDirective,
    BatchSearchComponent,
    BatchSearchDirective,
    ItemDispenseDirective,
    ItemDispenseComponent,
    SearchComponent,
    ISTDatePipe,
    BatchAdjustmentDirective,
    BatchAdjustmentComponent,
    BeneficiaryDetailsComponent,
    RxBatchViewComponent,
    IndentRequestDirective,
    IndentItemListComponent,
    IndentDispenseDirective,
    ShowCommitAndVersionDetailsComponent,
    CaptchaComponent,
  ],
  exports: [
    MaterialModule,
    CommonDialogComponent,
    TextareaDialogComponent,
    SpinnerComponent,
    AppFooterComponent,
    AppHeaderComponent,
    myEmailDirective,
    SetLanguageComponent,
    myMobileNumberDirective,
    myNameDirective,
    myPasswordDirective,
    StringValidatorDirective,
    NumberValidatorDirective,
    MinNumberValidatorDirective,
    NullDefaultValueDirective,
    ItemSearchComponent,
    ItemSearchDirective,
    TransferSearchComponent,
    ItemTransferDirective,
    ItemDispenseDirective,
    BatchSearchComponent,
    BatchSearchDirective,
    ISTDatePipe,
    BatchAdjustmentComponent,
    BatchAdjustmentDirective,
    BeneficiaryDetailsComponent,
    IndentRequestDirective,
    IndentItemListComponent,
    IndentDispenseDirective,
    ShowCommitAndVersionDetailsComponent,
    CaptchaComponent,
  ],
})
export class CoreModule {
  static forRoot(): ModuleWithProviders<CoreModule> {
    return {
      ngModule: CoreModule,
      providers: [
        ConfirmationService,
        HttpInterceptorService,
        BatchViewService,
        TextareaDialog,
        AuthGuard,
        SpinnerService,
        CommonService,
        ItemSearchService,
        BatchSearchService,
        BeneficiaryDetailsService,
        CaptchaService,
      ],
    };
  }
}
