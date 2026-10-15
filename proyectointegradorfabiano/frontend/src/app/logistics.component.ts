import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColdtraceApiService, Lote, Operacion } from './coldtrace-api.service';
import { ColdtraceStoreService } from './coldtrace-store.service';

@Component({ selector: 'app-logistics', standalone: true, imports: [CommonModule, FormsModule], template: `
<div class="title-row"><div><h1>Operaciones logísticas</h1><p>Gestiona despachos y recepción de activos de cadena de frío.</p></div><div class="quick-scan"><span class="material-symbols-outlined">qr_code_scanner</span><b>Escaneo rápido</b><small>Listo para ingresar</small></div><small class="auto-refresh"><span class="material-symbols-outlined">sync</span>Actualización instantánea</small></div>
<div class="operation-columns"><section class="panel operation-card"><header><h2>Registrar despacho</h2><span>Paso 1 de 2 · POST /api/operaciones</span></header><div class="form-content"><label>Manifiesto de despacho<input [(ngModel)]="despacho.manifiesto" placeholder="Ej. MF-2026-001"></label><label>Seleccionar lote<select [(ngModel)]="despacho.loteId"><option [ngValue]="0">Selecciona un lote...</option><option *ngFor="let lote of lotes" [ngValue]="lote.id">{{ lote.codigo }} ({{ lote.producto.nombre }})</option></select></label><div class="two-fields"><label>ID del vehículo<input [(ngModel)]="despacho.vehiculo" placeholder="Ej. TRK-402"></label><label>ID del conductor<input [(ngModel)]="despacho.conductor" placeholder="Documento o código"></label></div><div class="audit"><b>Pre-enfriamiento del vehículo</b><label><input type="radio" name="pre" [(ngModel)]="despacho.precooling" value="Verificado"> Verificado (&lt; 8°C)</label><label><input type="radio" name="pre" [(ngModel)]="despacho.precooling" value="Fallido"> Fallido</label></div><label>Destino<input [(ngModel)]="despacho.destino" placeholder="Centro de destino"></label><button class="primary" (click)="registrarDespacho()">Inicializar despacho</button></div></section><section class="panel operation-card"><header><h2>Registrar recepción</h2><span>Entrada · PUT /api/operaciones/:id/recepcion</span></header><div class="form-content"><label>Manifiesto de ingreso<select [(ngModel)]="recepcion.operacionId"><option [ngValue]="0">Selecciona un despacho en tránsito...</option><option *ngFor="let pendiente of despachosPendientes" [ngValue]="pendiente.id">{{ pendiente.manifiesto }} · {{ pendiente.tipoProducto }}</option></select></label><h3>Auditoría de condición de llegada</h3><div class="two-fields"><label>Temperatura de llegada (°C)<input type="number" [(ngModel)]="recepcion.temperatura" placeholder="Ej. 4.2"></label><label>Estado del datalogger<select [(ngModel)]="recepcion.logger"><option>Normal (sin alertas)</option><option>Alerta detectada</option><option>Faltante o con error</option></select></label></div><div class="checks"><label><input type="checkbox" [(ngModel)]="recepcion.sello"> Sellos intactos</label><label><input type="checkbox" [(ngModel)]="recepcion.dano"> Sin daños</label></div><label>Firma del receptor<textarea [(ngModel)]="recepcion.firma" placeholder="Firma o nombre del receptor"></textarea></label><button class="primary" (click)="completarRecepcion()">Completar recepción</button></div></section></div>
<p class="form-message" [class.error]="error">{{ mensaje }}</p>
<section class="panel recent"><header><h2>Despachos en tránsito</h2><span>{{ despachosPendientes.length }} pendientes de recepción</span></header><div class="table-scroll"><table><thead><tr><th>MANIFIESTO</th><th>TIPO</th><th>INSPECTOR</th><th>FECHA</th><th>ESTADO</th></tr></thead><tbody><tr *ngFor="let pendiente of despachosPendientes"><td class="blue">{{ pendiente.manifiesto }}</td><td>{{ pendiente.tipoProducto }}</td><td>{{ pendiente.inspector }}</td><td>{{ (pendiente.fechaRegistro?.slice(0, 16) ?? '').replace('T', ' ') || '--' }}</td><td><span class="status badge-warning">En tránsito</span></td></tr><tr *ngIf="!despachosPendientes.length"><td colspan="5" class="empty">No hay despachos en tránsito. Registra un despacho para poder recepcionarlo.</td></tr></tbody></table></div></section><section class="panel recent"><header><h2>Operaciones registradas</h2><span>{{ operaciones.length }} registros de la API</span></header><div class="table-scroll"><table><thead><tr><th>MANIFIESTO</th><th>TIPO</th><th>TRANSPORTISTA</th><th>INSPECTOR</th><th>FECHA</th><th>ESTADO</th><th>CONTROLES CONFIRMADOS</th></tr></thead><tbody><tr *ngFor="let operacion of operaciones"><td class="blue">{{ operacion.manifiesto }}</td><td>{{ operacion.tipoProducto }}</td><td>{{ operacion.transportista }}</td><td>{{ operacion.inspector }}</td><td>{{ (operacion.fechaRegistro?.slice(0, 16) ?? '').replace('T', ' ') || '--' }}</td><td><span class="status" [class.badge-warning]="operacion.estado === 'EN_TRANSITO'" [class.badge-success]="operacion.estado === 'RECEPCIONADO'">{{ estadoTexto(operacion) }}</span></td><td>{{ operacion.controlesConfirmados.join(' · ') }}</td></tr><tr *ngIf="!operaciones.length"><td colspan="7" class="empty">No hay operaciones registradas.</td></tr></tbody></table></div></section>`, styles: [] })
export class LogisticsComponent implements OnInit {
  private readonly api = inject(ColdtraceApiService);
  private readonly store = inject(ColdtraceStoreService);
  lotes: Lote[] = [];
  operaciones: Operacion[] = [];
  mensaje = '';
  error = false;
  despacho = { manifiesto: '', loteId: 0, vehiculo: '', conductor: '', precooling: '', destino: '' };
  recepcion = { operacionId: 0, temperatura: 0, logger: 'Normal (sin alertas)', sello: false, dano: false, firma: '' };

