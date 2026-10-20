import { Info } from "lucide-react";

export const CardComisiones = ({
  comisiones,
  porcentaje,
}: {
  comisiones: number;
  porcentaje: number;
}) => {
  const formatPrecio = (v: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(v);

  return (
    <div className="bg-white rounded-2xl w-full p-6 shadow-sm border border-black/5 flex flex-col gap-4 font-body">
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
            Comisiones de Plataforma
          </span>
          {/* 🆕 Badge estético que muestra el % dinámico retenido */}
          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded-md mt-0.5 self-start">
            Tasa Retención: {porcentaje}%
          </span>
        </div>
        <span className="text-2xl md:text-3xl font-body font-black text-red-500">
          {formatPrecio(comisiones)}
        </span>
      </div>
      <hr className="border-t border-gray-100 w-full" />
      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
        <Info className="w-4 h-4 text-red-400 shrink-0" />
        <span>Monto deducido por la OTA sobre el hospedaje base</span>
      </div>
    </div>
  );
};
