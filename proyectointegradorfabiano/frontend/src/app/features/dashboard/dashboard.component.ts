import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Lote, Temperatura } from '../../shared/models/domain.models';
import { ColdtraceStoreService } from '../../core/services/coldtrace-store.service';
import { UiStateService } from '../../core/services/ui-state.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="title-row">
      <div>
        <h1>Resumen ejecutivo</h1>
        <p>Monitoreo en tiempo real de la cadena de frío.</p>
      </div>
      <small class="auto-refresh">
        <span class="material-symbols-outlined">sync</span>Actualización instantánea
      </small>
    </div>

    <div class="kpis">
      <article>
        <label>LOTES REGISTRADOS</label>
        <strong>{{ lotes().length }}</strong>
        <small class="green">Datos de la API</small>
      </article>
      <article>
        <label>LECTURAS DE TEMPERATURA</label>
        <strong>{{ lecturas() }}</strong>
        <small class="green">Registros recibidos</small>
      </article>
      <article class="danger">
        <label>EXCURSIONES TÉRMICAS</label>
        <strong>{{ criticos() }}</strong>
        <small>Requieren atención</small>
      </article>
      <article>
        <label>LOTES EN RANGO</label>
        <strong>{{ enRango() }}</strong>
        <small class="green">Según última lectura</small>
      </article>
    </div>

    <div class="dashboard-grid">
      <section class="panel operational-summary">
        <header><h2>Resumen de monitoreo</h2></header>
        <div class="summary-content">
          <div>
            <span class="material-symbols-outlined">inventory_2</span>
            <p>Lotes controlados</p>
            <strong>{{ lotes().length }}</strong>
          </div>
          <div>
            <span class="material-symbols-outlined green-icon">check_circle</span>
            <p>Última lectura en rango</p>
            <strong>{{ enRango() }}</strong>
          </div>
          <div>
            <span class="material-symbols-outlined danger-icon">warning</span>
            <p>Requieren revisión</p>
            <strong>{{ criticos() }}</strong>
          </div>
          <small>Los indicadores se calculan con los registros almacenados en la API.</small>
        </div>
      </section>

      <section class="panel alerts" id="alerts">
        <header><h2>Alertas térmicas</h2><b>{{ criticos() }} activas</b></header>
        <article *ngFor="let lote of lotesCriticos()" class="alert-item">
          <span class="material-symbols-outlined">thermostat</span>
          <div>
            <strong>Lote {{ lote.codigo }}</strong>
            <p>Temperatura fuera del rango permitido</p>
            <small>{{ temperatura(lote) }}°C · {{ lote.producto.nombre }}</small>
          </div>
        </article>
        <p *ngIf="!lotesCriticos().length" class="empty-alert">No hay alertas térmicas activas.</p>
      </section>
    </div>

    <section class="panel recent">
      <header>
        <h2>Últimos lotes monitoreados</h2>
        <span *ngIf="filtro()">Filtrando por: "{{ filtro() }}"</span>
      </header>
      <table>
        <thead>
          <tr>
            <th>ID DE LOTE</th>
            <th>PRODUCTO</th>
            <th>UBICACIÓN</th>
            <th>ESTADO</th>
            <th class="right">TEMPERATURA</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let lote of lotesVisibles()">
            <td class="blue">{{ lote.codigo }}</td>
            <td>{{ lote.producto.nombre }}</td>
            <td>{{ lectura(lote)?.ubicacion || 'Sin ubicación' }}</td>
            <td>
              <span class="status" [class.badge-danger]="fueraDeRango(lote)">
                {{ fueraDeRango(lote) ? 'Crítico' : 'En rango' }}
              </span>
            </td>
            <td class="right">{{ temperatura(lote) }}°C</td>
          </tr>
          <tr *ngIf="!lotesVisibles().length">
            <td colspan="5" class="empty">No hay lotes que coincidan con la búsqueda.</td>
          </tr>
        </tbody>
      </table>
    </section>
  `,
})
export class DashboardComponent {
  private readonly store = inject(ColdtraceStoreService);
  private readonly ui = inject(UiStateService);

  readonly lotes = this.store.lotes;
  readonly lecturasMap = this.store.lecturas;
  readonly filtro = toSignal(this.ui.search$, { initialValue: '' });

  readonly lotesVisibles = computed(() => {
    const filtro = this.filtro();
    const lotes = this.lotes();
    if (!filtro) return lotes;
    return lotes.filter(
      (lote) =>
        lote.codigo.toLowerCase().includes(filtro) ||
        lote.producto.nombre.toLowerCase().includes(filtro) ||
        lote.producto.tipo.toLowerCase().includes(filtro) ||
        (this.lectura(lote)?.ubicacion ?? '').toLowerCase().includes(filtro)
    );
  });

  readonly criticos = computed(() => this.lotes().filter((lote) => this.fueraDeRango(lote)).length);
  readonly lotesCriticos = computed(() => this.lotes().filter((lote) => this.fueraDeRango(lote)));
  readonly enRango = computed(
    () => this.lotes().filter((lote) => this.lectura(lote) && !this.fueraDeRango(lote)).length
  );
  readonly lecturas = computed(() =>
    Array.from(this.lecturasMap().values()).reduce((total, registros) => total + registros.length, 0)
  );

  lectura(lote: Lote): Temperatura | undefined {
    return this.lecturasMap().get(lote.id)?.[0];
  }

  temperatura(lote: Lote): string {
    return this.lectura(lote)?.temperatura?.toFixed(1) ?? '--';
  }

  fueraDeRango(lote: Lote): boolean {
    const valor = this.lectura(lote)?.temperatura;
    return (
      valor !== undefined &&
      (valor < lote.producto.temperaturaMinima || valor > lote.producto.temperaturaMaxima)
    );
  }
}
