interface ConfirmarEliminarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reservaId: number | null;
  isSubmitting: boolean;
}

export const ConfirmarEliminarModal = ({
  isOpen,
  onClose,
  onConfirm,
  reservaId,
  isSubmitting,
}: ConfirmarEliminarModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-black/5 w-full max-w-sm overflow-hidden transform transition-all p-5 flex flex-col gap-4">
        {/* Encabezado con Icono de Alerta */}
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <svg
              xmlns="http://w3.org"
              className="h-5 w-5"
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
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 font-label">
              Eliminar Reservación #{reservaId}
            </h3>
            <p className="text-[11px] text-gray-400 font-medium uppercase">
              Acción Irreversible
            </p>
          </div>
        </div>

        {/* Advertencias Críticas del Negocio */}
        <div className="text-xs text-gray-600 font-body flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200/60">
          <p className="font-semibold text-gray-800">
            ¿Estás seguro de que deseas purgar esta reservación? Al proceder, se
            afectará lo siguiente en cascada:
          </p>
          <ul className="list-disc pl-4 space-y-1 font-medium text-gray-500">
            <li>
              Se borrarán <span className="text-red-600 font-bold">TODOS</span>{" "}
              los pagos y abonos registrados.
            </li>
            <li>
              Se eliminarán permanentemente los servicios extras (Jardín,
              cocina, etc.).
            </li>
            <li>
              Si el cliente no tiene más estancias, se eliminará su cuenta.
            </li>
          </ul>
        </div>

        {/* Botones de Acción Nivelados */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 text-xs">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-4 py-2 font-semibold text-gray-500 hover:bg-gray-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-4 py-2 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 disabled:bg-red-400"
          >
            {isSubmitting ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Purgando...
              </>
            ) : (
              "Confirmar Borrado"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
