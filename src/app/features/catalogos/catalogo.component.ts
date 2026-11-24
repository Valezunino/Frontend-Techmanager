import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaService, MarcaService } from '../../core/inventario/inventario.service';
import { mensajeApi } from '../../core/api/error';

interface CatalogoItem { id: number; nombre: string; }
@Component({ selector: 'app-catalogo', standalone: true, imports: [FormsModule], templateUrl: './catalogo.component.html' })
export class CatalogoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriaApi = inject(CategoriaService);
  private readonly marcaApi = inject(MarcaService);
  readonly tipo = signal<'categorias' | 'marcas'>('categorias');
  readonly items = signal<CatalogoItem[]>([]);
  readonly cargando = signal(false); readonly guardando = signal(false);
  readonly error = signal(''); readonly exito = signal('');
  readonly editando = signal<number | null>(null);
  nombre = '';
  readonly titulo = () => this.tipo() === 'categorias' ? 'Categorías' : 'Marcas';
  readonly singular = () => this.tipo() === 'categorias' ? 'categoría' : 'marca';
  ngOnInit() {
    this.route.data.subscribe(d => {
      this.tipo.set(d['tipo'] === 'marcas' ? 'marcas' : 'categorias');
      this.nombre = ''; this.editando.set(null); this.error.set(''); this.exito.set(''); this.cargar();
    });
  }
  cargar() {
    this.cargando.set(true); this.error.set('');
    const peticion = this.tipo() === 'categorias' ? this.categoriaApi.listar() : this.marcaApi.listar();
    peticion.subscribe({ next: datos => { this.items.set(datos); this.cargando.set(false); }, error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); } });
  }
  editar(item: CatalogoItem) { this.editando.set(item.id); this.nombre = item.nombre; this.exito.set(''); }
  cancelar() { this.editando.set(null); this.nombre = ''; }
  guardar() {
    const nombre = this.nombre.trim(); if (!nombre || this.guardando()) return;
    this.guardando.set(true); this.error.set(''); this.exito.set('');
    const id = this.editando();
    const peticion = this.tipo() === 'categorias'
      ? (id === null ? this.categoriaApi.crear(nombre) : this.categoriaApi.actualizar(id, nombre))
      : (id === null ? this.marcaApi.crear(nombre) : this.marcaApi.actualizar(id, nombre));
    peticion.subscribe({ next: () => { this.guardando.set(false); this.exito.set(`Se guardó la ${this.singular()}.`); this.cancelar(); this.cargar(); }, error: e => { this.guardando.set(false); this.error.set(mensajeApi(e)); } });
  }
  eliminar(item: CatalogoItem) {
    if (!confirm(`¿Eliminar ${item.nombre}? No debe tener productos asociados.`)) return;
    const peticion = this.tipo() === 'categorias' ? this.categoriaApi.eliminar(item.id) : this.marcaApi.eliminar(item.id);
    peticion.subscribe({ next: () => { this.exito.set('Registro eliminado.'); this.cargar(); }, error: e => this.error.set(mensajeApi(e)) });
  }
}
