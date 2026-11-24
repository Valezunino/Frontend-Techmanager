import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { ProductoService, CategoriaService, MarcaService } from '../../core/inventario/inventario.service';
import { Categoria, Marca } from '../../core/inventario/inventario.model';
import { mensajeApi } from '../../core/api/error';

@Component({ selector: 'app-producto-formulario', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './producto-formulario.component.html' })
export class ProductoFormularioComponent implements OnInit {
  private readonly productos = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly marcasApi = inject(MarcaService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly categorias = signal<Categoria[]>([]);
  readonly marcas = signal<Marca[]>([]);
  readonly id = signal<number | null>(null);
  nombre = ''; descripcion = ''; precioCompra = 0; precioVenta = 0; stock = 0; categoriaId = 0; marcaId = 0; activo = true;

  ngOnInit() {
    const valor = Number(this.route.snapshot.paramMap.get('id'));
    if (valor > 0 && Number.isInteger(valor)) this.id.set(valor);
    forkJoin({
      categorias: this.categoriasApi.listar(),
      marcas: this.marcasApi.listar(),
      producto: this.id() !== null ? this.productos.buscar(this.id()!) : of(null)
    }).subscribe({
      next: datos => {
        this.categorias.set(datos.categorias); this.marcas.set(datos.marcas);
        this.categoriaId = datos.producto?.categoria?.id ?? datos.categorias[0]?.id ?? 0;
        this.marcaId = datos.producto?.marca?.id ?? datos.marcas[0]?.id ?? 0;
        if (datos.producto) {
          this.nombre = datos.producto.nombre; this.descripcion = datos.producto.descripcion ?? '';
          this.precioCompra = datos.producto.precioCompra; this.precioVenta = datos.producto.precioVenta;
          this.stock = datos.producto.stock; this.activo = datos.producto.activo;
        }
        this.cargando.set(false);
      },
      error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); }
    });
  }
  guardar() {
    if (this.guardando()) return;
    this.error.set('');
    if (!this.categoriaId || !this.marcaId) { this.error.set('Primero tenés que crear al menos una categoría y una marca.'); return; }
    if (!Number.isInteger(this.stock) || this.stock < 0 || this.precioCompra < 0 || this.precioVenta < 0) { this.error.set('Revisá los precios y el stock.'); return; }
    const data = { nombre: this.nombre.trim(), descripcion: this.descripcion.trim(), precioCompra: Number(this.precioCompra), precioVenta: Number(this.precioVenta), stock: Number(this.stock), categoria: { id: Number(this.categoriaId) }, marca: { id: Number(this.marcaId) }, activo: this.activo };
    this.guardando.set(true);
    const peticion = this.id() === null ? this.productos.crear(data) : this.productos.actualizar(this.id()!, data);
    peticion.subscribe({
      next: () => { this.guardando.set(false); this.router.navigateByUrl('/productos'); },
      error: e => { this.guardando.set(false); this.error.set(mensajeApi(e)); }
    });
  }
}
