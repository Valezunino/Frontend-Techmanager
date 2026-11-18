import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  // No agregar el JWT a un dominio externo si cambia la configuración de la API.
  const esApi = req.url.startsWith(environment.apiUrl + '/');
  const request = token && esApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  return next(request).pipe(catchError((error: HttpErrorResponse) => {
    if (esApi && error.status === 401 && !req.url.includes('/auth/login')) {
      auth.logout();
      router.navigateByUrl('/login');
    }
    return throwError(() => error);
  }));
};
