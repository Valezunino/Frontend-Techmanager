export interface Categoria { id: number; nombre: string; }
export interface Marca { id: number; nombre: string; }
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  categoria: Categoria;
  marca: Marca;
  activo: boolean;
}
export interface ProductoGuardar {
  nombre: string;
  descripcion: string;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  categoria: { id: number };
  marca: { id: number };
  activo: boolean;
}
