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
import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfirmationService } from '../../services/confirmation.service';
import { LanguageService } from '../../services/language.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { ShowCommitAndVersionDetailsComponent } from '../show-commit-and-version-details/show-commit-and-version-details.component';
@Component({
  selector: 'app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
})
export class AppHeaderComponent implements OnInit, OnChanges {
  @Input()
  showRoles = false;
  storeName: any;
  facility: any;
  userName!: string;
  designation!: string;
  providerServiceID!: string;
  isAuthenticated!: boolean;
  isExternal!: boolean;
  filteredNavigation: any;
  roles: any;
  parent_app: any;
  parent_url = this.sessionstorage.getItem('return');
  reportsList: any = [];
  languageArray: any[] = [];
  language_file_path: any = './assets/';
  language: any = 'English';
  currentLanguageSet: any;
  navigation: any;

  constructor(
    private router: Router,
    private auth: AuthService,
    private dialog: MatDialog,
    private http_service: LanguageService,
    readonly sessionstorage: SessionStorageService,
    private confirmationService: ConfirmationService,
    private cookieService: CookieService,
  ) {}
  license: any;
  ngOnInit() {
    this.getUIVersionAndCommitDetails();
    // const userName = this.sessionstorage.getItem('userName');
    const userName = this.sessionstorage.userName;
    if (userName !== null) {
      this.userName = userName;
    }
    const designation = this.sessionstorage.getItem('designation');
    if (designation !== null) {
      this.designation = designation;
    }
    this.isExternal = this.sessionstorage.getItem('isExternal') === 'true';
    this.parent_app = this.sessionstorage.getItem('host');
    const providerServiceID = this.sessionstorage.getItem('providerServiceID');
    if (providerServiceID !== null) {
      this.providerServiceID = providerServiceID;
    }
    this.isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';
    this.license = environment.licenseUrl;
    this.reportsList = [
      'Inward stock Report',
      'Consumption Report',
      'Expiry Report',
      'Beneficiary drug issue Report',
    ];
    if (this.isAuthenticated) {
      this.fetchLanguageSet();
      this.refreshLogin();
    }
  }
  fetchLanguageSet() {
    this.http_service.fetchLanguageSet().subscribe((languageRes: any) => {
      if (languageRes && Array.isArray(languageRes.data)) {
        this.languageArray = languageRes.data;
        this.getLanguage();
      }
    });
  }

  refreshLogin() {
    this.auth.getUserDetails().subscribe((res: any) => {
      if (res.statusCode === '200') {
        if (res.data.previlegeObj && res.data.previlegeObj[0]) {
          this.cookieService.set('Jwttoken', res.data.Jwttoken);
          delete res.data.Jwttoken;
          this.sessionstorage.setItem(
            'loginDataResponse',
            JSON.stringify(res.data),
          );
          if (res.key) {
            sessionStorage.setItem('key', res.key);
          }
          // this.sessionstorage.setItem('designation', this.designation);
          this.sessionstorage.userID = res.userID;
          this.sessionstorage.userName = res.userName;
          this.sessionstorage.username = res.userName;
        } else {
          this.confirmationService.alert(
            'Seems you are logged in from somewhere else, Logout from there & try back in.',
            'error',
          );
        }
      }
    });
  }

  getLanguage() {
    if (sessionStorage.getItem('currentLanguage') !== null) {
      this.changeLanguage(sessionStorage.getItem('currentLanguage'));
    } else {
      this.changeLanguage(this.language);
    }
  }
  changeLanguage(language: any) {
    this.http_service
      .getLanguage(this.language_file_path + language + '.json')
      .subscribe(
        (response) => {
          if (response !== undefined && response !== null) {
            this.languageSuccessHandler(response, language);
          } else {
            alert(this.currentLanguageSet.alerts.langNotDefinesd);
          }
        },
        (error) => {
          alert(
            this.currentLanguageSet.alerts.comingUpWithThisLang +
              ' ' +
              language,
          );
        },
      );
  }
  languageSuccessHandler(response: any, language: any) {
    console.log('language is ', response);
    if (response === undefined) {
      alert(this.currentLanguageSet.alerts.langNotDefinesd);
    }
    if (response[language] !== undefined) {
      this.currentLanguageSet = response[language];
      sessionStorage.setItem('currentLanguage', language);
      if (this.currentLanguageSet) {
        this.languageArray.forEach((item: any) => {
          if (item.languageName === language) {
            this.language = language;
          }
        });
      } else {
        this.language = language;
      }
      this.http_service.getCurrentLanguage(response[language]);
      this.roleNavigation();
    } else {
      alert(
        this.currentLanguageSet.alerts.info.comingUpWithThisLang +
          ' ' +
          language,
      );
    }
  }

  ngOnChanges() {
    const facility = this.sessionstorage.getItem('facilityDetail');
    if (facility) {
      this.facility = JSON.parse(facility);
    }
    if (this.facility) {
      this.storeName = this.facility.facilityName;
    }
  }

