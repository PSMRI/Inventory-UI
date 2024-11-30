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
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

// const commonIP = 'https://amritwprdev.piramalswasthya.org';
// const inventoryIP = 'https://amritwprdev.piramalswasthya.org';
// const mmuIP = 'https://amritwprdev.piramalswasthya.org';
// const FHIRIP = 'https://amritwprdev.piramalswasthya.org';

const commonIP = 'https://amritwprdev.piramalswasthya.org/';
const inventoryIP = 'https://amritwprdev.piramalswasthya.org/';
const mmuIP = 'https://amritwprdev.piramalswasthya.org/';
const FHIRIP = 'https://amritwprdev.piramalswasthya.org/';

// const COMMON_API_OPEN = `http://${IP}:8080/apiman-gateway/IEMR/Common/open/`;
// const COMMON_API = `http://${IP}:8080/apiman-gateway/IEMR/Common/1.0/`;
// const INVENTORY_API = `http://${IP}:8080/apiman-gateway/IEMR/Inventory/1.0/`;
// const MMU_API = `http://${IP}:8080/apiman-gateway/IEMR/MMU/1.0/`;

const COMMON_API_OPEN = `${commonIP}commonapi-v3.0.0/`;
const COMMON_API = `${commonIP}commonapi-v3.0.0/`;
const INVENTORY_API = `${inventoryIP}Inventoryapi-v3.0.0/`;
const MMU_API = `${mmuIP}mmuapi-v3.0.0/`;
const FHIR_API = `${FHIRIP}fhirapi-v1.2/`;
import { keys } from './enckey';
// const FHIR_API = `http://localhost:8080/fhirapi-v1.0/`;

