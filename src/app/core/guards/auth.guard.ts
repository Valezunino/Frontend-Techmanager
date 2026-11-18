import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard de navegación para proteger rutas privadas en Angular.
 *
 * ¿Cómo se usa?
 * En `app.routes.ts`, podés agregárselo a cualquier ruta que requiera estar logueado:
 * `{ path: 'productos/nuevo', component: ProductoFormularioComponent, canActivate: [authGuard] }`
 *
 * Si el usuario tiene un JWT cargado, lo deja pasar (`return true`).
 * Si no, lo redirige automáticamente a `/login`.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    return true;
  }

  // Redirige al login si intenta entrar a una pantalla protegida sin token
  return router.createUrlTree(['/login']);
};
