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
import { AuthService } from '../app-modules/core/services/auth.service';
import { SessionStorageService } from 'src/app/app-modules/core/services/session-storage.service';

@Component({
  selector: 'app-set-security-questions',
  templateUrl: './set-security-questions.component.html',
  styleUrls: ['./set-security-questions.component.css'],
})
export class SetSecurityQuestionsComponent implements OnInit {
  constructor(
    public router: Router,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    private auth: AuthService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  handleSuccess(response: any) {
    this.questions = response.data;
    this.replica_questions = response.data;
    console.log(this.questions);
  }

  handleError(response: any) {
    console.log('error', this.questions);
  }

  ngOnInit() {
    this.uid = this.sessionstorage.userID;
    this.uname = this.sessionstorage.username;
    // this.uid = this.sessionstorage.getItem('userID');
    // this.uname = this.sessionstorage.getItem('username');
    this.authService.getSecurityQuestions().subscribe(
      (response: any) => this.handleSuccess(response),
      (error: any) => this.handleError(error),
    );
  }

  uid: any;
  uname: any;
  passwordSection = false;
  questionsection = true;
  iv: any;
  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword!: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;
  encryptedConfirmPwd: any;
  password: any;

  switch() {
    this.passwordSection = true;
    this.questionsection = false;
  }

  dynamictype: any = 'password';

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  question1: any = '';
  question2: any = '';
  question3: any = '';

  answer1: any = '';
  answer2: any = '';
  answer3: any = '';

  questions: any = [];
  replica_questions: any = [];
  Q_array_one: any = [];
  Q_array_two: any = [];

  selectedQuestions: any = [];

  updateQuestions(selectedques: any, position: any) {
    console.log('position', position, 'Selected Question', selectedques);
    console.log(
      'before if else block, selected questions',
      this.selectedQuestions,
    );

    if (this.selectedQuestions.indexOf(selectedques) === -1) {
      this.selectedQuestions[position] = selectedques;
      if (position === 0) {
        this.answer1 = '';
      }
      if (position === 1) {
        this.answer2 = '';
      }
      if (position === 2) {
        this.answer3 = '';
      }
      console.log('if block, selected questions', this.selectedQuestions);
    } else {
      if (this.selectedQuestions.indexOf(selectedques) !== position) {
        this.confirmationService.alert(
          'This Question is already selected. Choose Unique Question',
        );
      } else {
        this.confirmationService.alert(
          'This question is mapped at this position already',
        );
      }
      console.log('else block, selected questions', this.selectedQuestions);
      console.log('position else block', position);

      // this.disableAnswerField(position);
    }
  }

  filterArrayOne(questionID: any) {
    /*reset the 2nd and 3rd question and answer fields */
    this.question2 = '';
    this.answer2 = '';

    this.question3 = '';
    this.answer3 = '';

    /*filter the primary array based on the selection and feed resultant to Q_array_one*/
    this.Q_array_one = this.filter_function(questionID, this.replica_questions);
    // this.questions=this.Q_array_one;
  }

  filterArrayTwo(questionID: any) {
    /*reset the 3rd question and answer field */
    this.question3 = '';
    this.answer3 = '';

    /*filter the Q_array_one based on the selection and feed resultant to Q_array_two*/
    this.Q_array_two = this.filter_function(questionID, this.Q_array_one);
  }

  filter_function(questionID: any, array: any) {
    const dummy_array = [];
    for (let i = 0; i < array.length; i++) {
      if (array[i].QuestionID === questionID) {
        continue;
      } else {
        dummy_array.push(array[i]);
      }
    }
    return dummy_array;
  }

  dataArray: any = [];

  setSecurityQuestions() {
    console.log(this.selectedQuestions, this.selectedQuestions.length, 'yo');
    if (this.answer1 && this.answer2 && this.answer3) {
      this.dataArray = [
        {
          userID: this.uid,
          questionID: this.question1,
          answers: this.answer1,
          mobileNumber: '1234567890',
          createdBy: this.uname,
        },
        {
          userID: this.uid,
          questionID: this.question2,
          answers: this.answer2,
          mobileNumber: '1234567890',
          createdBy: this.uname,
        },
        {
          userID: this.uid,
          questionID: this.question3,
          answers: this.answer3,
          mobileNumber: '1234567890',
          createdBy: this.uname,
        },
      ];

      console.log('Request Array', this.dataArray);
      console.log('selected questions', this.selectedQuestions);

      this.switch();
    } else {
      this.confirmationService.alert(
        'All 3 questions should be different. Please check your selected Questions',
      );
    }
  }

  oldpwd: any;
  newpwd: any;
  confirmpwd: any;

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

  updatePassword(new_pwd: any) {
    this.password = this.encrypt(this.Key_IV, new_pwd);
    this.encryptedConfirmPwd = this.encrypt(this.Key_IV, this.confirmpwd);
    if (new_pwd === this.confirmpwd) {
      this.authService
        .saveUserSecurityQuestionsAnswer(this.dataArray)
        .subscribe(
          (response: any) =>
            this.handleQuestionSaveSuccess(response, this.encryptedConfirmPwd),
          (error: any) => this.handleQuestionSaveError(error),
        );
    } else {
      this.confirmationService.alert("Password doesn't match");
    }
  }

  handleQuestionSaveSuccess(response: any, encryptedConfirmPwd: any) {
    if (
      response &&
      response.statusCode === 200 &&
      response.data.transactionId !== undefined &&
      response.data.transactionId !== null
    ) {
      const transactionId = this.authService.transactionId;
      console.log('saved questions', response);
      this.authService
        .setNewPassword(
          this.uname,
          encryptedConfirmPwd,
          response.data.transactionId,
        )
        .subscribe(
          (response: any) => this.successCallback(response),
          (error: any) => this.errorCallback(error),
        );
    } else {
      this.confirmationService.alert(response.errorMessage, 'error');
    }
  }

  handleQuestionSaveError(response: any) {
    console.log('question save error', response);
  }

  successCallback(response: any) {
    console.log(response);
    this.confirmationService.alert('Password changed successfully', 'success');
    this.logout();
  }

  logout() {
    this.auth.logoutUser().subscribe((res: any) => {
      if (res && res.statusCode === 200) {
        this.router.navigate(['/login']);
        localStorage.clear();
        sessionStorage.clear();
      }
    });
  }

  errorCallback(response: any) {
    console.log(response);
  }
}
