import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ColdtraceApiService, Lote, Producto, Temperatura } from './coldtrace-api.service';
import { ColdtraceStoreService } from './coldtrace-store.service';
import { UiStateService } from './ui-state.service';

@Component({ selector: 'app-lots', standalone: true, imports: [CommonModule, FormsModule], template: `
<div class="title-row"><div><h1>Lotes y productos</h1><p>Registro y monitoreo de productos termosensibles.</p></div><div class="button-row"><small class="auto-refresh"><span class="material-symbols-outlined">sync</span>Actualización instantánea</small></div></div>
<p class="form-message" [class.error]="error">{{ mensaje }}</p>
<section class="panel product-form"><header><h2>{{ editandoId ? 'Editar producto #' + editandoId : 'Registrar producto' }}</h2><span>{{ editandoId ? 'PUT /api/productos/' + editandoId : 'POST /api/productos' }}</span></header><div class="product-fields"><label>Nombre<input [(ngModel)]="producto.nombre" placeholder="Ej. Insulina"></label><label>Tipo<input [(ngModel)]="producto.tipo" placeholder="Ej. Medicamento"></label><label>Temperatura mínima<input type="number" [(ngModel)]="producto.temperaturaMinima"></label><label>Temperatura máxima<input type="number" [(ngModel)]="producto.temperaturaMaxima"></label><label>Vida útil (días)<input type="number" [(ngModel)]="producto.vidaUtilDias"></label><button class="primary" (click)="registrarProducto()">{{ editandoId ? 'Guardar cambios' : 'Registrar producto' }}</button><button *ngIf="editandoId" (click)="cancelarEdicion()">Cancelar</button></div></section>
<div class="operation-columns"><section class="panel operation-card"><header><h2>Registrar lote</h2><span>POST /api/lotes</span></header><div class="form-content"><label>Código del lote<input [(ngModel)]="nuevoLote.codigo" placeholder="Ej. VAX-123"></label><div class="two-fields"><label>Fecha de vencimiento<input type="date" [(ngModel)]="nuevoLote.fechaVencimiento"></label><label>Estado<input [(ngModel)]="nuevoLote.estado" placeholder="ACTIVO"></label></div><label>Producto<select [(ngModel)]="nuevoLote.productoId"><option [ngValue]="0">Selecciona un producto...</option><option *ngFor="let producto of productos" [ngValue]="producto.id">{{ producto.nombre }}</option></select></label><button class="primary" (click)="registrarLote()">Registrar lote</button></div></section><section class="panel operation-card"><header><h2>Registrar lectura de temperatura</h2><span>POST /api/lotes/:id/temperaturas</span></header><div class="form-content"><label>Lote<select [(ngModel)]="nuevaTemperatura.loteId"><option [ngValue]="0">Selecciona un lote...</option><option *ngFor="let lote of lotes" [ngValue]="lote.id">{{ lote.codigo }} ({{ lote.producto.nombre }})</option></select></label><div class="two-fields"><label>Temperatura (°C)<input type="number" step="0.1" [(ngModel)]="nuevaTemperatura.temperatura"></label><label>Ubicación<input [(ngModel)]="nuevaTemperatura.ubicacion" placeholder="Ej. Almacén A"></label></div><button class="primary" (click)="registrarTemperatura()">Registrar lectura</button></div></section></div>
<section class="panel lot-table"><header><span>VISTA: <b>Productos</b></span><span>Mostrando {{ productos.length }} registros reales</span></header><div class="table-scroll"><table><thead><tr><th>ID</th><th>NOMBRE</th><th>TIPO</th><th class="right">RANGO PERMITIDO</th><th class="right">VIDA ÚTIL</th><th></th></tr></thead><tbody><tr *ngFor="let producto of productos"><td class="blue">{{ producto.id }}</td><td>{{ producto.nombre }}</td><td>{{ producto.tipo }}</td><td class="right">{{ producto.temperaturaMinima }}°C a {{ producto.temperaturaMaxima }}°C</td><td class="right">{{ producto.vidaUtilDias }} días</td><td class="right"><button (click)="editarProducto(producto)">Editar</button> <button (click)="eliminarProducto(producto)">Eliminar</button></td></tr><tr *ngIf="!productos.length"><td colspan="6" class="empty">No hay productos registrados.</td></tr></tbody></table></div></section>
<section class="panel lot-table"><header><span>VISTA: <b>Todos los lotes</b></span><span>Mostrando {{ lotesVisibles.length }} de {{ lotes.length }} registros</span></header><div class="table-scroll"><table><thead><tr><th>ID DE LOTE</th><th>PRODUCTO</th><th class="right">TEMPERATURA</th><th>ESTADO</th><th>RANGO PERMITIDO</th><th>ÚLTIMA LECTURA</th><th></th></tr></thead><tbody><tr *ngFor="let lote of lotesVisibles" [class.row-danger]="fueraDeRango(lote)"><td class="blue">{{ lote.codigo }}</td><td>{{ lote.producto.nombre }}</td><td class="right">{{ temperatura(lote) }}°C</td><td><span class="status" [class.badge-danger]="fueraDeRango(lote)" [class.badge-warning]="advertencia(lote)">{{ estado(lote) }}</span></td><td>{{ lote.producto.temperaturaMinima }}°C a {{ lote.producto.temperaturaMaxima }}°C</td><td>{{ lectura(lote)?.fechaRegistro || 'Sin lectura' }}</td><td class="right"><button (click)="eliminarLote(lote)">Eliminar</button></td></tr><tr *ngIf="!lotesVisibles.length"><td colspan="7" class="empty">No hay lotes que coincidan con la búsqueda.</td></tr></tbody></table></div><footer>Total: {{ lotes.length }} lote(s)</footer></section>`, styles: [] })
export class LotsComponent implements OnInit {
  private readonly api = inject(ColdtraceApiService);
  private readonly store = inject(ColdtraceStoreService);
  private readonly ui = inject(UiStateService);
  lotes: Lote[] = [];
  productos: Producto[] = [];
  lecturas = new Map<number, Temperatura[]>();
  filtro = '';
  editandoId: number | null = null;
  producto = { nombre: '', tipo: '', temperaturaMinima: 2, temperaturaMaxima: 8, vidaUtilDias: 30 };
  nuevoLote = { codigo: '', fechaVencimiento: '', estado: 'ACTIVO', productoId: 0 };
  nuevaTemperatura = { loteId: 0, temperatura: 4, ubicacion: '' };
  mensaje = '';
  error = false;