export const environment = {
  production: false,
  countryId: 1,
  encKey: keys.dev,

  getBeneficiaryDetail: `registrar/get/benDetailsByRegIDForLeftPanelNew`,
  getBeneficiaryImage: `registrar/getBenImage`,
  getPrescriptions: `${INVENTORY_API}RX/getPrescribedMedicines`,
  /**
   * Login and Logout Urls
   */
  loginUrl: `${COMMON_API_OPEN}user/userAuthenticate`,
  logoutUrl: `${COMMON_API_OPEN}user/userLogout`,
  userlogoutPreviousSessionUrl: `${COMMON_API_OPEN}user/logOutUserFromConcurrentSession`,

  /**
   * Security Question and Forgot password Url
   */
  getUserSecurityQuestionsAnswerUrl: `${COMMON_API_OPEN}user/forgetPassword`,
  getSecurityQuestionUrl: `${COMMON_API_OPEN}user/getsecurityquetions`,
  saveUserSecurityQuestionsAnswerUrl: `${COMMON_API_OPEN}user/saveUserSecurityQuesAns`,
  setNewPasswordUrl: `${COMMON_API_OPEN}user/setForgetPassword`,
  getSessionExistsURL: `${COMMON_API}user/getLoginResponse`,

  extendSessionUrl: `${INVENTORY_API}`,

  getBeneficaryVisitDetailsurl: `${INVENTORY_API}getVisitFromBenID`,
  getBeneficiaryDataURL: `${COMMON_API}beneficiary/getRegistrationData`,
  getStateDistrictsURL: `${COMMON_API}location/districts/`,
  searchBeneficiaryURL: `${COMMON_API}beneficiary/searchBeneficiary`,
  getFacilityUrl: `${INVENTORY_API}getAllStore/`,
  getFacilityByID: `${INVENTORY_API}getStoreByID`,

  getStoreItems: `${INVENTORY_API}getItemFromStoreID/`,

  getItemBatchForStoreID: `${INVENTORY_API}getItemBatchForStoreID/`,

  getItem_Url: `${INVENTORY_API}getSubStoreitem/`,

  savePhysicalStock_Url: `${INVENTORY_API}physicalStockEntry`,

  storeSelfConsumption: `${INVENTORY_API}storeSelfConsumption`,

  searchItemUrl: `${INVENTORY_API}itemPartialSearch`,
  searchBatchUrl: `${INVENTORY_API}itemBatchPartialSearch`,
  searchTransferItemUrl: `${INVENTORY_API}getItemBatchForStoreTransfer`,

  viewSelfConsumption: `${INVENTORY_API}getSelfConsumption`,
  getParticularConsumptionURL: `${INVENTORY_API}getSelfConsumptionItemEntry`,

  viewPhysicalStockURL: `${INVENTORY_API}getPhysicalStockEntry`,
  getParticularStockURL: `${INVENTORY_API}getPhysicalStockEntryItems`,

  viewMedicineDispenceURL: `${INVENTORY_API}getPatientissue`,
  getParticularMedicineDispenseURL: `${INVENTORY_API}getPatientissueItemEntry`,

  viewStockTransferURL: `${INVENTORY_API}getStoreTransfer`,
  getParticularStockTransferURL: `${INVENTORY_API}getStoreTransferItemEntry`,

  getAvailableItemInStoreUrl: `${INVENTORY_API}getItemFromStoreID/`,
  getItemBatchListUrl: `${INVENTORY_API}getItemBatchForStoreID`,

  saveStockExitUrl: `${INVENTORY_API}patientIssue`,

  allocateBatchStockUrl: `${INVENTORY_API}allocateStockFromItemID/`,
  saveStoreTransferUrl: `${INVENTORY_API}storeTransfer`,

  saveStockAdjustmentUrl: `${INVENTORY_API}stockadjustment`,
  saveStockAdjustmentDraftUrl: `${INVENTORY_API}stockadjustmentdraft`,
  getStockAjustmentDraftList: `${INVENTORY_API}getstockadjustmentdraftTransaction`,
  getStockAjustmentList: `${INVENTORY_API}getStockAdjustmentTransaction`,
  getStockAjustmentDraftDetails: `${INVENTORY_API}getforEditsStockAdjustmentdraftTransaction`,
  getStockAjustmentDetails: `${INVENTORY_API}getforEditsStockAdjustmentTransaction`,

  getItemDetailsByNameUrl: `${INVENTORY_API}getItemwithQuantityPartialSearch`,

  getVanByStoreIDUrl: `${INVENTORY_API}getVanByStoreID`,
  getBeneficiaryByPhoneNumberUrl: `${COMMON_API}beneficiary/searchUserByPhone`,
  getBeneficiaryByBeneficiaryIDUrl: `${COMMON_API}beneficiary/searchUserByID`,
  getItemListUrl: `${INVENTORY_API}patientReturnController/getItemNameByRegID`,
  getBatchListUrl: `${INVENTORY_API}patientReturnController/getItemDetailByBen`,
  getUpdateQuantityReturnedUrl: `${INVENTORY_API}patientReturnController/updateQuantityReturned`,
  getPatientReturnListUrl: `${INVENTORY_API}patientReturnController/getBenReturnHistory`,
  searchItemListUrl: `${INVENTORY_API}indentController/partialsearchindentitems`,
  saveIndentRequestUrl: `${INVENTORY_API}indentController/createIndentRequest`,
  showMainStoreIndentRequestUrl: `${INVENTORY_API}indentController/getIndentWorklist`,
  showSubStoreIndentRequestUrl: `${INVENTORY_API}indentController/getIndentHistory`,
  cancelIndentRequestUrl: `${INVENTORY_API}indentController/cancelIndentOrder`,
  viewItemListForSubStoreUrl: `${INVENTORY_API}indentController/getOrdersByIndentID`,
  viewItemListForMainStoreUrl: `${INVENTORY_API}indentController/getIndentOrderWorklist`,

  getSaveDispenseListUrl: `${INVENTORY_API}indentController/issueIndent`,
  receiveIndentOrderUrl: `${INVENTORY_API}indentController/receiveIndent`,
  updateIndentOrderUrl: `${INVENTORY_API}indentController/updateIndentOrder`,

  /* Report URL's*/
  inwardStockReportUrl: `${INVENTORY_API}crmReportController/getInwardStockReport`,
  consumptionReportUrl: `${INVENTORY_API}crmReportController/getConsumptionReport`,
  expiryReportUrl: `${INVENTORY_API}crmReportController/getExpiryReport`,
  beneficiaryDrugIssueReportUrl: `${INVENTORY_API}crmReportController/getBenDrugIssueReport`,
  dailyStockDetailsReportUrl: `${INVENTORY_API}crmReportController/getDailyStockDetailReport`,
  dailyStockSummaryReportUrl: `${INVENTORY_API}crmReportController/getDailyStockSummaryReport`,
  monthlyReportUrl: `${INVENTORY_API}crmReportController/getMonthlyReport`,
  yearlyReportUrl: `${INVENTORY_API}crmReportController/getYearlyReport`,
  shortExpiryReportUrl: `${INVENTORY_API}crmReportController/getShortExpiryReport`,
  transitReportUrl: `${INVENTORY_API}crmReportController/getTransitReport`,
  licenseUrl: `${COMMON_API}license.html`,
  apiVersionUrl: `${INVENTORY_API}version`,
  getLanguageList: `${COMMON_API}beneficiary/getLanguageList`,

  /**E-Aushadhi Stock Addition */
  eAushadhiStockAdditionUrl: `${FHIR_API}eAushadhi/getStoreStockDetails`,
  lastUpdatedStockLogUrl: `${FHIR_API}eAushadhi/getFacilityStockProcessLog`,
  /* Validate users based on security questions */
  validateSecurityQuestions: `${COMMON_API}user/validateSecurityQuestionAndAnswer`,

  /* TransactionID for changing password */
  getTransacIDForPasswordChange: `${COMMON_API}user/getTransactionIdForChangePassword`,
};
