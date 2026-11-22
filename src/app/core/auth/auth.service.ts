import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Sesion {
  token: string;
  nombre: string;
  email: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly key = 'techmanager_sesion';
  readonly sesion = signal<Sesion | null>(this.leer());
  readonly autenticado = computed(() => !!this.sesion()?.token);
  readonly esAdmin = computed(() => this.sesion()?.rol?.toUpperCase() === 'ADMIN');

  private leer(): Sesion | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const data = JSON.parse(raw) as Sesion;
      return typeof data.token === 'string' && data.token ? data : null;
    } catch { return null; }
  }

  login(email: string, password: string) {
    return this.http.post<Sesion>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap(sesion => this.guardar(sesion)));
  }

  requiereAdministrador() {
    return this.http.get<{ requiereAdministrador: boolean }>(`${environment.apiUrl}/auth/bootstrap-status`);
  }

  crearAdministrador(nombre: string, email: string, password: string) {
    return this.http.post<Sesion>(`${environment.apiUrl}/auth/bootstrap`, { nombre, email, password })
      .pipe(tap(sesion => this.guardar(sesion)));
  }

  token(): string | null { return this.sesion()?.token ?? null; }
  private guardar(sesion: Sesion) {
    localStorage.setItem(this.key, JSON.stringify(sesion));
    this.sesion.set(sesion);
  }
  logout() { localStorage.removeItem(this.key); this.sesion.set(null); }
}
