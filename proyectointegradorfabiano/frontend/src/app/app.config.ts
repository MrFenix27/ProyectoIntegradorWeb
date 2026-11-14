import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Angular 22 usa change detection sin Zone.js. El estado de la aplicación
    // se expone con signals (ver ColdtraceStoreService), por lo que las vistas
    // se refrescan solas al llegar las respuestas HTTP.
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
