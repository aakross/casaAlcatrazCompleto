// Dominio del feature reporteador / bitácora de auditoría

export interface ExtraEliminado {
  id: number;
  concepto: string;
  monto: number;
  cantidad: number;
  dias: number;
  precioNoche: number;
}

export interface BitacoraCambioItem {
  campo: string;
  valorAnterior: any;
  valorNuevo: any;
}

export interface BitacoraItem {
  id: number | string;
  tablaAfectada: string;
  registroId: number;
  usuarioId: number | string | null;
  fechaBorrado: string;
  accion: "BORRADO" | "ACTUALIZACION" | "EDICION";
  detalles: {
    montoTotal?: number;
    fechaInicio?: string;
    fechaFin?: string;
    clienteNombre?: string;
    extras?: ExtraEliminado[];
    concepto?: string;
    descripcion?: string;
    referenciaComprobante?: string;
    resumen?: string;
    cambios?: BitacoraCambioItem[];
  };
}

export interface IBitacoraRepository {
  obtenerBitacora(): Promise<BitacoraItem[]>;
}
