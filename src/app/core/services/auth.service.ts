import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

/**
 * Servicio encargado de la Autenticación contra Spring Security (JWT).
 * Maneja el login, el guardado del token en `localStorage` y el cierre de sesión.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);

  // Endpoint de login en Spring Boot (ajustar si en tu Controller es /api/v1/auth/login)
  private readonly authUrl = `${environment.apiUrl}/auth/login`;

  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'usuario_email';

  // Signal reactivo para que la barra de navegación sepa en todo momento si hay sesión activa
  estaAutenticado = signal<boolean>(this.tieneTokenGuardado());
  usuarioActual = signal<string | null>(localStorage.getItem(this.USER_KEY));

  /**
   * Envía las credenciales al backend (POST /auth/login).
   * Cuando Spring Boot responde con el JWT, el operador `tap` lo guarda en localStorage.
   */
  login(credenciales: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(this.authUrl, credenciales).pipe(
      tap((respuesta) => {
        this.guardarSesion(respuesta.token, credenciales.email);
      })
    );
  }

  /**
   * Simula un login exitoso generando un JWT de prueba en localStorage.
   * Ideal para que los alumnos verifiquen en las DevTools (F12 -> Network -> Headers)
   * cómo el `jwtInterceptor` agrega automáticamente `Authorization: Bearer ...` en cada petición.
   */
  loginDePrueba(email: string = 'alumno@tercero.edu.ar'): Observable<LoginResponse> {
    const tokenSimulado =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHVtbm9AdGVyY2Vyby5lZHUuYXIiLCJyb2wiOiJBRE1JTiJ9.FirmaSimuladaParaClase';

    const respuestaMock: LoginResponse = {
      token: tokenSimulado,
      email,
      rol: 'ADMIN'
    };

    this.guardarSesion(respuestaMock.token, email);
    return of(respuestaMock);
  }

  /**
   * Elimina el token de localStorage para cerrar la sesión.
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.estaAutenticado.set(false);
    this.usuarioActual.set(null);
  }

  /**
   * Devuelve el token JWT actual guardado en el navegador (o null si no inició sesión).
   */
  obtenerToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private guardarSesion(token: string, email: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, email);
    this.estaAutenticado.set(true);
    this.usuarioActual.set(email);
  }

  private tieneTokenGuardado(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }
}
