import { Info } from "lucide-react";

interface CardExtrasProps {
  total: number;
  comisionExtras?: number;
  porcentaje?: number;
}

export const CardExtras = ({
  total,
  comisionExtras = 0,
  porcentaje = 0,
}: CardExtrasProps) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  console.log(comisionExtras, "aqui");

  // 🆕 Sumamos el neto (total) más la comisión para obtener el precio bruto completo (ej: 900 + 100 = 1000)
  const totalCompleto = total + comisionExtras;

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-black/5 flex flex-col gap-4">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex flex-col items-start">
          <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
            Servicios Extras
          </span>

          {/* Si hay comisión acumulada en los extras, pintamos el recuadro rojo */}
          {comisionExtras > 0 && (
            <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md mt-1 self-start flex items-center gap-1">
              Comisión Generada: {formatPrecio(comisionExtras)} ({porcentaje}%)
            </span>
          )}
        </div>

        {/* 🆕 Aquí mostramos el total completo sumado */}
        <span className="text-2xl md:text-3xl font-body font-black text-amber-600">
          {formatPrecio(totalCompleto)}
        </span>
      </div>
      <hr className="border-t border-gray-100 w-full" />
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Info className="w-4 h-4 text-amber-500 shrink-0" />
        <span>Cocineras, Late Check-out y servicios contratados</span>
      </div>
    </div>
  );
};
