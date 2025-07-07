# CuentosKillaFE

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.0.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Environment configuration

The project relies on environment files located in `src/environments/`. Each
file exports an `environment` object with the following keys:

- `apiBaseUrl` – base URL for the backend API.
- `sentryDsn` – [Sentry](https://sentry.io/) DSN used to report errors.
- `minFreeShipping` – minimum order total required to obtain free shipping.

The repository contains predefined files for development (`environment.ts`),
production (`environment.prod.ts`) and local development
(`environment-local.ts`). You can create additional files such as
`environment.staging.ts` and reference them via Angular's configuration system.

To override values during deployment, either provide your own environment file
and add a corresponding configuration in `angular.json`, or replace specific
entries using the `fileReplacements` section.

### Switching environments

When building or serving the application you can specify the desired
configuration:

```bash
ng serve --configuration=development   # default for local development
ng build --configuration=production    # production build
```

Replace `production` or `development` with the name of any custom configuration
you create (for example `staging`).

## Charts and statistics

The dashboard charts are powered by [Chart.js](https://www.chartjs.org/) and
[ng2-charts](https://github.com/valor-software/ng2-charts). Order metrics are
provided through the `OrderStatsService` and visualized using the standalone
`order-stats` component.

To view these graphs locally:

1. Install dependencies with `npm install`.
2. Run the app using `ng serve` and open the admin dashboard.

If the charts do not render, ensure `NgChartsModule` is imported and that both
Chart.js and ng2-charts are installed.
