/**
 * Modelo (Interfaz) que representa un Producto tal como lo devuelve el JSON
 * de nuestro backend en Spring Boot.
 *
 * Los nombres de estas propiedades deben coincidir exactamente con los nombres
 * de los atributos en tu clase Entity o DTO de Java (Spring Boot).
 */
export interface Producto {
  id?: number;
  nombre: string;
  descripcion: string;
  costo: number;
  precio: number;
  categoria: number; // ID de la tabla categoria (Foreign Key)
  ultimaModificacion: string; // Fecha en formato ISO (ej: "2026-10-23T10:30:00")
}
