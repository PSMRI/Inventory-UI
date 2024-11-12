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

import { AuthenticationService } from '../login/authentication.service';
import { ConfirmationService } from '../app-modules/core/services/confirmation.service';
import * as CryptoJS from 'crypto-js';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';
@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrls: ['./set-password.component.css'],
})
export class SetPasswordComponent implements OnInit {
  newpwd: any;
  confirmpwd: any;
  uname: any;
  dynamictype: any = 'password';
  key: any;
  iv: any;
  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword!: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;
  encryptedConfirmPwd: any;
  password: any;

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

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

  ngOnInit() {
    // this.uname = this.sessionstorage.getItem('userID');
    this.uname = this.sessionstorage.userID;
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  updatePassword(new_pwd: any) {
    const transactionId = this.authService.transactionId;
    this.password = this.encrypt(this.Key_IV, new_pwd);
    this.encryptedConfirmPwd = this.encrypt(this.Key_IV, this.confirmpwd);

    if (new_pwd === this.confirmpwd) {
      this.authService
        .setNewPassword(this.uname, this.password, transactionId)
        .subscribe(
          (response: any) => {
            if (
              response !== undefined &&
              response !== null &&
              response.statusCode === 200
            ) {
              this.successCallback();
            } else {
              this.confirmationService.alert(response.errorMessage, 'error');
              this.router.navigate(['/reset-password']);
            }
          },
          (error: any) => {
            this.errorCallback(error);
            this.router.navigate(['/reset-password']);
          },
          (this.authService.transactionId = undefined),
        );
    } else {
      this.confirmationService.alert('Password does not match', 'error');
    }
  }

  successCallback() {
    this.confirmationService.alert('Password changed successfully', 'success');
    this.router.navigate(['/']);
  }

  errorCallback(response: any) {
    console.log(response);
  }
}
