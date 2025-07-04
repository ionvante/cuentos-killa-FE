import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import * as Sentry from '@sentry/angular-ivy';
import { BrowserTracing } from '@sentry/tracing';
import { environment } from './environments/environment';

Sentry.init({
  dsn: environment.sentryDsn,
  integrations: [
    new BrowserTracing({
      routingInstrumentation: Sentry.routingInstrumentation,
    }),
  ],
  sendDefaultPii: true,
  tracesSampleRate: 1.0,
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
