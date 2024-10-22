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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as CryptoJS from 'crypto-js';
import { ConfirmationService } from '../app-modules/core/services/confirmation.service';
import { CookieService } from 'ngx-cookie-service';
import { SessionStorageService } from '../app-modules/core/services/session-storage.service';
import { AuthenticationService } from './authentication.service';
@Component({
  selector: 'app-login-cmp',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  userName: any;
  password: any;
  designation!: any;
  dynamictype = 'password';

  key: any;
  iv: any;
  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword!: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;

  constructor(
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private sessionstorage: SessionStorageService,
    private cookieService: CookieService,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  ngOnInit() {
    if (sessionStorage.getItem('isAuthenticated'))
      this.router.navigate(['/service']);
    else {
      localStorage.clear();
      sessionStorage.clear();
    }
  }

  roleArray: any = [];

  get keySize() {
    return this._keySize;
  }

  set keySize(value) {
    this._keySize = value;
  }

  get iterationCount() {
    return this._iterationCount;
  }

  set iterationCount(value) {
    this._iterationCount = value;
  }

  generateKey(salt: any, passPhrase: any) {
    return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      hasher: CryptoJS.algo.SHA512,
      keySize: this.keySize / 32,
      iterations: this._iterationCount,
    });
  }

  encryptWithIvSalt(salt: any, iv: any, passPhrase: any, plainText: any) {
    const key = this.generateKey(salt, passPhrase);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  encrypt(passPhrase: any, plainText: any) {
    const iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
    return salt + iv + ciphertext;
  }

  login() {
    const encryptPassword = this.encrypt(this.Key_IV, this.password);
    this.authService
      .login(this.userName.trim(), encryptPassword, false)
      .subscribe(
        (res: any) => {
          if (res.statusCode === 200) {
            if (res.data.previlegeObj && res.data.previlegeObj[0]) {
              this.cookieService.set('Jwttoken', res.data.Jwttoken);
              delete res.data.Jwttoken;
              sessionStorage.setItem(
                'loginDataResponse',
                JSON.stringify(res.data),
              );
              this.checkRoleMapped(res.data);
            } else {
              this.confirmationService.alert(
                'Seems you are logged in from somewhere else, Logout from there & try back in.',
                'error',
              );
            }
          } else if (res.statusCode === 5002) {
            if (
              res.errorMessage ===
              'You are already logged in,please confirm to logout from other device and login again'
            ) {
              this.confirmationService
                .confirm('info', res.errorMessage)
                .subscribe((confirmResponse) => {
                  if (confirmResponse) {
                    this.authService
                      .userlogoutPreviousSession(this.userName)
                      .subscribe((userlogoutPreviousSession) => {
                        if (userlogoutPreviousSession.statusCode === 200) {
                          this.authService
                            .login(this.userName, encryptPassword, true)
                            .subscribe((userLoggedIn) => {
                              if (userLoggedIn.statusCode === 200) {
                                if (
                                  userLoggedIn.data.previlegeObj !== null &&
                                  userLoggedIn.data.previlegeObj !==
                                    undefined &&
                                  userLoggedIn.data.previlegeObj[0]
                                ) {
                                  this.cookieService.set(
                                    'Jwttoken',
                                    userLoggedIn.data.Jwttoken,
                                  );
                                  delete userLoggedIn.data.Jwttoken;
                                  this.checkRoleMapped(userLoggedIn.data);
                                } else {
                                  this.confirmationService.alert(
                                    'Seems you are logged in from somewhere else, Logout from there & try back in.',
                                    'error',
                                  );
                                }
                              } else {
                                this.confirmationService.alert(
                                  userLoggedIn.errorMessage,
                                  'error',
                                );
                              }
                            });
                        } else {
                          this.confirmationService.alert(
                            userlogoutPreviousSession.errorMessage,
                            'error',
                          );
                        }
                      });
                  } else {
                    sessionStorage.clear();
                    this.router.navigate(['/login']);
                    // this.confirmationService.alert(res.errorMessage, 'error');
                  }
                });
            } else {
              this.confirmationService.alert(res.errorMessage, 'error');
            }
          }
        },
        (err) => {
          this.confirmationService.alert(err, 'error');
        },
      );
  }

  serviceRoleArray: any = [];
  checkRoleMapped(loginDataResponse: any) {
    let roleObj;
    if (loginDataResponse.previlegeObj[0].roles) {
      roleObj = loginDataResponse.previlegeObj[0].roles;
      if (roleObj.length > 0) {
        roleObj.forEach((role: any) => {
          role.serviceRoleScreenMappings.forEach((serviceRole: any) => {
            this.roleArray.push(serviceRole.screen.screenName);
          });
        });
        if (this.roleArray && this.roleArray.length > 0) {
          sessionStorage.setItem('role', JSON.stringify(this.roleArray));
          this.checkMappedDesignation(loginDataResponse);
        } else {
          this.confirmationService.alert(
            'Role Features is not mapped for user , Please map a role feature',
            'error',
          );
        }
      } else {
        this.confirmationService.alert(
          'Role Features is not mapped for user , Please map a role feature',
          'error',
        );
      }
    } else {
      this.confirmationService.alert(
        'Role Features is not mapped for user , Please map a role feature',
        'error',
      );
    }
  }

  checkMappedDesignation(loginDataResponse: any) {
    if (
      loginDataResponse.designation &&
      loginDataResponse.designation.designationName
    ) {
      this.designation = loginDataResponse.designation.designationName;
      if (this.designation !== null) {
        this.checkDesignationWithRole(loginDataResponse);
      } else {
        this.confirmationService.alert(
          'Designation is not available for user , Please map the Designation',
          'error',
        );
      }
    } else {
      this.confirmationService.alert(
        'Designation is not available for user , Please map the Designation',
        'error',
      );
    }
  }

  checkDesignationWithRole(loginDataResponse: any) {
    if (this.roleArray.includes(this.designation)) {
      sessionStorage.setItem('key', loginDataResponse.key);
      sessionStorage.setItem('designation', this.designation);
      // localStorage.setItem('userID', loginDataResponse.userID);
      // localStorage.setItem('userName', loginDataResponse.userName);
      // localStorage.setItem('username', this.userName);
      this.sessionstorage.userID = loginDataResponse.userID;
      this.sessionstorage.userName = loginDataResponse.userName;
      this.sessionstorage.username = this.userName;
      const services = loginDataResponse.previlegeObj.map((item: any) => {
        if (
          item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
            .serviceID === 4 ||
          item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
            .serviceID === 2
        ) {
          return {
            serviceID:
              item.roles[0].serviceRoleScreenMappings[0].providerServiceMapping
                .serviceID,
            providerServiceID: item.serviceID,
            serviceName: item.serviceName,
            apimanClientKey: item.apimanClientKey,
          };
        }
      });
      if (services.length > 0) {
        sessionStorage.setItem('services', JSON.stringify(services));

        if (loginDataResponse.Status.toLowerCase() === 'new') {
          this.router.navigate(['/set-security-questions']);
        } else {
          sessionStorage.setItem(
            'isAuthenticated',
            loginDataResponse.isAuthenticated,
          );
          this.router.navigate(['/service']);
        }
      } else {
        this.confirmationService.alert(
          "User doesn't have previlege to access the application",
        );
      }
    } else {
      this.confirmationService.alert(
        'Designation is not matched with your roles , Please map the Designation or include more roles',
        'error',
      );
    }
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }
}
