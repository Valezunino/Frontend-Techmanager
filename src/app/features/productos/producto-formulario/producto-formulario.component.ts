import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Producto } from '../../../core/models/producto.model';
import { Categoria } from '../../../core/models/categoria.model';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-producto-formulario',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './producto-formulario.component.html',
  styleUrl: './producto-formulario.component.css'
})
export class ProductoFormularioComponent implements OnInit {
  private readonly productoService = inject(ProductoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly router = inject(Router);

  readonly endpointPostUrl = `${environment.apiUrl}/productos`;

  // Lista de categorías para poblar el desplegable <select>
  categorias = signal<Categoria[]>([]);
  usandoCategoriasDePrueba = signal<boolean>(false);

  // Estados de envío del formulario
  guardando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);

  // Objeto vinculado al formulario mediante [(ngModel)] (Two-Way Data Binding)
  nuevoProducto: Producto = {
    nombre: '',
    descripcion: '',
    costo: 0,
    precio: 0,
    categoria: 1,
    ultimaModificacion: ''
  };

  ngOnInit(): void {
    this.cargarCategorias();
  }

  /**
   * Busca las categorías en la API para llenar el <select>.
   * Si el backend está apagado, carga las de prueba para que el alumno pueda probar el formulario.
   */
  cargarCategorias(): void {
    this.categoriaService.obtenerCategorias().subscribe({
      next: (datos) => {
        this.categorias.set(datos);
        this.usandoCategoriasDePrueba.set(false);
        if (datos.length > 0) {
          this.nuevoProducto.categoria = datos[0].id;
        }
      },
      error: () => {
        this.categoriaService.obtenerCategoriasDePrueba().subscribe((mock) => {
          this.categorias.set(mock);
          this.usandoCategoriasDePrueba.set(true);
          if (mock.length > 0) {
            this.nuevoProducto.categoria = mock[0].id;
          }
        });
      }
    });
  }

  /**
   * Envía el producto al backend mediante HTTP POST (http://localhost:8000/productos)
   */
  guardarProducto(): void {
    this.guardando.set(true);
    this.mensajeError.set(null);

    this.nuevoProducto.ultimaModificacion = new Date().toISOString().slice(0, 19);

    this.productoService.crearProducto(this.nuevoProducto).subscribe({
      next: () => {
        this.guardando.set(false);
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error('Error al hacer POST del producto:', err);
        this.guardando.set(false);
        this.mensajeError.set(
          `No se pudo enviar el producto a ${this.endpointPostUrl}. ` +
          `Verificá que el backend tenga el método @PostMapping en /productos o probá guardarlo en modo de prueba.`
        );
      }
    });
  }

  /**
   * Permite simular el guardado en memoria cuando el backend todavía no está levantado
   */
  guardarEnModoPrueba(): void {
    this.productoService.crearProductoDePrueba(this.nuevoProducto).subscribe({
      next: () => {
        this.router.navigate(['/productos']);
      }
    });
  }
}