  roleNavigation() {
    this.navigation = [
      {
        role: this.currentLanguageSet.itemDispense.pharmacist,
        work: [
          {
            link: '/inventory/medicineDispense',
            label: this.currentLanguageSet.inventory.patientIssueWithoutRx,
          },
          {
            link: '/inventory/physicalStockEntry',
            label: this.currentLanguageSet.inventory.physicalStockEntry,
          },
          {
            link: '/inventory/storeStockAdjustment',
            label: this.currentLanguageSet.inventory.stockAdjustment,
          },
          {
            link: '/inventory/storeSelfConsumption',
            label: this.currentLanguageSet.inventory.storeConsumption,
          },
          {
            link: '/inventory/storeStockTransfer',
            label: this.currentLanguageSet.inventory.stockTransfer,
          },
          {
            link: '/inventory/patientReturn',
            label: this.currentLanguageSet.inventory.patientReturns,
          },
          {
            link: '/inventory/indentOrderWorklist',
            label: this.currentLanguageSet.inventory.indent,
          },
        ],
      },
      {
        role: this.currentLanguageSet.inventory.reports,
        work: [
          {
            link: '/inventory/inwardStockReport',
            label: this.currentLanguageSet.inventory.inwardStockReport,
          },
          {
            link: '/inventory/consumptionReport',
            label: this.currentLanguageSet.inventory.consumptionReport,
          },
          {
            link: '/inventory/expiryReport',
            label: this.currentLanguageSet.inventory.expiryReport,
          },
          {
            link: '/inventory/beneficiaryDrugIssueReport',
            label: this.currentLanguageSet.inventory.beneficiaryDrugIssueReport,
          },
          {
            link: '/inventory/dailyStockReportDetails',
            label: this.currentLanguageSet.inventory.dailyStockReportDetails,
          },
          {
            link: '/inventory/dailyStockReportSummary',
            label: this.currentLanguageSet.inventory.dailyStockReportSummary,
          },
          {
            link: '/inventory/monthlyReport',
            label: this.currentLanguageSet.inventory.monthlyReport,
          },
          {
            link: '/inventory/yearlyReport',
            label: this.currentLanguageSet.inventory.yearlyReport,
          },
          {
            link: '/inventory/shortExpiryReport',
            label: this.currentLanguageSet.inventory.shortExpiryReport,
          },
          {
            link: '/inventory/transitReport',
            label: this.currentLanguageSet.inventory.transitReport,
          },
        ],
      },
    ];
  }
  handleKeyLogout(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' ||
      event.key === 'Spacebar' ||
      event.key === ' '
    ) {
      this.logout();
    }
  }

  logout() {
    this.auth.logoutUser().subscribe((res: any) => {
      if (res && res.statusCode === 200) {
        this.router.navigate(['/login']);
        this.changeLanguage('English');
        localStorage.clear();
        sessionStorage.clear();
      }
    });
  }
  commitDetailsUI: any;
  versionUI: any;
  getUIVersionAndCommitDetails() {
    const commitDetailsPath: any = 'assets/git-version.json';
    this.auth.getUIVersionAndCommitDetails(commitDetailsPath).subscribe(
      (res) => {
        console.log('res', res);
        this.commitDetailsUI = res;
        this.versionUI = this.commitDetailsUI['version'];
      },
      (err) => {
        console.log('err', err);
      },
    );
  }
  showVersionAndCommitDetails() {
    this.auth.getAPIVersionAndCommitDetails().subscribe(
      (res: any) => {
        if (res.statusCode === 200) {
          this.constructAPIAndUIDetails(res.data);
        }
      },
      (err) => {},
    );
  }
  constructAPIAndUIDetails(apiVersionAndCommitDetails: any) {
    const data = {
      commitDetailsUI: {
        version: this.commitDetailsUI['version'],
        commit: this.commitDetailsUI['commit'],
      },
      commitDetailsAPI: {
        version: apiVersionAndCommitDetails['git.build.version'] || 'NA',
        commit: apiVersionAndCommitDetails['git.commit.id'] || 'NA',
      },
    };
    if (data) {
      this.showData(data);
    }
  }
  showData(versionData: any) {
    const dialogRef = this.dialog.open(ShowCommitAndVersionDetailsComponent, {
      data: versionData,
    });
  }

  backToParent() {
    sessionStorage.removeItem('parentBen');
    sessionStorage.removeItem('parentBenVisit');
    sessionStorage.removeItem('isExternal');
    sessionStorage.removeItem('host');
    sessionStorage.removeItem('fallback');
    sessionStorage.removeItem('return');
    sessionStorage.removeItem('facilityDetail');
    let language: any;
    if (sessionStorage.getItem('currentLanguage') === 'undefined') {
      language = 'English';
    } else {
      language = sessionStorage.getItem('currentLanguage');
    }
    window.location.href = `${this.parent_url}?currentLanguage=${language}`;
    sessionStorage.removeItem('currentLanguage');
  }
}
