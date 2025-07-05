import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MiniCartService {
  private _isOpen = new BehaviorSubject<boolean>(false);
  readonly isOpen$ = this._isOpen.asObservable();

  open() {
    this._isOpen.next(true);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  }

  close() {
    this._isOpen.next(false);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  }

  toggle() {
    this._isOpen.value ? this.close() : this.open();
  }
}