  ngOnInit() {
    this.store.lotes.subscribe(lotes => this.lotes = lotes);
    this.store.productos.subscribe(productos => this.productos = productos);
    this.store.lecturas.subscribe(mapa => this.lecturas = mapa);
    this.ui.search$.subscribe(termino => this.filtro = termino);
  }

  registrarProducto() {
    if (!this.producto.nombre || !this.producto.tipo || this.producto.temperaturaMinima > this.producto.temperaturaMaxima || this.producto.vidaUtilDias <= 0) {
      this.mostrarError('Completa los datos y verifica el rango de temperatura.');
      return;
    }
    const peticion = this.editandoId === null
      ? this.api.registrarProducto(this.producto)
      : this.api.actualizarProducto(this.editandoId, this.producto);
    peticion.subscribe({
      next: resultado => {
        this.error = false;
        this.mensaje = this.editandoId === null
          ? `Producto ${resultado.nombre} registrado correctamente con ID ${resultado.id}.`
          : `Producto ${resultado.nombre} actualizado correctamente.`;
        this.producto = { nombre: '', tipo: '', temperaturaMinima: 2, temperaturaMaxima: 8, vidaUtilDias: 30 };
        this.editandoId = null;
        this.store.recargar();
      },
      error: err => this.mostrarError(this.mensajeError(err))
    });
  }

  editarProducto(producto: Producto) {
    this.editandoId = producto.id;
    this.producto = { nombre: producto.nombre, tipo: producto.tipo, temperaturaMinima: producto.temperaturaMinima, temperaturaMaxima: producto.temperaturaMaxima, vidaUtilDias: producto.vidaUtilDias };
  }

  cancelarEdicion() {
    this.editandoId = null;
    this.producto = { nombre: '', tipo: '', temperaturaMinima: 2, temperaturaMaxima: 8, vidaUtilDias: 30 };
    this.mensaje = '';
    this.error = false;
  }

