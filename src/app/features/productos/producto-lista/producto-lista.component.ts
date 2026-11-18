import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-producto-lista',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './producto-lista.component.html',
  styleUrl: './producto-lista.component.css'
})
export class ProductoListaComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  readonly authService = inject(AuthService);

  // Estado del componente usando Signals (reactividad moderna de Angular)
  productos = signal<Producto[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  usandoDatosDePrueba = signal<boolean>(false);

  // Guardamos las URLs a las que intentamos conectarnos para mostrarlas en pantalla
  readonly endpointProductosUrl = `${environment.apiUrl}/productos`;
  readonly endpointCategoriasUrl = `${environment.apiUrl}/categorias`;

  ngOnInit(): void {
    this.cargarDatosDesdeApi();
  }

  /**
   * Consulta las categorías y los productos en el backend de Spring Boot (localhost:8000).
   * Si hay un token JWT guardado en localStorage, `jwtInterceptor` lo adjunta automáticamente.
   */
  cargarDatosDesdeApi(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);
    this.usandoDatosDePrueba.set(false);

    // 1. Buscamos las categorías para poder traducir el ID de categoría a su nombre
    this.categoriaService.obtenerCategorias().subscribe({
      next: (listaCategorias) => {
        this.categorias.set(listaCategorias);
      },
      error: () => {
        this.categorias.set([]);
      }
    });

    // 2. Buscamos la lista de productos
    this.productoService.obtenerProductos().subscribe({
      next: (datosRecibidos) => {
        this.productos.set(datosRecibidos);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al conectar con la API de Spring Boot:', err);
        this.productos.set([]);
        this.cargando.set(false);
        this.mensajeError.set(
          `No se pudo conectar con el servidor en ${this.endpointProductosUrl}. ` +
          `Verificá que el backend de Spring Boot esté corriendo en el puerto 8000, que tenga habilitado CORS (o uses el proxy) y que tengas sesión JWT si el endpoint está protegido.`
        );
      }
    });
  }

  /**
   * Permite a los alumnos ver cómo queda la tabla con productos y categorías simulados
   * mientras todavía no levantaron el backend.
   */
  cargarDatosDePrueba(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.categoriaService.obtenerCategoriasDePrueba().subscribe({
      next: (categoriasMock) => this.categorias.set(categoriasMock)
    });

    this.productoService.obtenerProductosDePrueba().subscribe({
      next: (productosMock) => {
        this.productos.set(productosMock);
        this.usandoDatosDePrueba.set(true);
        this.cargando.set(false);
      }
    });
  }

  /**
   * Dado el ID numérico de la categoría guardado en el producto,
   * busca su nombre en la lista de categorías cargadas.
   */
  obtenerNombreCategoria(idCategoria: number): string {
    const encontrada = this.categorias().find((cat) => cat.id === idCategoria);
    return encontrada ? `${encontrada.nombre} (#${idCategoria})` : `ID #${idCategoria}`;
  }
}
