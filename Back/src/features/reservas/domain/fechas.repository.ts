export interface IFechasOcupadas {
  fechaDesde: Date;
  fechaHasta: Date;
  nombreCliente: string;
  plataformaOrigen: string;
}

export interface IFechasOcupadasRepository {
  obtenerFechasOcupadas(): Promise<IFechasOcupadas[]>;
}
