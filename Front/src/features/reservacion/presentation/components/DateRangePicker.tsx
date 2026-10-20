import { useState, useRef, useEffect, useMemo } from "react";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DayPicker, type DateRange } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { useCalendarioOcupacion } from "../hooks/useCalendarioOcupacion";

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
  const {
    diasOcupadosCompletos,
    diasCambio,
    diasCheckIn,
    diasCheckOut,
    loading,
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
    return normalizarFecha(h);
  }, []);

  const setOcupados = useMemo(
    () => new Set(diasOcupadosCompletos.map(normalizarFecha)),
    [diasOcupadosCompletos],
  );
  const setCambio = useMemo(
    () => new Set(diasCambio.map(normalizarFecha)),
    [diasCambio],
  );
  const setCheckIn = useMemo(
    () => new Set(diasCheckIn.map(normalizarFecha)),
    [diasCheckIn],
  );
  const setCheckOut = useMemo(
    () => new Set(diasCheckOut.map(normalizarFecha)),
    [diasCheckOut],
  );

  const isDayDisabled = (date: Date): boolean => {
    if (esEdicion) return false;
    const t = normalizarFecha(date);

    // 1. Bloquear fechas en el pasado
    if (t < hoy) return true;

    // 2. Bloquear fechas 100% ocupadas o de cambio total
    if (setOcupados.has(t) || setCambio.has(t)) return true;

    // Caso A: Se va a seleccionar la fecha de Check-In (Entrada)
    if (!range?.from || (range.from && range.to)) {
      // No se puede entrar si ya hay otro Check-In a las 15:00
      if (setCheckIn.has(t)) return true;
      // Días libres o de Check-Out (salida 12:00, p. ej. día 27) SÍ se permiten
      return false;
    }

    // Caso B: Ya se seleccionó Check-In, se va a seleccionar Check-Out (Salida)
    const tFrom = normalizarFecha(range.from);

    // Check-Out debe ser posterior al Check-In (mínimo 1 noche)
    if (t <= tFrom) return true;

    // No se puede salir en un día donde otro huésped ya sale a las 12:00
    if (setCheckOut.has(t)) return true;

    // Buscar la fecha del siguiente bloqueo a partir de range.from
    let proximoBloqueo = Infinity;
    for (const d of diasCheckIn) {
      const td = normalizarFecha(d);
      if (td > tFrom && td < proximoBloqueo) proximoBloqueo = td;
    }
    for (const d of diasOcupadosCompletos) {
      const td = normalizarFecha(d);
      if (td > tFrom && td < proximoBloqueo) proximoBloqueo = td;
    }
    for (const d of diasCambio) {
      const td = normalizarFecha(d);
      if (td > tFrom && td < proximoBloqueo) proximoBloqueo = td;
    }

    // Si hay un bloqueo próximo, se puede salir ese día si es Check-In (a las 12:00),
    // pero NO después de ese día
    if (t > proximoBloqueo) return true;

    return false;
  };

  const handleSelect = (
    newRange: DateRange | undefined,
    triggerDate?: Date,
  ) => {
    if (!newRange) {
      setRange(undefined);
      onRangeChange?.(undefined);
      return;
    }

    // Si hace clic en la misma fecha de entrada (cuando aún no hay salida): deseleccionar
    if (
      range?.from &&
      !range?.to &&
      triggerDate &&
      normalizarFecha(triggerDate) === normalizarFecha(range.from)
    ) {
      setRange(undefined);
      onRangeChange?.(undefined);
      return;
    }

    setRange(newRange);
    onRangeChange?.(newRange);

    // Si se completó el rango (from y to distintos), cerrar el desplegable
    if (
      newRange.from &&
      newRange.to &&
      normalizarFecha(newRange.from) !== normalizarFecha(newRange.to)
    ) {
      setTimeout(() => setIsOpen(false), 250);
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
      displayText = `Entrada: ${format(range.from, "dd MMM yyyy", { locale: es })} (Seleccione salida)`;
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
          {/* Header informativo del rango */}
          <div className="mb-3 pb-2 border-b border-tertiary/20">
            {!range?.from ? (
              <p className="text-xs text-primary font-medium">
                Paso 1: Seleccione la fecha de <strong>Check-In (Entrada)</strong>
              </p>
            ) : !range.to ? (
              <div className="flex items-center justify-between text-xs text-secondary font-body bg-secondary/10 px-2 py-1 rounded-md">
                <span>
                  Entrada: <strong>{format(range.from, "dd MMM yyyy", { locale: es })}</strong>. Seleccione <strong>Check-Out</strong>
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs underline text-primary font-bold hover:opacity-80 cursor-pointer ml-2"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs text-primary font-body bg-primary/10 px-2 py-1 rounded-md">
                <span>
                  {format(range.from, "dd MMM", { locale: es })} al{" "}
                  {format(range.to, "dd MMM yyyy", { locale: es })} (
                  {differenceInDays(range.to, range.from)} noches)
                </span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-500 hover:underline cursor-pointer ml-2"
                >
                  Limpiar
                </button>
              </div>
            )}
          </div>

          <DayPicker
            mode="range"
            selected={range}
            onSelect={handleSelect}
            locale={es}
            disabled={isDayDisabled}
            excludeDisabled={true}
            resetOnSelect={true}
            modifiers={{
              salida: diasCheckOut,
              entrada: diasCheckIn,
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
                let title = "";
                if (setCheckOut.has(t)) {
                  title =
                    "Salida de huésped (12:00 PM). Disponible para nuevo Check-In (3:00 PM)";
                } else if (setCheckIn.has(t)) {
                  title =
                    "Llegada de huésped (3:00 PM). Disponible para Check-Out (12:00 PM)";
                } else if (setOcupados.has(t) || setCambio.has(t)) {
                  title = "Fecha ocupada (No disponible)";
                }

                return (
                  <button
                    {...props}
                    type="button"
                    title={title || props.title}
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
              <span>Salida previa (Disponible para Check-In a las 3:00 PM)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-1 border-t-2 border-dashed border-ohsunny inline-block shrink-0" />
              <span>Llegada posterior (Disponible para Check-Out a las 12:00 PM)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
