import { type IDashboardCorte } from "../../domain/cortes.repository";
import { type DashboardCorteResponseDTO } from "../dtos/corte.dto";

export const apiToDashboardCorteAdapter = (
  dto: DashboardCorteResponseDTO,
): IDashboardCorte => {
  const { data } = dto;
  return {
    finanzas: { ...data.finanzas },
    plataformas: data.plataformas.map((p) => ({
      ...p,
      plataforma: p.plataforma.trim(), // Limpieza de espacios vacíos
    })),
    historico: { ...data.historico },
    topClientes: data.topClientes.map((c) => ({ ...c })),
    estados: data.estados.map((e) => ({ ...e })),
  };
};
