import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient,withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { authInterceptor } from './services/auth.interceptor';
import { ThemeService } from './services/theme.service';
import * as Sentry from '@sentry/angular';



export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),
    {
      provide: APP_INITIALIZER,
      useFactory: (ts: ThemeService) => () => ts.loadTheme(),
      deps: [ThemeService],
      multi: true,
    },
    {
      provide: ErrorHandler,
      useValue: Sentry.createErrorHandler(),
    },
    Sentry.TraceService,
    {
      provide: APP_INITIALIZER,
      useFactory: () => () => {},
      deps: [Sentry.TraceService],
      multi: true,
    },
  ]
};
