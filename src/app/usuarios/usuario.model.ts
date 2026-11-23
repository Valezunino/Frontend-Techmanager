export interface Rol { id: number; nombre: string; }
export interface Usuario { id: number; nombre: string; email: string; rol: Rol; activo: boolean; }
export interface UsuarioGuardar { nombre: string; email: string; rol: { id: number }; activo: boolean; password?: string; }
