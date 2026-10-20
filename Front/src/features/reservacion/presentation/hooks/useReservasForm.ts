import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays } from "date-fns";
import {
  reservaSchema,
} from "../../domain/reserva.schema";
import {
  calcularTotalesReserva,
  normalizarExtraParaEnvio,
} from "../../domain/reserva-calculos.service";
import { ReservaRepository } from "../../infrastructure/reservas.repository";
import { notify } from "../../../../core/components/notifierTostify";
import { OrigenReservaRepository } from "../../infrastructure/origenReserva.repository";
import { useAuthStore } from "../../../../core/store/authStore";

export const useReservasForm = (onSuccess?: () => void) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [origenes, setOrigenes] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(reservaSchema),
    defaultValues: {
      nombreHuesped: "",
      apellidoHuesped: "",
      telefono: "",
      huespedes: 1,
      origenReserva: "",
      nuevoOrigenNombre: "",
      diasHospedaje: 0,
      precioNoche: 0,
      montoTotal: 0,
      porcentajeComision: 0,
      montoGarantia: 0,
      fechaEntrada: "",
      fechaSalida: "",
      extras: [] as Array<{
        concepto: string;
        otroConcepto: string;
        tipoEvento?: string;
        monto: number;
        dias: number;
        precioUnitarioNoche: number;
        porcentajeComision?: number;
        montoComision?: number;
      }>,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "extras",
  });

  useEffect(() => {
    const cargarOrigenes = async () => {
      try {
        const data = await OrigenReservaRepository.getAll();
        setOrigenes(data);
      } catch (error) {
        console.error("Error al cargar orígenes de reserva", error);
      }
    };
    cargarOrigenes();
  }, []);

  const origenSeleccionado = watch("origenReserva");
  const esOrigenNuevo = origenSeleccionado === "OTRO";

  const diasHospedaje = watch("diasHospedaje") || 0;
  const precioNoche = watch("precioNoche") || 0;
  const porcentajeComision = watch("porcentajeComision") || 0;
  const listaExtras = watch("extras") || [];

  // ✅ Cálculos financieros delegados al servicio de dominio
  const {
    totalHospedajeBase,
    subtotalExtras,
    granMontoTotalCalculado,
    comisionPlataformaCalculada,
    gananciaNetaEsperada,
  } = calcularTotalesReserva(diasHospedaje, precioNoche, porcentajeComision, listaExtras);

  useEffect(() => {
    setValue("montoTotal", totalHospedajeBase, { shouldValidate: true });
  }, [totalHospedajeBase, setValue]);

  // Sincroniza el monto calculado de cada extra en el form
  useEffect(() => {
    listaExtras.forEach((item: any, index: number) => {
      if (item && item.concepto !== "Jardin" && item.detalleNumero) {
        setValue(`extras.${index}.detalleNumero`, undefined);
      }
      const cantidad = Number(item?.cantidad) || 0;
      const dias = Number(item?.dias) || 0;
      const precio = Number(item?.precioUnitarioNoche) || 0;
      const montoCalculado = cantidad * dias * precio;
      if (item && item.monto !== montoCalculado) {
        setValue(`extras.${index}.monto`, montoCalculado);
      }
    });
  }, [listaExtras, setValue]);

  const handleDateChange = (range: any) => {
    if (range?.from) {
      setValue("fechaEntrada", format(range.from, "yyyy-MM-dd"), {
        shouldValidate: true,
      });

      if (range.to) {
        setValue("fechaSalida", format(range.to, "yyyy-MM-dd"), {
          shouldValidate: true,
        });
        const dias = differenceInDays(range.to, range.from);
        setValue("diasHospedaje", dias, { shouldValidate: true });
      } else {
        setValue("fechaSalida", "");
        setValue("diasHospedaje", 0);
      }
    } else {
      setValue("fechaEntrada", "");
      setValue("fechaSalida", "");
      setValue("diasHospedaje", 0);
    }
  };

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      if (data.extras && Array.isArray(data.extras)) {
        // ✅ Normalización de extras delegada al servicio de dominio
        data.extras = data.extras.map(normalizarExtraParaEnvio);
      }

      // Sincronizamos los montos finales autocalculados antes de disparar el Payload
      data.montoTotal = granMontoTotalCalculado;

      if (data.origenReserva !== "OTRO") {
        data.nuevoOrigenNombre = "";
      }

      const currentUserId = useAuthStore.getState().userId;
      await ReservaRepository.create(data, Number(currentUserId || 1));
      notify.success("¡La reserva se ha guardado correctamente!");
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("❌ Error al crear la reservación:", error);
      notify.error(
        error.message || "Ocurrió un error al procesar la reservación",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    reset();
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    handleDateChange,
    handleClear,
    watch,
    errors,
    isSubmitting,
    origenes,
    esOrigenNuevo,
    extrasFields: fields,
    agregarExtra: () =>
      append({
        concepto: "",
        otroConcepto: "",
        tipoEvento: "",
        monto: 0,
        cantidad: 1,
        dias: 1,
        precioUnitarioNoche: 0,
      }),
    eliminarExtra: (index: number) => remove(index),
    agregarJardin: () => {
      const huespedesActuales = watch("huespedes") || 1;
      append({
        concepto: "Jardin",
        otroConcepto: "",
        tipoEvento: "",
        cantidad: Number(huespedesActuales),
        dias: 1,
        precioUnitarioNoche: 0,
        porcentajeComision: 0,
        montoComision: 0,
        monto: 0,
      });
    },
    totalHospedajeBase,
    subtotalExtras,
    comisionPlataformaCalculada,
    gananciaNetaEsperada,
    granMontoTotalCalculado,
  };
};
