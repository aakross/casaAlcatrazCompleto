import { IRentasRepository } from "../domain/rentas.repository.interface";
import {
  Region,
  Lugar,
  LocalComercial,
  ContratoRenta,
  PagoRenta,
  AuditoriaPagoRenta,
  AdeudoResumen,
  DashboardRentas,
} from "../domain/rentas.types";

export class RentasUseCase {
  constructor(private readonly repository: IRentasRepository) {}

  // Regiones
  async listarRegiones(): Promise<Region[]> {
    return this.repository.obtenerRegiones();
  }

  async crearRegion(nombre: string, descripcion: string | null, usuarioId: number): Promise<Region> {
    if (!nombre || !nombre.trim()) {
      throw new Error("El nombre de la región es obligatorio.");
    }
    return this.repository.crearRegion(nombre.trim(), descripcion?.trim() || null, usuarioId);
  }

  async actualizarRegion(
    id: number,
    data: { nombre: string; descripcion?: string | null },
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de región inválido.");
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error("El nombre de la región es obligatorio.");
    }
    return this.repository.actualizarRegion(
      id,
      { nombre: data.nombre.trim(), descripcion: data.descripcion?.trim() || null },
      usuarioId
    );
  }

  // Lugares
  async listarLugares(regionId?: number): Promise<Lugar[]> {
    return this.repository.obtenerLugares(regionId);
  }

  async crearLugar(
    regionId: number,
    nombre: string,
    direccion: string | null,
    usuarioId: number
  ): Promise<Lugar> {
    if (!regionId || regionId <= 0) {
      throw new Error("Debe seleccionar una región válida.");
    }
    if (!nombre || !nombre.trim()) {
      throw new Error("El nombre del lugar/complejo es obligatorio.");
    }
    return this.repository.crearLugar(regionId, nombre.trim(), direccion?.trim() || null, usuarioId);
  }

  async actualizarLugar(
    id: number,
    data: { region_id: number; nombre: string; direccion?: string | null },
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de lugar inválido.");
    if (!data.region_id || data.region_id <= 0) {
      throw new Error("Debe seleccionar una región válida.");
    }
    if (!data.nombre || !data.nombre.trim()) {
      throw new Error("El nombre del lugar/complejo es obligatorio.");
    }
    return this.repository.actualizarLugar(
      id,
      {
        region_id: data.region_id,
        nombre: data.nombre.trim(),
        direccion: data.direccion?.trim() || null,
      },
      usuarioId
    );
  }

  // Locales
  async listarLocales(lugarId?: number): Promise<LocalComercial[]> {
    return this.repository.obtenerLocales(lugarId);
  }

  async crearLocal(
    data: {
      lugar_id: number;
      numero_fisico: string;
      nickname: string;
      monto_renta_sugerido: number;
      descripcion?: string | null;
    },
    usuarioId: number
  ): Promise<LocalComercial> {
    if (!data.lugar_id || data.lugar_id <= 0) {
      throw new Error("Debe asociar el local a un lugar o complejo válido.");
    }
    if (!data.numero_fisico || !data.numero_fisico.trim()) {
      throw new Error("El número físico del local es obligatorio.");
    }
    if (!data.nickname || !data.nickname.trim()) {
      throw new Error("El nombre comercial o nickname es obligatorio.");
    }
    return this.repository.crearLocal(data, usuarioId);
  }

  async actualizarLocal(
    id: number,
    data: {
      lugar_id: number;
      numero_fisico: string;
      nickname: string;
      monto_renta_sugerido: number;
      descripcion?: string | null;
    },
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de local inválido.");
    return this.repository.actualizarLocal(id, data, usuarioId);
  }

  async eliminarLocal(id: number, usuarioId: number): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de local inválido.");
    return this.repository.eliminarLocal(id, usuarioId);
  }

  // Contratos
  async listarContratos(localId?: number): Promise<ContratoRenta[]> {
    return this.repository.obtenerContratos(localId);
  }

  async crearContrato(
    data: {
      local_id: number;
      nombre_comercial?: string | null;
      arrendatario_nombre: string;
      arrendatario_telefono?: string | null;
      arrendatario_email?: string | null;
      fecha_inicio: string;
      fecha_fin?: string | null;
      monto_renta_mensual: number;
      dia_corte: number;
    },
    usuarioId: number
  ): Promise<ContratoRenta> {
    if (!data.local_id || data.local_id <= 0) throw new Error("Local inválido.");
    if (!data.arrendatario_nombre || !data.arrendatario_nombre.trim()) {
      throw new Error("El nombre del arrendatario es obligatorio.");
    }
    if (!data.fecha_inicio) throw new Error("La fecha de inicio de contrato es obligatoria.");
    if (data.monto_renta_mensual <= 0) throw new Error("El monto de renta mensual debe ser mayor a 0.");
    if (!data.dia_corte || data.dia_corte < 1 || data.dia_corte > 31) {
      data.dia_corte = 1;
    }
    return this.repository.crearContrato(data, usuarioId);
  }

  async actualizarContrato(
    id: number,
    data: {
      nombre_comercial?: string | null;
      arrendatario_nombre: string;
      arrendatario_telefono?: string | null;
      arrendatario_email?: string | null;
      fecha_inicio?: string | null;
      fecha_fin?: string | null;
      monto_renta_mensual: number;
      dia_corte: number;
      vigente: boolean;
    },
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de contrato inválido.");
    if (!data.arrendatario_nombre || !data.arrendatario_nombre.trim()) {
      throw new Error("El nombre del arrendatario es obligatorio.");
    }
    if (data.monto_renta_mensual === undefined || Number(data.monto_renta_mensual) < 0) {
      throw new Error("El monto de la renta mensual debe ser un valor numérico válido.");
    }
    if (data.dia_corte < 1 || data.dia_corte > 31) {
      data.dia_corte = 1;
    }
    return this.repository.actualizarContrato(
      id,
      {
        ...data,
        monto_renta_mensual: Number(data.monto_renta_mensual),
        arrendatario_nombre: data.arrendatario_nombre.trim(),
        nombre_comercial: data.nombre_comercial?.trim() || null,
        arrendatario_telefono: data.arrendatario_telefono?.trim() || null,
        arrendatario_email: data.arrendatario_email?.trim() || null,
        fecha_inicio: data.fecha_inicio?.trim() || null,
        fecha_fin: data.fecha_fin?.trim() || null,
      },
      usuarioId
    );
  }

  async finalizarContrato(id: number, usuarioId: number): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de contrato inválido.");
    return this.repository.finalizarContrato(id, usuarioId);
  }

  // Pagos
  async listarPagos(contratoId?: number): Promise<PagoRenta[]> {
    return this.repository.obtenerPagos(contratoId);
  }

  async crearPago(
    data: {
      contrato_id: number;
      monto: number;
      meses_cubiertos: number;
      periodo_cubierto?: string | null;
      fecha_abono_real: string;
      metodo_pago: string;
      referencia_bancaria?: string | null;
      nota?: string | null;
    },
    usuarioId: number
  ): Promise<PagoRenta> {
    if (!data.contrato_id || data.contrato_id <= 0) throw new Error("Contrato inválido.");
    if (!data.monto || data.monto <= 0) throw new Error("El monto del pago debe ser mayor a 0.");
    if (!data.fecha_abono_real) throw new Error("La fecha de abono real (banco) es obligatoria.");
    if (!data.meses_cubiertos || data.meses_cubiertos <= 0) {
      data.meses_cubiertos = 1.0;
    }
    return this.repository.crearPago(
      {
        ...data,
        periodo_cubierto: data.periodo_cubierto?.trim() || null,
      },
      usuarioId
    );
  }

  async actualizarPagoConAuditoria(
    id: number,
    data: {
      monto: number;
      meses_cubiertos: number;
      periodo_cubierto?: string | null;
      fecha_abono_real: string;
      metodo_pago: string;
      referencia_bancaria?: string | null;
      nota?: string | null;
      motivo_cambio: string;
    },
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de pago inválido.");
    if (!data.motivo_cambio || !data.motivo_cambio.trim()) {
      throw new Error("Debe especificar obligatoriamente el motivo de la modificación por auditoría.");
    }
    if (!data.monto || data.monto <= 0) throw new Error("El monto debe ser mayor a 0.");
    if (!data.fecha_abono_real) throw new Error("La fecha de abono real es obligatoria.");
    return this.repository.actualizarPagoConAuditoria(
      id,
      {
        ...data,
        periodo_cubierto: data.periodo_cubierto?.trim() || null,
      },
      usuarioId
    );
  }

  async eliminarPagoConAuditoria(
    id: number,
    motivo_cambio: string,
    usuarioId: number
  ): Promise<boolean> {
    if (!id || id <= 0) throw new Error("ID de pago inválido.");
    if (!motivo_cambio || !motivo_cambio.trim()) {
      throw new Error("Debe especificar obligatoriamente el motivo de la baja lógica.");
    }
    return this.repository.eliminarPagoConAuditoria(id, motivo_cambio.trim(), usuarioId);
  }

  async obtenerAuditoriaPago(pagoId: number): Promise<AuditoriaPagoRenta[]> {
    if (!pagoId || pagoId <= 0) throw new Error("ID de pago inválido.");
    return this.repository.obtenerAuditoriaPago(pagoId);
  }

  // Adeudos y Dashboard
  async obtenerControlAdeudos(): Promise<AdeudoResumen[]> {
    return this.repository.obtenerControlAdeudos();
  }

  async obtenerDashboard(): Promise<DashboardRentas> {
    return this.repository.obtenerDashboard();
  }
}
