import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Rol, Usuario, UsuarioGuardar } from './usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/usuarios`;
  listar() { return this.http.get<Usuario[]>(this.url); }
  roles() { return this.http.get<Rol[]>(`${environment.apiUrl}/roles`); }
  crear(data: UsuarioGuardar) { return this.http.post<Usuario>(this.url, data); }
  actualizar(id: number, data: UsuarioGuardar) { return this.http.put<Usuario>(`${this.url}/${id}`, data); }
  eliminar(id: number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
