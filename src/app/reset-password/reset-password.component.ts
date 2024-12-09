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
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthenticationService } from '../login/authentication.service';
import { ConfirmationService } from '../app-modules/core/services/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  userFinalAnswers: any = [];

  constructor(
    private router: Router,
    private authService: AuthenticationService,
    private confirmationService: ConfirmationService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  public response: any;
  public error: any;
  userID: any;
  showQuestions = false;
  hideOnGettingQuestions = true;
  securityQuestions: any;
  answer: any = undefined;

  dynamictype: any = 'password';

  public questions: any[] = [];
  public questionId: any[] = [];
  public userAnswers: any[] = [];

  wrong_answer_msg: any = '';

  getQuestions(username: any) {
    // localStorage.setItem('userID', username);
    this.sessionstorage.userID = username;
    this.authService.getUserSecurityQuestionsAnswer(username).subscribe(
      (response: any) => {
        if (response !== undefined && response !== null) {
          this.handleSuccess(response.data);
        } else {
          this.confirmationService.alert(response.errorMessage);
        }
      },
      (error: any) => (this.error = <any>error),
    );
  }

  handleSuccess(data: any) {
    console.log(data);
    if (data !== undefined && data.forgetPassword !== 'user Not Found') {
      if (data.SecurityQuesAns.length > 0) {
        this.securityQuestions = data.SecurityQuesAns;
        this.showQuestions = true;
        this.hideOnGettingQuestions = false;

        this.splitQuestionAndQuestionID();
      } else {
        this.router.navigate(['/']);
        this.confirmationService.alert(
          'Questions are not set for this User',
          'error',
        );
      }
    } else {
      this.router.navigate(['/']);
      this.confirmationService.alert('User Not Found', 'info');
    }
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  splitQuestionAndQuestionID() {
    console.log('Q n A', this.securityQuestions);
    for (const element of this.securityQuestions) {
      this.questions.push(element.question);
      this.questionId.push(element.questionId);
    }
    console.log('questions', this.questions);
    console.log('questionId', this.questionId);
    this.showMyQuestion();
  }
  bufferQuestionId: any;
  bufferQuestion: any;
  counter = 0;
  showMyQuestion() {
    this.bufferQuestion = this.questions[this.counter];
    this.bufferQuestionId = this.questionId[this.counter];
  }
  nextQuestion() {
    if (this.counter < 3) {
      const reqObj = {
        questionId: this.questionId[this.counter],
        answer: this.answer,
      };
      this.userFinalAnswers.push(reqObj);
      this.wrong_answer_msg = '';
      this.counter = this.counter + 1;
      if (this.counter < 3) {
        this.showMyQuestion();
        this.answer = undefined;
      } else {
        this.validatingAnswers();
      }
    }
    console.log('user Final Answers are:', this.userFinalAnswers);
  }
  // For validating final answers, If all answers are correct need to pass transaction ID
  validatingAnswers() {
    this.authService
      .validateSecurityQuestionAndAnswer(
        this.userFinalAnswers,
        // this.sessionstorage.getItem('userID'),
        this.sessionstorage.userID,
      )
      .subscribe(
        (response: any) => {
          if (response.statusCode === 200) {
            this.counter = 0;
            this.router.navigate(['/set-password']);
            this.authService.transactionId = response.data.transactionId;
          } else {
            // this.getQuestions(this.sessionstorage.getItem('userID'));
            this.getQuestions(this.sessionstorage.userID);
            this.onFailureNavigateToResetPassword(response);
          }
        },
        (error: any) => {
          this.onFailureNavigateToResetPassword(error);
        },
      );
    this.answer = null;
    this.userFinalAnswers = [];
  }
  onFailureNavigateToResetPassword(error: any) {
    this.showQuestions = true;
    this.counter = 0;
    this.confirmationService.alert(error.errorMessage, 'error');
    this.router.navigate(['/reset-password']);
    this.splitQuestionAndQuestionID();
  }
}
