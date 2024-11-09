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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Injectable()
export class InventoryService {
  private dialogClosedSubject = new Subject<void>();
  constructor(
    private http: HttpClient,
    private sessionstorage: SessionStorageService,
  ) {}

  dialogClosed(): void {
    this.dialogClosedSubject.next();
  }
  getDialogClosedObservable(): Observable<void> {
    return this.dialogClosedSubject.asObservable();
  }

  getAvailableItemInStore() {
    const storeID = this.sessionstorage.getItem('facilityID');
    console.log('this.itemInStore', storeID);
    return this.http.post<any>(
      environment.getAvailableItemInStoreUrl + storeID,
      {},
    );
  }
  getBeneficaryVisitDetail(beneficiaryID: any) {
    return this.http.post<any>(
      environment.getBeneficaryVisitDetailsurl,
      beneficiaryID,
    );
  }

  saveStockExit(dispensingItem: any) {
    return this.http.post<any>(environment.saveStockExitUrl, dispensingItem);
  }

  allocateBatch(itemList: any) {
    return this.http.post<any>(
      environment.allocateBatchStockUrl +
        this.sessionstorage.getItem('facilityID'),
      itemList,
    );
  }

  getItemBatchList(itemDetail: any) {
    return this.http.post<any>(environment.getItemBatchListUrl, itemDetail);
  }

  getStoreItemsCall(facID: any) {
    return this.http.post<any>(environment.getStoreItems + facID, {});
  }

  getItemBatchForStoreIDCall(itemID: any, facID: any) {
    return this.http.post<any>(environment.getItemBatchForStoreID, {
      facilityID: facID,
      itemID: itemID,
    });
  }

  getItem(obj: any) {
    return this.http.post<any>(environment.getItem_Url, obj);
  }

  /**
   * Related To Store Consumption
   * */
  storeSelfConsumption(obj: any) {
    return this.http.post<any>(environment.storeSelfConsumption, obj);
  }
  viewSelfConsumption(obj: any) {
    return this.http.post<any>(environment.viewSelfConsumption, obj);
  }

  getParticularConsumption(consumptionID: any) {
    return this.http.post<any>(environment.getParticularConsumptionURL, {
      consumptionID: consumptionID,
    });
  }

  /**
   * Related To Store Consumption  -- ENDS
   * */

  /**
   * Related to Physical Stock Entry
   */
  savePhysicalStock(obj: any) {
    return this.http.post<any>(environment.savePhysicalStock_Url, obj);
  }

  viewPhysicalStockEntry(obj: any) {
    return this.http.post<any>(environment.viewPhysicalStockURL, obj);
  }

  getParticularStockEntry(entryID: any) {
    return this.http.post<any>(environment.getParticularStockURL, {
      phyEntryID: entryID,
    });
  }

  /**
   * Related to Physical Stock Entry -- ENDS
   */

  /**
   * Related to Medicine Dispense
   */
  viewMedicineDispenseEntry(obj: any) {
    return this.http.post<any>(environment.viewMedicineDispenceURL, obj);
  }

  getParticularMedicineDispenseEntry(patientIssueID: any) {
    return this.http.post<any>(environment.getParticularMedicineDispenseURL, {
      patientIssueID: patientIssueID,
    });
  }
  /**
   * Related to Medicine Dispense -- ENDS
   */

  /**
   * Related to Stock Transfer
   */

  saveStockTransfer(obj: any) {
    return this.http.post<any>(environment.saveStoreTransferUrl, obj);
  }

  viewStockTransferEntry(obj: any) {
    return this.http.post<any>(environment.viewStockTransferURL, obj);
  }

  getParticularStockTransferEntry(stockTransferID: any) {
    return this.http.post<any>(environment.getParticularStockTransferURL, {
      stockTransferID: stockTransferID,
    });
  }

  /**
   * Related to Stock Transfer -- ENDS
   */

  getAllStore(serviceProviderId: any) {
    return this.http.post<any>(
      environment.getFacilityUrl + serviceProviderId,
      {},
    );
  }

  saveStockAdjustmentDraft(stockAdjustment: any) {
    return this.http.post<any>(
      environment.saveStockAdjustmentDraftUrl,
      stockAdjustment,
    );
  }

  saveStockAdjustment(stockAdjustment: any) {
    return this.http.post<any>(
      environment.saveStockAdjustmentUrl,
      stockAdjustment,
    );
  }

  getStockAdjustmentDraftList(fetchDetails: any) {
    return this.http.post<any>(
      environment.getStockAjustmentDraftList,
      fetchDetails,
    );
  }

  getStockAdjustmentList(fetchDetails: any) {
    return this.http.post<any>(environment.getStockAjustmentList, fetchDetails);
  }

  getStockAdjustmentDraftDetails(stockAdjustmentDraftID: any) {
    return this.http.post<any>(environment.getStockAjustmentDraftDetails, {
      stockAdjustmentDraftID,
    });
  }

  getStockAdjustmentDetails(stockAdjustmentID: any) {
    return this.http.post<any>(environment.getStockAjustmentDetails, {
      stockAdjustmentID,
    });
  }

