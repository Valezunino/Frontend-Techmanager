import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor funcional para Spring Security (JWT).
 *
 * ¿Qué hace este archivo?
 * Intercepta automáticamente TODAS las peticiones HTTP que salen desde Angular hacia Spring Boot.
 * Si encuentra un token JWT guardado en `localStorage`, clona la petición y le agrega
 * la cabecera `Authorization: Bearer <token>` antes de enviarla.
 *
 * Así no tenés que agregar los headers a mano en cada servicio (ProductoService, CategoriaService, etc.).
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }

  return next(req);
};
