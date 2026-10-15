import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, switchMap } from 'rxjs';

export interface Producto { id: number; nombre: string; tipo: string; temperaturaMinima: number; temperaturaMaxima: number; vidaUtilDias: number; }
export interface Lote { id: number; codigo: string; fechaVencimiento: string; estado: string; producto: Producto; }
export interface Temperatura { id: number; temperatura: number; fechaRegistro: string; ubicacion?: string; lote?: Lote; }
export interface Operacion { id?: number; manifiesto: string; loteId?: number; transportista: string; tipoProducto: string; controlesConfirmados: string[]; inspector: string; firma?: string; evidencia?: string; fechaRegistro?: string; estado?: string; }
export interface RecepcionData { temperatura: number; logger?: string; sello?: boolean; dano?: boolean; firma?: string; }
export interface NuevoLote { codigo: string; fechaVencimiento: string; estado: string; producto: { id: number }; }
export interface NuevaTemperatura { temperatura: number; ubicacion?: string; }

@Injectable({ providedIn: 'root' })
export class ColdtraceApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';
  productos(): Observable<Producto[]> { return this.http.get<Producto[]>(`${this.base}/productos`); }
  registrarProducto(data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.post<Producto>(`${this.base}/productos`, data); }
  actualizarProducto(id: number, data: Omit<Producto, 'id'>): Observable<Producto> { return this.http.put<Producto>(`${this.base}/productos/${id}`, data); }
  eliminarProducto(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/productos/${id}`); }
  lotes(): Observable<Lote[]> { return this.http.get<Lote[]>(`${this.base}/lotes`); }
  registrarLote(data: NuevoLote): Observable<Lote> { return this.http.post<Lote>(`${this.base}/lotes`, data); }
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
