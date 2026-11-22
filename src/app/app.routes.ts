import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProductosComponent } from './features/productos/productos.component';
import { ProductoFormularioComponent } from './features/productos/producto-formulario.component';
import { CatalogoComponent } from './features/catalogos/catalogo.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'productos', component: ProductosComponent },
  { path: 'productos/nuevo', component: ProductoFormularioComponent },
  { path: 'productos/:id/editar', component: ProductoFormularioComponent },
  { path: 'categorias', component: CatalogoComponent, data: { tipo: 'categorias' } },
  { path: 'marcas', component: CatalogoComponent, data: { tipo: 'marcas' } },
  { path: '**', redirectTo: 'dashboard' }
];
