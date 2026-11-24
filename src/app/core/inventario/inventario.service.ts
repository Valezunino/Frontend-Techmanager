import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Producto, ProductoGuardar, Marca, Categoria } from './inventario.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/productos`;
  listar() { return this.http.get<Producto[]>(this.url); }
  buscar(id: number) { return this.http.get<Producto>(`${this.url}/${id}`); }
  crear(datos: ProductoGuardar) { return this.http.post<Producto>(this.url, datos); }
  actualizar(id: number, datos: ProductoGuardar) { return this.http.put<Producto>(`${this.url}/${id}`, datos); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/categorias`;
  listar() { return this.http.get<Categoria[]>(this.url); }
  crear(nombre: string) { return this.http.post<Categoria>(this.url, { nombre }); }
  actualizar(id: number, nombre: string) { return this.http.put<Categoria>(`${this.url}/${id}`, { nombre }); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class MarcaService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/marcas`;
  listar() { return this.http.get<Marca[]>(this.url); }
  crear(nombre: string) { return this.http.post<Marca>(this.url, { nombre }); }
  actualizar(id: number, nombre: string) { return this.http.put<Marca>(`${this.url}/${id}`, { nombre }); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
