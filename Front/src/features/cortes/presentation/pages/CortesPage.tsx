import React from "react";
import { useCorteDashboard } from "../hooks/useCorteDashboard";
// import { CardTotalBruto } from "../components/CardTotalBruto";
import { CardMetodosPagos } from "../components/CardMetodosPagos";
import { CardMontosComisiones } from "../components/CardMontosComisiones";
import { CardResumenHistorico } from "../components/CardResumenHistorico";
import { CardTopClientes } from "../components/CardTopClientes";
import { CardNetoGanado } from "../components/CardNetoGanado";
import { CardVolumenCanales } from "../components/CardVolumenCanales";
import { CalendarioReservas } from "../../../reservacion/presentation/components/CalendarioReservas";

export const CortesPage: React.FC = () => {
  const { data, loading, error } = useCorteDashboard();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-tertiary">
        <span className="font-body text-neutral text-lg animate-pulse">
          Cargando métricas de cortes...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-tertiary min-h-screen">
        <div className="bg-white border-l-4 border-error p-4 roundedshadow-sm">
          <p className="font-body text-error font-semibold">
            Error del sistema
          </p>
          <p className="font-body text-neutral text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 bg-tertiary min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Cabecera Principal */}
        <div>
          <span className="font-headline text-primary text-3xl font-bold block mb-1">
            Corte de Reservaciones
          </span>
          <p className="font-body text-xs text-surface/70">
            Monitoreo en tiempo real de operaciones, comisiones y canales de
            venta.
          </p>
        </div>

        {/* Fila superior: 3 Tarjetas Financieras Clave */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* <CardTotalBruto finanzas={data.finanzas} /> */}
          <CardNetoGanado finanzas={data.finanzas} />
          <CardMontosComisiones finanzas={data.finanzas} />

          <CardMetodosPagos plataformas={data.plataformas} />
        </div>

        {/* Fila Inferior: Datos Operativos y de Clientes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CardVolumenCanales plataformas={data.plataformas} />
          <CardResumenHistorico
            historico={data.historico}
            estados={data.estados}
          />
          <CardTopClientes clientes={data.topClientes} />
          <CalendarioReservas />
        </div>
      </div>
    </div>
  );
};
