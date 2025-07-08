import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { ConfigItem } from '../model/config-item.model';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private palettes: Record<string, Record<string, string>> = {
    "1": {
      "--btn-primary-bg": "#a66e38",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffad60",
      "--btn-secondary-text": "#ffffff",
      "--btn-ghost-border": "#3f2a14",
      "--btn-ghost-text": "#3f2a14",
      "--btn-tertiary-bg": "#96ceb4",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#eeeeee",
      "--btn-disabled-text": "#aaaaaa",
      "--bg-color": "#fffefc",
      "--text-color": "#3f2a14"
    },
    "2": {
      "--btn-primary-bg": "#96ceb4",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffad60",
      "--btn-secondary-text": "#ffffff",
      "--btn-ghost-border": "#3f2a14",
      "--btn-ghost-text": "#3f2a14",
      "--btn-tertiary-bg": "#a66e38",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#f7f4e9",
      "--btn-disabled-text": "#cccccc",
      "--bg-color": "#fffefc",
      "--text-color": "#3f2a14"
    },
    "3": {
      "--btn-primary-bg": "#ffad60",
      "--btn-primary-text": "#ffffff",
      "--btn-secondary-bg": "#ffeead",
      "--btn-secondary-text": "#a66e38",
      "--btn-ghost-border": "#3f2a14",
      "--btn-ghost-text": "#3f2a14",
      "--btn-tertiary-bg": "#96ceb4",
      "--btn-tertiary-text": "#ffffff",
      "--btn-disabled-bg": "#faf5e0",
      "--btn-disabled-text": "#bbbbbb",
      "--bg-color": "#fffefc",
      "--text-color": "#3f2a14"
    }
  };

  constructor(
    private http: HttpClient,
    private configservice: ConfigService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  loadTheme(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    return firstValueFrom(
      this.configservice.getItem(1, 1)
    ).then((item: ConfigItem) => {
      const data = item && item.data ? JSON.parse(item.data) : { opcion: '1' };
      this.apply(data.opcion);
    });

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
