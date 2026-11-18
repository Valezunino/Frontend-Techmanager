import { Routes } from '@angular/router';
import { ProductoListaComponent } from './features/productos/producto-lista/producto-lista.component';
import { ProductoFormularioComponent } from './features/productos/producto-formulario/producto-formulario.component';
import { LoginComponent } from './features/auth/login/login.component';
// import { authGuard } from './core/guards/auth.guard';

/**
 * Definición de rutas del Frontend (Navegación interna de Angular).
 * - '/login': Pantalla de autenticación JWT contra Spring Security.
 * - '/productos': Muestra la tabla de productos (GET).
 * - '/productos/nuevo': Muestra el formulario para crear un producto (POST).
 *
 * Tip: Si en tu proyecto querés obligar al usuario a iniciar sesión antes de crear un producto,
 * descomentá `authGuard` arriba y agregá `canActivate: [authGuard]` en la ruta.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'productos', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'productos', component: ProductoListaComponent },
  {
    path: 'productos/nuevo',
    component: ProductoFormularioComponent
    // canActivate: [authGuard]
  }
];