  /**
   * Related to Patient Return -- STARTS
   */

  getBeneficiaryByPhoneNumber(obj: any) {
    return this.http.post<any>(environment.getBeneficiaryByPhoneNumberUrl, obj);
  }

  getBeneficiaryByBeneficiaryID(obj: any) {
    return this.http.post<any>(
      environment.getBeneficiaryByBeneficiaryIDUrl,
      obj,
    );
  }

  getItemList(obj: any) {
    return this.http.post<any>(environment.getItemListUrl, obj);
  }

  getBatchDetails(obj: any) {
    return this.http.post<any>(environment.getBatchListUrl, obj);
  }

  updateQuantityReturned(obj: any) {
    return this.http.post<any>(environment.getUpdateQuantityReturnedUrl, obj);
  }

  getPatientReturnList(obj: any) {
    return this.http.post<any>(environment.getPatientReturnListUrl, obj);
  }
  /**
   *
   * Errrrorororororoor
   *
   */
  handleError(error: Response | any) {
    return throwError(error.json());
  }

  /*
   * Related to Indent Request
   */
  saveIndentRequest(tempObj: any) {
    return this.http.post<any>(environment.saveIndentRequestUrl, tempObj);
  }
  showMainstoreOrderWorklist(facilityID: any) {
    return this.http.post<any>(
      environment.showMainStoreIndentRequestUrl,
      facilityID,
    );
  }

  viewItemListForMainStore(itemList: any) {
    return this.http.post<any>(
      environment.viewItemListForMainStoreUrl,
      itemList,
    );
  }
  viewBatchlistForIndentItem(batchlistObj: any) {
    return this.http.post<any>(environment.getItemBatchListUrl, batchlistObj);
  }
  rejectIndentOrder(rejectIndent: any) {
    return this.http.post<any>(
      environment.getSaveDispenseListUrl,
      rejectIndent,
    );
  }
  /**
   * Related to indent dispense
   */
  saveDispenseList(itemListObj: any) {
    return this.http.post<any>(environment.getSaveDispenseListUrl, itemListObj);
  }
  /*
   * Related to sub store
   */
  showSubStoreOrderWorklist(facilityID: any) {
    return this.http.post<any>(
      environment.showSubStoreIndentRequestUrl,
      facilityID,
    );
  }
  cancelIndentRequest(cancelIndent: any) {
    return this.http.post<any>(
      environment.cancelIndentRequestUrl,
      cancelIndent,
    );
  }
  viewItemListForSubStore(itemList: any) {
    return this.http.post<any>(
      environment.viewItemListForSubStoreUrl,
      itemList,
    );
  }
  receiveIndentOrder(acceptOrderObj: any) {
    return this.http.post<any>(
      environment.receiveIndentOrderUrl,
      acceptOrderObj,
    );
  }
  updateIndentRequest(updateTempObj: any) {
    return this.http.post<any>(environment.updateIndentOrderUrl, updateTempObj);
  }

  /**
   * Reports
   */
  getInwardStockReports(inwardStockReportObj: any) {
    return this.http.post<any>(
      environment.inwardStockReportUrl,
      inwardStockReportObj,
    );
  }

  getConsumptionReports(consumptionReportObj: any) {
    return this.http.post<any>(
      environment.consumptionReportUrl,
      consumptionReportObj,
    );
  }

  getExpiryReports(expiryReportObj: any) {
    return this.http.post<any>(environment.expiryReportUrl, expiryReportObj);
  }

  getBeneficiaryDrugIssueReports(beneficiaryDrugIssueReportObj: any) {
    return this.http.post<any>(
      environment.beneficiaryDrugIssueReportUrl,
      beneficiaryDrugIssueReportObj,
    );
  }

  getDailyStockDetailsReports(dailyStockDetailsReportObj: any) {
    return this.http.post<any>(
      environment.dailyStockDetailsReportUrl,
      dailyStockDetailsReportObj,
    );
  }

  getDailyStockSummaryReports(dailyStockSummaryReportObj: any) {
    return this.http.post<any>(
      environment.dailyStockSummaryReportUrl,
      dailyStockSummaryReportObj,
    );
  }

  getMonthlyReports(monthlyReportObj: any) {
    return this.http.post<any>(environment.monthlyReportUrl, monthlyReportObj);
  }

  getYearlyReports(yearlyReportObj: any) {
    return this.http.post<any>(environment.yearlyReportUrl, yearlyReportObj);
  }

  getShortExpiryReports(shortExpiryReportObj: any) {
    return this.http.post<any>(
      environment.shortExpiryReportUrl,
      shortExpiryReportObj,
    );
  }

  getTransitReports(transitReportReqObj: any) {
    return this.http.post<any>(
      environment.transitReportUrl,
      transitReportReqObj,
    );
  }

  addEAushadhiItemsToAmrit(facilityID: any) {
    return this.http.post<any>(
      environment.eAushadhiStockAdditionUrl,
      facilityID,
    );
  }

  showLastUpdatedStockLogs(facilityID: any) {
    return this.http.post<any>(environment.lastUpdatedStockLogUrl, facilityID);
  }
}
