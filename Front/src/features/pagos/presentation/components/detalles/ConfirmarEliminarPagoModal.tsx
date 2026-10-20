interface ConfirmarEliminarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
}

export const ConfirmarEliminarPagoModal = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: ConfirmarEliminarPagoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-xl shadow-xl border border-black/5 w-full max-w-xs overflow-hidden p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2.5 text-red-600 font-bold text-sm">
          <span>⚠️ ¿Eliminar abono de caja?</span>
        </div>
        <p className="text-xs text-gray-500 font-medium font-body leading-relaxed">
          Esta acción removerá de forma permanente el abono seleccionado. El
          saldo pendiente de la reservación aumentará automáticamente.
        </p>
        <div className="flex justify-end gap-2 text-xs pt-1 border-t border-gray-100">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="px-3 py-1.5 font-semibold text-gray-500 hover:bg-gray-50 rounded-md transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className="px-3 py-1.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center gap-1"
          >
            {isSubmitting ? "Borrando..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
};
