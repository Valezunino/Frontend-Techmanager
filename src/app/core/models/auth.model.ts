/**
 * Modelos para el flujo de Autenticación con Spring Security + JWT.
 *
 * IMPORTANTE PARA ADAPTAR A TU BACKEND:
 * - Si tu LoginRequestDTO en Java pide `dni` y `contrasena` (o `username` y `password`),
 *   ajustá los nombres de las propiedades en `LoginRequest`.
 * - Si tu AuthResponse en Java devuelve `accessToken` en lugar de `token`,
 *   ajustá la propiedad en `LoginResponse`.
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  rol?: string;
  email?: string;
}
