import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../core/models/auth.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly endpointLoginUrl = `${environment.apiUrl}/auth/login`;

  credenciales: LoginRequest = {
    email: '',
    password: ''
  };

  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);

  /**
   * Envía las credenciales al endpoint POST /auth/login de Spring Boot.
   * Si las credenciales son válidas, AuthService guarda el token JWT en localStorage
   * y redirigimos al usuario al listado de productos.
   */
  iniciarSesion(): void {
    this.cargando.set(true);
    this.mensajeError.set(null);

    this.authService.login(this.credenciales).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/productos']);
      },
      error: (err) => {
        console.error('Error en login JWT:', err);
        this.cargando.set(false);
        this.mensajeError.set(
          `No se pudo autenticar contra ${this.endpointLoginUrl}. ` +
          `Verificá tus credenciales, que el backend esté corriendo, o usá el botón "Generar Token JWT de Prueba" abajo.`
        );
      }
    });
  }

  /**
   * Genera un token JWT de prueba en localStorage para que los alumnos puedan
   * comprobar en la pestaña Network (F12) cómo el `jwtInterceptor` adjunta
   * el header `Authorization: Bearer <token>` en cada petición HTTP.
   */
  iniciarSesionDePrueba(): void {
    const emailDemo = this.credenciales.email.trim() || 'alumno@tercero.edu.ar';
    this.authService.loginDePrueba(emailDemo).subscribe(() => {
      this.router.navigate(['/productos']);
    });
  }

  cerrarSesion(): void {
    this.authService.logout();
  }
}
