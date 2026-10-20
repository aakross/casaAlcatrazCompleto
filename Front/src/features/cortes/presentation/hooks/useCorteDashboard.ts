import { useState, useEffect } from "react";
import { type IDashboardCorte } from "../../domain/cortes.repository";
import { ApiCorteRepository } from "../../infrastructure/repositories/api-corte.repository";

export const useCorteDashboard = () => {
  const [data, setData] = useState<IDashboardCorte | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const repository = new ApiCorteRepository();

    repository
      .getDashboardData()
      .then((dashboardData) => {
        setData(dashboardData);

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error al cargar los datos del dashboard");
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
};
