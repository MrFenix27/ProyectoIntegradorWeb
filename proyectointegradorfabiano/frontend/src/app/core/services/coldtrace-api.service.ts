import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Lote,
  NuevaTemperatura,
  NuevoLote,
  Operacion,
  Producto,
  RecepcionData,
  Temperatura,
} from '../../shared/models/domain.models';

@Injectable({ providedIn: 'root' })
export class ColdtraceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/api`;
  productos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${this.base}/productos`); }
  buscarProducto(id: number): Observable<Producto> { return this.http.get<Producto>(`${this.base}/productos/${id}`); }
  registrarProducto(data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.post<Producto>(`${this.base}/productos`, data); }
  actualizarProducto(id: number, data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.put<Producto>(`${this.base}/productos/${id}`, data); }
  eliminarProducto(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/productos/${id}`); }
  lotes(): Observable<Lote[]> { return this.http.get<Lote[]>(`${this.base}/lotes`); }
  registrarLote(data: NuevoLote): Observable<Lote> { return this.http.post<Lote>(`${this.base}/lotes`, data); }
  actualizarLote(id: number, data: NuevoLote): Observable<Lote> { return this.http.put<Lote>(`${this.base}/lotes/${id}`, data); }
  eliminarLote(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/lotes/${id}`); }
  temperaturas(id: number): Observable<Temperatura[]> { return this.http.get<Temperatura[]>(`${this.base}/lotes/${id}/temperaturas`); }
  registrarTemperatura(loteId: number, data: NuevaTemperatura): Observable<Temperatura> { return this.http.post<Temperatura>(`${this.base}/lotes/${loteId}/temperaturas`, data); }
  operaciones(): Observable<Operacion[]> { return this.http.get<Operacion[]>(`${this.base}/operaciones`); }
  registrarOperacion(data: Operacion): Observable<Operacion> { return this.http.post<Operacion>(`${this.base}/operaciones`, data); }
  operacionesEnTransito(): Observable<Operacion[]> { return this.http.get<Operacion[]>(`${this.base}/operaciones/en-transito`); }
  registrarRecepcion(id: number, data: RecepcionData): Observable<Operacion> { return this.http.put<Operacion>(`${this.base}/operaciones/${id}/recepcion`, data); }
  resumen(): Observable<{ lotes: Lote[]; temperaturas: Temperatura[] }> {
    return this.lotes().pipe(switchMap(lotes => lotes.length ? forkJoin(lotes.map(l => this.temperaturas(l.id))).pipe(map(values => ({ lotes, temperaturas: values.flat() }))) : of({ lotes, temperaturas: [] })));
  }
}
