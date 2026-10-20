interface DetalleExtrasProps {
  listadoExtras: Array<{
    id: number;
    concepto: string;
    cantidad: number;
    dias: number;
    precioUnitarioNoche: number;
    monto: number;
    porcentajeComision?: number;
    montoComision?: number;
  }>;
}

export const DetalleExtras = ({ listadoExtras }: DetalleExtrasProps) => {
  const formatPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  if (listadoExtras.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl w-full p-5 mt-6 shadow-sm border border-black/5 flex flex-col gap-3 font-body col-span-1 lg:col-span-2">
      {/* Cabecera de la sección */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        <span className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">
          Desglose Detallado de Servicios Extras
        </span>
      </div>

      {/* Rejilla responsiva de los conceptos de extras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
        {listadoExtras.map((extra) => (
          <div
            key={extra.id}
            className="flex items-center justify-between p-3 bg-gray-50/50 rounded-xl border border-gray-100 shadow-xs hover:bg-gray-50 transition-colors"
          >
            <div className="flex flex-col gap-0.5">
              {/* Concepto */}
              <span className="text-xs font-semibold text-neutral-dark capitalize">
                {extra.concepto}
              </span>
              {/* Multiplicación visual de apoyo: Cantidad x Días x Precio */}
              <span className="text-[10px] text-gray-400 font-medium">
                {extra.cantidad} {extra.cantidad === 1 ? "unidad" : "unidades"}{" "}
                • {extra.dias} {extra.dias === 1 ? "día" : "días"} x{" "}
                {formatPrecio(extra.precioUnitarioNoche)}
              </span>
            </div>

            {extra.montoComision && extra.montoComision > 0 && (
              <div className="inline-flex items-center gap-1 mt-0.5">
                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                  Comisión: {extra.porcentajeComision}% (
                  {formatPrecio(extra.montoComision)})
                </span>
              </div>
            )}

            {/* Subtotal de este extra específico */}
            <span className="text-xs font-bold text-neutral-dark">
              {formatPrecio(extra.monto)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
