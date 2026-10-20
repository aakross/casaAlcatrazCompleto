import { useState, useEffect, useCallback } from "react";
import {
  IngresoRepository,
  type IngresoApiResponse,
} from "../../../pagos/infrastructure/ingreso.repository";
import { ReservaRepository } from "../../../reservacion/infrastructure/reservas.repository";

export const useDetalleReserva = (reservaId: number | null) => {
  const [pagos, setPagos] = useState<IngresoApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalHospedajeBase, setTotalHospedajeBase] = useState(0);
  const [totalExtras, setTotalExtras] = useState(0);
  const [montoGarantia, setMontoGarantia] = useState(0);
  const [granTotalEstancia, setGranTotalEstancia] = useState(0);
  const [extrasDesglosados, setExtrasDesglosados] = useState<any[]>([]);
  const [porcentajeComision, setPorcentajeComision] = useState(0);
  const [totalComisiones, setTotalComisiones] = useState(0);
  const [precioNoche, setPrecioNoche] = useState(0);
  const [
    // datosCliente,
  ] = useState<any>(null);

  const cargarDetalles = useCallback(async () => {
    if (!reservaId) return;
    setIsLoading(true);
    try {
      // Petición A: Pagos recibidos en caja
      const data = await IngresoRepository.getByReservaId(reservaId);
      setPagos(data);

      // Petición B: Datos maestros de la reserva por ID
      const response = await ReservaRepository.getById(reservaId);
      const reserva = response.data || response;

      setPrecioNoche(Number(reserva.precioNoche || 0));

      // Cargamos los valores brutos de la base de datos
      const montoTotalReserva = Number(reserva.montoTotal || 0);
      const extrasMonto = Number(reserva.totalExtras || 0);
      const comisionMonto = Number(reserva.montoComision || 0);

      setTotalHospedajeBase(montoTotalReserva);
      setTotalExtras(extrasMonto);
      setMontoGarantia(Number(reserva.montoGarantia || 0));
      setExtrasDesglosados(reserva.extras || []);
      setPorcentajeComision(Number(reserva.porcentajeComision || 0));
      setTotalComisiones(comisionMonto);

      // 🌟 FÓRMULA NUEVA: Costo de reserva original + servicios extras - Comisión deducida de la plataforma
      // Caso 4: 70000 + 2000 - 7000 = 65000
      const totalConsolidado = montoTotalReserva + extrasMonto - comisionMonto;
      setGranTotalEstancia(totalConsolidado);
    } catch (error) {
      console.error("Error al consultar detalles consolidados:", error);
    } finally {
      setIsLoading(false);
    }
  }, [reservaId]);

  useEffect(() => {
    cargarDetalles();
  }, [cargarDetalles]);

  // Tomamos el primer registro de la respuesta de ingresos para armar la cabecera
  const primerRegistro = pagos[0];
  const costoTotal =
    totalHospedajeBase || primerRegistro?.montoTotalReserva || 0;

  // Sumamos los abonos reales del cliente
  const totalPagadoCliente = pagos.reduce(
    (sum, item) => sum + item.montoBrutoPago,
    0,
  );

  // 🌟 BALANCE PENDIENTE: Lo que realmente le falta depositar al cliente sobre la nueva estancia total
  // Caso 4: 65000 - 31000 = 34000
  const balancePendiente = granTotalEstancia - totalPagadoCliente;

  return {
    pagos,
    isLoading,
    refrescarPagos: cargarDetalles,
    datosCliente: primerRegistro
      ? {
          nombreCompleto: `${primerRegistro.nombre} ${primerRegistro.apellido}`,
          folio: primerRegistro.folioReserva,
          fechaInicio: primerRegistro.fechaInicio,
          fechaFin: primerRegistro.fechaFin,
          precioNoche,
          // estado: primerRegistro.estadoReservacion,
          estado:
            primerRegistro.estadoReservacion === "Finalizado"
              ? "Finalizado"
              : balancePendiente <= 0
                ? "Liquidado"
                : "Pendiente",
        }
      : null,
    costoTotal,
    totalPagadoCliente,
    balancePendiente, // Retorna la fórmula exacta corregida
    totalComisiones,
    totalHospedajeBase,
    totalExtras,
    montoGarantia,
    granTotalEstancia, // Retorna la fórmula exacta corregida
    extrasDesglosados,
    porcentajeComision,
  };
};
//   const cargarDetalles = useCallback(async () => {
//     if (!reservaId) return;
//     setIsLoading(true);
//     try {
//       // Petición A: Tu consulta original de pagos recibidos
//       const data = await IngresoRepository.getByReservaId(reservaId);
//       setPagos(data);

