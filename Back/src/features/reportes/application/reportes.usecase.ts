import {
  IReporteRepository,
  FiltrosReporteDto,
  ReporteFinancieroEntity,
  BitacoraBorrado,
} from "../domain/reportes.repository";

export class ObtenerReporteGeneralUseCase {
  // Inyectamos el repositorio conceptual a través del constructor
  constructor(private readonly reporteRepository: IReporteRepository) {}

  async execute(
    filtros: FiltrosReporteDto,
  ): Promise<ReporteFinancieroEntity[]> {
    // Aquí podrías meter validaciones extras de negocio en el futuro si el hotel lo requiere
    return await this.reporteRepository.obtenerReporteGeneral(filtros);
  }

  public async ejecutarObtenerBitacora(): Promise<BitacoraBorrado[]> {
    return await this.reporteRepository.obtenerBitacoraBorrado();
  }
}
