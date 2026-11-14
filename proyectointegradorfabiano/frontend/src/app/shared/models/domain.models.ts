/** Modelos de dominio compartidos por los servicios y las vistas. */

export interface Producto {
  id: number;
  nombre: string;
  tipo: string;
  temperaturaMinima: number;
  temperaturaMaxima: number;
  vidaUtilDias: number;
}

export interface Lote {
  id: number;
  codigo: string;
  fechaVencimiento: string;
  estado: string;
  producto: Producto;
}

export interface Temperatura {
  id: number;
  temperatura: number;
  fechaRegistro: string;
  ubicacion?: string;
  lote?: Lote;
}

export interface Operacion {
  id?: number;
  manifiesto: string;
  loteId?: number;
  transportista: string;
  tipoProducto: string;
  controlesConfirmados: string[];
  inspector: string;
  firma?: string;
  evidencia?: string;
  fechaRegistro?: string;
  estado?: string;
}

export interface RecepcionData {
  temperatura: number;
  logger?: string;
  sello?: boolean;
  dano?: boolean;
  firma?: string;
}

export interface NuevoLote {
  codigo: string;
  fechaVencimiento: string;
  estado: string;
  producto: { id: number };
}

export interface NuevaTemperatura {
  temperatura: number;
  ubicacion?: string;
}