//       // Petición B: Agregamos la consulta por ID de la reserva en el mismo flujo
//       const response = await ReservaRepository.getById(reservaId);
//       const reserva = response.data || response;

//       // Almacenamos los datos maestros del cliente
//       setDatosCliente({
//         nombre: reserva.nombreCliente,
//         apellido: reserva.apellidoCliente,
//         telefono: reserva.telefono,
//         email: reserva.email,
//       });

//       // Cargamos el desglose contable real de la base de datos
//       setTotalHospedajeBase(reserva.montoTotal);
//       setTotalExtras(reserva.totalExtras || 0);
//       setMontoGarantia(reserva.montoGarantia || 0);
//       setExtrasDesglosados(reserva.extras || []);
//       setPorcentajeComision(reserva.porcentajeComision || 0);
//       setTotalComisiones(reserva.montoComision || 0);

//       // 🧠 Cálculo unificado: Hospedaje base + extras (Garantía queda aislada)
//       const totalConsolidado =
//         Number(reserva.montoTotal) + Number(reserva.totalExtras || 0);
//       setGranTotalEstancia(totalConsolidado);
//     } catch (error) {
//       // console.error("Error al consultar detalles consolidados:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [reservaId]);

//   useEffect(() => {
//     cargarDetalles();
//   }, [cargarDetalles]);

//   const primerRegistro = pagos[0];
//   const costoTotal = primerRegistro?.montoTotalReserva || 0;

//   const totalPagadoCliente = pagos.reduce(
//     (sum, item) => sum + item.montoBrutoPago,
//     0,
//   );

//   // const balancePendiente = costoTotal - totalPagadoCliente;
//   const balancePendingCalculado = granTotalEstancia - totalPagadoCliente;

//   useEffect(() => {
//     if (!reservaId) return;

//     const cargarDetalles = async () => {
//       // setLoading(true);
//       try {
//         // 🆕 Llamamos a tu repositorio por ID (el que ya modificamos y trae el JSON completo)
//         const response = await ReservaRepository.getById(reservaId);
//         const reserva = response.data || response;

//         // ... Seteas tus datos previos (datosCliente, pagos, etc.) ...

//         // 🆕 Seteamos las nuevas variables contables desglosadas
//         setTotalHospedajeBase(reserva.montoTotal); // Hospedaje Base (Días * Precio)
//         setTotalExtras(reserva.totalExtras || 0);
//         setMontoGarantia(reserva.montoGarantia || 0);

//         // 🆕 Calculamos el Gran Total de Estancia (Juntos - Sin contar la garantía)
//         // Fórmula de Negocio: Hospedaje Base + Extras
//         setGranTotalEstancia(reserva.montoTotal + (reserva.totalExtras || 0));
//         setExtrasDesglosados(reserva.extras || []);
//         setPorcentajeComision(reserva.porcentajeComision || 0); // 💡 Captura el 10
//         setTotalComisiones(reserva.montoComision || 0);
//       } catch (error) {
//         console.error("Error al cargar saldos del estado de cuenta", error);
//       }
//     };

//     cargarDetalles();
//   }, [reservaId]);

//   return {
//     pagos,
//     isLoading,
//     refrescarPagos: cargarDetalles,
//     datosCliente: primerRegistro
//       ? {
//           nombreCompleto: `${primerRegistro.nombre} ${primerRegistro.apellido}`,
//           folio: primerRegistro.folioReserva,
//           fechaInicio: primerRegistro.fechaInicio,
//           fechaFin: primerRegistro.fechaFin,
//           estado: primerRegistro.estadoReservacion,
//         }
//       : null,
//     costoTotal,
//     totalPagadoCliente,
//     // balancePendiente,
//     balancePendiente: balancePendingCalculado,
//     totalComisiones,
//     totalHospedajeBase,
//     totalExtras,
//     montoGarantia,
//     granTotalEstancia,
//     extrasDesglosados,
//     porcentajeComision,
//   };
// };
