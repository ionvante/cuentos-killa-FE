import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private container: HTMLElement | null = null;

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.container = this.document.getElementById('toast-container');
  }

  show(
    content: string | Node | ((toast: HTMLElement) => void),
    type: 'success' | 'warning' | 'error' | 'info' = 'info'
  ): void {
    if (!this.container) {
      this.container = this.document.body;
    }

    const toast = this.document.createElement('div');
    toast.className = `alert alert--${type}`;

    if (typeof content === 'function') {
      content(toast);
    } else if (typeof content === 'string') {
      toast.innerHTML = content;
    } else {
      toast.appendChild(content);
    }

    this.container.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }
}
