// src/features/reservacion/presentation/components/CalendarioReservas.tsx
import { DayPicker } from "react-day-picker";
import { useCalendarioOcupacion } from "../hooks/useCalendarioOcupacion";
import "react-day-picker/dist/style.css";
import { useState } from "react";
import type { FechasOcupadas } from "../../domain/fechas-ocupadas.repository";
import { es } from "date-fns/locale";

export const CalendarioReservas = () => {
  const {
    obtenerEstadoDia,
    buscarReservasDelDia,
    loading,
  } = useCalendarioOcupacion();

  // Estado local para guardar las reservas del día seleccionado al hacer clic
  const [reservasSeleccionadas, setReservasSeleccionadas] = useState<
    FechasOcupadas[]
  >([]);

  if (loading) {
    return (
      <div className="text-neutral font-body p-4 text-center">
        Cargando calendario de ocupación...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto">
      {/* Contenedor del Calendario */}
      <div className="flex flex-col items-center p-6 bg-surfacecontainer rounded-2xl shadow-md border border-tertiary">
        <h2 className="text-2xl font-headline text-primary font-bold mb-4">
          Disponibilidad de la Casa
        </h2>

        <DayPicker
          mode="single"
          locale={es}
          onDayClick={(date) => {
            const reservas = buscarReservasDelDia(date);
            if (reservas && reservas.length > 0) {
              setReservasSeleccionadas(reservas);
            } else {
              setReservasSeleccionadas([]);
            }
          }}
          components={{
            DayButton: (dayProps) => {
              const { day, modifiers, ...buttonProps } = dayProps as any;
              const { children, className, onClick, ...restProps } = buttonProps;
              const date = day.date;
              const reservas = buscarReservasDelDia(date);
              const tieneMovimiento = reservas.length > 0;
              const estado = obtenerEstadoDia(date);
              const isToday = modifiers?.today;
              const isOutside = modifiers?.outside;

              return (
                <button
                  {...restProps}
                  type="button"
                  onClick={(e) => {
                    onClick?.(e);
                    if (tieneMovimiento) {
                      setReservasSeleccionadas(reservas);
                    } else {
                      setReservasSeleccionadas([]);
                    }
                  }}
                  style={{
                    borderRadius: "10px",
                    width: "40px",
                    height: "40px",
                  }}
                  className={`!relative !overflow-hidden !w-10 !h-10 !rounded-xl !p-0 !border flex items-center justify-center font-label cursor-pointer transition-all duration-150 ${
                    isOutside
                      ? "opacity-25 pointer-events-none"
                      : tieneMovimiento
                      ? "hover:scale-105 shadow-xs"
                      : "hover:bg-neutral/5"
                  } ${
                    isToday
                      ? "!border-secondary ring-2 ring-secondary/50"
                      : "!border-neutral/15"
                  } ${
                    estado === "ocupado"
                      ? "!bg-ohsunny"
                      : estado === "checkInAndCheckOut"
                      ? "!bg-transparent"
                      : "!bg-white"
                  }`}
                >
                  {/* Check-In: Cuadrado con esquina redondeada donde SOLO la mitad inferior derecha es visible en diagonal */}
                  {estado === "checkIn" && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 40 40"
                      preserveAspectRatio="none"
                    >
                      {/* Mitad visible: Entrada / Tarde (coral en triángulo inferior derecho) */}
                      <polygon points="40,0 40,40 0,40" fill="var(--color-ohsunny)" />
                      {/* Línea divisoria diagonal que delimita la mitad visible */}
                      <line
                        x1="40"
                        y1="0"
                        x2="0"
                        y2="40"
                        stroke="#1a3c34"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}

                  {/* Check-Out: Cuadrado con esquina redondeada donde SOLO la mitad superior izquierda es visible en diagonal */}
                  {estado === "checkOut" && (
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      viewBox="0 0 40 40"
                      preserveAspectRatio="none"
                    >
                      {/* Mitad visible: Salida / Mañana (coral en triángulo superior izquierdo) */}
                      <polygon points="0,0 40,0 0,40" fill="var(--color-ohsunny)" />
                      {/* Línea divisoria diagonal que delimita la mitad visible */}
                      <line
                        x1="40"
                        y1="0"
                        x2="0"
                        y2="40"
                        stroke="#1a3c34"
                        strokeOpacity="0.25"
                        strokeWidth="1.5"
                      />
                    </svg>
                  )}

                  {/* Check-In + Check-Out: División limpia de dos colores con degradado lineal de parada abrupta (Checkout azul + Checkin coral) */}
                  {estado === "checkInAndCheckOut" && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none bg-gradient-to-br from-[#60a5fa] from-50% to-[#ff8a80] to-50%" />
                  )}

                  {/* Número del día con contraste optimizado */}
                  <span
                    className={`relative z-10 text-xs select-none pointer-events-none ${
                      estado === "disponible"
                        ? "text-neutral font-medium"
                        : "text-neutral font-bold drop-shadow-[0_1px_1px_rgba(255,255,255,0.95)]"
                    }`}
                  >
                    {children}
                  </span>
                </button>
              );
            },
          }}
        />

        {/* Leyenda de colores con Check-In, Check-Out y Cambio de Huéspedes */}
        <div className="grid grid-cols-2 gap-3 mt-5 text-xs font-body text-neutral w-full max-w-sm">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-ohsunny rounded-lg border border-neutral/20 shadow-xs shrink-0" />
            <span>Ocupado completo</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 bg-white border border-neutral/25 rounded-lg shadow-xs shrink-0" />
            <span>Disponible</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg border border-neutral/20 bg-white shadow-xs overflow-hidden relative shrink-0">
              <svg viewBox="0 0 20 20" className="w-full h-full">
                {/* Solo mitad visible en diagonal */}
                <polygon points="20,0 20,20 0,20" fill="var(--color-ohsunny)" />
                <line x1="20" y1="0" x2="0" y2="20" stroke="#1a3c34" strokeOpacity="0.25" strokeWidth="1.5" />
              </svg>
            </span>
            <span>Check-In (Entrada)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-lg border border-neutral/20 bg-white shadow-xs overflow-hidden relative shrink-0">
              <svg viewBox="0 0 20 20" className="w-full h-full">
                {/* Solo mitad visible en diagonal */}
                <polygon points="0,0 20,0 0,20" fill="var(--color-ohsunny)" />
                <line x1="20" y1="0" x2="0" y2="20" stroke="#1a3c34" strokeOpacity="0.25" strokeWidth="1.5" />
              </svg>
            </span>
            <span>Check-Out (Salida)</span>
          </div>

          <div className="flex items-center gap-2 col-span-2 pt-2 border-t border-neutral/15">
            <span className="w-5 h-5 rounded-lg border border-neutral/20 shadow-xs overflow-hidden relative shrink-0 bg-gradient-to-br from-[#60a5fa] from-50% to-[#ff8a80] to-50%" />
            <span className="font-semibold text-primary">
              Check-In + Check-Out (Salida azul y Entrada coral)
            </span>
          </div>
        </div>
      </div>

      {/* Tarjeta de Detalles Detallada (Se muestra al hacer clic en un día con movimiento) */}
      {reservasSeleccionadas.length > 0 ? (
        <div className="p-5 bg-surface text-tertiary rounded-xl shadow-lg border border-primary transition-all duration-300 animate-fade-in space-y-4">
          <div className="flex justify-between items-center border-b border-primary/20 pb-2">
            <div>
              <h3 className="text-lg font-headline font-bold text-secondary">
                {reservasSeleccionadas.length > 1
                  ? "Día de Cambio (Check-In y Check-Out)"
                  : "Detalle de Ocupación"}
              </h3>
              {reservasSeleccionadas.length > 1 && (
                <p className="text-xs text-tertiary/70 font-body">
                  Este día coincide la salida de una reservación y la llegada de otra.
                </p>
              )}
            </div>
            <button
              onClick={() => setReservasSeleccionadas([])}
              className="text-tertiary/70 hover:text-secondary text-xs uppercase tracking-wider font-label cursor-pointer"
            >
              Cerrar ×
            </button>
          </div>

          <div className="space-y-3">
            {reservasSeleccionadas.map((reserva, idx) => (
              <div
                key={idx}
                className={`space-y-1.5 font-body text-sm ${
                  reservasSeleccionadas.length > 1
                    ? "p-3 rounded-lg bg-primary/20 border border-primary/30"
                    : ""
                }`}
              >
                {reservasSeleccionadas.length > 1 && (
                  <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-primary mb-1">
                    {idx === 0 ? "Reserva 1 (Salida / Mañana)" : "Reserva 2 (Entrada / Tarde)"}
                  </span>
                )}
                <p>
                  <span className="font-bold text-secondary">Cliente:</span>{" "}
                  {reserva.nombreCliente}
                </p>
                <p>
                  <span className="font-bold text-secondary">Plataforma:</span>{" "}
                  {reserva.plataformaOrigen}
                </p>
                <p>
                  <span className="font-bold text-secondary">Check-In:</span>{" "}
                  {reserva.fechaDesde.toLocaleDateString()}
                </p>
                <p>
                  <span className="font-bold text-secondary">Check-Out:</span>{" "}
                  {reserva.fechaHasta.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-surfacecontainer/50 border border-dashed border-neutral/20 text-neutral/60 text-center rounded-xl text-sm font-body">
          Haz clic en un día ocupado o de entrada/salida para ver la reserva.
        </div>
      )}
    </div>
  );
};
