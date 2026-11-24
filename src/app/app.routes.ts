import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './features/productos/productos.component';
import { ProductoFormularioComponent } from './features/productos/producto-formulario.component';
import { CatalogoComponent } from './features/catalogos/catalogo.component';

import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { authGuard, adminGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'productos', component: ProductosComponent, canActivate: [authGuard] },
  { path: 'productos/nuevo', component: ProductoFormularioComponent, canActivate: [authGuard] },
  { path: 'productos/:id/editar', component: ProductoFormularioComponent, canActivate: [authGuard] },
  { path: 'categorias', component: CatalogoComponent, canActivate: [authGuard], data: { tipo: 'categorias' } },
  { path: 'marcas', component: CatalogoComponent, canActivate: [authGuard], data: { tipo: 'marcas' } },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
