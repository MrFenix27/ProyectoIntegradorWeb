import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Lote, Operacion, Temperatura } from './coldtrace-api.service';
import { ColdtraceStoreService } from './coldtrace-store.service';

@Component({ selector: 'app-trace-report', standalone: true, imports: [CommonModule, FormsModule], template: `
<div class="title-row"><div><h1>Reporte de trazabilidad</h1><p>Historial del recorrido y telemetría del lote {{ lote?.codigo || '---' }}.</p></div><div class="button-row"><select [ngModel]="lote?.id" (ngModelChange)="seleccionar($event)"><option [ngValue]="null">Selecciona un lote en tránsito...</option><option *ngFor="let l of lotesEnTransito" [ngValue]="l.id">{{ l.codigo }} ({{ l.producto.nombre }})</option></select><button (click)="actualizarAhora()"><span class="material-symbols-outlined">refresh</span>Actualizar</button><button (click)="exportar()">Exportar reporte</button><button class="primary" (click)="verificarCumplimiento()">Verificar cumplimiento</button><small class="auto-refresh"><span class="material-symbols-outlined">sync</span>En vivo · cada 2 s</small></div></div>
<section class="panel journey"><header><h2>Línea de recorrido</h2><span class="status" [class.badge-success]="!ultimaFueraDeRango" [class.badge-danger]="ultimaFueraDeRango">{{ ultimaFueraDeRango ? '● En tránsito - CRÍTICO' : '● En tránsito - estable' }}</span></header><div class="journey-line"><article><b>Almacenamiento</b><strong>{{ primera?.temperatura ?? '--' }}°C</strong><small>{{ (primera?.fechaRegistro?.slice(0, 16) ?? '').replace('T', ' ') || 'Sin registro' }}</small></article><article><b>Despacho</b><strong>{{ despachoEstado }}</strong><small>{{ preenfriamientoVerificado ? 'Pre-enfriamiento verificado (< 8°C)' : 'Pre-enfriamiento fallido' }}</small></article><article class="current"><b>En tránsito</b><strong>{{ temperaturaTransito }}°C</strong><small>Lectura en vivo · cada 2 s</small></article><article class="future"><b>Distribución</b><strong>--.-°C</strong><small>Pendiente</small></article></div></section>
<section class="panel" *ngIf="mostrarCumplimiento"><header><h2>Verificación de cumplimiento</h2><span>{{ cumplimiento }}% en rango</span></header><div class="summary-content"><div><span class="material-symbols-outlined green-icon">check_circle</span><p>Lecturas en rango</p><strong>{{ enRango }}</strong></div><div><span class="material-symbols-outlined danger-icon">warning</span><p>Excursiones térmicas</p><strong>{{ excursiones }}</strong></div><div><span class="material-symbols-outlined">timeline</span><p>Cumplimiento total</p><strong>{{ cumplimiento }}%</strong></div><small>Rango permitido: {{ lote?.producto.temperaturaMinima }}°C a {{ lote?.producto.temperaturaMaxima }}°C. Las lecturas fuera de rango indican una posible ruptura de la cadena de frío.</small></div><div class="table-scroll" *ngIf="excursiones > 0"><table><thead><tr><th>FECHA</th><th class="right">TEMPERATURA</th><th>UBICACIÓN</th></tr></thead><tbody><tr *ngFor="let registro of lecturasFueraDeRango" class="row-danger"><td>{{ (registro.fechaRegistro?.slice(0, 16) ?? '').replace('T', ' ') }}</td><td class="right">{{ registro.temperatura }}°C</td><td>{{ registro.ubicacion || 'Sin ubicación' }}</td></tr></tbody></table></div></section>
<div class="trace-grid"><section class="panel telemetry"><header><h2>Telemetría de temperatura</h2><span>Historial del lote · {{ lecturasGrafico.length }} lecturas</span></header><div class="telemetry-chart"><div class="safe-zone"></div><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polyline [attr.points]="puntos" fill="none" stroke="#005ab3" stroke-width="2"/></svg><span class="axis-label top">{{ lote?.producto?.temperaturaMaxima || '--' }}°C</span><span class="axis-label bottom">{{ lote?.producto?.temperaturaMinima || '--' }}°C</span></div></section><aside><article class="panel current-status"><label>ESTADO ACTUAL</label><strong>{{ temperaturaTransito }}°C</strong><span class="status" [class.badge-success]="!ultimaFueraDeRango" [class.badge-danger]="ultimaFueraDeRango">{{ ultima ? (ultimaFueraDeRango ? 'Fuera de rango' : 'En rango') : 'Sin lectura' }}</span><p>Ubicación: <b>{{ ultima?.ubicacion || 'No registrada' }}</b></p><hr><b>Lecturas registradas: {{ registros.length }}</b></article><article class="panel manifest"><h2>Datos del lote</h2><p>Código <b>{{ lote?.codigo || '--' }}</b></p><p>Producto <b>{{ lote?.producto?.nombre || '--' }}</b></p><p>Vencimiento <b>{{ lote?.fechaVencimiento || '--' }}</b></p><p>Estado <b>{{ lote?.estado || '--' }}</b></p></article></aside></div>`, styles: [] })
export class TraceReportComponent implements OnInit, OnDestroy {
  private readonly store = inject(ColdtraceStoreService);
  lotes: Lote[] = [];
  operaciones: Operacion[] = [];
  lote?: Lote;
  registros: Temperatura[] = [];
  lecturas = new Map<number, Temperatura[]>();
  mostrarCumplimiento = false;
  temperaturaSimulada?: number;
  lecturasEnVivo: Temperatura[] = [];
  private simulacion?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.store.lotes.subscribe(lotes => {
      this.lotes = lotes;
      this.asegurarSeleccion();
    });
    this.store.operaciones.subscribe(operaciones => {
      this.operaciones = operaciones;
      this.asegurarSeleccion();
    });
    this.store.lecturas.subscribe(mapa => {
      this.lecturas = mapa;
      if (this.lote) this.registros = mapa.get(this.lote.id) ?? [];
    });
    this.simulacion = setInterval(() => this.avanzarSimulacion(), 2000);
  }

  ngOnDestroy() {
    if (this.simulacion) clearInterval(this.simulacion);
  }

  private asegurarSeleccion() {
    if (this.lote) return;
    const primero = this.lotesEnTransito[0];
    if (primero) this.seleccionar(primero.id);
  }

  seleccionar(id: number | null) {
    if (id === null || id === undefined) return;
    this.mostrarCumplimiento = false;
    this.lote = this.lotes.find(l => l.id === id);
    this.registros = this.lecturas.get(id) ?? [];
    this.temperaturaSimulada = undefined;
    this.lecturasEnVivo = [];
  }

  actualizarAhora() {
    this.store.recargar();
    this.avanzarSimulacion();
  }

  get lecturasGrafico(): Temperatura[] {
    const cronologicas = [...this.registros].reverse();
    return [...cronologicas, ...this.lecturasEnVivo];
  }

  get lotesEnTransito(): Lote[] {
    return this.lotes.filter(lote =>
      this.operaciones.some(o => o.estado === 'EN_TRANSITO' && o.loteId === lote.id));
  }

  get despachoDelLote(): Operacion | undefined {
    if (!this.lote) return undefined;
    return this.operaciones.find(o => o.estado === 'EN_TRANSITO' && o.loteId === this.lote!.id);
  }

  get preenfriamientoVerificado(): boolean {
    const control = this.despachoDelLote?.controlesConfirmados.find(c => c.startsWith('Pre-enfriamiento:'));
    return control ? control.includes('Verificado') : false;
  }

  get despachoEstado(): string {
    return this.preenfriamientoVerificado ? 'DENTRO DEL RANGO' : 'EN OBSERVACION';
  }

  get temperaturaTransito(): string {
    if (this.temperaturaSimulada !== undefined) return this.temperaturaSimulada.toFixed(1);
    return this.ultima?.temperatura.toFixed(1) ?? '--';
  }

  private avanzarSimulacion() {
    if (!this.lote) return;
    const min = this.lote.producto.temperaturaMinima;
    const max = this.lote.producto.temperaturaMaxima;
    const medio = (min + max) / 2;
    if (this.temperaturaSimulada === undefined) {
      this.temperaturaSimulada = this.ultima?.temperatura ?? medio;
      return;
    }
    let nueva: number;
    if (this.preenfriamientoVerificado) {
      // Fluctúa como una acción en bolsa: movimientos pequeños,
      // reversión a la media y picos ocasionales de subida/bajada
      const ruido = (Math.random() - 0.5) * (max - min) * 0.12;
      const reversion = (medio - this.temperaturaSimulada) * 0.08;
      const pico = Math.random() < 0.08 ? (Math.random() - 0.5) * (max - min) * 0.45 : 0;
      nueva = this.temperaturaSimulada + ruido + reversion + pico;
      nueva = Math.max(min, Math.min(max, nueva));
    } else {
      nueva = Math.max(min, this.temperaturaSimulada - 0.5);
    }
    this.temperaturaSimulada = nueva;

    const ultimaLectura = this.lecturasGrafico[this.lecturasGrafico.length - 1];
    const base = ultimaLectura ? this.tiempoDe(ultimaLectura) : Date.now();
    const fecha = new Date(base + 2000);
    this.lecturasEnVivo = [...this.lecturasEnVivo, {
      id: (this.ultima?.id ?? 0) + this.lecturasEnVivo.length + 1,
      temperatura: nueva,
      fechaRegistro: fecha.toISOString(),
      ubicacion: 'En tránsito'
    }];
  }

  private tiempoDe(registro: Temperatura): number {
    return registro.fechaRegistro ? new Date(registro.fechaRegistro).getTime() : 0;
  }

  get primera() { return this.registros[this.registros.length - 1]; }
  get ultima() { return this.registros[0]; }
  get intermedia() { return this.registros.length > 2 ? this.registros[Math.floor(this.registros.length / 2)] : undefined; }
  get enRango() { return this.registros.filter(r => !this.fueraDeRango(r)).length; }
  get excursiones() { return this.registros.length - this.enRango; }
  get cumplimiento() { return this.registros.length ? Math.round(this.enRango / this.registros.length * 100) : 0; }
  get lecturasFueraDeRango() { return this.registros.filter(r => this.fueraDeRango(r)); }
  get ultimaFueraDeRango() { return this.ultima ? this.fueraDeRango(this.ultima) : false; }

  private fueraDeRango(registro: Temperatura) {
    if (!this.lote) return false;
    return registro.temperatura < this.lote.producto.temperaturaMinima || registro.temperatura > this.lote.producto.temperaturaMaxima;
  }

  get puntos() {
    const lista = this.lecturasGrafico;
    if (!lista.length) return '';
    const valores = lista.map(r => r.temperatura);
    const min = Math.min(...valores);
    const max = Math.max(...valores);
    const rango = max - min || 1;
    const t0 = this.tiempoDe(lista[0]);
    const t1 = this.tiempoDe(lista[lista.length - 1]);
    const duracion = t1 - t0 || 1;
    return lista.map(registro => {
      const x = lista.length > 1 ? ((this.tiempoDe(registro) - t0) / duracion) * 100 : 50;
      const y = 90 - ((registro.temperatura - min) / rango) * 80;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  verificarCumplimiento() {
    this.mostrarCumplimiento = true;
  }

  exportar() {
    if (!this.lote || !this.registros.length) return;
    const lineas = [
      `ColdTrace - Reporte de trazabilidad del lote ${this.lote.codigo}`,
      `Producto,${this.lote.producto.nombre}`,
      `Rango permitido (°C),${this.lote.producto.temperaturaMinima} a ${this.lote.producto.temperaturaMaxima}`,
      `Cumplimiento,${this.cumplimiento}%`,
      '',
      'id,fecha_registro,temperatura_c,ubicacion,en_rango'
    ];
    this.registros.forEach(r => lineas.push(
      `${r.id},${r.fechaRegistro},${r.temperatura},${r.ubicacion ?? ''},${this.fueraDeRango(r) ? 'NO' : 'SI'}`
    ));
    const blob = new Blob(['\uFEFF' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `trazabilidad-${this.lote.codigo}.csv`;
    enlace.click();
    URL.revokeObjectURL(url);
  }
}
