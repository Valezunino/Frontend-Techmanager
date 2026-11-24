import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { UsuarioService } from '../../core/usuarios/usuario.service';
import { Rol, Usuario } from '../../core/usuarios/usuario.model';
import { mensajeApi } from '../../core/api/error';
import { AuthService } from '../../core/auth/auth.service';

@Component({ selector: 'app-usuarios', standalone: true, imports: [FormsModule], templateUrl: './usuarios.component.html' })
export class UsuariosComponent implements OnInit {
  private readonly api = inject(UsuarioService);
  readonly auth = inject(AuthService);
  readonly usuarios = signal<Usuario[]>([]);
  readonly roles = signal<Rol[]>([]);
  readonly cargando = signal(false);
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly formulario = signal(false);
  readonly editando = signal<number | null>(null);
  nombre = ''; email = ''; password = ''; rolId = 0; activo = true;

  ngOnInit() { this.cargar(); }
  cargar() {
    this.cargando.set(true); this.error.set('');
    forkJoin({ usuarios: this.api.listar(), roles: this.api.roles() }).subscribe({
      next: ({ usuarios, roles }) => { this.usuarios.set(usuarios); this.roles.set(roles); this.cargando.set(false); },
      error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); }
    });
  }
  nuevo() {
    this.editando.set(null); this.nombre = ''; this.email = ''; this.password = '';
    this.rolId = this.roles()[0]?.id ?? 0; this.activo = true; this.formulario.set(true); this.error.set(''); this.exito.set('');
  }
  editar(usuario: Usuario) {
    this.editando.set(usuario.id); this.nombre = usuario.nombre; this.email = usuario.email;
    this.password = ''; this.rolId = usuario.rol?.id ?? 0; this.activo = usuario.activo;
    this.formulario.set(true); this.error.set(''); this.exito.set('');
  }
  guardar() {
    if (!this.nombre.trim() || !this.email.trim() || !this.rolId) return;
    if (this.password && this.password.length < 8) { this.error.set('La contraseña debe tener al menos 8 caracteres.'); return; }
    if (this.editando() === null && this.password.length < 8) { this.error.set('Ingresá una contraseña de al menos 8 caracteres.'); return; }
    this.guardando.set(true); this.error.set('');
    const datos = { nombre: this.nombre.trim(), email: this.email.trim(), rol: { id: Number(this.rolId) }, activo: this.activo,
      ...(this.password ? { password: this.password } : {}) };
    const peticion = this.editando() === null ? this.api.crear(datos) : this.api.actualizar(this.editando()!, datos);
    peticion.subscribe({
      next: () => { this.guardando.set(false); this.formulario.set(false); this.exito.set('Usuario guardado correctamente.'); this.cargar(); },
      error: e => { this.guardando.set(false); this.error.set(mensajeApi(e)); }
    });
  }
  eliminar(u: Usuario) {
    if (u.email.toLowerCase() === this.auth.sesion()?.email?.toLowerCase()) { this.error.set('No podés eliminar tu propio usuario desde esta pantalla.'); return; }
    if (!confirm(`¿Eliminar al usuario «${u.nombre}»?`)) return;
    this.api.eliminar(u.id).subscribe({ next: () => { this.exito.set('Usuario eliminado.'); this.cargar(); }, error: e => this.error.set(mensajeApi(e)) });
  }
}
