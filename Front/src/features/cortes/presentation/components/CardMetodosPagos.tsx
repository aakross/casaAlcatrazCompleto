import React from "react";
import { type PlataformaInfo } from "../../domain/cortes.repository";

interface Props {
  plataformas: PlataformaInfo[];
}

export const CardMetodosPagos: React.FC<Props> = ({ plataformas }) => {
  // Calculamos el dinero total generado por todas las plataformas sumadas
  const totalAmount = plataformas.reduce(
    (sum, item) => sum + item.totalDineroGenerado,
    0,
  );

  // Función para asignar un color contrastante de tu @theme según la plataforma
  const obtenerColorPlataforma = (nombre: string): string => {
    switch (nombre.toLowerCase()) {
      case "ohsunny":
        return "bg-ohsunny"; // Tu rosa llamativo
      case "airbnb":
        return "bg-secondary"; // Tu dorado de marca
      case "el chef":
        return "bg-amber-600"; // Un tono ámbar contrastante
      case "booking":
        return "bg-blue-600"; // Azul corporativo de Booking
      case "web":
        return "bg-primary"; // Tu verde oscuro principal
      default:
        return "bg-surface"; // Gris de respaldo para plataformas nuevas
    }
  };

  // Procesamos, mapeamos y ordenamos los datos de mayor a menor ingreso generado
  const paymentMethods = plataformas
    .map((item) => {
      const percentage =
        totalAmount > 0 ? (item.totalDineroGenerado / totalAmount) * 100 : 0;

      const nombreLimpio = item.plataforma.trim();
      const colorClass = obtenerColorPlataforma(nombreLimpio);

      return {
        id: nombreLimpio,
        name: nombreLimpio,
        reservaciones: item.cantidadReservaciones, // 👈 Guardamos la cantidad de reservaciones
        amount: item.totalDineroGenerado,
        color: colorClass,
        formattedAmount: `$${item.totalDineroGenerado.toLocaleString("es-MX")}`,
        percentageString: `${percentage}%`,
        percentageFormatted: `${Math.round(percentage)}%`,
      };
    })
    // ⬇️ Ordena automáticamente para que la plataforma con más ingresos aparezca primero
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-surfacecontainer rounded-xl p-5 shadow-sm border border-tertiary flex flex-col justify-between w-full h-full min-h-[240px]">
      <div>
        <h3 className="font-body text-neutral/60 font-semibold text-sm tracking-wide uppercase mb-4">
          Ingresos Por Plataformas
        </h3>

        {/* Barra de progreso segmentada dinámica y multicolor */}
        <div className="w-full bg-neutral/5 h-3 rounded-full flex overflow-hidden mb-5">
          {paymentMethods.map((method) => (
            <div
              key={`bar-${method.id}`}
              className={`${method.color} h-full transition-all duration-500`}
              style={{ width: method.percentageString }}
              title={`${method.name}: ${method.percentageString} (${method.reservaciones} res.)`}
            />
          ))}
        </div>
      </div>

      {/* Listado detallado de métodos con círculos de color, cantidad de reservas e ingresos */}
      <div className="space-y-3 w-full">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between text-sm font-medium text-neutral gap-2 font-body"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`${method.color} rounded-full w-3 h-3 shrink-0 shadow-xs`}
              />
              <span className="truncate">{method.name}</span>
              {/* Muestra el porcentaje y el número de reservas de forma discreta */}
              <span className="text-xs text-neutral/40 font-normal font-label whitespace-nowrap">
                ({method.percentageFormatted} • {method.reservaciones}{" "}
                {method.reservaciones === 1 ? "reserva" : "reservas"})
              </span>
            </div>
            <span className="text-primary font-bold whitespace-nowrap font-label">
              {method.formattedAmount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
