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
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthenticationService {
  transactionId: any;
  constructor(
    private router: Router,
    private http: HttpClient,
  ) {}

  login(
    userName: string,
    password: string,
    doLogout: any,
    captchaToken: string,
  ) {
    return this.http.post<any>(environment.loginUrl, {
      userName: userName,
      password: password,
      doLogout: doLogout,
      withCredentials: true,
      captchaToken: captchaToken,
    });
  }

  /* AN4085822 - Concurrent login issue*/
  userlogoutPreviousSession(userName: string) {
    console.log(
      'environment.userlogoutPreviousSessionUrl',
      environment.userlogoutPreviousSessionUrl,
    );
    return this.http.post<any>(environment.userlogoutPreviousSessionUrl, {
      userName: userName,
    });
  }

  getUserSecurityQuestionsAnswer(uname: any): Observable<any> {
    return this.http.post<any>(environment.getUserSecurityQuestionsAnswerUrl, {
      userName: uname.toLowerCase(),
    });
  }

  getSecurityQuestions() {
    return this.http.get<any>(environment.getSecurityQuestionUrl);
  }

  saveUserSecurityQuestionsAnswer(userQuestionAnswer: any) {
    console.log('save security', userQuestionAnswer);

    return this.http.post<any>(
      environment.saveUserSecurityQuestionsAnswerUrl,
      userQuestionAnswer,
    );
  }

  setNewPassword(userName: string, password: string, transactionId: any) {
    console.log('update password', password);
    console.log('update username', userName);
    return this.http.post<any>(environment.setNewPasswordUrl, {
      userName: userName,
      password: password,
      transactionId: transactionId,
    });
  }

  logout() {
    localStorage.removeItem('isAuthenticated');
    this.router.navigate(['/login']);
  }

  getSessionExists() {
    return this.http.post<any>(environment.getSessionExistsURL, {});
  }

  getFacilityDetails(storeID: any) {
    return this.http.post<any>(environment.getFacilityByID, {
      facilityID: storeID,
    });
  }
  validateSecurityQuestionAndAnswer(ans: any, uname: any): Observable<any> {
    return this.http.post<any>(environment.validateSecurityQuestions, {
      SecurityQuesAns: ans,
      userName: uname,
    });
  }
  getTransactionIdForChangePassword(uname: any): Observable<any> {
    return this.http.post<any>(environment.getTransacIDForPasswordChange, {
      userName: uname,
    });
  }
}