  ngOnInit() {
    this.store.lotes.subscribe(lotes => this.lotes = lotes);
    this.store.operaciones.subscribe(operaciones => this.operaciones = operaciones);
  }

  get despachosPendientes(): Operacion[] {
    return this.operaciones.filter(operacion => operacion.estado === 'EN_TRANSITO');
  }

  estadoTexto(operacion: Operacion): string {
    return operacion.estado === 'RECEPCIONADO' ? 'Recepcionado' : 'En tránsito';
  }

  registrarDespacho() {
    if (!this.despacho.manifiesto || !this.despacho.loteId || !this.despacho.vehiculo || !this.despacho.destino) {
      this.mostrarError('Completa manifiesto, lote, vehículo y destino.');
      return;
    }
    const lote = this.lotes.find(l => l.id === this.despacho.loteId);
    const data: Operacion = {
      manifiesto: this.despacho.manifiesto,
      loteId: this.despacho.loteId,
      transportista: 'ColdTrace Logistics',
      tipoProducto: 'Despacho - ' + (lote?.producto.nombre ?? 'Activo de cadena de frío'),
      controlesConfirmados: [
        'Pre-enfriamiento: ' + (this.despacho.precooling || 'Pendiente'),
        'Vehículo: ' + this.despacho.vehiculo,
        'Conductor: ' + (this.despacho.conductor || 'No asignado'),
        'Destino: ' + this.despacho.destino
      ],
      inspector: this.despacho.conductor || 'Responsable de despacho'
    };
    this.api.registrarOperacion(data).subscribe({
      next: resultado => {
        this.error = false;
        this.mensaje = `Despacho del lote ${lote?.codigo ?? this.despacho.loteId} registrado con operación #${resultado.id}.`;
        this.despacho = { manifiesto: '', loteId: 0, vehiculo: '', conductor: '', precooling: '', destino: '' };
        this.store.recargar();
      },
      error: err => this.mostrarError(err?.error?.message ?? 'No se pudo registrar el despacho.')
    });
  }

  completarRecepcion() {
    if (!this.recepcion.operacionId) {
      this.mostrarError('Selecciona un despacho en tránsito para registrar la recepción.');
      return;
    }
    if (this.recepcion.temperatura === null || this.recepcion.temperatura === undefined) {
      this.mostrarError('La temperatura de llegada es obligatoria.');
      return;
    }
    this.api.registrarRecepcion(this.recepcion.operacionId, {
      temperatura: this.recepcion.temperatura,
      logger: this.recepcion.logger,
      sello: this.recepcion.sello,
      dano: this.recepcion.dano,
      firma: this.recepcion.firma
    }).subscribe({
      next: resultado => {
        this.error = false;
        this.mensaje = `Recepción registrada: el despacho ${resultado.manifiesto} pasó de "En tránsito" a "Recepcionado".`;
        this.recepcion = { operacionId: 0, temperatura: 0, logger: 'Normal (sin alertas)', sello: false, dano: false, firma: '' };
        this.store.recargar();
      },
      error: err => this.mostrarError(err?.error?.message ?? 'No se pudo registrar la recepción en el backend.')
    });
  }

  private mostrarError(mensaje: string) { this.error = true; this.mensaje = mensaje; }
}
