import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private _isOpen = new BehaviorSubject<boolean>(false);

  readonly isOpen$ = this._isOpen.asObservable();

  open() { this._isOpen.next(true); document.body.style.overflow = 'hidden'; }
  close() { this._isOpen.next(false); document.body.style.overflow = ''; }
  toggle() { this._isOpen.next(!this._isOpen.value); if (this._isOpen.value) { document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = ''; } }
}
