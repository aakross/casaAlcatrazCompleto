interface UltimasCapturasProps {
  id: number;
  nombreCliente: string;
  noches: number;
  precio: number;
  plataforma: string;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  precioxNoche: number;
  permitirEliminar: boolean;
}

// 2. Recibimos las propiedades desestructuradas
export const UltimasCapturas = ({
  id,
  nombreCliente,
  noches,
  precio,
  plataforma,
  onEdit,
  onDelete,
  precioxNoche,
  permitirEliminar,
}: UltimasCapturasProps) => {
  // Formateador de dinero nativo para que se vea como $18,200.00
  const formatPrecio = (valor: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(valor);
  };

  return (
    <>
      <div className="rounded-xl p-1">
        <div className="px-2 pb-2">
          {/* 🆕 Añadimos clases de hover y cursor-pointer para mejorar la UX */}
          <div className="bg-white p-3 rounded-lg flex items-center justify-between gap-4 border-primary border-l-4 shadow-md hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col gap-0.5 flex-1">
              <span className="font-medium text-neutral-dark">
                {nombreCliente}
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {noches} {noches === 1 ? "Noche" : "Noches"} •{" "}
                {formatPrecio(precio)} MXN
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Precio por noche: {formatPrecio(precioxNoche)} MXN
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Etiqueta de la Plataforma */}
              <div className="min-w-[70px]">
                <div className="bg-secondary/40 rounded-lg w-full text-[#745c00] text-center font-bold text-xs py-1 px-1.5 tracking-wide truncate">
                  {plataforma}
                </div>
              </div>

              {/* 🆕 Botón de Editar con icono de lápiz */}
              <button
                type="button"
                onClick={() => onEdit(id)}
                className="p-1.5 text-primary hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
                title="Editar reservación"
              >
                <svg
                  xmlns="http://w3.org"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </button>
              {permitirEliminar && (
                <button
                  type="button"
                  onClick={() => onDelete(id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Eliminar reservación permanente"
                >
                  <svg
                    xmlns="http://w3.org"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 2 0 00-1-1h-4a1 2 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
