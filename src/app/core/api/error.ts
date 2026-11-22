import { HttpErrorResponse } from '@angular/common/http';

export function mensajeApi(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'No se pudo conectar con el servidor. Revisá que la API esté iniciada.';
    if (error.status === 401) return 'Tu sesión venció o necesitás iniciar sesión.';
    if (error.status === 403) return 'No tenés permiso para realizar esta acción.';
    const detalle = error.error;
    if (typeof detalle === 'string' && detalle.trim()) return detalle;
    if (detalle && typeof detalle === 'object') {
      const mensaje = detalle.message ?? detalle.mensaje ?? detalle.error;
      if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;
    }
    return `Error ${error.status}: no se pudo completar la operación.`;
  }
  return 'Ocurrió un error inesperado.';
}
