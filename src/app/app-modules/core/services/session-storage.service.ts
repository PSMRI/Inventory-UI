import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { StorageService } from 'ng-cryptostore';

@Injectable({
  providedIn: 'root',
})
export class SessionStorageService {
  userID: any;
  userName: any;
  username: any;
  SECRET_KEY = environment.encKey;

  constructor(private store: StorageService) {}

  safeToString(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    return value.toString();
  }

  setItem(key: string, value: any): void {
    this.store.set(key, value, this.SECRET_KEY);
  }

  getItem(key: string): any | null {
    return this.store.get(key, this.SECRET_KEY);
  }
}
