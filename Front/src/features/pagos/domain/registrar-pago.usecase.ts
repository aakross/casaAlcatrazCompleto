import { type IPagoRepository, type Pago } from "./pago.repository";

export class RegistrarPagoUseCase {
  private readonly repository: IPagoRepository;

  constructor(repository: IPagoRepository) {
    this.repository = repository;
  }

  async execute(pago: Pago): Promise<void> {
    return await this.repository.registrar(pago);
  }
}
