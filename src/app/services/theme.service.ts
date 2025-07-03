import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private palettes: Record<string, Record<string, string>> = {
    "1": {
      "--btn-primary-bg": "#a66e38",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffad60",
      "--btn-secondary-text": "#ffffff",
      "--btn-ghost-border": "#a66e38",
      "--btn-ghost-text": "#a66e38",
      "--btn-tertiary-bg": "#96ceb4",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#eeeeee",
      "--btn-disabled-text": "#aaaaaa"
    },
    "2": {
      "--btn-primary-bg": "#96ceb4",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffad60",
      "--btn-secondary-text": "#ffffff",
      "--btn-ghost-border": "#96ceb4",
      "--btn-ghost-text": "#96ceb4",
      "--btn-tertiary-bg": "#a66e38",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#f7f4e9",
      "--btn-disabled-text": "#cccccc"
    },
    "3": {
      "--btn-primary-bg": "#ffad60",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffeead",
      "--btn-secondary-text": "#a66e38",
      "--btn-ghost-border": "#ffad60",
      "--btn-ghost-text": "#ffad60",
      "--btn-tertiary-bg": "#96ceb4",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#faf5e0",
      "--btn-disabled-text": "#bbbbbb"
    }
  };

  constructor(
    private http: HttpClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loadTheme(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    return firstValueFrom(
      this.http.get<{ opcion: string }>("/api/config/theme")
    )
      .then((cfg) => this.apply(cfg.opcion))
      .catch(() => this.apply("1"));
  }

  private apply(option: string) {
    const vars = this.palettes[option] || this.palettes["1"];
    if (isPlatformBrowser(this.platformId)) {
      Object.entries(vars).forEach(([key, val]) =>
        this.document.documentElement.style.setProperty(key, val)
      );
    }
  }
}
