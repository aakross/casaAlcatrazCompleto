import { DayPicker } from "react-day-picker";
import { useCalendarioOcupacion } from "../hooks/useCalendarioOcupacion";
import type { FechasOcupadas } from "../../domain/fechas-ocupadas.repository";
import { useState } from "react";
import { es } from "date-fns/locale";

export const AñoCompleto = () => {
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
    <>
      {/* Contenedor Principal del Calendario */}
      <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto p-4">
        <div className="flex flex-col items-center p-6 bg-surfacecontainer rounded-xl shadow-md border border-tertiary w-full">
          <h2 className="text-2xl font-headline text-primary font-bold mb-4">
            Disponibilidad de la Casa
          </h2>

          {/* Grid de 12 meses */}
          <div className="w-full className-proporcional-al-grid [&_.rdp-months]:grid [&_.rdp-months]:grid-cols-1 [&_.rdp-months]:sm:grid-cols-2 [&_.rdp-months]:md:grid-cols-3 [&_.rdp-months]:lg:grid-cols-4 [&_.rdp-months]:gap-6">
            <DayPicker
              mode="single"
              locale={es}
              numberOfMonths={12}
              pagedNavigation
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
                        borderRadius: "8px",
                        width: "36px",
                        height: "36px",
                      }}
                      className={`!relative !overflow-hidden !w-9 !h-9 !rounded-lg !p-0 !border flex items-center justify-center font-label cursor-pointer transition-all duration-150 ${
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
                          viewBox="0 0 36 36"
                          preserveAspectRatio="none"
                        >
                          <polygon points="36,0 36,36 0,36" fill="var(--color-ohsunny)" />
                          <line
                            x1="36"
                            y1="0"
                            x2="0"
                            y2="36"
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
                          viewBox="0 0 36 36"
                          preserveAspectRatio="none"
                        >
                          <polygon points="0,0 36,0 0,36" fill="var(--color-ohsunny)" />
                          <line
                            x1="36"
                            y1="0"
                            x2="0"
                            y2="36"
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
          </div>

          {/* Leyenda de colores con Check-In, Check-Out y Cambio de Huéspedes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-6 text-xs font-body text-neutral w-full max-w-4xl justify-center">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-ohsunny rounded-lg border border-neutral/20 shadow-xs shrink-0" />
              <span>Ocupado completo</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border border-neutral/20 relative overflow-hidden bg-white shadow-xs shrink-0">
                <svg className="w-full h-full" viewBox="0 0 20 20">
                  <polygon points="20,0 20,20 0,20" fill="var(--color-ohsunny)" />
                  <line x1="20" y1="0" x2="0" y2="20" stroke="#1a3c34" strokeOpacity="0.3" strokeWidth="1" />
                </svg>
              </div>
              <span>Check-In (Entrada tarde)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border border-neutral/20 relative overflow-hidden bg-white shadow-xs shrink-0">
                <svg className="w-full h-full" viewBox="0 0 20 20">
                  <polygon points="0,0 20,0 0,20" fill="var(--color-ohsunny)" />
                  <line x1="20" y1="0" x2="0" y2="20" stroke="#1a3c34" strokeOpacity="0.3" strokeWidth="1" />
                </svg>
              </div>
              <span>Check-Out (Salida mañana)</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg border border-neutral/20 relative overflow-hidden bg-gradient-to-br from-[#60a5fa] from-50% to-[#ff8a80] to-50% shadow-xs shrink-0" />
              <span>Salida y Entrada (Mismo día)</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-5 h-5 bg-white border border-neutral/20 rounded-lg shadow-xs shrink-0" />
              <span>Disponible</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL POPUP */}
      {reservasSeleccionadas.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setReservasSeleccionadas([])}
        >
          <div
            className="w-full max-w-md p-6 bg-surface text-tertiary rounded-2xl shadow-2xl border border-primary/20 transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-neutral/10">
              <h3 className="text-xl font-headline font-bold text-secondary flex items-center gap-2">
                Detalle de Ocupación ({reservasSeleccionadas.length} {reservasSeleccionadas.length === 1 ? "reserva" : "reservas"})
              </h3>
              <button
                onClick={() => setReservasSeleccionadas([])}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral/10 text-tertiary/70 hover:bg-neutral/20 hover:text-secondary text-lg font-bold transition-colors cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {reservasSeleccionadas.map((r, idx) => (
                <div key={idx} className="p-3 bg-surfacecontainer/40 rounded-xl space-y-2 border border-neutral/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="block text-[11px] font-semibold text-neutral/60 uppercase tracking-wider">
                        Cliente
                      </span>
                      <p className="text-base font-bold text-secondary">
                        {r.nombreCliente}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/20 text-secondary font-semibold">
                      {r.plataformaOrigen}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                    <div>
                      <span className="block text-[10px] font-semibold text-neutral/60 uppercase tracking-wider">
                        Check-In
                      </span>
                      <p className="text-xs font-medium text-secondary">
                        {r.fechaDesde.toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="block text-[10px] font-semibold text-neutral/60 uppercase tracking-wider">
                        Check-Out
                      </span>
                      <p className="text-xs font-medium text-secondary">
                        {r.fechaHasta.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setReservasSeleccionadas([])}
                className="px-4 py-2 bg-primary text-white font-label text-xs font-bold rounded-lg hover:bg-primary/90 shadow-md transition-all cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
