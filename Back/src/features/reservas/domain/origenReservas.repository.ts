export interface OrigenesReserva {
  id: number;
  nombre: string;
  descripcion: string;
}
export interface IOrigenesReserva {
  findAll(): Promise<OrigenesReserva[]>;
  //   create(nombre: string, descripcion?: string): Promise<OrigenesReserva>;
}
