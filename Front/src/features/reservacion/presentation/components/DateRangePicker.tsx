import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { useCalendarioOcupacion } from "../hooks/useCalendarioOcupacion";
import { notify } from "../../../../core/components/notifierTostify";

interface DateRangePickerProps {
  onRangeChange?: (range: DateRange | undefined) => void;
  initialRange?: DateRange;
  esEdicion?: boolean;
  reservaIdEdicion?: number | null;
}

export function DateRangePicker({
  onRangeChange,
  initialRange,
  esEdicion = false,
  reservaIdEdicion = null,
}: DateRangePickerProps) {
  // 1. Cargamos los datos de ocupación desde la arquitectura limpia
  const {
    loading,
    checkoutsDelHotel,
    diasCheckIn,
    diasCheckOut,
    diasCambio,
    diasOcupadosCompletos,
  } = useCalendarioOcupacion(reservaIdEdicion);

  const [range, setRange] = useState<DateRange | undefined>(initialRange);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (initialRange) {
      setRange(initialRange);
    }
  }, [initialRange]);

  const normalizarFecha = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

  const hoy = useMemo(() => {
    const h = new Date();
    h.setHours(0, 0, 0, 0);
    return h;
  }, []);

  const setCheckIns = useMemo(() => {
    return new Set((diasCheckIn || []).map(normalizarFecha));
  }, [diasCheckIn]);

  const setCheckOuts = useMemo(() => {
    return new Set((diasCheckOut || []).map(normalizarFecha));
  }, [diasCheckOut]);

  const setCambio = useMemo(() => {
    return new Set((diasCambio || []).map(normalizarFecha));
  }, [diasCambio]);

  const setOcupados = useMemo(() => {
    return new Set((diasOcupadosCompletos || []).map(normalizarFecha));
  }, [diasOcupadosCompletos]);

  // Días que están 100% bloqueados para cualquier nueva reserva:
  // 1. Días intermedios ocupados (la casa está ocupada día y noche)
  // 2. Días de cambio completo (alguien sale a las 12:00 PM Y alguien entra a las 3:00 PM)
  // 3. Fechas en el pasado
  // NOTA: Los días de sólo Check-Out (ej. 27) y de sólo Check-In (ej. 4) NO se bloquean
  // para permitir entrar a las 3:00 PM o salir a las 12:00 PM respectivamente.
  const diasBloqueadosCompletos = useMemo(() => {
    return [...(diasOcupadosCompletos || []), ...(diasCambio || [])];
  }, [diasOcupadosCompletos, diasCambio]);

  const diasDeshabilitados = esEdicion
    ? []
    : [...diasBloqueadosCompletos, { before: hoy }];

  const handleSelect = (newRange: DateRange | undefined) => {
    // Si el usuario intenta seleccionar como fecha de ENTRADA (primer clic) un día donde ya hay llegada
    if (
      newRange?.from &&
      !newRange.to &&
      setCheckIns.has(normalizarFecha(newRange.from))
    ) {
      notify.warning(
        "En esta fecha ya hay una llegada programada (3:00 PM). Solo está disponible como fecha de salida (Check-Out)."
      );
      setRange(undefined);
      onRangeChange?.(undefined);
      return;
    }

    setRange(newRange);
    onRangeChange?.(newRange);

    // Si se completó el rango de entrada y salida (y no es el mismo día), cerramos el calendario
    if (
      newRange?.from &&
      newRange?.to &&
      normalizarFecha(newRange.from) !== normalizarFecha(newRange.to)
    ) {
      setTimeout(() => setIsOpen(false), 200);
    }
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRange(undefined);
    onRangeChange?.(undefined);
  };

  let displayText = loading
    ? "Cargando disponibilidad..."
    : "Seleccione el rango de fechas";

  if (range?.from) {
    if (range.to) {
      displayText = `${format(range.from, "dd MMM", { locale: es })} - ${format(range.to, "dd MMM yyyy", { locale: es })}`;
    } else {
      displayText = `${format(range.from, "dd MMM yyyy", { locale: es })} (Seleccione salida)`;
    }
  }

  return (
    <div className="w-full relative" ref={containerRef}>
      <div className="w-full rounded-md p-1 flex items-center justify-between gap-2 bg-transparent">
        <button
          type="button"
          disabled={loading}
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarIcon className="text-secondary w-5 h-5 flex-shrink-0" />
          <span
            className={`font-body text-sm truncate ${range?.from ? "text-neutral" : "text-gray-400"}`}
          >
            {displayText}
          </span>
        </button>

        {range?.from && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-neutral/10 rounded-full text-neutral/50 hover:text-red-500 transition-colors cursor-pointer"
            title="Limpiar fechas seleccionadas"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-surfacecontainer border border-tertiary shadow-2xl rounded-xl left-0 md:left-auto">
          <DayPicker
            mode="range"
            min={1}
            selected={range}
            onSelect={handleSelect}
            locale={es}
            disabled={diasDeshabilitados}
            excludeDisabled={true}
            resetOnSelect={true}
            modifiers={{
              ocupado: diasBloqueadosCompletos,
              salida: diasCheckOut || checkoutsDelHotel || [],
              entrada: diasCheckIn || [],
            }}
            modifiersClassNames={{
              selected:
                "bg-primary text-white rounded-none first:rounded-l-md last:rounded-r-md",
              range_start: "bg-secondary text-primary font-bold rounded-l-md!",
              range_end: "bg-secondary text-primary font-bold rounded-r-md!",
              range_middle: "bg-primary/10 text-primary font-medium",
              today: "text-secondary font-bold underline",
              disabled:
                "bg-ohsunny/20 text-neutral/30 line-through cursor-not-allowed opacity-60 rounded-md",
              salida:
                "border-b-4 border-dashed border-ohsunny hover:bg-secondary/10 cursor-pointer font-bold",
              entrada:
                "border-t-4 border-dashed border-ohsunny hover:bg-secondary/10 cursor-pointer font-bold",
            }}
            components={{
              DayButton: ({ day, ...props }) => {
                const t = normalizarFecha(day.date);
                const esSalida = setCheckOuts.has(t);
                const esEntrada = setCheckIns.has(t);
                const esCambio = setCambio.has(t);
                const esOcupado = setOcupados.has(t);

                let title = props.title;
                if (esCambio) {
                  title = "Día ocupado (Salida 12:00 PM y Llegada 3:00 PM - No disponible)";
                } else if (esOcupado) {
                  title = "Día ocupado (No disponible)";
                } else if (esSalida) {
                  title = "Salida previa (12:00 PM) - Disponible para Check-In (3:00 PM)";
                } else if (esEntrada) {
                  title = "Llegada posterior (3:00 PM) - Disponible para Check-Out (12:00 PM)";
                }

                return (
                  <button
                    {...props}
                    type="button"
                    title={title}
                    className={`${props.className || ""} font-label transition-all duration-150`}
                  />
                );
              },
            }}
          />

          {/* Leyenda rápida dentro del picker */}
          <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-tertiary/20 text-[11px] font-body text-neutral/70">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 border-b-2 border-dashed border-ohsunny inline-block shrink-0" />
              <span>Borde inferior: Salida previa (Disponible para Check-In a las 3:00 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-ohsunny inline-block shrink-0" />
              <span>Borde superior: Llegada posterior (Disponible para Check-Out a las 12:00 PM)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
