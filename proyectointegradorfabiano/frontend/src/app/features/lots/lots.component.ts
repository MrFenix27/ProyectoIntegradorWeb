import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ColdtraceApiService } from '../../core/services/coldtrace-api.service';
import { ColdtraceStoreService } from '../../core/services/coldtrace-store.service';
import { UiStateService } from '../../core/services/ui-state.service';
import { AuthService } from '../../core/services/auth.service';
import { Lote, Temperatura } from '../../shared/models/domain.models';

/** Valida que la temperatura máxima sea mayor que la mínima (validación cruzada). */
function rangoTermico(grupo: AbstractControl): ValidationErrors | null {
  const minima = grupo.get('temperaturaMinima')?.value;
  const maxima = grupo.get('temperaturaMaxima')?.value;
  if (minima === null || maxima === null || minima === '' || maxima === '') {
    return null;
  }
  return Number(minima) < Number(maxima) ? null : { rangoTermico: true };
}

@Component({
  selector: 'app-lots',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="title-row">
      <div>
        <h1>Lotes y productos</h1>
        <p>Registro y monitoreo de productos termosensibles.</p>
      </div>
      <div class="button-row">
        <small class="auto-refresh"><span class="material-symbols-outlined">sync</span>Actualización instantánea</small>
      </div>
    </div>

    <p class="guest-note" *ngIf="!auth.puedeEscribir">
      Sesión con rol <b>GUEST</b>: solo consulta. Para registrar o editar datos inicia sesión como
      <b>user</b> o <b>admin</b>.
    </p>

    <p class="form-message" [class.error]="error()">{{ mensaje() }}</p>

    <!-- ===================== Formulario de producto ===================== -->
    <section class="panel product-form" *ngIf="auth.puedeEscribir">
      <header>
        <h2>{{ editandoId() ? 'Editar producto #' + editandoId() : 'Registrar producto' }}</h2>
        <span>{{ editandoId() ? 'PUT /api/productos/' + editandoId() : 'POST /api/productos' }}</span>
      </header>

      <form class="product-fields" [formGroup]="productoForm" (ngSubmit)="registrarProducto()" novalidate>
        <label>
          Nombre
          <input
            type="text"
            formControlName="nombre"
            placeholder="Ej. Insulina"
            [class.campo-invalido]="invalido(productoForm, 'nombre')"
          />
          <small class="field-error" *ngIf="invalido(productoForm, 'nombre')">
            <ng-container *ngIf="productoForm.get('nombre')?.hasError('required')">El nombre es obligatorio.</ng-container>
            <ng-container *ngIf="productoForm.get('nombre')?.hasError('minlength')">Mínimo 3 caracteres.</ng-container>
            <ng-container *ngIf="productoForm.get('nombre')?.hasError('maxlength')">Máximo 60 caracteres.</ng-container>
          </small>
        </label>

        <label>
          Tipo
          <input
            type="text"
            formControlName="tipo"
            placeholder="Ej. Medicamento"
            [class.campo-invalido]="invalido(productoForm, 'tipo')"
          />
          <small class="field-error" *ngIf="invalido(productoForm, 'tipo')">
            <ng-container *ngIf="productoForm.get('tipo')?.hasError('required')">El tipo es obligatorio.</ng-container>
            <ng-container *ngIf="productoForm.get('tipo')?.hasError('minlength')">Mínimo 3 caracteres.</ng-container>
            <ng-container *ngIf="productoForm.get('tipo')?.hasError('maxlength')">Máximo 40 caracteres.</ng-container>
          </small>
        </label>

        <label>
          Temperatura mínima (°C)
          <input
            type="number"
            step="0.1"
            formControlName="temperaturaMinima"
            [class.campo-invalido]="invalido(productoForm, 'temperaturaMinima')"
          />
          <small class="field-error" *ngIf="invalido(productoForm, 'temperaturaMinima')">
            <ng-container *ngIf="productoForm.get('temperaturaMinima')?.hasError('required')">Campo obligatorio.</ng-container>
            <ng-container *ngIf="productoForm.get('temperaturaMinima')?.hasError('min')">Mínimo -60 °C.</ng-container>
            <ng-container *ngIf="productoForm.get('temperaturaMinima')?.hasError('max')">Máximo 40 °C.</ng-container>
          </small>
        </label>

        <label>
          Temperatura máxima (°C)
          <input
            type="number"
            step="0.1"
            formControlName="temperaturaMaxima"
            [class.campo-invalido]="invalido(productoForm, 'temperaturaMaxima') || productoForm.hasError('rangoTermico')"
          />
          <small class="field-error" *ngIf="invalido(productoForm, 'temperaturaMaxima') || productoForm.hasError('rangoTermico')">
            <ng-container *ngIf="productoForm.get('temperaturaMaxima')?.hasError('required')">Campo obligatorio.</ng-container>
            <ng-container *ngIf="productoForm.get('temperaturaMaxima')?.hasError('min')">Mínimo -60 °C.</ng-container>
            <ng-container *ngIf="productoForm.get('temperaturaMaxima')?.hasError('max')">Máximo 40 °C.</ng-container>
            <ng-container *ngIf="productoForm.hasError('rangoTermico')">Debe ser mayor que la temperatura mínima.</ng-container>
          </small>
        </label>

        <label>
          Vida útil (días)
          <input
            type="number"
            formControlName="vidaUtilDias"
            [class.campo-invalido]="invalido(productoForm, 'vidaUtilDias')"
          />
          <small class="field-error" *ngIf="invalido(productoForm, 'vidaUtilDias')">
            <ng-container *ngIf="productoForm.get('vidaUtilDias')?.hasError('required')">Campo obligatorio.</ng-container>
            <ng-container *ngIf="productoForm.get('vidaUtilDias')?.hasError('min')">Debe ser mayor que 0.</ng-container>
            <ng-container *ngIf="productoForm.get('vidaUtilDias')?.hasError('max')">Máximo 3650 días.</ng-container>
          </small>
        </label>

        <div class="table-actions">
          <button class="primary" type="submit" [disabled]="productoForm.invalid || guardando()">
            {{ editandoId() ? 'Guardar cambios' : 'Registrar producto' }}
          </button>
          <button type="button" *ngIf="editandoId()" (click)="cancelarEdicion()">Cancelar</button>
        </div>
      </form>
    </section>

    <!-- ===================== Lote + temperatura ===================== -->
    <div class="operation-columns" *ngIf="auth.puedeEscribir">
      <section class="panel operation-card">
        <header><h2>Registrar lote</h2><span>POST /api/lotes</span></header>
        <form class="form-content" [formGroup]="loteForm" (ngSubmit)="registrarLote()" novalidate>
          <label>
            Código del lote
            <input
              type="text"
              formControlName="codigo"
              placeholder="Ej. VAX-123"
              [class.campo-invalido]="invalido(loteForm, 'codigo')"
            />
            <small class="field-error" *ngIf="invalido(loteForm, 'codigo')">
              <ng-container *ngIf="loteForm.get('codigo')?.hasError('required')">El código es obligatorio.</ng-container>
              <ng-container *ngIf="loteForm.get('codigo')?.hasError('pattern')">
                Usa de 3 a 20 letras, números o guiones (Ej. VAX-123).
              </ng-container>
            </small>
          </label>

          <div class="two-fields">
            <label>
              Fecha de vencimiento
              <input
                type="date"
                formControlName="fechaVencimiento"
                [class.campo-invalido]="invalido(loteForm, 'fechaVencimiento')"
              />
              <small class="field-error" *ngIf="invalido(loteForm, 'fechaVencimiento')">
                La fecha de vencimiento es obligatoria.
              </small>
            </label>

            <label>
              Estado
              <input
                type="text"
                formControlName="estado"
                placeholder="ACTIVO"
                [class.campo-invalido]="invalido(loteForm, 'estado')"
              />
              <small class="field-error" *ngIf="invalido(loteForm, 'estado')">El estado es obligatorio.</small>
            </label>
          </div>

          <label>
            Producto
            <select formControlName="productoId" [class.campo-invalido]="invalido(loteForm, 'productoId')">
              <option [ngValue]="0">Selecciona un producto...</option>
              <option *ngFor="let producto of productos()" [ngValue]="producto.id">{{ producto.nombre }}</option>
            </select>
            <small class="field-error" *ngIf="invalido(loteForm, 'productoId')">
              Selecciona el producto al que pertenece el lote.
            </small>
          </label>

          <button class="primary" type="submit" [disabled]="loteForm.invalid || guardando()">Registrar lote</button>
        </form>
      </section>

      <section class="panel operation-card">
        <header><h2>Registrar lectura de temperatura</h2><span>POST /api/lotes/:id/temperaturas</span></header>
        <form class="form-content" [formGroup]="temperaturaForm" (ngSubmit)="registrarTemperatura()" novalidate>
          <label>
            Lote
            <select formControlName="loteId" [class.campo-invalido]="invalido(temperaturaForm, 'loteId')">
              <option [ngValue]="0">Selecciona un lote...</option>
              <option *ngFor="let lote of lotes()" [ngValue]="lote.id">
                {{ lote.codigo }} ({{ lote.producto.nombre }})
              </option>
            </select>
            <small class="field-error" *ngIf="invalido(temperaturaForm, 'loteId')">
              Selecciona un lote para registrar la lectura.
            </small>
          </label>

          <div class="two-fields">
            <label>
              Temperatura (°C)
              <input
                type="number"
                step="0.1"
                formControlName="temperatura"
                [class.campo-invalido]="invalido(temperaturaForm, 'temperatura')"
              />
              <small class="field-error" *ngIf="invalido(temperaturaForm, 'temperatura')">
                <ng-container *ngIf="temperaturaForm.get('temperatura')?.hasError('required')">Campo obligatorio.</ng-container>
                <ng-container *ngIf="temperaturaForm.get('temperatura')?.hasError('min')">Mínimo -60 °C.</ng-container>
                <ng-container *ngIf="temperaturaForm.get('temperatura')?.hasError('max')">Máximo 40 °C.</ng-container>
              </small>
            </label>

            <label>
              Ubicación
              <input
                type="text"
                formControlName="ubicacion"
                placeholder="Ej. Almacén A"
                [class.campo-invalido]="invalido(temperaturaForm, 'ubicacion')"
              />
              <small class="field-error" *ngIf="invalido(temperaturaForm, 'ubicacion')">
                Máximo 40 caracteres.
              </small>
            </label>
          </div>

          <button class="primary" type="submit" [disabled]="temperaturaForm.invalid || guardando()">
            Registrar lectura
          </button>
        </form>
      </section>
    </div>

    <!-- ===================== Tabla de productos ===================== -->
    <section class="panel lot-table">
      <header>
        <span>VISTA: <b>Productos</b></span>
        <span>Mostrando {{ productos().length }} registros reales</span>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>NOMBRE</th>
              <th>TIPO</th>
              <th class="right">RANGO PERMITIDO</th>
              <th class="right">VIDA ÚTIL</th>
              <th class="right">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let producto of productos()">
              <td class="blue">{{ producto.id }}</td>
              <td>{{ producto.nombre }}</td>
              <td>{{ producto.tipo }}</td>
              <td class="right">{{ producto.temperaturaMinima }}°C a {{ producto.temperaturaMaxima }}°C</td>
              <td class="right">{{ producto.vidaUtilDias }} días</td>
              <td>
                <div class="table-actions">
                  <button type="button" (click)="verDetalle(producto)">Ver</button>
                  <button type="button" *ngIf="auth.puedeEscribir" (click)="editarProducto(producto)">
                    Editar
                  </button>
                  <button
                    type="button"
                    class="danger"
                    *ngIf="auth.esAdmin"
                    (click)="eliminarProducto(producto)"
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!productos().length">
              <td colspan="6" class="empty">No hay productos registrados.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ===================== Tabla de lotes ===================== -->
    <section class="panel lot-table">
      <header>
        <span>VISTA: <b>Todos los lotes</b></span>
        <span>Mostrando {{ lotesVisibles().length }} de {{ lotes().length }} registros</span>
      </header>
      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th>ID DE LOTE</th>
              <th>PRODUCTO</th>
              <th class="right">TEMPERATURA</th>
              <th>ESTADO</th>
              <th>RANGO PERMITIDO</th>
              <th>ÚLTIMA LECTURA</th>
              <th class="right" *ngIf="auth.esAdmin">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let lote of lotesVisibles()" [class.row-danger]="fueraDeRango(lote)">
              <td class="blue">{{ lote.codigo }}</td>
              <td>{{ lote.producto.nombre }}</td>
              <td class="right">{{ temperatura(lote) }}°C</td>
              <td>
                <span
                  class="status"
                  [class.badge-danger]="fueraDeRango(lote)"
                  [class.badge-warning]="advertencia(lote)"
                >{{ estado(lote) }}</span>
              </td>
              <td>{{ lote.producto.temperaturaMinima }}°C a {{ lote.producto.temperaturaMaxima }}°C</td>
              <td>{{ fecha(lote) }}</td>
              <td *ngIf="auth.esAdmin">
                <div class="table-actions">
                  <button type="button" class="danger" (click)="eliminarLote(lote)">Eliminar</button>
                </div>
              </td>
            </tr>
            <tr *ngIf="!lotesVisibles().length">
              <td [attr.colspan]="auth.esAdmin ? 7 : 6" class="empty">
                No hay lotes que coincidan con la búsqueda.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <footer>Total: {{ lotes().length }} lote(s)</footer>
    </section>
  `,
})
export class LotsComponent {
  private readonly api = inject(ColdtraceApiService);
  private readonly store = inject(ColdtraceStoreService);
  private readonly ui = inject(UiStateService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  readonly lotes = this.store.lotes;
  readonly productos = this.store.productos;
  readonly lecturas = this.store.lecturas;
  readonly filtro = toSignal(this.ui.search$, { initialValue: '' });

  readonly editandoId = signal<number | null>(null);
  readonly mensaje = signal('');
  readonly error = signal(false);
  readonly guardando = signal(false);

  readonly lotesVisibles = computed(() => {
    const filtro = this.filtro();
    const lotes = this.lotes();
    if (!filtro) return lotes;
    return lotes.filter(
      (lote) =>
        lote.codigo.toLowerCase().includes(filtro) ||
        lote.producto.nombre.toLowerCase().includes(filtro) ||
        lote.estado.toLowerCase().includes(filtro) ||
        (this.lectura(lote)?.ubicacion ?? '').toLowerCase().includes(filtro)
    );
  });

  readonly productoForm = this.fb.nonNullable.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(60)]],
      tipo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(40)]],
      temperaturaMinima: [2, [Validators.required, Validators.min(-60), Validators.max(40)]],
      temperaturaMaxima: [8, [Validators.required, Validators.min(-60), Validators.max(40)]],
      vidaUtilDias: [30, [Validators.required, Validators.min(1), Validators.max(3650)]],
    },
    { validators: rangoTermico }
  );

  readonly loteForm = this.fb.nonNullable.group({
    codigo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]{3,20}$/)]],
    fechaVencimiento: ['', [Validators.required]],
    estado: ['ACTIVO', [Validators.required]],
    productoId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly temperaturaForm = this.fb.nonNullable.group({
    loteId: [0, [Validators.required, Validators.min(1)]],
    temperatura: [4, [Validators.required, Validators.min(-60), Validators.max(40)]],
    ubicacion: ['', [Validators.maxLength(40)]],
  });

  // ------------------------- Utilidades de validación -------------------------
  invalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private mostrarError(mensaje: string) {
    this.error.set(true);
    this.mensaje.set(mensaje);
  }

  private mostrarExito(mensaje: string) {
    this.error.set(false);
    this.mensaje.set(mensaje);
  }

  private mensajeError(err: any): string {
    if (err?.error?.message) return err.error.message;
    if (err?.status === 403) return 'Tu rol no tiene permiso para realizar esta acción.';
    if (err?.status === 409) return 'No se puede eliminar: el registro está referenciado por otros datos.';
    if (err?.status === 0) return 'No se pudo conectar con la API. Verifica que el backend esté corriendo.';
    return 'No se pudo completar la operación.';
  }

  // ------------------------- Productos -------------------------
  registrarProducto(): void {
    if (this.productoForm.invalid) {
      this.productoForm.markAllAsTouched();
      this.mostrarError('Revisa los campos marcados en rojo antes de guardar.');
      return;
    }

    const datos = this.productoForm.getRawValue();
    const editando = this.editandoId();
    const peticion =
      editando === null ? this.api.registrarProducto(datos) : this.api.actualizarProducto(editando, datos);

    this.guardando.set(true);
    peticion.subscribe({
      next: (resultado) => {
        this.guardando.set(false);
        this.mostrarExito(
          editando === null
            ? `Producto ${resultado.nombre} registrado correctamente con ID ${resultado.id}.`
            : `Producto ${resultado.nombre} actualizado correctamente.`
        );
        this.productoForm.reset({
          nombre: '',
          tipo: '',
          temperaturaMinima: 2,
          temperaturaMaxima: 8,
          vidaUtilDias: 30,
        });
        this.editandoId.set(null);
        this.store.recargar();
      },
      error: (err) => {
        this.guardando.set(false);
        this.mostrarError(this.mensajeError(err));
      },
    });
  }

  editarProducto(producto: { id: number; nombre: string; tipo: string; temperaturaMinima: number; temperaturaMaxima: number; vidaUtilDias: number }): void {
    this.editandoId.set(producto.id);
    this.productoForm.setValue({
      nombre: producto.nombre,
      tipo: producto.tipo,
      temperaturaMinima: producto.temperaturaMinima,
      temperaturaMaxima: producto.temperaturaMaxima,
      vidaUtilDias: producto.vidaUtilDias,
    });
    this.productoForm.markAsPristine();
    this.mostrarExito(`Editando el producto #${producto.id}. Modifica los datos y guarda los cambios.`);
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.productoForm.reset({
      nombre: '',
      tipo: '',
      temperaturaMinima: 2,
      temperaturaMaxima: 8,
      vidaUtilDias: 30,
    });
    this.mensaje.set('');
    this.error.set(false);
  }

  eliminarProducto(producto: { id: number; nombre: string }): void {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;

    this.api.eliminarProducto(producto.id).subscribe({
      next: () => {
        this.mostrarExito(`Producto "${producto.nombre}" eliminado.`);
        if (this.editandoId() === producto.id) this.cancelarEdicion();
        this.store.recargar();
      },
      error: (err) => this.mostrarError(this.mensajeError(err)),
    });
  }

  verDetalle(producto: { id: number }): void {
    this.router.navigate(['/productos', producto.id]);
  }

  // ------------------------- Lotes -------------------------
  registrarLote(): void {
    if (this.loteForm.invalid) {
      this.loteForm.markAllAsTouched();
      this.mostrarError('Completa código, fecha de vencimiento y producto del lote.');
      return;
    }

    const datos = this.loteForm.getRawValue();
    this.guardando.set(true);
    this.api
      .registrarLote({
        codigo: datos.codigo,
        fechaVencimiento: datos.fechaVencimiento,
        estado: datos.estado,
        producto: { id: datos.productoId },
      })
      .subscribe({
        next: (resultado) => {
          this.guardando.set(false);
          this.mostrarExito(`Lote ${resultado.codigo} registrado correctamente con ID ${resultado.id}.`);
          this.loteForm.reset({ codigo: '', fechaVencimiento: '', estado: 'ACTIVO', productoId: 0 });
          this.store.recargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.mostrarError(this.mensajeError(err));
        },
      });
  }

  eliminarLote(lote: Lote): void {
    if (!confirm(`¿Eliminar el lote "${lote.codigo}"? También se eliminarán sus lecturas.`)) return;

    this.api.eliminarLote(lote.id).subscribe({
      next: () => {
        this.mostrarExito(`Lote "${lote.codigo}" eliminado.`);
        this.store.recargar();
      },
      error: (err) => this.mostrarError(this.mensajeError(err)),
    });
  }

  // ------------------------- Temperaturas -------------------------
  registrarTemperatura(): void {
    if (this.temperaturaForm.invalid) {
      this.temperaturaForm.markAllAsTouched();
      this.mostrarError('Selecciona un lote y verifica la temperatura antes de registrar.');
      return;
    }

    const datos = this.temperaturaForm.getRawValue();
    this.guardando.set(true);
    this.api
      .registrarTemperatura(datos.loteId, { temperatura: datos.temperatura, ubicacion: datos.ubicacion })
      .subscribe({
        next: (resultado) => {
          this.guardando.set(false);
          this.mostrarExito(
            `Lectura de ${resultado.temperatura}°C registrada para el lote ${resultado.lote?.codigo ?? datos.loteId}.`
          );
          this.temperaturaForm.patchValue({ ubicacion: '' });
          this.store.recargar();
        },
        error: (err) => {
          this.guardando.set(false);
          this.mostrarError(this.mensajeError(err));
        },
      });
  }

  // ------------------------- Vista -------------------------
  lectura(lote: Lote): Temperatura | undefined {
    return this.lecturas().get(lote.id)?.[0];
  }

  temperatura(lote: Lote): string {
    return this.lectura(lote)?.temperatura?.toFixed(1) ?? '--';
  }

  fecha(lote: Lote): string {
    const registro = this.lectura(lote)?.fechaRegistro;
    return registro ? registro.slice(0, 16).replace('T', ' ') : 'Sin lectura';
  }

  fueraDeRango(lote: Lote): boolean {
    const valor = this.lectura(lote)?.temperatura;
    return (
      valor !== undefined &&
      (valor < lote.producto.temperaturaMinima || valor > lote.producto.temperaturaMaxima)
    );
  }

  advertencia(lote: Lote): boolean {
    const valor = this.lectura(lote)?.temperatura;
    return (
      !this.fueraDeRango(lote) &&
      valor !== undefined &&
      (valor < lote.producto.temperaturaMinima + 0.5 || valor > lote.producto.temperaturaMaxima - 0.5)
    );
  }

  estado(lote: Lote): string {
    if (this.fueraDeRango(lote)) return 'Crítico';
    if (this.advertencia(lote)) return 'Advertencia';
    return this.lectura(lote) ? 'En rango' : 'Sin lectura';
  }
}