  eliminarProducto(producto: Producto) {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;
    this.api.eliminarProducto(producto.id).subscribe({
      next: () => { this.error = false; this.mensaje = `Producto "${producto.nombre}" eliminado.`; this.store.recargar(); },
      error: err => this.mostrarError(this.mensajeError(err))
    });
  }

  registrarLote() {
    if (!this.nuevoLote.codigo || !this.nuevoLote.fechaVencimiento || this.nuevoLote.productoId <= 0) {
      this.mostrarError('Completa código, fecha de vencimiento y producto del lote.');
      return;
    }
    this.api.registrarLote({
      codigo: this.nuevoLote.codigo,
      fechaVencimiento: this.nuevoLote.fechaVencimiento,
      estado: this.nuevoLote.estado,
      producto: { id: this.nuevoLote.productoId }
    }).subscribe({
      next: resultado => {
        this.error = false;
        this.mensaje = `Lote ${resultado.codigo} registrado correctamente con ID ${resultado.id}.`;
        this.nuevoLote = { codigo: '', fechaVencimiento: '', estado: 'ACTIVO', productoId: 0 };
        this.store.recargar();
      },
      error: err => this.mostrarError(this.mensajeError(err))
    });
  }

  eliminarLote(lote: Lote) {
    if (!confirm(`¿Eliminar el lote "${lote.codigo}"? También se eliminarán sus lecturas.`)) return;
    this.api.eliminarLote(lote.id).subscribe({
      next: () => { this.error = false; this.mensaje = `Lote "${lote.codigo}" eliminado.`; this.store.recargar(); },
      error: err => this.mostrarError(this.mensajeError(err))
    });
  }

  registrarTemperatura() {
    if (this.nuevaTemperatura.loteId <= 0) {
      this.mostrarError('Selecciona un lote para registrar la lectura.');
      return;
    }
    this.api.registrarTemperatura(this.nuevaTemperatura.loteId, {
      temperatura: this.nuevaTemperatura.temperatura,
      ubicacion: this.nuevaTemperatura.ubicacion
    }).subscribe({
      next: resultado => {
        this.error = false;
        this.mensaje = `Lectura de ${resultado.temperatura}°C registrada para el lote ${resultado.lote?.codigo ?? this.nuevaTemperatura.loteId}.`;
        this.nuevaTemperatura.ubicacion = '';
        this.store.recargar();
      },
      error: err => this.mostrarError(this.mensajeError(err))
    });
  }

  get lotesVisibles() {
    if (!this.filtro) return this.lotes;
    return this.lotes.filter(lote =>
      lote.codigo.toLowerCase().includes(this.filtro) ||
      lote.producto.nombre.toLowerCase().includes(this.filtro) ||
      lote.estado.toLowerCase().includes(this.filtro) ||
      (this.lectura(lote)?.ubicacion ?? '').toLowerCase().includes(this.filtro));
  }

  lectura(lote: Lote) { return this.lecturas.get(lote.id)?.[0]; }
  temperatura(lote: Lote) { return this.lectura(lote)?.temperatura?.toFixed(1) ?? '--'; }
  fueraDeRango(lote: Lote) { const valor = this.lectura(lote)?.temperatura; return valor !== undefined && (valor < lote.producto.temperaturaMinima || valor > lote.producto.temperaturaMaxima); }
  advertencia(lote: Lote) { const valor = this.lectura(lote)?.temperatura; return !this.fueraDeRango(lote) && valor !== undefined && (valor < lote.producto.temperaturaMinima + .5 || valor > lote.producto.temperaturaMaxima - .5); }
  estado(lote: Lote) { return this.fueraDeRango(lote) ? 'Crítico' : this.advertencia(lote) ? 'Advertencia' : this.lectura(lote) ? 'En rango' : 'Sin lectura'; }

  private mostrarError(mensaje: string) { this.error = true; this.mensaje = mensaje; }

  private mensajeError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 409) return 'No se puede eliminar: el registro está referenciado por lotes o temperaturas.';
    return 'No se pudo completar la operación.';
  }
}
