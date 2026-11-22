import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/inventario/inventario.service';
import { Producto } from '../../core/inventario/inventario.model';
import { mensajeApi } from '../../core/api/error';

@Component({ selector: 'app-productos', standalone: true, imports: [RouterLink, FormsModule], templateUrl: './productos.component.html' })
export class ProductosComponent implements OnInit {
  private readonly api = inject(ProductoService);
  readonly productos = signal<Producto[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly busqueda = signal('');
  readonly filtro = signal('todos');
  readonly filtrados = computed(() => this.productos().filter(p => {
    const q = this.busqueda().trim().toLocaleLowerCase();
    const texto = `${p.nombre} ${p.marca?.nombre ?? ''} ${p.categoria?.nombre ?? ''}`.toLocaleLowerCase();
    return (!q || texto.includes(q)) && (this.filtro() === 'todos' || (this.filtro() === 'sin-stock' && p.stock === 0) || (this.filtro() === 'bajo' && p.stock > 0 && p.stock <= 5) || (this.filtro() === 'activos' && p.activo));
  }));
  ngOnInit() { this.cargar(); }
  cargar() {
    this.cargando.set(true); this.error.set('');
    this.api.listar().subscribe({
      next: productos => { this.productos.set(productos); this.cargando.set(false); },
      error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); }
    });
  }
  estado(p: Producto): string { return !p.activo ? 'Inactivo' : p.stock === 0 ? 'Sin stock' : p.stock <= 5 ? 'Stock bajo' : 'Disponible'; }
  eliminar(p: Producto) {
    if (!confirm(`¿Seguro que querés eliminar «${p.nombre}»?`)) return;
    this.api.eliminar(p.id).subscribe({
      next: () => { this.exito.set(`Se eliminó ${p.nombre}.`); this.cargar(); },
      error: e => this.error.set(mensajeApi(e))
    });
  }
}
