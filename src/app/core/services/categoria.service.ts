import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Categoria } from '../models/categoria.model';

/**
 * Servicio encargado de consultar las Categorías al Backend (Spring Boot).
 * Se usa tanto para mostrar el nombre de la categoría en la tabla de productos
 * como para armar el desplegable (<select>) en el formulario de alta.
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/categorias`;

  private readonly categoriasMock: Categoria[] = [
    { id: 1, nombre: 'Periféricos' },
    { id: 2, nombre: 'Monitores' },
    { id: 3, nombre: 'Componentes PC' },
    { id: 4, nombre: 'Audio y Video' }
  ];

  /**
   * Petición HTTP GET a http://localhost:8000/categorias
   */
  obtenerCategorias(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  /**
   * Devuelve categorías simuladas para poder probar la interfaz y el formulario
   * cuando el backend de Spring Boot todavía no está levantado.
   */
  obtenerCategoriasDePrueba(): Observable<Categoria[]> {
    return of(this.categoriasMock);
  }
}
