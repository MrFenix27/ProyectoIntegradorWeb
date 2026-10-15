import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { ColdtraceApiService, Lote, Operacion, Producto, Temperatura } from './coldtrace-api.service';

/**
 * Estado global de la aplicación. Carga los registros al arrancar y los
 * distribuye a todas las vistas. Cualquier cambio (agregar, editar, eliminar)
 * llama a recargar() y todas las vistas se actualizan al instante, sin polling.
 */
@Injectable({ providedIn: 'root' })
export class ColdtraceStoreService {
  private readonly api = inject(ColdtraceApiService);

  private readonly productosSubject = new BehaviorSubject<Producto[]>([]);
  private readonly lotesSubject = new BehaviorSubject<Lote[]>([]);
  private readonly operacionesSubject = new BehaviorSubject<Operacion[]>([]);
  private readonly lecturasSubject = new BehaviorSubject<Map<number, Temperatura[]>>(new Map());

  readonly productos = this.productosSubject.asObservable();
  readonly lotes = this.lotesSubject.asObservable();
  readonly operaciones = this.operacionesSubject.asObservable();
  readonly lecturas = this.lecturasSubject.asObservable();

  constructor() {
    this.recargar();
  }

  recargar(): void {
    this.cargarProductos();
    this.cargarLotes();
    this.cargarOperaciones();
  }

  private cargarProductos(): void {
    this.api.productos().subscribe({
      next: productos => this.productosSubject.next(productos),
      error: () => setTimeout(() => this.cargarProductos(), 1500)
    });
  }

  private cargarLotes(): void {
    this.api.lotes().subscribe({
      next: lotes => {
        this.lotesSubject.next(lotes);
        this.cargarLecturas(lotes);
      },
      error: () => setTimeout(() => this.cargarLotes(), 1500)
    });
  }

  private cargarLecturas(lotes: Lote[]): void {
    if (!lotes.length) {
      this.lecturasSubject.next(new Map());
      return;
    }
    forkJoin(lotes.map(lote => this.api.temperaturas(lote.id))).subscribe({
      next: valores => {
        const mapa = new Map<number, Temperatura[]>();
        lotes.forEach((lote, indice) => mapa.set(lote.id, valores[indice]));
        this.lecturasSubject.next(mapa);
      },
      error: () => setTimeout(() => this.cargarLecturas(lotes), 1500)
    });
  }

  private cargarOperaciones(): void {
    this.api.operaciones().subscribe({
      next: operaciones => this.operacionesSubject.next(operaciones),
      error: () => setTimeout(() => this.cargarOperaciones(), 1500)
    });
  }
}
