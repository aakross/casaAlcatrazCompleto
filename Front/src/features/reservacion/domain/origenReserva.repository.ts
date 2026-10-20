// Contrato de dominio para el catálogo de orígenes de reservaciones

export interface OrigenReserva {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface IOrigenReservaRepository {
  getAll(): Promise<OrigenReserva[]>;
}
