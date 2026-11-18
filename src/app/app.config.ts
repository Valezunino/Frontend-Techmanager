import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

/**
 * Configuración global de la aplicación Angular 22 (Standalone).
 * - `provideRouter(routes)`: Habilita el enrutador de pantallas.
 * - `provideHttpClient(withFetch(), withInterceptors([jwtInterceptor]))`:
 *   Habilita el cliente HTTP e inyecta automáticamente el token JWT (`Authorization: Bearer ...`)
 *   en todas las peticiones que salgan hacia Spring Boot.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([jwtInterceptor])
    )
  ]
};
