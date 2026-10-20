export interface FechasOcupadas {
  fechaDesde: Date;
  fechaHasta: Date;
  nombreCliente: string;
  plataformaOrigen: string;
}

export interface IFechasOcupadasRepository {
  obtenerOcupadas(): Promise<FechasOcupadas[]>;
}
