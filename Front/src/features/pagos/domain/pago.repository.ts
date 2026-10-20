// Entidad de dominio pago — independiente de la capa de presentación o infraestructura

export interface Pago {
  reservacionId: number;
  userCreate: number;
  montoBruto: number;
  conceptoPagoId: number;
  origenDineroId: number;
  aplicaComision: boolean;
  montoComision: number;
  fechaDeposito: string;
}

export interface IPagoRepository {
  registrar(pago: Pago): Promise<void>;
}
