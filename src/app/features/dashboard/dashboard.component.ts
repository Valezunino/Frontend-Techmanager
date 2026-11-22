import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProductoService, CategoriaService, MarcaService } from '../../core/inventario/inventario.service';
import { Producto } from '../../core/inventario/inventario.model';
import { mensajeApi } from '../../core/api/error';

@Component({ selector: 'app-dashboard', standalone: true, imports: [RouterLink], templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  private readonly productosApi = inject(ProductoService);
  private readonly categoriasApi = inject(CategoriaService);
  private readonly marcasApi = inject(MarcaService);
  readonly productos = signal<Producto[]>([]);
  readonly categorias = signal(0);
  readonly marcas = signal(0);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly total = computed(() => this.productos().length);
  readonly sinStock = computed(() => this.productos().filter(p => p.activo && p.stock === 0).length);
  readonly stockBajo = computed(() => this.productos().filter(p => p.activo && p.stock > 0 && p.stock <= 5).length);
  readonly valor = computed(() => this.productos().reduce((acc, p) => acc + p.precioCompra * p.stock, 0));
  readonly alertas = computed(() => this.productos().filter(p => p.activo && p.stock <= 5).sort((a,b)=>a.stock-b.stock).slice(0,6));
  readonly recientes = computed(() => [...this.productos()].sort((a,b)=>b.id-a.id).slice(0,5));
  ngOnInit() { this.cargar(); }
  cargar() {
    this.cargando.set(true); this.error.set('');
    forkJoin({ productos: this.productosApi.listar(), categorias: this.categoriasApi.listar(), marcas: this.marcasApi.listar() }).subscribe({
      next: data => { this.productos.set(data.productos); this.categorias.set(data.categorias.length); this.marcas.set(data.marcas.length); this.cargando.set(false); },
      error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); }
    });
  }
}
