import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { mensajeApi } from '../../core/api/error';

@Component({ selector: 'app-login', standalone: true, imports: [FormsModule], templateUrl: './login.component.html' })
export class LoginComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly cargando = signal(false);
  readonly comprobando = signal(true);
  readonly esPrimerIngreso = signal(false);
  readonly error = signal('');
  nombre = ''; email = ''; password = '';

  ngOnInit() {
    if (this.auth.autenticado()) { this.router.navigateByUrl('/dashboard'); return; }
    this.auth.requiereAdministrador().subscribe({
      next: r => { this.esPrimerIngreso.set(r.requiereAdministrador); this.comprobando.set(false); },
      error: e => { this.error.set(mensajeApi(e)); this.comprobando.set(false); }
    });
  }

  ingresar() {
    if (this.cargando()) return;
    this.error.set('');
    this.cargando.set(true);
    const peticion = this.esPrimerIngreso()
      ? this.auth.crearAdministrador(this.nombre.trim(), this.email.trim(), this.password)
      : this.auth.login(this.email.trim(), this.password);
    peticion.subscribe({
      next: () => { this.cargando.set(false); this.router.navigateByUrl('/dashboard'); },
      error: e => { this.error.set(mensajeApi(e)); this.cargando.set(false); }
    });
  }
}
