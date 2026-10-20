import { type IDashboardCorte } from "../domain/cortes.repository";

export interface CorteRepository {
  getDashboardData(): Promise<IDashboardCorte>;
}
