export interface Region {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
  usuario_creo_id: number;
  fecha_creacion: string | Date;
  usuario_modifico_id?: number | null;
  fecha_modificacion?: string | Date | null;
}

export interface Lugar {
  id: number;
  region_id: number;
  region_nombre?: string;
  nombre: string;
  direccion?: string | null;
  activo: boolean;
  usuario_creo_id: number;
  fecha_creacion: string | Date;
  usuario_modifico_id?: number | null;
  fecha_modificacion?: string | Date | null;
}

export interface LocalComercial {
  id: number;
  lugar_id: number;
  lugar_nombre?: string;
  region_nombre?: string;
  numero_fisico: string;
  nickname: string;
  monto_renta_sugerido: number;
  descripcion?: string | null;
  activo: boolean;
  ocupado?: boolean;
  contrato_vigente_id?: number | null;
  arrendatario_actual?: string | null;
  usuario_creo_id: number;
  fecha_creacion: string | Date;
  usuario_modifico_id?: number | null;
  fecha_modificacion?: string | Date | null;
}

export interface ContratoRenta {
  id: number;
  local_id: number;
  local_numero?: string;
  local_nickname?: string;
  lugar_nombre?: string;
  arrendatario_nombre: string;
  arrendatario_telefono?: string | null;
  arrendatario_email?: string | null;
  fecha_inicio: string | Date;
  fecha_fin?: string | Date | null;
  monto_renta_mensual: number;
  dia_corte: number;
  vigente: boolean;
  activo: boolean;
  usuario_creo_id: number;
  fecha_creacion: string | Date;
  usuario_modifico_id?: number | null;
  fecha_modificacion?: string | Date | null;
}

export interface PagoRenta {
  id: number;
  contrato_id: number;
  local_nickname?: string;
  arrendatario_nombre?: string;
  monto: number;
  meses_cubiertos: number;
  fecha_abono_real: string; // YYYY-MM-DD
  fecha_captura: string | Date;
  metodo_pago: string;
  referencia_bancaria?: string | null;
  nota?: string | null;
  activo: boolean;
  usuario_creo_id: number;
  usuario_creo_nombre?: string;
  fecha_creacion: string | Date;
  usuario_modifico_id?: number | null;
  fecha_modificacion?: string | Date | null;
}

export interface AuditoriaPagoRenta {
  id: number;
  pago_id: number;
  accion: "EDICION" | "BAJA_LOGICA";
  monto_anterior: number;
  monto_nuevo: number;
  fecha_abono_anterior: string;
  fecha_abono_nuevo: string;
  meses_cubiertos_anterior: number;
  meses_cubiertos_nuevo: number;
  motivo_cambio: string;
  usuario_id: number;
  usuario_nombre?: string;
  fecha_evento: string | Date;
}

export interface AdeudoResumen {
  contrato_id: number;
  region: string;
  lugar: string;
  numero_fisico: string;
  nickname: string;
  arrendatario_nombre: string;
  fecha_inicio: string;
  dia_corte: number;
  monto_renta_mensual: number;
  meses_cobrables: number;
  meses_pagados: number;
  total_pagado: number;
  meses_adeudo: number;
  monto_adeudo: number;
  estatus_cartera: "AL CORRIENTE" | "CON ADEUDO";
}

export interface DashboardRentas {
  ocupacion: {
    total_locales: number;
    locales_rentados: number;
    locales_disponibles: number;
    porcentaje_ocupacion: number;
  };
  cartera: {
    contratos_al_corriente: number;
    contratos_con_adeudo: number;
    monto_deuda_acumulada: number;
  };
  ingresosMesActual: {
    total_ingreso: number;
    total_pagos: number;
  };
  historicoRecaudacion: Array<{
    anio: number;
    mes: number;
    total_recaudado: number;
  }>;
}
