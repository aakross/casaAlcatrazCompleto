interface CardGenericMontoProps {
  monto: number;
  title: string;
  color?: string;
  isFlotante?: boolean;
}

export const CardGenericMonto = ({
  monto,
  title,
  color = "text-neutral",
  isFlotante = false,
}: CardGenericMontoProps) => {
  const formatPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  return (
    <div
      className={`p-4 bg-white rounded-lg border border-gray-100 shadow-sm flex flex-col gap-1 ${isFlotante ? "bg-blue-50/30 border-blue-100" : ""}`}
    >
      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-body">
        {title}
      </span>
      <span className={`text-xl font-black font-body ${color}`}>
        {formatPrecio(monto)}
      </span>
      {isFlotante && (
        <span className="text-[10px] text-blue-500 italic font-body">
          Depósito reembolsable • No es ingreso
        </span>
      )}
    </div>
  );
};
