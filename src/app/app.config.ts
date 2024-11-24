import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
<<<<<<< HEAD
  providers: [
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule, ClipboardModule)
  ]
=======
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes)]
>>>>>>> parent of de56f79 (chore(ng): add `@angular/material`)
};
