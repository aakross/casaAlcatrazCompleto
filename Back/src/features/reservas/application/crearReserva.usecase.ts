// 📁 /application/usecases/crear-reserva.usecase.ts

import {
  CrearReservaInput,
  IReservaRepository,
  ReservacionExtra,
} from "../domain/reservas.respository";

export interface CrearReservaResponse {
  success: boolean;
  data: { id: number } & CrearReservaInput & {
      resumenFinanciero: {
        totalHospedaje: number;
        totalComisionPlataforma: number;
        totalExtras: number;
        totalGranTotal: number;
        ingresoNetoPropietario: number;
        montoGarantia: number;
      };
    };
}

export class CrearReservaUseCase {
  constructor(private reservaRepository: IReservaRepository) {}

  async execute(input: CrearReservaInput): Promise<CrearReservaResponse> {
    // 1. Calcular el monto base del hospedaje (días x precio de la noche)
    const montoHospedajeCalculado =
      input.totalDiasReservacion * input.precioNoche;

    // 2. Calcular el dinero real de la comisión de la plataforma (Cabecera)
    const montoComisionCalculado =
      (montoHospedajeCalculado * input.porcentajeComision) / 100;

    // 3. Procesar y calcular cada uno de los extras de forma independiente
    let totalExtrasNetosCalculado = 0; // 🌟 Cambiado a acumulador NETO
    let totalComisionesExtras = 0; // 🆕 Para el resumen financiero totalizado

    const extrasProcesados: ReservacionExtra[] = (input.extras || []).map(
      (extra) => {
        const subtotalExtraBruto =
          extra.cantidad * extra.dias * extra.precioUnitarioNoche;

        let porcComisionExtra = 0;
        let montoComisionExtra = 0;

        // Validación universal para el Jardín (con o sin acento)
        const conceptoMinusculas = extra.concepto.toLowerCase().trim();
        if (
          conceptoMinusculas === "jardin" ||
          conceptoMinusculas === "jardín"
        ) {
          porcComisionExtra =
            Number((extra as any).comision) || extra.porcentajeComision || 0;
          montoComisionExtra = (subtotalExtraBruto * porcComisionExtra) / 100;
        }

        // 🌟 EL CAMBIO CONTABLE: El monto real del servicio es el Bruto MENOS su comisión
        const montoExtraNeto = subtotalExtraBruto - montoComisionExtra;

        // Acumulamos para los totales globales
        totalExtrasNetosCalculado += montoExtraNeto;
        totalComisionesExtras += montoComisionExtra;

        return {
          ...extra,
          monto: montoExtraNeto,
          tipoEvento: (extra as any).tipoEvento || "",
          porcentajeComision: porcComisionExtra,
          montoComision: montoComisionExtra,
        };
      },
    );

    // 4. Totales consolidados exactos (Hospedaje Base + Extras ya Netos)
    const totalReservaConExtrasNetos =
      montoHospedajeCalculado + totalExtrasNetosCalculado;

    // El ingreso neto real libre de comisiones de plataforma y libre de comisiones de extras
    const totalEsperadoNeto =
      totalReservaConExtrasNetos - montoComisionCalculado;

    // 5. Enriquecer el objeto input antes de enviarlo al repositorio SQL
    const reservaConCalculos: CrearReservaInput = {
      ...input,
      montoTotal: montoHospedajeCalculado, // Mantiene los $14,000 limpios en la cabecera
      extras: extrasProcesados,
    };

    // 6. Guardar en SQL Server 2008R2 a través del repositorio
    const reservaCreada =
      await this.reservaRepository.create(reservaConCalculos);

    // 7. Retornar la respuesta con el resumen financiero exacto para tu frontend
    return {
      success: true,
      data: {
        id: reservaCreada.id,
        ...reservaConCalculos,
        resumenFinanciero: {
          totalHospedaje: montoHospedajeCalculado, // $14,000.00
          totalComisionPlataforma:
            montoComisionCalculado + totalComisionesExtras, // 🆕 Suma ambas comisiones ($1,680 + $1,800 = $3,480)
          totalExtras: totalExtrasNetosCalculado, // $13,300.00 (Netos)
          totalGranTotal: totalReservaConExtrasNetos, // $27,300.00 (Hospedaje + Extras Netos)
          ingresoNetoPropietario: totalEsperadoNeto, // $23,820.00 (Ganancia final real)
          montoGarantia: input.montoGarantia,
        },
      },
    };
  }
}
