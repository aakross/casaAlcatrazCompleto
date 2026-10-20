import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

interface DatePickerPagoProps {
  onDateChange: (dateStr: string) => void;
  initialDate?: string; // Formato "YYYY-MM-DD"
}

export function DatePickerPago({
  onDateChange,
  initialDate,
}: DatePickerPagoProps) {
  const [date, setDate] = useState<Date | undefined>(() => {
    // Si viene de los defaultValues o del watch, creamos el objeto Date plano
    if (initialDate) return new Date(`${initialDate}T00:00:00`);
    return new Date();
  });
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);

      // Formateamos de forma segura a YYYY-MM-DD sin desfases horarios
      const año = selectedDate.getFullYear();
      const mes = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const dia = String(selectedDate.getDate()).padStart(2, "0");
      const stringFecha = `${año}-${mes}-${dia}`;

      onDateChange(stringFecha); // Dispara el callback hacia el formulario padre
      setIsOpen(false); // Cierra el popover automáticamente
    }
  };

  const displayText = date
    ? format(date, "dd MMM yyyy", { locale: es })
    : "Seleccione la fecha del depósito";

  return (
    <div className="w-full relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md p-1 flex items-center gap-2 bg-transparent text-left cursor-pointer focus:outline-none"
      >
        <CalendarIcon className="text-secondary w-5 h-5 flex-shrink-0" />
        <span
          className={`flex-1 font-body text-sm truncate ${date ? "text-neutral" : "text-gray-400"}`}
        >
          {displayText}
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-surfacecontainer border border-tertiary shadow-2xl rounded-xl left-0">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={handleSelect}
            locale={es}
            modifiersClassNames={{
              selected: "bg-primary text-white font-bold rounded-md",
              today: "text-secondary font-bold underline",
            }}
            components={{
              DayButton: ({ day, ...props }) => (
                <button
                  {...props}
                  type="button"
                  className={`${props.className || ""} font-label transition-all duration-150 cursor-pointer`}
                />
              ),
            }}
          />
        </div>
      )}
    </div>
  );
}
