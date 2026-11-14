import { Injectable, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ColdtraceApiService } from './coldtrace-api.service';
import { Lote, Operacion, Producto, Temperatura } from '../../shared/models/domain.models';

/**
 * Estado global de la aplicación basado en signals.
 *
 * Angular 22 usa change detection sin Zone.js (zoneless): solo las vistas que
 * leen un signal se marcan para refrescarse cuando su valor cambia. Por eso el
 * estado compartido se expone como signals de solo lectura.
 *
 * Cualquier cambio (agregar, editar, eliminar) llama a recargar() y todas las
 * vistas se actualizan al instante, sin polling.
 */
@Injectable({ providedIn: 'root' })
export class ColdtraceStoreService {
  private readonly api = inject(ColdtraceApiService);

  private readonly productosState = signal<Producto[]>([]);
  private readonly lotesState = signal<Lote[]>([]);
  private readonly operacionesState = signal<Operacion[]>([]);
  private readonly lecturasState = signal<Map<number, Temperatura[]>>(new Map());

  readonly productos = this.productosState.asReadonly();
  readonly lotes = this.lotesState.asReadonly();
  readonly operaciones = this.operacionesState.asReadonly();
  readonly lecturas = this.lecturasState.asReadonly();

  constructor() {
    this.recargar();
  }

  recargar(): void {
    this.cargarProductos();
    this.cargarLotes();
    this.cargarOperaciones();
  }

  /**
   * Reintenta solo cuando el fallo es de red o del servidor (5xx).
   * Un 401/403/404 no se resuelve reintentando: evita bucles infinitos
   * cuando el rol autenticado no tiene permiso sobre un endpoint.
   */
  private reintentar(carga: () => void, err: unknown): void {
    const status = (err as { status?: number } | null)?.status ?? 0;
    if (status >= 400 && status < 500) {
      return;
    }
    setTimeout(carga, 1500);
  }

  private cargarProductos(): void {
    this.api.productos().subscribe({
      next: (productos) => this.productosState.set(productos),
      error: (err) => this.reintentar(() => this.cargarProductos(), err),
    });
  }

  private cargarLotes(): void {
    this.api.lotes().subscribe({
      next: (lotes) => {
        this.lotesState.set(lotes);
        this.cargarLecturas(lotes);
      },
      error: (err) => this.reintentar(() => this.cargarLotes(), err),
    });
  }

  private cargarLecturas(lotes: Lote[]): void {
    if (!lotes.length) {
      this.lecturasState.set(new Map());
      return;
    }
    forkJoin(lotes.map((lote) => this.api.temperaturas(lote.id))).subscribe({
      next: (valores) => {
        const mapa = new Map<number, Temperatura[]>();
        lotes.forEach((lote, indice) => mapa.set(lote.id, valores[indice]));
        this.lecturasState.set(mapa);
      },
      error: (err) => this.reintentar(() => this.cargarLecturas(lotes), err),
    });
  }

  private cargarOperaciones(): void {
    this.api.operaciones().subscribe({
      next: (operaciones) => this.operacionesState.set(operaciones),
      error: (err) => this.reintentar(() => this.cargarOperaciones(), err),
    });
  }
}
