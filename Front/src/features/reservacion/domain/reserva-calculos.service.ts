// Servicio de dominio para cálculos financieros de reservaciones.
// Contiene lógica de negocio pura — sin dependencias de React, Axios ni ningún framework.

export interface TotalesReserva {
  totalHospedajeBase: number;
  subtotalExtras: number;
  granMontoTotalCalculado: number;
  comisionPlataformaCalculada: number;
  gananciaNetaEsperada: number;
}

export interface ExtraItem {
  cantidad?: number | string;
  dias?: number | string;
  precioUnitarioNoche?: number | string;
  monto?: number;
  [key: string]: unknown;
}

/**
 * Calcula todos los totales financieros de una reservación.
 * Recibe los valores crudos del formulario y retorna los montos calculados.
 */
export function calcularTotalesReserva(
  diasHospedaje: number,
  precioNoche: number,
  porcentajeComision: number,
  extras: ExtraItem[],
): TotalesReserva {
  const totalHospedajeBase = diasHospedaje * precioNoche;

  const subtotalExtras = extras.reduce((acc, extra) => {
    if (!extra) return acc;
    const cantidad = Number(extra.cantidad) || 0;
    const dias = Number(extra.dias) || 0;
    const precio = Number(extra.precioUnitarioNoche) || 0;
    return acc + cantidad * dias * precio;
  }, 0);

  const granMontoTotalCalculado = totalHospedajeBase + subtotalExtras;
  const comisionPlataformaCalculada = (totalHospedajeBase * porcentajeComision) / 100;
  const gananciaNetaEsperada = granMontoTotalCalculado - comisionPlataformaCalculada;

  return {
    totalHospedajeBase,
    subtotalExtras,
    granMontoTotalCalculado,
    comisionPlataformaCalculada,
    gananciaNetaEsperada,
  };
}

/**
 * Transforma y normaliza el concepto de un extra antes de enviarlo al backend.
 * Aplica las mismas reglas de negocio que antes vivían en el hook de presentación.
 */
export function normalizarExtraParaEnvio(extra: any): object {
  let conceptoFinal = extra.concepto || "";

  if (String(extra.concepto).toLowerCase().trim().includes("otro")) {
    conceptoFinal =
      extra.otroConcepto && extra.otroConcepto.trim() !== ""
        ? extra.otroConcepto
        : "Servicio Personalizado";
  }

  const conceptoNormalizado = String(conceptoFinal).toLowerCase().trim();
  const esJardin =
    conceptoNormalizado === "jardin" || conceptoNormalizado === "jardín";
  const comisionFinal = Number(extra.porcentajeComision) || 0;

  return {
    concepto: String(conceptoFinal).trim(),
    cantidad: esJardin ? 1 : Number(extra.cantidad) || 1,
    tipoEvento: esJardin
      ? `${String(extra.tipoEvento || "Evento").trim()} - ${Number(extra.invitadosEvento || 0)} personas`
      : "",
    dias: Number(extra.dias) || 1,
    precioUnitarioNoche: Number(extra.precioUnitarioNoche) || 0,
    porcentajeComision: esJardin ? comisionFinal : 0,
    comision: esJardin ? comisionFinal : 0,
  };
}
