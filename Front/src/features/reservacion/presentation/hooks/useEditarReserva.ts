import { useState } from "react";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  reservaSchema,
  type ReservaFormData,
} from "../../domain/reserva.schema";
import { ReservaRepository } from "../../infrastructure/reservas.repository";
import { notify } from "../../../../core/components/notifierTostify";
import { useAuthStore } from "../../../../core/store/authStore";

export const useEditarReserva = (onSuccess?: () => void) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDatos, setIsLoadingDatos] = useState(false);

  interface ReservaCompletaDTO {
    id: number;
    nombreCliente: string;
    apellidoCliente: string;
    telefono: string | null;
    fechaInicio: string; // "YYYY-MM-DD" o ISOString
    fechaFin: string;
    totalDiasReservacion: number;
    precioNoche: number;
    montoTotal: number;
    porcentajeComision: number;
    montoGarantia: number;
    origenReservaId: number;
    personasHospedadas: number;
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    control,
  } = useForm<ReservaFormData>({
    resolver: zodResolver(reservaSchema) as Resolver<ReservaFormData>,
    shouldUnregister: false,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extras",
  });

  const abrirEditarModal = async (reserva: ReservaCompletaDTO) => {
    setSelectedId(reserva.id);
    setIsOpen(true);
    setIsLoadingDatos(true);

    try {
      const response = await ReservaRepository.getById(reserva.id);

      const reservaCompleta = response.data || response;

      // 🆕 Normalizamos las opciones fijas a minúsculas para un emparejamiento ciego de errores
      const opcionesFijas = [
        "servicio de cocina",
        "cocineros",
        "ayudantes",
        "jardin",
        "salida tardia",
        "entrada anticipada",
      ];

      const extrasMapeados = Array.isArray(reservaCompleta.extras)
        ? reservaCompleta.extras.map((ext: any) => {
            // 🆕 Limpiamos y normalizamos el texto de la base de datos
            const conceptoStr = ext.concepto ? String(ext.concepto).trim() : "";
            const conceptoMinusculas = conceptoStr.toLowerCase();

            // Evaluamos contra la lista en minúsculas de forma segura
            const esPersonalizado =
              conceptoStr !== "" && !opcionesFijas.includes(conceptoMinusculas);

            const textoCompletoBD =
              ext.tipoEvento || ext.tipo_evento || ext.tipoevento || "";

            // Rompemos el string a la mitad usando el separador guion " - "
            const [eventoNombre, personasTexto] = textoCompletoBD.includes(
              " - ",
            )
              ? textoCompletoBD.split(" - ")
              : [textoCompletoBD, "0 personas"];

            const numeroInvitados = parseInt(personasTexto) || 0;

            return {
              id: ext.id,
              // Si es personalizado de BD el select dirá "Otros", si es Jardin mantendrá su string original limpio
              concepto: esPersonalizado ? "Otros" : conceptoStr,
              otroConcepto: esPersonalizado ? conceptoStr : "",
              tipoEvento: eventoNombre,
              invitadosEvento: numeroInvitados,
              porcentajeComision: Number(ext.porcentajeComision) || 0,
              cantidad: conceptoMinusculas === "jardin" ? 1 : ext.cantidad || 1,
              dias: ext.dias || 1,
              precioUnitarioNoche: ext.precioUnitarioNoche || 0,
              monto: ext.monto || 0,
            };
          })
        : [];

      reset({
        nombreHuesped: reservaCompleta.nombreCliente || "",
        apellidoHuesped: reservaCompleta.apellidoCliente || "",
        telefono: reservaCompleta.telefono || "",
        huespedes: reservaCompleta.personasHospedadas || 1,
        origenReserva: String(reservaCompleta.origenReservaId || "1"),
        nuevoOrigenNombre: "",
        diasHospedaje: reservaCompleta.totalDiasReservacion || 0,
        precioNoche: reservaCompleta.precioNoche || 0,
        montoTotal: reservaCompleta.montoTotal || 0,
        porcentajeComision: reservaCompleta.porcentajeComision || 0,
        montoGarantia: reservaCompleta.montoGarantia || 0,
        fechaEntrada: reservaCompleta.fechaInicio
          ? reservaCompleta.fechaInicio.split("T")[0]
          : "",
        fechaSalida: reservaCompleta.fechaFin
          ? reservaCompleta.fechaFin.split("T")[0]
          : "",
        extras: extrasMapeados,
      });
    } catch (error) {
      console.error("Error al mapear datos del modal de edición:", error);
    } finally {
      setIsLoadingDatos(false);
    }
  };

  const onSubmitEdit = async (data: any) => {
    if (!selectedId) return;
    setIsSubmitting(true);

    try {
      const extrasLimpios = data.extras.map((ext: any) => {
        let conceptoFinal = ext.concepto || "";

        const selectorConcepto = String(ext.concepto).toLowerCase().trim();
        const opcionesFijas = [
          "servicio de cocina",
          "cocineros",
          "ayudantes",
          "jardin",
          "jardín",
          "salida tardia",
          "salida tardía",
          "entrada anticipada",
        ];

        const esOtrosOTextoLibre =
          selectorConcepto.includes("otro") ||
          !opcionesFijas.includes(selectorConcepto);

        if (esOtrosOTextoLibre) {
          // 🆕 Buscamos primero en otroConcepto. Si por algún motivo de renderizado viene vacío,
          // intentamos rescatar lo que ya tenía el select originalmente (concepto) antes de poner el genérico.
          if (ext.otroConcepto && ext.otroConcepto.trim() !== "") {
            conceptoFinal = ext.otroConcepto;
          } else if (ext.concepto && ext.concepto !== "Otros") {
            conceptoFinal = ext.concepto;
          } else {
            conceptoFinal = "Servicio Personalizado";
          }
        }

        const conceptoNormalizado = String(conceptoFinal).toLowerCase().trim();
        const esJardin =
          conceptoNormalizado === "jardin" || conceptoNormalizado === "jardín";

        // Buscamos el porcentaje en comision (formulario) o porcentajeComision (base de datos)
        const comisionFinal = Number(ext.porcentajeComision) || 0;

        return {
          id: ext.id ? Number(ext.id) : undefined,
          concepto: String(conceptoFinal).trim(),
          tipoEvento: esJardin
            ? `${String(ext.tipoEvento || "Evento").trim()} - ${Number(ext.invitadosEvento || 0)} personas`
            : "",

          cantidad: Number(ext.cantidad) || 1,
          dias: Number(ext.dias) || 1,
          precioUnitarioNoche: Number(ext.precioUnitarioNoche) || 0,
          porcentajeComision: esJardin ? comisionFinal : 0,
          comision: esJardin ? comisionFinal : 0,
        };
      });

      const payloadFinal = {
        ...data,
        fechaInicio: data.fechaEntrada,
        fechaFin: data.fechaSalida,
        totalDiasReservacion: Number(data.diasHospedaje),
        precioNoche: Number(data.precioNoche),
        montoTotal: Number(data.montoTotal),
        personasHospedadas: Number(data.huespedes),
        usuarioId: Number(useAuthStore.getState().userId || 1),
        origenReserva: String(data.origenReserva).trim(),
        origenReservaId: Number(data.origenReserva) || null,
        extras: extrasLimpios,
      };

      await ReservaRepository.update(selectedId, payloadFinal, Number(payloadFinal.usuarioId));
      notify.success("¡La reservación ha sido actualizada con éxito!");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("❌ Error atrapado en el bloque catch de la API:", error);
      notify.error(error.message || "Error al actualizar la reservación");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    cerrarModal: () => setIsOpen(false),
    abrirEditarModal,
    register,
    // handleSubmit: handleSubmit(onSubmitEdit, onErrorInvalid),
    handleSubmit: handleSubmit(onSubmitEdit),
    errors,
    isSubmitting,
    watch,
    setValue,
    control,
    extrasFields: fields,
    agregarExtra: () =>
      append({
        conceptoTipo: "",
        concepto: "",
        otroConcepto: "",
        tipoEvento: "",
        cantidad: 1,
        dias: 1,
        precioUnitarioNoche: 0,
        monto: 0,
        porcentajeComision: 0,
        montoComision: 0,
      }),
    eliminarExtra: (index: number) => remove(index),
    agregarJardin: () => {
      const huespedesEdicion = watch("huespedes") || 1;
      append({
        concepto: "Jardin",
        otroConcepto: "",
        tipoEvento: "",
        cantidad: Number(huespedesEdicion),
        dias: 1,
        precioUnitarioNoche: 0,
        porcentajeComision: 0,
        montoComision: 0,
        monto: 0,
      });
    },
    isLoadingDatos,
  };
};
