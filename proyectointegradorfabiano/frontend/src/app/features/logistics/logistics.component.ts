import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ColdtraceApiService } from '../../core/services/coldtrace-api.service';
import { ColdtraceStoreService } from '../../core/services/coldtrace-store.service';
import { AuthService } from '../../core/services/auth.service';
import { Operacion } from '../../shared/models/domain.models';

@Component({
  selector: 'app-logistics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="title-row">
      <div>
        <h1>Operaciones logísticas</h1>
        <p>Gestiona despachos y recepción de activos de cadena de frío.</p>
      </div>
      <div class="button-row">
        <div class="quick-scan">
          <span class="material-symbols-outlined">qr_code_scanner</span>
          <b>Escaneo rápido</b>
          <small>Listo para ingresar</small>
        </div>
        <small class="auto-refresh"><span class="material-symbols-outlined">sync</span>Actualización instantánea</small>
      </div>
    </div>

    <p class="guest-note" *ngIf="!auth.puedeEscribir">
      Tu rol es de solo consulta: no puedes registrar despachos ni recepciones.
    </p>

    <div class="operation-columns" *ngIf="auth.puedeEscribir">
      <!-- ===================== Despacho ===================== -->
      <section class="panel operation-card">
        <header><h2>Registrar despacho</h2><span>Paso 1 de 2 · POST /api/operaciones</span></header>
        <form class="form-content" [formGroup]="despachoForm" (ngSubmit)="registrarDespacho()" novalidate>
          <label>
            Manifiesto de despacho
            <input
              type="text"
              formControlName="manifiesto"
              placeholder="Ej. MF-2026-001"
              [class.campo-invalido]="invalido(despachoForm, 'manifiesto')"
            />
            <small class="field-error" *ngIf="invalido(despachoForm, 'manifiesto')">
              <ng-container *ngIf="despachoForm.get('manifiesto')?.hasError('required')">
                El manifiesto es obligatorio.
              </ng-container>
              <ng-container *ngIf="despachoForm.get('manifiesto')?.hasError('pattern')">
                Usa de 3 a 25 letras, números o guiones (Ej. MF-2026-001).
              </ng-container>
            </small>
          </label>

          <label>
            Seleccionar lote
            <select formControlName="loteId" [class.campo-invalido]="invalido(despachoForm, 'loteId')">
              <option [ngValue]="0">Selecciona un lote...</option>
              <option *ngFor="let lote of lotes()" [ngValue]="lote.id">
                {{ lote.codigo }} ({{ lote.producto.nombre }})
              </option>
            </select>
            <small class="field-error" *ngIf="invalido(despachoForm, 'loteId')">
              Selecciona el lote que se va a despachar.
            </small>
          </label>

          <div class="two-fields">
            <label>
              ID del vehículo
              <input
                type="text"
                formControlName="vehiculo"
                placeholder="Ej. TRK-402"
                [class.campo-invalido]="invalido(despachoForm, 'vehiculo')"
              />
              <small class="field-error" *ngIf="invalido(despachoForm, 'vehiculo')">
                <ng-container *ngIf="despachoForm.get('vehiculo')?.hasError('required')">Campo obligatorio.</ng-container>
                <ng-container *ngIf="despachoForm.get('vehiculo')?.hasError('minlength')">Mínimo 3 caracteres.</ng-container>
              </small>
            </label>

            <label>
              ID del conductor
              <input
                type="text"
                formControlName="conductor"
                placeholder="Documento o código"
                [class.campo-invalido]="invalido(despachoForm, 'conductor')"
              />
              <small class="field-error" *ngIf="invalido(despachoForm, 'conductor')">
                <ng-container *ngIf="despachoForm.get('conductor')?.hasError('required')">Campo obligatorio.</ng-container>
                <ng-container *ngIf="despachoForm.get('conductor')?.hasError('minlength')">Mínimo 3 caracteres.</ng-container>
              </small>
            </label>
          </div>

          <div class="audit">
            <b>Pre-enfriamiento del vehículo</b>
            <label>
              <input type="radio" formControlName="precooling" value="Verificado" /> Verificado (&lt; 8°C)
            </label>
            <label>
              <input type="radio" formControlName="precooling" value="Fallido" /> Fallido
            </label>
          </div>
          <small class="field-error" *ngIf="invalido(despachoForm, 'precooling')">
            Indica si el pre-enfriamiento fue verificado o fallido.
          </small>

          <label>
            Destino
            <input
              type="text"
              formControlName="destino"
              placeholder="Centro de destino"
              [class.campo-invalido]="invalido(despachoForm, 'destino')"
            />
            <small class="field-error" *ngIf="invalido(despachoForm, 'destino')">
              <ng-container *ngIf="despachoForm.get('destino')?.hasError('required')">Campo obligatorio.</ng-container>
              <ng-container *ngIf="despachoForm.get('destino')?.hasError('minlength')">Mínimo 3 caracteres.</ng-container>
            </small>
          </label>

          <button class="primary" type="submit" [disabled]="despachoForm.invalid || guardando()">
            Inicializar despacho
          </button>
        </form>
      </section>

      <!-- ===================== Recepción ===================== -->
      <section class="panel operation-card">
        <header><h2>Registrar recepción</h2><span>Entrada · PUT /api/operaciones/:id/recepcion</span></header>
        <form class="form-content" [formGroup]="recepcionForm" (ngSubmit)="completarRecepcion()" novalidate>
          <label>
            Manifiesto de ingreso
            <select
              formControlName="operacionId"
              [class.campo-invalido]="invalido(recepcionForm, 'operacionId')"
            >
              <option [ngValue]="0">Selecciona un despacho en tránsito...</option>
              <option *ngFor="let pendiente of despachosPendientes()" [ngValue]="pendiente.id">
                {{ pendiente.manifiesto }} · {{ pendiente.tipoProducto }}
              </option>
            </select>
            <small class="field-error" *ngIf="invalido(recepcionForm, 'operacionId')">
              Selecciona un despacho en tránsito para registrar la recepción.
            </small>
          </label>

          <h3>Auditoría de condición de llegada</h3>

          <div class="two-fields">
            <label>
              Temperatura de llegada (°C)
              <input
                type="number"
                step="0.1"
                formControlName="temperatura"
                placeholder="Ej. 4.2"
                [class.campo-invalido]="invalido(recepcionForm, 'temperatura')"
              />
              <small class="field-error" *ngIf="invalido(recepcionForm, 'temperatura')">
                <ng-container *ngIf="recepcionForm.get('temperatura')?.hasError('required')">
                  La temperatura de llegada es obligatoria.
                </ng-container>
                <ng-container *ngIf="recepcionForm.get('temperatura')?.hasError('min')">Mínimo -60 °C.</ng-container>
                <ng-container *ngIf="recepcionForm.get('temperatura')?.hasError('max')">Máximo 40 °C.</ng-container>
              </small>
            </label>

            <label>
              Estado del datalogger
              <select formControlName="logger">
                <option>Normal (sin alertas)</option>
                <option>Alerta detectada</option>
                <option>Faltante o con error</option>
              </select>
            </label>
          </div>

          <div class="checks">
            <label><input type="checkbox" formControlName="sello" /> Sellos intactos</label>
            <label><input type="checkbox" formControlName="dano" /> Sin daños</label>
          </div>

          <label>
            Firma del receptor
            <textarea
              formControlName="firma"
              placeholder="Firma o nombre del receptor"
              [class.campo-invalido]="invalido(recepcionForm, 'firma')"
            ></textarea>
            <small class="field-error" *ngIf="invalido(recepcionForm, 'firma')">
              Máximo 120 caracteres.
            </small>
          </label>

          <button class="primary" type="submit" [disabled]="recepcionForm.invalid || guardando()">
            Completar recepción
          </button>
        </form>
      </section>
    </div>

    <p class="form-message" [class.error]="error()">{{ mensaje() }}</p>

    <!-- ===================== Despachos pendientes ===================== -->
    <section class="panel recent">
      <header>
        <h2>Despachos en tránsito</h2>
        <span>{{ despachosPendientes().length }} pendientes de recepción</span>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>MANIFIESTO</th>
              <th>TIPO</th>
              <th>INSPECTOR</th>
              <th>FECHA</th>
              <th>ESTADO</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pendiente of despachosPendientes()">
              <td class="blue">{{ pendiente.manifiesto }}</td>
              <td>{{ pendiente.tipoProducto }}</td>
              <td>{{ pendiente.inspector }}</td>
              <td>{{ fecha(pendiente) }}</td>
              <td><span class="status badge-warning">En tránsito</span></td>
            </tr>
            <tr *ngIf="!despachosPendientes().length">
              <td colspan="5" class="empty">
                No hay despachos en tránsito. Registra un despacho para poder recepcionarlo.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===================== Operaciones ===================== -->
    <section class="panel recent">
      <header>
        <h2>Operaciones registradas</h2>
        <span>{{ operaciones().length }} registros de la API</span>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>MANIFIESTO</th>
              <th>TIPO</th>
              <th>TRANSPORTISTA</th>
              <th>INSPECTOR</th>
              <th>FECHA</th>
              <th>ESTADO</th>
              <th>CONTROLES CONFIRMADOS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let operacion of operaciones()">
              <td class="blue">{{ operacion.manifiesto }}</td>
              <td>{{ operacion.tipoProducto }}</td>
              <td>{{ operacion.transportista }}</td>
              <td>{{ operacion.inspector }}</td>
              <td>{{ fecha(operacion) }}</td>
              <td>
                <span
                  class="status"
                  [class.badge-warning]="operacion.estado === 'EN_TRANSITO'"
                  [class.badge-success]="operacion.estado === 'RECEPCIONADO'"
                >{{ estadoTexto(operacion) }}</span>
              </td>
              <td>{{ operacion.controlesConfirmados.join(' · ') }}</td>
            </tr>
            <tr *ngIf="!operaciones().length">
              <td colspan="7" class="empty">No hay operaciones registradas.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
})
export class LogisticsComponent {
  private readonly api = inject(ColdtraceApiService);
  private readonly store = inject(ColdtraceStoreService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

  readonly lotes = this.store.lotes;
  readonly operaciones = this.store.operaciones;
  readonly mensaje = signal('');
  readonly error = signal(false);
  readonly guardando = signal(false);

  readonly despachosPendientes = computed(() =>
    this.operaciones().filter((operacion) => operacion.estado === 'EN_TRANSITO')
  );

  readonly despachoForm = this.fb.nonNullable.group({
    manifiesto: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{3,25}$/)]],
    loteId: [0, [Validators.required, Validators.min(1)]],
    vehiculo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
    conductor: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
    precooling: ['', [Validators.required]],
    destino: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
  });

  readonly recepcionForm = this.fb.nonNullable.group({
    operacionId: [0, [Validators.required, Validators.min(1)]],
    temperatura: [4, [Validators.required, Validators.min(-60), Validators.max(40)]],
    logger: ['Normal (sin alertas)', [Validators.required]],
    sello: [false],
    dano: [false],
    firma: ['', [Validators.maxLength(120)]],
  });

  invalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  estadoTexto(operacion: Operacion): string {
    return operacion.estado === 'RECEPCIONADO' ? 'Recepcionado' : 'En tránsito';
  }

  fecha(operacion: Operacion): string {
    const registro = operacion.fechaRegistro;
    return registro ? registro.slice(0, 16).replace('T', ' ') : '--';
  }

  registrarDespacho(): void {
    if (this.despachoForm.invalid) {
      this.despachoForm.markAllAsTouched();
      this.mostrarError('Completa manifiesto, lote, vehículo, conductor, pre-enfriamiento y destino.');
      return;
    }

    const datos = this.despachoForm.getRawValue();
    const lote = this.lotes().find((l) => l.id === datos.loteId);
    const payload: Operacion = {
      manifiesto: datos.manifiesto,
      loteId: datos.loteId,
      transportista: 'ColdTrace Logistics',
      tipoProducto: 'Despacho - ' + (lote?.producto.nombre ?? 'Activo de cadena de frío'),
      controlesConfirmados: [
        'Pre-enfriamiento: ' + datos.precooling,
        'Vehículo: ' + datos.vehiculo,
        'Conductor: ' + datos.conductor,
        'Destino: ' + datos.destino,
      ],
      inspector: datos.conductor,
    };

    this.guardando.set(true);
    this.api.registrarOperacion(payload).subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.mostrarExito(
          `Despacho del lote ${lote?.codigo ?? datos.loteId} registrado con operación #${resultado.id}.`
        );
        this.despachoForm.reset({
          manifiesto: '',
          loteId: 0,
          vehiculo: '',
          conductor: '',
          precooling: '',
          destino: '',
        });
        this.store.recargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mostrarError(this.mensajeError(err, 'No se pudo registrar el despacho.'));
      },
    });
  }

  completarRecepcion(): void {
    if (this.recepcionForm.invalid) {
      this.recepcionForm.markAllAsTouched();
      this.mostrarError('Selecciona un despacho en tránsito y verifica la temperatura de llegada.');
      return;
    }

    const datos = this.recepcionForm.getRawValue();
    this.guardando.set(true);
    this.api
      .registrarRecepcion(datos.operacionId, {
        temperatura: datos.temperatura,
        logger: datos.logger,
        sello: datos.sello,
        dano: datos.dano,
        firma: datos.firma,
      })
      .subscribe({
        next: (resultado) => {
          this.guardando.set(false);
          this.mostrarExito(
            `Recepción registrada: el despacho ${resultado.manifiesto} pasó de "En tránsito" a "Recepcionado".`
          );
          this.recepcionForm.reset({
            operacionId: 0,
            temperatura: 4,
            logger: 'Normal (sin alertas)',
            sello: false,
            dano: false,
            firma: '',
          });
          this.store.recargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.mostrarError(this.mensajeError(err, 'No se pudo registrar la recepción en el backend.'));
        },
      });
  }

  private mostrarError(mensaje: string) {
    this.error.set(true);
    this.mensaje.set(mensaje);
  }

  private mostrarExito(mensaje: string) {
    this.error.set(false);
    this.mensaje.set(mensaje);
  }

  private mensajeError(err: any, porDefecto: string): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 403) return 'Tu rol no tiene permiso para registrar operaciones.';
    if (err?.status === 409) return 'La operación no está en un estado válido para recepción.';
    if (err?.status === 0) return 'No se pudo conectar con la API. Verifica que el backend esté corriendo.';
    return porDefecto;
  }
}
