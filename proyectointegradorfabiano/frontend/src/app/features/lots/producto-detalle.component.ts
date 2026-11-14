import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ColdtraceApiService } from '../../core/services/coldtrace-api.service';
import { ColdtraceStoreService } from '../../core/services/coldtrace-store.service';
import { Lote, Producto, Temperatura } from '../../shared/models/domain.models';

/**
 * Vista de detalle de un producto: GET /api/productos/:id
 * Muestra la ficha del producto y los lotes/lecturas asociados
 * (relación Producto 1—N Lote 1—N RegistroTemperatura).
 */
@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="title-row">
      <div>
        <h1>Detalle de producto</h1>
        <p>Ficha del producto y trazabilidad de sus lotes asociados.</p>
      </div>
      <div class="button-row">
        <a routerLink="/lotes">← Volver a lotes</a>
        <button type="button" (click)="recargar()">Actualizar</button>
      </div>
    </div>

    <p class="form-message error" *ngIf="error()">{{ error() }}</p>
    <p class="form-message" *ngIf="cargando() && !error()">Cargando producto #{{ productoId() }}...</p>

    <div class="trace-grid" *ngIf="producto() as p">
      <section class="panel recent">
        <header>
          <h2>Lotes del producto</h2>
          <span>{{ lotes().length }} lote(s) · {{ lecturas() }} lectura(s)</span>
        </header>
        <div class="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID DE LOTE</th>
                <th>CÓDIGO</th>
                <th class="right">TEMPERATURA</th>
                <th>ESTADO</th>
                <th>VENCIMIENTO</th>
                <th>ÚLTIMA LECTURA</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let lote of lotes()" [class.row-danger]="fueraDeRango(lote)">
                <td class="blue">{{ lote.id }}</td>
                <td>{{ lote.codigo }}</td>
                <td class="right">{{ temperatura(lote) }}°C</td>
                <td>
                  <span
                    class="status"
                    [class.badge-danger]="fueraDeRango(lote)"
                    [class.badge-warning]="sinLectura(lote)"
                  >{{ estado(lote) }}</span>
                </td>
                <td>{{ lote.fechaVencimiento }}</td>
                <td>{{ fecha(lectura(lote)) }}</td>
              </tr>
              <tr *ngIf="!lotes().length">
                <td colspan="6" class="empty">Este producto todavía no tiene lotes asociados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <aside>
        <article class="panel manifest">
          <h2>Datos del producto</h2>
          <p>ID <b>{{ p.id }}</b></p>
          <p>Nombre <b>{{ p.nombre }}</b></p>
          <p>Tipo <b>{{ p.tipo }}</b></p>
          <p>Rango permitido <b>{{ p.temperaturaMinima }}°C a {{ p.temperaturaMaxima }}°C</b></p>
          <p>Vida útil <b>{{ p.vidaUtilDias }} días</b></p>
        </article>
        <article class="panel current-status">
          <label>CUMPLIMIENTO TÉRMICO</label>
          <strong>{{ cumplimiento() }}%</strong>
          <p>Lecturas en rango <b>{{ lecturas() - excursiones() }}</b></p>
          <p>Excursiones <b>{{ excursiones() }}</b></p>
          <p>Lotes asociados <b>{{ lotes().length }}</b></p>
        </article>
      </aside>
    </div>
  `,
})
export class ProductoDetalleComponent implements OnInit {
  private readonly api = inject(ColdtraceApiService);
  private readonly store = inject(ColdtraceStoreService);
  private readonly route = inject(ActivatedRoute);

  readonly productoId = signal(0);
  readonly producto = signal<Producto | undefined>(undefined);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly lecturasMap = this.store.lecturas;
  readonly lotes = computed(() =>
    this.store.lotes().filter((lote) => lote.producto?.id === this.productoId())
  );

  readonly lecturas = computed(() =>
    this.lotes().reduce((total, lote) => total + this.registros(lote).length, 0)
  );

  readonly excursiones = computed(() =>
    this.lotes().reduce(
      (total, lote) => total + this.registros(lote).filter((r) => this.registroFueraDeRango(r)).length,
      0
    )
  );

  readonly cumplimiento = computed(() => {
    const lecturas = this.lecturas();
    if (!lecturas) return 0;
    return Math.round(((lecturas - this.excursiones()) / lecturas) * 100);
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id <= 0) {
      this.error.set('El identificador del producto no es válido.');
      this.cargando.set(false);
      return;
    }
    this.productoId.set(id);
    this.cargarProducto();
  }

  recargar(): void {
    this.cargarProducto();
    this.store.recargar();
  }

  private cargarProducto(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.buscarProducto(this.productoId()).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.cargando.set(false);
      },
      error: (err) => {
        this.producto.set(undefined);
        this.cargando.set(false);
        this.error.set(
          err?.status === 404
            ? `No existe un producto con ID ${this.productoId()}.`
            : err?.error?.message ?? 'No se pudo cargar el producto desde la API.'
        );
      },
    });
  }

  registros(lote: Lote): Temperatura[] {
    return this.lecturasMap().get(lote.id) ?? [];
  }

  lectura(lote: Lote): Temperatura | undefined {
    return this.registros(lote)[0];
  }

  temperatura(lote: Lote): string {
    return this.lectura(lote)?.temperatura?.toFixed(1) ?? '--';
  }

  fecha(registro?: Temperatura): string {
    if (!registro?.fechaRegistro) return 'Sin lectura';
    return registro.fechaRegistro.slice(0, 16).replace('T', ' ');
  }

  sinLectura(lote: Lote): boolean {
    return !this.lectura(lote);
  }

  fueraDeRango(lote: Lote): boolean {
    const valor = this.lectura(lote)?.temperatura;
    if (valor === undefined || !this.producto()) return false;
    return this.registroFueraDeRango(this.lectura(lote)!);
  }

  estado(lote: Lote): string {
    if (this.sinLectura(lote)) return 'Sin lectura';
    return this.fueraDeRango(lote) ? 'Crítico' : 'En rango';
  }

  private registroFueraDeRango(registro: Temperatura): boolean {
    const producto = this.producto();
    if (!producto) return false;
    return (
      registro.temperatura < producto.temperaturaMinima || registro.temperatura > producto.temperaturaMaxima
    );
  }
}
