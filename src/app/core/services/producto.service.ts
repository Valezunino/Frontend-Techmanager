import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto } from '../models/producto.model';

/**
 * Servicio encargado exclusivamente de la comunicación HTTP con el Backend (Spring Boot)
 * para todo lo relacionado a Productos (GET y POST).
 *
 * NOTA SOBRE JWT:
 * No hace falta agregar el header `Authorization: Bearer ...` acá a mano,
 * porque `jwtInterceptor` (en `core/interceptors/jwt.interceptor.ts`) se encarga
 * de inyectarlo automáticamente en todas las peticiones si el usuario inició sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  // Lista en memoria para el modo de prueba (cuando el backend está apagado)
  private productosMock: Producto[] = [
    {
      id: 1,
      nombre: 'Teclado Mecánico RGB',
      descripcion: 'Teclado mecánico switches red, formato TKL en español',
      costo: 32000,
      precio: 48500,
      categoria: 1,
      ultimaModificacion: '2026-10-20T14:30:00'
    },
    {
      id: 2,
      nombre: 'Mouse Inalámbrico Gamer',
      descripcion: 'Sensor óptico 16000 DPI con batería recargable USB-C',
      costo: 21000,
      precio: 34900,
      categoria: 1,
      ultimaModificacion: '2026-10-21T09:15:00'
    },
    {
      id: 3,
      nombre: 'Monitor IPS 24 Pulgadas',
      descripcion: 'Monitor Full HD 1920x1080 a 75Hz con bordes ultradelgados',
      costo: 145000,
      precio: 210000,
      categoria: 2,
      ultimaModificacion: '2026-10-22T18:45:00'
    }
  ];

  /**
   * Realiza una petición HTTP GET al backend para traer todos los productos.
   */
  obtenerProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.apiUrl);
  }

  /**
   * Realiza una petición HTTP POST al backend enviando un nuevo producto en formato JSON.
   */
  crearProducto(nuevoProducto: Producto): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, nuevoProducto);
  }

  /**
   * Datos de prueba (Mock) cuando el backend de Spring Boot todavía no está levantado.
   */
  obtenerProductosDePrueba(): Observable<Producto[]> {
    return of([...this.productosMock]);
  }

  /**
   * Simula el guardado de un producto en memoria cuando se usa el modo de prueba sin backend.
   */
  crearProductoDePrueba(nuevoProducto: Producto): Observable<Producto> {
    const proximoId =
      this.productosMock.length > 0
        ? Math.max(...this.productosMock.map((p) => p.id ?? 0)) + 1
        : 1;

    const productoGuardado: Producto = {
      ...nuevoProducto,
      id: proximoId,
      ultimaModificacion: new Date().toISOString()
    };

    this.productosMock.push(productoGuardado);
    return of(productoGuardado);
  }
}
