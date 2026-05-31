import { Component, OnInit } from '@angular/core';
import {
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { SpinnerService } from './app-modules/core/services/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],

  standalone: false,
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private spinnerService: SpinnerService,
  ) {}

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.spinnerService.show();
      } else if (event instanceof NavigationEnd) {
        setTimeout(() => this.spinnerService.hide(), 500);
      } else if (event instanceof NavigationError) {
        setTimeout(() => this.spinnerService.hide(), 500);
      } else {
        setTimeout(() => this.spinnerService.hide());
      }
    });
  }
}
