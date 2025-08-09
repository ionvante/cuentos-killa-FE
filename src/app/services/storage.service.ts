import { Injectable } from '@angular/core';

export const TOKEN_KEY = 'token';
export const USER_KEY = 'userData';

@Injectable({ providedIn: 'root' })
export class StorageService {
  setItem(key: string, value: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  }

  getItem(key: string): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  }

  removeItem(key: string) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
  }
}
