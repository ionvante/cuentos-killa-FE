import { bootstrapApplication } from '@angular/platform-browser';
import * as Sentry from '@sentry/angular';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

Sentry.init({
  dsn: environment.sentryDsn,
  // Send default personally identifiable information
  sendDefaultPii: true,
  integrations: [Sentry.browserTracingIntegration()],
  // Capture all traces in development. Adjust in production as needed.
  tracesSampleRate: 1.0,
  tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
