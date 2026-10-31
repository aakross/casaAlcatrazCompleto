import { useState, useEffect } from "react";
import {
  Building2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit2,
  Trash2,
  History,
  Search,
  RefreshCw,
  X,
  FileText,
  UserCheck,
  Landmark,
  MapPin,
  FilterX,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { rentasApi } from "../../infrastructure/rentas.api";
import type {
  Region,
  Lugar,
  LocalComercial,
  ContratoRenta,
  PagoRenta,
  AuditoriaPagoRenta,
  AdeudoResumen,
  DashboardRentas,
} from "../../domain/rentas.types";
import { notify } from "../../../../core/components/notifierTostify";

const MESES_ES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function generarPeriodoFecha(
  fechaInicioStr?: string | null,
  diaCorte?: number,
  mesIndex: number = 0
): string {
  if (!fechaInicioStr) return "";
  const parts = fechaInicioStr.split("-").map(Number);
  const startYear = parts[0];
  const startMonth = (parts[1] || 1) - 1;
  const d = new Date(startYear, startMonth + mesIndex, 1);
  const year = d.getFullYear();
  const month = d.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const day = Math.min(diaCorte || 1, daysInMonth);
  return `${day} ${MESES_ES[month]} de ${year}`;
}

export function RentasPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "adeudos" | "pagos" | "locales">("dashboard");
  const [isLoading, setIsLoading] = useState(false);

  // Estados de datos
  const [dashboard, setDashboard] = useState<DashboardRentas | null>(null);
  const [adeudos, setAdeudos] = useState<AdeudoResumen[]>([]);
  const [pagos, setPagos] = useState<PagoRenta[]>([]);
  const [locales, setLocales] = useState<LocalComercial[]>([]);
  const [contratos, setContratos] = useState<ContratoRenta[]>([]);
  const [regiones, setRegiones] = useState<Region[]>([]);
  const [lugares, setLugares] = useState<Lugar[]>([]);

  // Filtros Generales
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState<"TODOS" | "AL CORRIENTE" | "CON ADEUDO">("TODOS");
  const [periodosExpandidos, setPeriodosExpandidos] = useState<Record<number, boolean>>({});

  const toggleExpandirPeriodos = (contratoId: number) => {
    setPeriodosExpandidos((prev) => ({
      ...prev,
      [contratoId]: !prev[contratoId],
    }));
  };

  // Filtros Específicos para Catálogo de Locales
  const [filtroLocalesBusqueda, setFiltroLocalesBusqueda] = useState("");
  const [filtroLocalesRegionId, setFiltroLocalesRegionId] = useState<number | "">("");
  const [filtroLocalesLugarId, setFiltroLocalesLugarId] = useState<number | "">("");
  const [filtroLocalesEstatus, setFiltroLocalesEstatus] = useState<"TODOS" | "DISPONIBLES" | "RENTADOS">("TODOS");

  // Filtros Específicos para Contratos
  const [filtroContratosBusqueda, setFiltroContratosBusqueda] = useState("");
  const [filtroContratosRegionId, setFiltroContratosRegionId] = useState<number | "">("");
  const [filtroContratosLugarId, setFiltroContratosLugarId] = useState<number | "">("");
  const [filtroContratosDiaCorte, setFiltroContratosDiaCorte] = useState<number | "">("");
  const [filtroContratosEstatus, setFiltroContratosEstatus] = useState<"TODOS" | "VIGENTES" | "FINALIZADOS">("TODOS");

  // Filtros para Búsqueda en Modales de Catálogo
  const [filtroRegionesBusqueda, setFiltroRegionesBusqueda] = useState("");
  const [filtroLugaresBusqueda, setFiltroLugaresBusqueda] = useState("");
  const [filtroLugaresRegionId, setFiltroLugaresRegionId] = useState<number | "">("");

  // Modales
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pagoEditando, setPagoEditando] = useState<PagoRenta | null>(null);

  const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState(false);
  const [auditoriasPago, setAuditoriasPago] = useState<AuditoriaPagoRenta[]>([]);
  const [pagoSeleccionadoAuditoria, setPagoSeleccionadoAuditoria] = useState<number | null>(null);

  const [modalBajaPagoOpen, setModalBajaPagoOpen] = useState(false);
  const [pagoBajaId, setPagoBajaId] = useState<number | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");

  // Modales "Al Vuelo" y Edición de Catálogos
  const [modalRegionOpen, setModalRegionOpen] = useState(false);
  const [regionEditandoId, setRegionEditandoId] = useState<number | null>(null);
  const [nuevaRegionNombre, setNuevaRegionNombre] = useState("");
  const [nuevaRegionDesc, setNuevaRegionDesc] = useState("");

  const [modalLugarOpen, setModalLugarOpen] = useState(false);
  const [lugarEditandoId, setLugarEditandoId] = useState<number | null>(null);
  const [nuevoLugarRegionId, setNuevoLugarRegionId] = useState<number | "">("");
  const [nuevoLugarNombre, setNuevoLugarNombre] = useState("");
  const [nuevoLugarDireccion, setNuevoLugarDireccion] = useState("");

  const [modalLocalOpen, setModalLocalOpen] = useState(false);
  const [localLugarId, setLocalLugarId] = useState<number | "">("");
  const [localNumero, setLocalNumero] = useState("");
  const [localNickname, setLocalNickname] = useState("");
  const [localRentaSugerida, setLocalRentaSugerida] = useState<number | "">("");
  const [localDescripcion, setLocalDescripcion] = useState("");

  // Modales: Editar Local
  const [modalEditarLocalOpen, setModalEditarLocalOpen] = useState(false);
  const [localEditandoId, setLocalEditandoId] = useState<number | null>(null);
  const [editLocalLugarId, setEditLocalLugarId] = useState<number | "">("");
  const [editLocalNumero, setEditLocalNumero] = useState("");
  const [editLocalNickname, setEditLocalNickname] = useState("");
  const [editLocalRentaSugerida, setEditLocalRentaSugerida] = useState<number | "">("");
  const [editLocalDescripcion, setEditLocalDescripcion] = useState("");

  const [modalContratoOpen, setModalContratoOpen] = useState(false);
  const [contratoLocalId, setContratoLocalId] = useState<number | "">("");
  const [contratoArrendatario, setContratoArrendatario] = useState("");
  const [contratoNombreComercial, setContratoNombreComercial] = useState("");
  const [contratoTelefono, setContratoTelefono] = useState("");
  const [contratoEmail, setContratoEmail] = useState("");
  const [contratoFechaInicio, setContratoFechaInicio] = useState("");
  const [contratoFechaFin, setContratoFechaFin] = useState("");
  const [contratoMontoRenta, setContratoMontoRenta] = useState<number | "">("");
  const [contratoDiaCorte, setContratoDiaCorte] = useState<number>(1);

  // Modal: Editar Contrato
  const [modalEditarContratoOpen, setModalEditarContratoOpen] = useState(false);
  const [editContratoId, setEditContratoId] = useState<number | null>(null);
  const [editContratoLocalInfo, setEditContratoLocalInfo] = useState<string>("");
  const [editContratoArrendatario, setEditContratoArrendatario] = useState("");
  const [editContratoNombreComercial, setEditContratoNombreComercial] = useState("");
  const [editContratoTelefono, setEditContratoTelefono] = useState("");
  const [editContratoEmail, setEditContratoEmail] = useState("");
  const [editContratoFechaInicio, setEditContratoFechaInicio] = useState("");
  const [editContratoFechaFin, setEditContratoFechaFin] = useState("");
  const [editContratoMontoRenta, setEditContratoMontoRenta] = useState<number | "">("");
  const [editContratoDiaCorte, setEditContratoDiaCorte] = useState<number>(1);
  const [editContratoVigente, setEditContratoVigente] = useState<boolean>(true);

  // Formulario de Pago
  const [formPagoContratoId, setFormPagoContratoId] = useState<number | "">("");
  const [formPagoMonto, setFormPagoMonto] = useState<number | "">("");
  const [formPagoMeses, setFormPagoMeses] = useState<number>(1);
  const [formPagoPeriodo, setFormPagoPeriodo] = useState<string>("");
  const [formPagoFechaReal, setFormPagoFechaReal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formPagoMetodo, setFormPagoMetodo] = useState<string>("Efectivo");
  const [formPagoReferencia, setFormPagoReferencia] = useState("");
  const [formPagoNota, setFormPagoNota] = useState("");
  const [formPagoMotivoCambio, setFormPagoMotivoCambio] = useState("");

  // Helpers para periodos de cobro y pagos
  const obtenerSugerenciaPeriodo = (contratoId: number, mesesCubiertos: number = 1): string => {
    const contratoAdeudo = adeudos.find((a) => a.contrato_id === contratoId);
    if (contratoAdeudo) {
      const pend = contratoAdeudo.periodos_pendientes || [];
      if (pend.length > 0) {
        const count = Math.max(1, Math.floor(mesesCubiertos));
        return pend.slice(0, count).join(", ");
      }
      return generarPeriodoFecha(
        contratoAdeudo.fecha_inicio,
        contratoAdeudo.dia_corte,
        contratoAdeudo.meses_pagados
      );
    }
    const cObj = contratos.find((c) => c.id === contratoId);
    if (cObj) {
      return generarPeriodoFecha(cObj.fecha_inicio, cObj.dia_corte, 0);
    }
    return "";
  };

  const getOpcionesPeriodos = (): string[] => {
    if (!formPagoContratoId) return [];
    const opts: string[] = [];
    const contratoAdeudo = adeudos.find((a) => a.contrato_id === Number(formPagoContratoId));
    if (contratoAdeudo) {
      const pend = contratoAdeudo.periodos_pendientes || [];
      // Agregar combinación de los N meses si meses cubiertos > 1
      if (formPagoMeses > 1 && pend.length >= 2) {
        const comb = pend.slice(0, Math.floor(formPagoMeses)).join(", ");
        opts.push(comb);
      }
      // Agregar periodos pendientes individuales
      pend.forEach((p) => {
        if (!opts.includes(p)) opts.push(p);
      });
      // Agregar siguientes periodos a futuro
      const nextIdx = Math.max(contratoAdeudo.meses_cobrables, Math.floor(contratoAdeudo.meses_pagados));
      const next1 = generarPeriodoFecha(contratoAdeudo.fecha_inicio, contratoAdeudo.dia_corte, nextIdx);
      if (next1 && !opts.includes(next1)) opts.push(next1);
      const next2 = generarPeriodoFecha(contratoAdeudo.fecha_inicio, contratoAdeudo.dia_corte, nextIdx + 1);
      if (next2 && !opts.includes(next2)) opts.push(next2);
    } else {
      const cObj = contratos.find((c) => c.id === Number(formPagoContratoId));
      if (cObj) {
        for (let i = 0; i < 3; i++) {
          const p = generarPeriodoFecha(cObj.fecha_inicio, cObj.dia_corte, i);
          if (p && !opts.includes(p)) opts.push(p);
        }
      }
    }
    return opts;
  };

  // Carga inicial
  const cargarCatalogos = async () => {
    try {
      const [regs, lugs, locs, conts] = await Promise.all([
        rentasApi.getRegiones(),
        rentasApi.getLugares(),
        rentasApi.getLocales(),
        rentasApi.getContratos(),
      ]);
      setRegiones(regs);
      setLugares(lugs);
      setLocales(locs);
      setContratos(conts);
    } catch {
      notify.error("Error al cargar catálogos base");
    }
  };

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [dash, adeuds, pgs] = await Promise.all([
        rentasApi.getDashboard(),
        rentasApi.getAdeudos(),
        rentasApi.getPagos(),
      ]);
      setDashboard(dash);
      setAdeudos(adeuds);
      setPagos(pgs);
      await cargarCatalogos();
    } catch {
      notify.error("Error al sincronizar datos de rentas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // Manejadores de Pago
  const abrirModalNuevoPago = (contratoId?: number, periodoInicial?: string) => {
    const targetId = contratoId || (contratos[0]?.id ?? "");
    setPagoEditando(null);
    setFormPagoContratoId(targetId);
    setFormPagoMonto("");
    setFormPagoMeses(1);
    setFormPagoPeriodo(
      periodoInicial || (targetId ? obtenerSugerenciaPeriodo(Number(targetId), 1) : "")
    );
    setFormPagoFechaReal(new Date().toISOString().split("T")[0]);
    setFormPagoMetodo("Transferencia");
    setFormPagoReferencia("");
    setFormPagoNota("");
    setFormPagoMotivoCambio("");
    setModalPagoOpen(true);
  };

  const abrirModalEditarPago = (pago: PagoRenta) => {
    setPagoEditando(pago);
    setFormPagoContratoId(pago.contrato_id);
    setFormPagoMonto(pago.monto);
    setFormPagoMeses(pago.meses_cubiertos);
    setFormPagoPeriodo(pago.periodo_cubierto || "");
    setFormPagoFechaReal(pago.fecha_abono_real);
    setFormPagoMetodo(pago.metodo_pago);
    setFormPagoReferencia(pago.referencia_bancaria || "");
    setFormPagoNota(pago.nota || "");
    setFormPagoMotivoCambio("");
    setModalPagoOpen(true);
  };

  const guardarPago = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPagoContratoId) {
      notify.warning("Seleccione un contrato.");
      return;
    }
    if (!formPagoMonto || Number(formPagoMonto) <= 0) {
      notify.warning("El monto debe ser mayor a 0.");
      return;
    }
    if (!formPagoFechaReal) {
      notify.warning("La fecha de abono real (banco) es requerida.");
      return;
    }

    try {
      if (pagoEditando) {
        if (!formPagoMotivoCambio.trim()) {
          notify.warning("Especifique el motivo de la modificación para la bitácora.");
          return;
        }
        await rentasApi.updatePago(pagoEditando.id, {
          monto: Number(formPagoMonto),
          meses_cubiertos: Number(formPagoMeses) || 1,
          periodo_cubierto: formPagoPeriodo.trim() || undefined,
          fecha_abono_real: formPagoFechaReal,
          metodo_pago: formPagoMetodo,
          referencia_bancaria: formPagoReferencia || undefined,
          nota: formPagoNota || undefined,
          motivo_cambio: formPagoMotivoCambio.trim(),
        });
        notify.success("Pago modificado con registro de auditoría");
      } else {
        await rentasApi.createPago({
          contrato_id: Number(formPagoContratoId),
          monto: Number(formPagoMonto),
          meses_cubiertos: Number(formPagoMeses) || 1,
          periodo_cubierto: formPagoPeriodo.trim() || undefined,
          fecha_abono_real: formPagoFechaReal,
          metodo_pago: formPagoMetodo,
          referencia_bancaria: formPagoReferencia || undefined,
          nota: formPagoNota || undefined,
        });
        notify.success("Pago registrado con éxito");
      }
      setModalPagoOpen(false);
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al procesar pago");
    }
  };

  const confirmarBajaPago = async () => {
    if (!pagoBajaId) return;
    if (!motivoBaja.trim()) {
      notify.warning("Debe ingresar el motivo de la baja lógica.");
      return;
    }
    try {
      await rentasApi.deletePago(pagoBajaId, motivoBaja.trim());
      notify.success("Pago dado de baja lógicamente y registrado en bitácora");
      setModalBajaPagoOpen(false);
      setPagoBajaId(null);
      setMotivoBaja("");
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al dar de baja el pago");
    }
  };

  const verAuditoria = async (pagoId: number) => {
    try {
      setPagoSeleccionadoAuditoria(pagoId);
      const data = await rentasApi.getAuditoriaPago(pagoId);
      setAuditoriasPago(data);
      setModalAuditoriaOpen(true);
    } catch {
      notify.error("Error al consultar bitácora de auditoría");
    }
  };

  // Gestión: Región (Crear / Editar)
  const submitRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRegionNombre.trim()) {
      notify.warning("El nombre de la región es obligatorio.");
      return;
    }
    try {
      if (regionEditandoId) {
        await rentasApi.updateRegion(regionEditandoId, {
          nombre: nuevaRegionNombre.trim(),
          descripcion: nuevaRegionDesc.trim() || undefined,
        });
        notify.success(`Región "${nuevaRegionNombre.trim()}" actualizada con éxito`);
        setRegionEditandoId(null);
      } else {
        const reg = await rentasApi.createRegion({
          nombre: nuevaRegionNombre.trim(),
          descripcion: nuevaRegionDesc.trim() || undefined,
        });
        notify.success(`Región "${reg.nombre}" creada al instante`);
        setNuevoLugarRegionId(reg.id);
      }
      setNuevaRegionNombre("");
      setNuevaRegionDesc("");
      await cargarCatalogos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al procesar región");
    }
  };

  const iniciarEdicionRegion = (reg: Region) => {
    setRegionEditandoId(reg.id);
    setNuevaRegionNombre(reg.nombre);
    setNuevaRegionDesc(reg.descripcion || "");
  };

  const cancelarEdicionRegion = () => {
    setRegionEditandoId(null);
    setNuevaRegionNombre("");
    setNuevaRegionDesc("");
  };

  // Gestión: Lugar / Complejo (Crear / Editar)
  const submitLugar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoLugarRegionId || !nuevoLugarNombre.trim()) {
      notify.warning("Seleccione región y asigne un nombre al complejo.");
      return;
    }
    try {
      if (lugarEditandoId) {
        await rentasApi.updateLugar(lugarEditandoId, {
          region_id: Number(nuevoLugarRegionId),
          nombre: nuevoLugarNombre.trim(),
          direccion: nuevoLugarDireccion.trim() || undefined,
        });
        notify.success(`Complejo "${nuevoLugarNombre.trim()}" actualizado con éxito`);
        setLugarEditandoId(null);
      } else {
        const lug = await rentasApi.createLugar({
          region_id: Number(nuevoLugarRegionId),
          nombre: nuevoLugarNombre.trim(),
          direccion: nuevoLugarDireccion.trim() || undefined,
        });
        notify.success(`Complejo "${lug.nombre}" registrado`);
        setLocalLugarId(lug.id);
      }
      setNuevoLugarNombre("");
      setNuevoLugarDireccion("");
      await cargarCatalogos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al procesar complejo");
    }
  };

  const iniciarEdicionLugar = (lug: Lugar) => {
    setLugarEditandoId(lug.id);
    setNuevoLugarRegionId(lug.region_id);
    setNuevoLugarNombre(lug.nombre);
    setNuevoLugarDireccion(lug.direccion || "");
  };

  const cancelarEdicionLugar = () => {
    setLugarEditandoId(null);
    setNuevoLugarRegionId("");
    setNuevoLugarNombre("");
    setNuevoLugarDireccion("");
  };

  // Creación de Local
  const crearLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localLugarId || !localNumero.trim() || !localNickname.trim()) {
      notify.warning("Complejo, número físico y nickname son obligatorios.");
      return;
    }
    try {
      await rentasApi.createLocal({
        lugar_id: Number(localLugarId),
        numero_fisico: localNumero.trim(),
        nickname: localNickname.trim(),
        monto_renta_sugerido: Number(localRentaSugerida) || 0,
        descripcion: localDescripcion.trim() || undefined,
      });
      notify.success("Local comercial creado con éxito");
      setModalLocalOpen(false);
      setLocalNumero("");
      setLocalNickname("");
      setLocalRentaSugerida("");
      setLocalDescripcion("");
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al registrar local");
    }
  };

  // Edición de Local
  const abrirModalEditarLocal = (loc: LocalComercial) => {
    setLocalEditandoId(loc.id);
    setEditLocalLugarId(loc.lugar_id);
    setEditLocalNumero(loc.numero_fisico);
    setEditLocalNickname(loc.nickname);
    setEditLocalRentaSugerida(loc.monto_renta_sugerido || "");
    setEditLocalDescripcion(loc.descripcion || "");
    setModalEditarLocalOpen(true);
  };

  const editarLocalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localEditandoId || !editLocalLugarId || !editLocalNumero.trim() || !editLocalNickname.trim()) {
      notify.warning("Complejo, número físico y alias son obligatorios.");
      return;
    }
    try {
      await rentasApi.updateLocal(localEditandoId, {
        lugar_id: Number(editLocalLugarId),
        numero_fisico: editLocalNumero.trim(),
        nickname: editLocalNickname.trim(),
        monto_renta_sugerido: Number(editLocalRentaSugerida) || 0,
        descripcion: editLocalDescripcion.trim() || undefined,
      });
      notify.success("¡Local comercial actualizado correctamente!");
      setModalEditarLocalOpen(false);
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al actualizar local");
    }
  };

  // Creación de Contrato
  const crearContratoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contratoLocalId || !contratoArrendatario.trim() || !contratoFechaInicio || !contratoMontoRenta) {
      notify.warning("Complete todos los campos obligatorios del contrato.");
      return;
    }
    try {
      await rentasApi.createContrato({
        local_id: Number(contratoLocalId),
        nombre_comercial: contratoNombreComercial.trim() || undefined,
        arrendatario_nombre: contratoArrendatario.trim(),
        arrendatario_telefono: contratoTelefono.trim() || undefined,
        arrendatario_email: contratoEmail.trim() || undefined,
        fecha_inicio: contratoFechaInicio,
        fecha_fin: contratoFechaFin || undefined,
        monto_renta_mensual: Number(contratoMontoRenta),
        dia_corte: Number(contratoDiaCorte) || 1,
      });
      notify.success("Contrato de arrendamiento activado");
      setModalContratoOpen(false);
      setContratoArrendatario("");
      setContratoNombreComercial("");
      setContratoTelefono("");
      setContratoEmail("");
      setContratoFechaInicio("");
      setContratoFechaFin("");
      setContratoMontoRenta("");
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al crear contrato");
    }
  };

  // Finalizar Contrato
  const finalizarContratoClick = async (contratoId: number, arrendatario: string) => {
    if (!window.confirm(`¿Está seguro de finalizar el contrato de "${arrendatario}"? El local volverá a quedar como disponible.`)) {
      return;
    }
    try {
      await rentasApi.finalizarContrato(contratoId);
      notify.success("Contrato finalizado correctamente. El local está disponible.");
      cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al finalizar contrato");
    }
  };

  // Editar Contrato
  const abrirModalEditarContrato = (c: ContratoRenta) => {
    setEditContratoId(c.id);
    const infoLocal = `${c.local_nickname || "Local"} - No. ${c.local_numero || ""}${
      c.lugar_nombre ? ` • ${c.lugar_nombre}` : ""
    }${c.region_nombre ? ` (${c.region_nombre})` : ""}`;
    setEditContratoLocalInfo(infoLocal);
    setEditContratoArrendatario(c.arrendatario_nombre || "");
    setEditContratoNombreComercial(c.nombre_comercial || "");
    setEditContratoTelefono(c.arrendatario_telefono || "");
    setEditContratoEmail(c.arrendatario_email || "");
    setEditContratoFechaInicio(c.fecha_inicio || "");
    setEditContratoFechaFin(c.fecha_fin || "");
    setEditContratoMontoRenta(c.monto_renta_mensual);
    setEditContratoDiaCorte(c.dia_corte || 1);
    setEditContratoVigente(Boolean(c.vigente));
    setModalEditarContratoOpen(true);
  };

  const guardarEdicionContrato = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editContratoId) return;
    if (!editContratoArrendatario.trim()) {
      notify.warning("El nombre del arrendatario es obligatorio.");
      return;
    }
    if (editContratoMontoRenta === "" || Number(editContratoMontoRenta) < 0) {
      notify.warning("El monto de renta mensual debe ser un número válido.");
      return;
    }
    if (editContratoDiaCorte < 1 || editContratoDiaCorte > 31) {
      notify.warning("El día de corte debe estar entre 1 y 31.");
      return;
    }
    try {
      await rentasApi.updateContrato(editContratoId, {
        arrendatario_nombre: editContratoArrendatario.trim(),
        nombre_comercial: editContratoNombreComercial.trim() || undefined,
        arrendatario_telefono: editContratoTelefono.trim() || undefined,
        arrendatario_email: editContratoEmail.trim() || undefined,
        fecha_inicio: editContratoFechaInicio || undefined,
        fecha_fin: editContratoFechaFin || undefined,
        monto_renta_mensual: Number(editContratoMontoRenta),
        dia_corte: Number(editContratoDiaCorte),
        vigente: editContratoVigente,
      });
      notify.success("Contrato actualizado con éxito.");
      setModalEditarContratoOpen(false);
      await cargarDatos();
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al actualizar contrato");
    }
  };

  // Filtro de tabla de adeudos
  const adeudosFiltrados = adeudos.filter((a) => {
    const coincideTexto =
      a.nickname.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      a.arrendatario_nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      (a.nombre_comercial ? a.nombre_comercial.toLowerCase().includes(filtroBusqueda.toLowerCase()) : false) ||
      a.lugar.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      a.numero_fisico.toLowerCase().includes(filtroBusqueda.toLowerCase());

    if (filtroEstatus === "TODOS") return coincideTexto;
    return coincideTexto && a.estatus_cartera === filtroEstatus;
  });

  // Filtro de locales comerciales
  const localesFiltrados = locales.filter((loc) => {
    const q = filtroLocalesBusqueda.trim().toLowerCase();
    if (q) {
      const coincide =
        loc.nickname.toLowerCase().includes(q) ||
        loc.numero_fisico.toLowerCase().includes(q) ||
        (loc.lugar_nombre ? loc.lugar_nombre.toLowerCase().includes(q) : false) ||
        (loc.region_nombre ? loc.region_nombre.toLowerCase().includes(q) : false) ||
        (loc.arrendatario_actual ? loc.arrendatario_actual.toLowerCase().includes(q) : false) ||
        (loc.nombre_comercial_actual ? loc.nombre_comercial_actual.toLowerCase().includes(q) : false);
      if (!coincide) return false;
    }

    if (filtroLocalesRegionId !== "") {
      const lug = lugares.find((l) => l.id === loc.lugar_id);
      if (!lug || lug.region_id !== Number(filtroLocalesRegionId)) return false;
    }

    if (filtroLocalesLugarId !== "") {
      if (loc.lugar_id !== Number(filtroLocalesLugarId)) return false;
    }

    if (filtroLocalesEstatus === "DISPONIBLES" && loc.ocupado) return false;
    if (filtroLocalesEstatus === "RENTADOS" && !loc.ocupado) return false;

    return true;
  });

  const lugaresParaFiltroLocales =
    filtroLocalesRegionId !== ""
      ? lugares.filter((l) => l.region_id === Number(filtroLocalesRegionId))
      : lugares;

  const hayFiltrosLocalesActivos = Boolean(
    filtroLocalesBusqueda.trim() ||
      filtroLocalesRegionId !== "" ||
      filtroLocalesLugarId !== "" ||
      filtroLocalesEstatus !== "TODOS"
  );

  const limpiarFiltrosLocales = () => {
    setFiltroLocalesBusqueda("");
    setFiltroLocalesRegionId("");
    setFiltroLocalesLugarId("");
    setFiltroLocalesEstatus("TODOS");
  };

  // Filtro de contratos de arrendamiento
  const contratosFiltrados = contratos.filter((c) => {
    const q = filtroContratosBusqueda.trim().toLowerCase();
    if (q) {
      const coincide =
        c.arrendatario_nombre.toLowerCase().includes(q) ||
        (c.nombre_comercial ? c.nombre_comercial.toLowerCase().includes(q) : false) ||
        (c.local_nickname ? c.local_nickname.toLowerCase().includes(q) : false) ||
        (c.local_numero ? c.local_numero.toLowerCase().includes(q) : false) ||
        (c.lugar_nombre ? c.lugar_nombre.toLowerCase().includes(q) : false) ||
        (c.region_nombre ? c.region_nombre.toLowerCase().includes(q) : false) ||
        (c.arrendatario_telefono ? c.arrendatario_telefono.toLowerCase().includes(q) : false) ||
        (c.arrendatario_email ? c.arrendatario_email.toLowerCase().includes(q) : false);
      if (!coincide) return false;
    }

    if (filtroContratosRegionId !== "") {
      const regId =
        c.region_id ??
        (() => {
          const loc = locales.find((l) => l.id === c.local_id);
          const lug = lugares.find((l) => l.id === loc?.lugar_id);
          return lug?.region_id;
        })();
      if (regId !== Number(filtroContratosRegionId)) return false;
    }

    if (filtroContratosLugarId !== "") {
      const lugId = (() => {
        const loc = locales.find((l) => l.id === c.local_id);
        return loc?.lugar_id;
      })();
      if (lugId !== Number(filtroContratosLugarId)) return false;
    }

    if (filtroContratosDiaCorte !== "") {
      if (c.dia_corte !== Number(filtroContratosDiaCorte)) return false;
    }

    if (filtroContratosEstatus === "VIGENTES" && !c.vigente) return false;
    if (filtroContratosEstatus === "FINALIZADOS" && c.vigente) return false;

    return true;
  });

  const lugaresParaFiltroContratos =
    filtroContratosRegionId !== ""
      ? lugares.filter((l) => l.region_id === Number(filtroContratosRegionId))
      : lugares;

  const diasCorteDisponibles = Array.from(new Set(contratos.map((c) => c.dia_corte))).sort(
    (a, b) => a - b
  );

  const hayFiltrosContratosActivos = Boolean(
    filtroContratosBusqueda.trim() ||
      filtroContratosRegionId !== "" ||
      filtroContratosLugarId !== "" ||
      filtroContratosDiaCorte !== "" ||
      filtroContratosEstatus !== "TODOS"
  );

  const limpiarFiltrosContratos = () => {
    setFiltroContratosBusqueda("");
    setFiltroContratosRegionId("");
    setFiltroContratosLugarId("");
    setFiltroContratosDiaCorte("");
    setFiltroContratosEstatus("TODOS");
  };

  // Filtro de complejos en modal
  const lugaresFiltradosModal = lugares.filter((lug) => {
    const q = filtroLugaresBusqueda.trim().toLowerCase();
    if (q) {
      const coincide =
        lug.nombre.toLowerCase().includes(q) ||
        (lug.direccion ? lug.direccion.toLowerCase().includes(q) : false) ||
        (lug.region_nombre ? lug.region_nombre.toLowerCase().includes(q) : false);
      if (!coincide) return false;
    }
    if (filtroLugaresRegionId !== "") {
      if (lug.region_id !== Number(filtroLugaresRegionId)) return false;
    }
    return true;
  });

  // Filtro de regiones en modal
  const regionesFiltradasModal = regiones.filter((reg) => {
    const q = filtroRegionesBusqueda.trim().toLowerCase();
    if (q) {
      const coincide =
        reg.nombre.toLowerCase().includes(q) ||
        (reg.descripcion ? reg.descripcion.toLowerCase().includes(q) : false);
      if (!coincide) return false;
    }
    return true;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-body">
      {/* CABECERA PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-black/5">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">
                Control de Rentas y Casetas
              </h1>
              <p className="text-xs text-neutral/70 font-medium">
                Módulo independiente con auditoría antifraude y control de adeudos en tiempo real
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={cargarDatos}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-surfacecontainer/60 hover:bg-surfacecontainer text-neutral text-xs font-semibold rounded-xl transition border border-black/5"
            title="Sincronizar"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            <span>Refrescar</span>
          </button>

          <button
            onClick={() => abrirModalNuevoPago()}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            <DollarSign className="w-4 h-4" />
            <span>Registrar Pago</span>
          </button>

          <button
            onClick={() => setModalLocalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Local</span>
          </button>

          <button
            onClick={() => setModalContratoOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-secondary hover:bg-secondary/90 text-primary text-xs font-bold rounded-xl shadow-sm transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Nuevo Contrato</span>
          </button>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div className="flex border-b border-black/10 gap-2 overflow-x-auto pb-1">
        {[
          { id: "dashboard", label: "Dashboard & Indicadores", icon: TrendingUp },
          { id: "adeudos", label: "Control de Adeudos", icon: AlertCircle, badge: dashboard?.cartera.contratos_con_adeudo },
          { id: "pagos", label: "Gestión de Pagos e Historial", icon: DollarSign },
          { id: "locales", label: "Locales y Contratos", icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-white shadow-2xs"
                  : "border-transparent text-neutral/60 hover:text-neutral hover:bg-white/40"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-neutral/50"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500 text-white font-bold ml-1">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. SECCIÓN: DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === "dashboard" && dashboard && (
        <div className="space-y-6 animate-fadeIn">
          {/* Tarjetas de Métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Ocupación */}
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral/60">
                <span>Tasa de Ocupación</span>
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <div className="font-headline text-3xl font-extrabold text-primary">
                {dashboard.ocupacion.porcentaje_ocupacion}%
              </div>
              <div className="w-full bg-surfacecontainer rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(dashboard.ocupacion.porcentaje_ocupacion, 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-neutral/60">
                <strong className="text-neutral">{dashboard.ocupacion.locales_rentados}</strong> rentados de{" "}
                <strong className="text-neutral">{dashboard.ocupacion.total_locales}</strong> locales (
                {dashboard.ocupacion.locales_disponibles} disponibles)
              </p>
            </div>

            {/* Recaudación Mes Actual */}
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral/60">
                <span>Ingreso Mes Actual (Banco)</span>
                <Landmark className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="font-headline text-3xl font-extrabold text-emerald-600">
                ${dashboard.ingresosMesActual.total_ingreso.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral/60">
                Basado estrictamente en la <strong className="text-emerald-700">Fecha de Abono Real</strong> ({dashboard.ingresosMesActual.total_pagos} pagos registrados)
              </p>
            </div>

            {/* Estatus Cartera: Adeudo */}
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral/60">
                <span>Cartera Vencida (Deuda)</span>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <div className="font-headline text-3xl font-extrabold text-rose-600">
                ${dashboard.cartera.monto_deuda_acumulada.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-neutral/60">
                <strong className="text-rose-600 font-bold">{dashboard.cartera.contratos_con_adeudo}</strong> contratos con mensualidades pendientes
              </p>
            </div>

            {/* Estatus Cartera: Al Corriente */}
            <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-2xs space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral/60">
                <span>Contratos Al Corriente</span>
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
              </div>
              <div className="font-headline text-3xl font-extrabold text-teal-700">
                {dashboard.cartera.contratos_al_corriente}
              </div>
              <p className="text-[11px] text-neutral/60">
                Inquilinos sin saldo pendiente al corte del mes
              </p>
            </div>
          </div>

          {/* Gráfico Histórico de Recaudación (Últimos 12 Meses) */}
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-base font-bold text-primary">
                  Histórico de Recaudación (Últimos 12 Meses)
                </h2>
                <p className="text-xs text-neutral/60">
                  Agrupado por mes bancario según la Fecha de Abono Real
                </p>
              </div>
            </div>

            {dashboard.historicoRecaudacion.length === 0 ? (
              <div className="text-center py-12 text-xs text-neutral/50 font-medium">
                No se tienen registros de pagos en el historial para graficar.
              </div>
            ) : (
              <div className="h-64 flex items-end gap-2 sm:gap-4 pt-8 pb-4 px-2 border-b border-black/10 overflow-x-auto">
                {(() => {
                  const maxMonto = Math.max(...dashboard.historicoRecaudacion.map((h) => h.total_recaudado), 1);
                  return dashboard.historicoRecaudacion.map((item, idx) => {
                    const alturaPorc = Math.max(8, (item.total_recaudado / maxMonto) * 100);
                    const nombresMes = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
                    return (
                      <div key={idx} className="flex-1 min-w-[42px] flex flex-col items-center gap-2 group relative">
                        {/* Tooltip */}
                        <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral text-white text-[10px] px-2 py-1 rounded shadow pointer-events-none whitespace-nowrap z-10 font-bold">
                          ${item.total_recaudado.toLocaleString("es-MX")}
                        </div>
                        <div
                          className="w-full bg-primary/80 group-hover:bg-primary rounded-t-lg transition-all"
                          style={{ height: `${alturaPorc}%` }}
                        />
                        <span className="text-[10px] font-bold text-neutral/70">
                          {nombresMes[item.mes - 1]} '{String(item.anio).slice(2)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SECCIÓN: CONTROL DE ADEUDOS */}
      {/* ========================================================================= */}
      {activeTab === "adeudos" && (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-primary">
                Control de Adeudos y Cartera por Contrato
              </h2>
              <p className="text-xs text-neutral/60">
                Cálculo en tiempo real: Meses transcurridos cobrables vs Meses pagados
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Buscador */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral/40" />
                <input
                  type="text"
                  placeholder="Buscar local, arrendatario o lugar..."
                  value={filtroBusqueda}
                  onChange={(e) => setFiltroBusqueda(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-surfacecontainer/50 border border-black/10 rounded-xl focus:outline-none focus:border-primary w-64"
                />
              </div>

              {/* Selector de estatus */}
              <div className="flex rounded-xl bg-surfacecontainer/60 p-1 border border-black/5 text-xs">
                {(["TODOS", "CON ADEUDO", "AL CORRIENTE"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFiltroEstatus(st)}
                    className={`px-3 py-1 rounded-lg font-bold text-[11px] transition ${
                      filtroEstatus === st
                        ? "bg-white text-primary shadow-2xs"
                        : "text-neutral/60 hover:text-neutral"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tabla de Adeudos */}
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surfacecontainer/60 text-neutral font-bold border-b border-black/5">
                  <th className="p-3">Local / Caseta</th>
                  <th className="p-3">Complejo & Región</th>
                  <th className="p-3">Arrendatario</th>
                  <th className="p-3 text-right">Renta Mensual</th>
                  <th className="p-3 text-center">Meses Cobrables</th>
                  <th className="p-3 text-center">Meses Pagados</th>
                  <th className="p-3 text-center">Meses Pendientes</th>
                  <th className="p-3 text-right">Saldo Deuda</th>
                  <th className="p-3 text-center">Estatus</th>
                  <th className="p-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {adeudosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-neutral/50 font-medium">
                      No se encontraron contratos con los criterios especificados.
                    </td>
                  </tr>
                ) : (
                  adeudosFiltrados.map((a) => (
                    <tr key={a.contrato_id} className="hover:bg-surfacecontainer/20 transition">
                      <td className="p-3 font-semibold text-primary">
                        <div className="font-bold">{a.nickname}</div>
                        <div className="text-[10px] text-neutral/60">No. {a.numero_fisico}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-neutral">{a.lugar}</div>
                        <div className="text-[10px] text-neutral/50">{a.region}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-neutral">{a.arrendatario_nombre}</div>
                        {a.nombre_comercial && (
                          <div className="text-[11px] font-bold text-primary">Giro: {a.nombre_comercial}</div>
                        )}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${a.monto_renta_mensual.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-bold text-neutral/70">{a.meses_cobrables}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{a.meses_pagados}</td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center">
                          {a.meses_adeudo <= 0 ? (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              0 (Al corriente)
                            </span>
                          ) : a.meses_adeudo === 1 ? (
                            <div className="flex flex-col items-center">
                              <span className="font-extrabold text-rose-600 text-xs">
                                1 mes
                              </span>
                              {a.periodos_pendientes && a.periodos_pendientes.length > 0 && (
                                <span className="inline-block px-2 py-0.5 bg-rose-50 border border-rose-200/90 text-rose-900 rounded-md text-[10px] font-semibold mt-0.5 shadow-2xs whitespace-nowrap">
                                  {a.periodos_pendientes[0]}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="font-extrabold text-rose-600 text-xs">
                                {a.meses_adeudo} meses
                              </span>

                              {/* Botón Acordeón / Dropmenu */}
                              <button
                                type="button"
                                onClick={() => toggleExpandirPeriodos(a.contrato_id)}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition shadow-2xs mt-1 ${
                                  periodosExpandidos[a.contrato_id]
                                    ? "bg-rose-600 text-white border-rose-600"
                                    : "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200"
                                }`}
                                title="Ver desglose de periodos pendientes"
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                <span>
                                  {periodosExpandidos[a.contrato_id]
                                    ? "Ocultar"
                                    : `Ver ${a.periodos_pendientes?.length || a.meses_adeudo} fechas`}
                                </span>
                                <ChevronDown
                                  className={`w-2.5 h-2.5 transition-transform duration-200 ${
                                    periodosExpandidos[a.contrato_id] ? "rotate-180" : ""
                                  }`}
                                />
                              </button>

                              {/* Menú desplegable / Acordeón de periodos */}
                              {periodosExpandidos[a.contrato_id] && (
                                <div className="mt-1.5 p-2 bg-white rounded-xl border border-rose-200 shadow-md text-left w-52 max-h-36 overflow-y-auto space-y-1 animate-fadeIn">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-neutral/70 pb-1 border-b border-black/5">
                                    <span>Periodos adeudados</span>
                                    <span className="text-rose-600 font-extrabold">
                                      {a.periodos_pendientes?.length || a.meses_adeudo}
                                    </span>
                                  </div>
                                  <div className="space-y-1 pt-0.5">
                                    {a.periodos_pendientes?.map((periodo, pIdx) => (
                                      <div
                                        key={pIdx}
                                        onClick={() => abrirModalNuevoPago(a.contrato_id, periodo)}
                                        className="flex items-center justify-between text-[10px] font-semibold text-rose-950 px-2 py-1 rounded-md bg-rose-50/70 hover:bg-rose-100 border border-rose-100 transition cursor-pointer group"
                                        title="Clic para abonar este periodo específico"
                                      >
                                        <div className="flex items-center gap-1.5 truncate">
                                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                                          <span className="truncate">{periodo}</span>
                                        </div>
                                        <span className="text-[9px] text-rose-600 opacity-0 group-hover:opacity-100 transition font-bold shrink-0 ml-1">
                                          Pagar ➔
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-right font-extrabold">
                        {a.monto_adeudo > 0 ? (
                          <span className="text-rose-600">
                            ${a.monto_adeudo.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-emerald-600">$0.00</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.estatus_cartera === "AL CORRIENTE"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {a.estatus_cartera}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => abrirModalNuevoPago(a.contrato_id)}
                          className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg text-[10px] transition shadow-2xs flex items-center gap-1 mx-auto"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>Abonar</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SECCIÓN: GESTIÓN DE PAGOS E HISTORIAL */}
      {/* ========================================================================= */}
      {activeTab === "pagos" && (
        <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="font-headline text-lg font-bold text-primary">
                Historial de Pagos y Auditoría Antifraude
              </h2>
              <p className="text-xs text-neutral/60">
                Diferenciación entre Fecha de Abono Real (banco) y Fecha de Captura (sistema)
              </p>
            </div>

            <button
              onClick={() => abrirModalNuevoPago()}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Nuevo Pago</span>
            </button>
          </div>

          {/* Tabla de Pagos */}
          <div className="overflow-x-auto rounded-xl border border-black/5">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surfacecontainer/60 text-neutral font-bold border-b border-black/5">
                  <th className="p-3">Local & Arrendatario</th>
                  <th className="p-3 text-right">Monto</th>
                  <th className="p-3 text-center">Meses & Periodo Cubierto</th>
                  <th className="p-3">Fecha Abono Real (Banco)</th>
                  <th className="p-3">Fecha Captura (Sistema)</th>
                  <th className="p-3">Método / Referencia</th>
                  <th className="p-3">Usuario Capturó</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {pagos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-neutral/50 font-medium">
                      No se han registrado pagos de rentas todavía.
                    </td>
                  </tr>
                ) : (
                  pagos.map((p) => (
                    <tr key={p.id} className="hover:bg-surfacecontainer/20 transition">
                      <td className="p-3 font-semibold text-primary">
                        <div className="font-bold">{p.local_nickname}</div>
                        <div className="text-[10px] text-neutral/60 font-medium">{p.arrendatario_nombre}</div>
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-700">
                        ${p.monto.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-bold text-neutral">{p.meses_cubiertos} mes(es)</div>
                        {p.periodo_cubierto && (
                          <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 rounded px-1.5 py-0.5 mt-0.5 inline-block whitespace-nowrap shadow-2xs">
                            {p.periodo_cubierto}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-neutral">{p.fecha_abono_real}</span>
                      </td>
                      <td className="p-3 text-neutral/60 text-[11px]">
                        {new Date(p.fecha_captura).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="p-3 text-neutral">
                        <div className="font-medium">{p.metodo_pago}</div>
                        {p.referencia_bancaria && (
                          <div className="text-[10px] text-neutral/50 font-mono">Ref: {p.referencia_bancaria}</div>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral/80 bg-surfacecontainer/60 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3 text-primary" />
                          {p.usuario_creo_nombre || `ID: ${p.usuario_creo_id}`}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => abrirModalEditarPago(p)}
                            title="Editar con registro de auditoría"
                            className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => verAuditoria(p.id)}
                            title="Ver bitácora antifraude"
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setPagoBajaId(p.id);
                              setModalBajaPagoOpen(true);
                            }}
                            title="Baja lógica del pago"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SECCIÓN: LOCALES Y CONTRATOS */}
      {/* ========================================================================= */}
      {activeTab === "locales" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Locales Comerciales */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-primary">
                  Catálogo de Locales y Casetas
                </h2>
                <p className="text-xs text-neutral/60">
                  Jerarquía: Región ➔ Complejo / Lugar ➔ Local (Número Físico y Nombre Comercial)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    cancelarEdicionRegion();
                    setModalRegionOpen(true);
                  }}
                  className="px-3 py-1.5 bg-surfacecontainer hover:bg-surfacecontainer/80 text-neutral text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  title="Gestionar y editar regiones"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Regiones ({regiones.length})
                </button>
                <button
                  onClick={() => {
                    cancelarEdicionLugar();
                    setModalLugarOpen(true);
                  }}
                  className="px-3 py-1.5 bg-surfacecontainer hover:bg-surfacecontainer/80 text-neutral text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  title="Gestionar y editar complejos"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  Complejos ({lugares.length})
                </button>
                <button
                  onClick={() => setModalLocalOpen(true)}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-primary/90 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nuevo Local
                </button>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda de Locales */}
            <div className="bg-surfacecontainer/30 p-3.5 rounded-xl border border-black/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                  {/* Buscador de texto */}
                  <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral/40" />
                    <input
                      type="text"
                      placeholder="Buscar local, giro, inquilino o complejo..."
                      value={filtroLocalesBusqueda}
                      onChange={(e) => setFiltroLocalesBusqueda(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  {/* Filtro Región */}
                  <div className="min-w-[150px]">
                    <select
                      value={filtroLocalesRegionId}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setFiltroLocalesRegionId(val);
                        if (val !== "") {
                          const lugPertenece = lugares.find(
                            (l) => l.id === filtroLocalesLugarId && l.region_id === val
                          );
                          if (!lugPertenece) setFiltroLocalesLugarId("");
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs font-medium text-neutral cursor-pointer"
                    >
                      <option value="">Todas las Regiones</option>
                      {regiones.map((r) => (
                        <option key={r.id} value={r.id}>
                          Región: {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Complejo / Lugar */}
                  <div className="min-w-[160px]">
                    <select
                      value={filtroLocalesLugarId}
                      onChange={(e) =>
                        setFiltroLocalesLugarId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs font-medium text-neutral cursor-pointer"
                    >
                      <option value="">Todos los Complejos</option>
                      {lugaresParaFiltroLocales.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nombre} {filtroLocalesRegionId === "" && l.region_nombre ? `(${l.region_nombre})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Estatus (Pills) */}
                  <div className="flex rounded-xl bg-white p-1 border border-black/10 text-xs shadow-2xs">
                    {(
                      [
                        { key: "TODOS", label: `Todos (${locales.length})` },
                        {
                          key: "DISPONIBLES",
                          label: `Disponibles (${locales.filter((l) => !l.ocupado).length})`,
                        },
                        {
                          key: "RENTADOS",
                          label: `Rentados (${locales.filter((l) => l.ocupado).length})`,
                        },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFiltroLocalesEstatus(item.key)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          filtroLocalesEstatus === item.key
                            ? "bg-primary text-white shadow-2xs"
                            : "text-neutral/60 hover:text-neutral"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Botón limpiar filtros */}
                  {hayFiltrosLocalesActivos && (
                    <button
                      type="button"
                      onClick={limpiarFiltrosLocales}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center gap-1 border border-red-200"
                      title="Restablecer todos los filtros"
                    >
                      <FilterX className="w-3.5 h-3.5" />
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Resumen de conteo */}
                <div className="text-[11px] text-neutral/60 font-semibold shrink-0">
                  Mostrando <span className="text-primary font-bold">{localesFiltrados.length}</span> de {locales.length} locales
                </div>
              </div>
            </div>

            {/* Contenedor Scrollable con Grid de Locales */}
            <div className="max-h-[580px] overflow-y-auto pr-1">
              {locales.length === 0 ? (
                <div className="text-center py-12 text-neutral/50 text-xs space-y-2">
                  <div className="text-base font-semibold">No hay locales registrados aún</div>
                  <p>Agregue el primero usando el botón "+ Nuevo Local".</p>
                </div>
              ) : localesFiltrados.length === 0 ? (
                <div className="text-center py-12 text-neutral/50 text-xs space-y-2 bg-surfacecontainer/10 rounded-2xl border border-dashed border-black/10">
                  <div className="text-sm font-bold text-neutral/70">
                    No se encontraron locales con los filtros seleccionados
                  </div>
                  <p className="text-[11px]">Intente cambiar los criterios de búsqueda o estatus.</p>
                  <button
                    type="button"
                    onClick={limpiarFiltrosLocales}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-black/10 rounded-xl text-primary font-bold hover:bg-neutral/5 shadow-2xs"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {localesFiltrados.map((loc) => (
                    <div
                      key={loc.id}
                      className="p-4 rounded-xl border border-black/5 bg-surfacecontainer/20 hover:bg-surfacecontainer/40 transition space-y-2 relative"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-headline font-bold text-sm text-primary">
                            {loc.nickname}
                          </div>
                          <div className="text-[11px] text-neutral/60 font-semibold">
                            Local No. {loc.numero_fisico}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => abrirModalEditarLocal(loc)}
                            className="p-1 text-primary hover:bg-primary/10 rounded-lg transition"
                            title="Editar local"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              loc.ocupado ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {loc.ocupado ? "Rentado" : "Disponible"}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-neutral/70 space-y-1">
                        <div>
                          <span className="font-semibold text-neutral">Lugar:</span> {loc.lugar_nombre} ({loc.region_nombre})
                        </div>
                        {loc.monto_renta_sugerido > 0 && (
                          <div>
                            <span className="font-semibold text-neutral">Renta Sugerida:</span> $
                            {loc.monto_renta_sugerido.toLocaleString("es-MX")}
                          </div>
                        )}
                        {loc.ocupado ? (
                          <div className="pt-1 border-t border-black/5 space-y-0.5">
                            {loc.nombre_comercial_actual && (
                              <div className="text-primary font-bold text-xs">
                                <span className="font-semibold text-neutral">Giro:</span> {loc.nombre_comercial_actual}
                              </div>
                            )}
                            {loc.arrendatario_actual && (
                              <div className="text-emerald-700 font-medium text-xs">
                                <span className="font-bold">Inquilino:</span> {loc.arrendatario_actual}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-emerald-600 text-[11px] font-semibold italic pt-1 border-t border-black/5">
                            ✓ Inmueble disponible para nuevo contrato
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contratos Vigentes */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline text-base font-bold text-primary">
                  Contratos de Arrendamiento
                </h3>
                <p className="text-xs text-neutral/60">
                  Condiciones de renta pactadas, días de corte, vigencias y estatus
                </p>
              </div>

              <button
                onClick={() => setModalContratoOpen(true)}
                className="px-3 py-1.5 bg-secondary text-primary text-xs font-bold rounded-xl shadow-2xs hover:bg-secondary/90 transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Nuevo Contrato
              </button>
            </div>

            {/* Barra de Filtros de Contratos */}
            <div className="bg-surfacecontainer/30 p-3.5 rounded-xl border border-black/5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[260px]">
                  {/* Buscador de texto */}
                  <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral/40" />
                    <input
                      type="text"
                      placeholder="Buscar por inquilino, giro, local o complejo..."
                      value={filtroContratosBusqueda}
                      onChange={(e) => setFiltroContratosBusqueda(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs"
                    />
                  </div>

                  {/* Filtro Región */}
                  <div className="min-w-[150px]">
                    <select
                      value={filtroContratosRegionId}
                      onChange={(e) => {
                        const val = e.target.value === "" ? "" : Number(e.target.value);
                        setFiltroContratosRegionId(val);
                        if (val !== "") {
                          const lugPertenece = lugares.find(
                            (l) => l.id === filtroContratosLugarId && l.region_id === val
                          );
                          if (!lugPertenece) setFiltroContratosLugarId("");
                        }
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs font-medium text-neutral cursor-pointer"
                    >
                      <option value="">Todas las Regiones</option>
                      {regiones.map((r) => (
                        <option key={r.id} value={r.id}>
                          Región: {r.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Complejo / Lugar */}
                  <div className="min-w-[160px]">
                    <select
                      value={filtroContratosLugarId}
                      onChange={(e) =>
                        setFiltroContratosLugarId(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs font-medium text-neutral cursor-pointer"
                    >
                      <option value="">Todos los Complejos</option>
                      {lugaresParaFiltroContratos.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.nombre} {filtroContratosRegionId === "" && l.region_nombre ? `(${l.region_nombre})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro Día de Corte */}
                  {diasCorteDisponibles.length > 0 && (
                    <div className="min-w-[130px]">
                      <select
                        value={filtroContratosDiaCorte}
                        onChange={(e) =>
                          setFiltroContratosDiaCorte(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-black/10 rounded-xl focus:outline-none focus:border-primary shadow-2xs font-medium text-neutral cursor-pointer"
                      >
                        <option value="">Todos los Cortes</option>
                        {diasCorteDisponibles.map((dia) => (
                          <option key={dia} value={dia}>
                            Corte: Día {dia}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Filtro Estatus (Pills) */}
                  <div className="flex rounded-xl bg-white p-1 border border-black/10 text-xs shadow-2xs">
                    {(
                      [
                        { key: "TODOS", label: `Todos (${contratos.length})` },
                        {
                          key: "VIGENTES",
                          label: `Vigentes (${contratos.filter((c) => c.vigente).length})`,
                        },
                        {
                          key: "FINALIZADOS",
                          label: `Finalizados (${contratos.filter((c) => !c.vigente).length})`,
                        },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setFiltroContratosEstatus(item.key)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                          filtroContratosEstatus === item.key
                            ? "bg-primary text-white shadow-2xs"
                            : "text-neutral/60 hover:text-neutral"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* Botón limpiar filtros */}
                  {hayFiltrosContratosActivos && (
                    <button
                      type="button"
                      onClick={limpiarFiltrosContratos}
                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center gap-1 border border-red-200"
                      title="Restablecer todos los filtros"
                    >
                      <FilterX className="w-3.5 h-3.5" />
                      Limpiar
                    </button>
                  )}
                </div>

                {/* Resumen de conteo */}
                <div className="text-[11px] text-neutral/60 font-semibold shrink-0">
                  Mostrando <span className="text-primary font-bold">{contratosFiltrados.length}</span> de {contratos.length} contratos
                </div>
              </div>
            </div>

            {/* Tabla con scroll y encabezado fijo */}
            <div className="overflow-x-auto max-h-[520px] overflow-y-auto rounded-xl border border-black/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 bg-surfacecontainer/95 backdrop-blur-xs z-10">
                  <tr className="text-neutral font-bold border-b border-black/10">
                    <th className="p-3">Local y Complejo</th>
                    <th className="p-3">Arrendatario & Giro</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Fecha Inicio</th>
                    <th className="p-3 text-center">Día de Corte</th>
                    <th className="p-3 text-right">Renta Mensual</th>
                    <th className="p-3 text-center">Estatus</th>
                    <th className="p-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {contratos.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral/50 font-medium">
                        No hay contratos registrados aún.
                      </td>
                    </tr>
                  ) : contratosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-neutral/50 font-medium space-y-2">
                        <div className="text-sm font-bold text-neutral/70">
                          No se encontraron contratos con los filtros seleccionados
                        </div>
                        <p className="text-[11px]">Intente cambiar los criterios de búsqueda o estatus.</p>
                        <button
                          type="button"
                          onClick={limpiarFiltrosContratos}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-white border border-black/10 rounded-xl text-primary font-bold hover:bg-neutral/5 shadow-2xs mt-2"
                        >
                          <FilterX className="w-3.5 h-3.5" />
                          Limpiar filtros
                        </button>
                      </td>
                    </tr>
                  ) : (
                    contratosFiltrados.map((c) => (
                      <tr key={c.id} className="hover:bg-surfacecontainer/20 transition">
                        <td className="p-3 font-bold text-primary">
                          <div>{c.local_nickname}</div>
                          <div className="text-[10px] text-neutral/60 font-medium">
                            No. {c.local_numero} {c.lugar_nombre ? `• ${c.lugar_nombre}` : ""}
                            {c.region_nombre ? ` (${c.region_nombre})` : ""}
                          </div>
                        </td>
                        <td className="p-3 font-semibold text-neutral">
                          <div>{c.arrendatario_nombre}</div>
                          {c.nombre_comercial && (
                            <div className="text-[11px] font-bold text-primary">
                              Giro: {c.nombre_comercial}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-neutral/60">
                          {c.arrendatario_telefono || c.arrendatario_email || "N/A"}
                        </td>
                        <td className="p-3">{c.fecha_inicio}</td>
                        <td className="p-3 text-center font-bold text-neutral">Día {c.dia_corte}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">
                          ${c.monto_renta_mensual.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.vigente ? "bg-teal-100 text-teal-800" : "bg-neutral/20 text-neutral/70"
                            }`}
                          >
                            {c.vigente ? "Vigente" : "Finalizado"}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => abrirModalEditarContrato(c)}
                              className="px-2 py-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition flex items-center gap-1"
                              title="Editar datos del contrato"
                            >
                              <Edit2 className="w-3 h-3" />
                              Editar
                            </button>
                            {c.vigente && (
                              <button
                                type="button"
                                onClick={() => finalizarContratoClick(c.id, c.arrendatario_nombre)}
                                className="px-2 py-1 text-[10px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                                title="Dar de baja / Finalizar contrato"
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REGISTRAR / EDITAR PAGO (CON BITÁCORA) */}
      {/* ========================================================================= */}
      {modalPagoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-black/10">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-headline text-base font-bold text-primary">
                {pagoEditando ? "Modificar Pago (Auditoría Antifraude)" : "Registrar Pago de Renta"}
              </h3>
              <button onClick={() => setModalPagoOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={guardarPago} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-neutral mb-1">Contrato / Local</label>
                <select
                  value={formPagoContratoId}
                  onChange={(e) => {
                    const newId = Number(e.target.value);
                    setFormPagoContratoId(newId);
                    if (!pagoEditando && newId) {
                      setFormPagoPeriodo(obtenerSugerenciaPeriodo(newId, formPagoMeses));
                    }
                  }}
                  disabled={Boolean(pagoEditando)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">Seleccione contrato...</option>
                  {contratos.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.local_nickname} - {c.arrendatario_nombre} (${c.monto_renta_mensual}/mes)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Monto Pagado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formPagoMonto}
                    onChange={(e) => setFormPagoMonto(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Meses Cubiertos</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={formPagoMeses}
                    onChange={(e) => {
                      const m = Number(e.target.value);
                      setFormPagoMeses(m);
                      if (!pagoEditando && formPagoContratoId) {
                        setFormPagoPeriodo(obtenerSugerenciaPeriodo(Number(formPagoContratoId), m));
                      }
                    }}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Selección y Captura del Periodo a Pagar */}
              <div className="bg-surfacecontainer/20 p-3 rounded-xl border border-black/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-neutral">
                    Mes / Periodo a Pagar
                  </label>
                  {getOpcionesPeriodos().length > 0 && (
                    <span className="text-[10px] text-primary font-bold">
                      Sugerencias automáticas
                    </span>
                  )}
                </div>

                {getOpcionesPeriodos().length > 0 && (
                  <div className="space-y-1">
                    <select
                      value={getOpcionesPeriodos().includes(formPagoPeriodo) ? formPagoPeriodo : "__manual__"}
                      onChange={(e) => {
                        if (e.target.value !== "__manual__") {
                          setFormPagoPeriodo(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-1.5 border border-black/15 rounded-xl bg-white focus:outline-none focus:border-primary font-medium text-xs text-neutral"
                    >
                      <option value="">-- Seleccionar periodo adeudado / próximo --</option>
                      {getOpcionesPeriodos().map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                      <option value="__manual__">-- Escribir periodo personalizado / manual --</option>
                    </select>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {getOpcionesPeriodos().slice(0, 3).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFormPagoPeriodo(opt)}
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition ${
                            formPagoPeriodo === opt
                              ? "bg-primary text-white border-primary shadow-2xs"
                              : "bg-white hover:bg-surfacecontainer text-neutral/80 border-black/10"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Ej. 26 enero de 2026"
                  value={formPagoPeriodo}
                  onChange={(e) => setFormPagoPeriodo(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-bold text-primary bg-white text-xs"
                />
                <p className="text-[10px] text-neutral/50">
                  Especifica el mes o periodo correspondiente al pago (ej. 26 enero de 2026).
                </p>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">
                  Fecha de Abono Real (Depósito en Banco)
                </label>
                <input
                  type="date"
                  required
                  value={formPagoFechaReal}
                  onChange={(e) => setFormPagoFechaReal(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                />
                <p className="text-[10px] text-neutral/50 mt-0.5">
                  Esta fecha se utilizará estrictamente para las métricas de recaudación.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Método de Pago</label>
                  <select
                    value={formPagoMetodo}
                    onChange={(e) => setFormPagoMetodo(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Depósito">Depósito en Ventanilla</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Referencia Bancaria</label>
                  <input
                    type="text"
                    placeholder="No. autorización"
                    value={formPagoReferencia}
                    onChange={(e) => setFormPagoReferencia(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Notas / Observaciones</label>
                <input
                  type="text"
                  placeholder="Detalles adicionales..."
                  value={formPagoNota}
                  onChange={(e) => setFormPagoNota(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              {pagoEditando && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                  <label className="block font-bold text-amber-900">
                    Motivo del Cambio (Obligatorio para Auditoría) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Corrección por error de captura en monto de banco"
                    value={formPagoMotivoCambio}
                    onChange={(e) => setFormPagoMotivoCambio(e.target.value)}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-neutral focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalPagoOpen(false)}
                  className="px-4 py-2 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-surfacecontainer/40 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-sm transition"
                >
                  {pagoEditando ? "Guardar Modificación" : "Confirmar Pago"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BITÁCORA DE AUDITORÍA DE UN PAGO */}
      {/* ========================================================================= */}
      {modalAuditoriaOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-black/10">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h3 className="font-headline text-base font-bold text-primary">
                  Historial de Modificaciones (Auditoría Pago #{pagoSeleccionadoAuditoria})
                </h3>
              </div>
              <button onClick={() => setModalAuditoriaOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto text-xs">
              {auditoriasPago.length === 0 ? (
                <div className="text-center py-6 text-neutral/50 font-medium">
                  Este pago no tiene modificaciones registradas. Se conserva en su estado original.
                </div>
              ) : (
                auditoriasPago.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-black/10 bg-surfacecontainer/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-primary">
                        Acción: {log.accion}
                      </span>
                      <span className="text-neutral/50">
                        {new Date(log.fecha_evento).toLocaleString("es-MX")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-black/5">
                      <div>
                        <span className="font-bold text-rose-600">Valor Anterior:</span>
                        <div>Monto: ${log.monto_anterior.toLocaleString("es-MX")}</div>
                        <div>Fecha Abono: {log.fecha_abono_anterior}</div>
                        <div>Meses: {log.meses_cubiertos_anterior}</div>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-600">Valor Nuevo:</span>
                        <div>Monto: ${log.monto_nuevo.toLocaleString("es-MX")}</div>
                        <div>Fecha Abono: {log.fecha_abono_nuevo}</div>
                        <div>Meses: {log.meses_cubiertos_nuevo}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral/80">
                      <strong className="text-neutral">Motivo:</strong> {log.motivo_cambio}
                    </div>

                    <div className="text-[10px] text-neutral/60">
                      Modificado por: <strong>{log.usuario_nombre || `Usuario #${log.usuario_id}`}</strong>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setModalAuditoriaOpen(false)}
                className="px-4 py-2 bg-neutral/10 hover:bg-neutral/20 text-neutral font-semibold rounded-xl text-xs transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: BAJA LÓGICA DE PAGO */}
      {/* ========================================================================= */}
      {modalBajaPagoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-black/10 text-xs">
            <h3 className="font-headline text-base font-bold text-rose-600 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Baja Lógica de Pago</span>
            </h3>

            <p className="text-neutral/70">
              El registro no se borrará físicamente, pero se desactivará para no alterar indebidamente las métricas. Se requiere registrar el motivo por auditoría.
            </p>

            <div>
              <label className="block font-bold text-neutral mb-1">Motivo de la Baja *</label>
              <textarea
                required
                rows={3}
                placeholder="Ej. Cheque rebotado o pago capturado en local incorrecto..."
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setModalBajaPagoOpen(false)}
                className="px-3 py-2 border border-black/15 rounded-xl font-semibold text-neutral hover:bg-surfacecontainer/40"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmarBajaPago}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm"
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GESTIÓN DE REGIONES (CREAR Y EDITAR) */}
      {/* ========================================================================= */}
      {modalRegionOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-black/10 max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold text-primary">
                  {regionEditandoId ? "Editar Región" : "Gestión de Regiones"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalRegionOpen(false);
                  cancelarEdicionRegion();
                  setFiltroRegionesBusqueda("");
                }}
                className="text-neutral/50 hover:text-neutral"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso de modo edición */}
            {regionEditandoId && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <span className="font-bold">Editando región seleccionada</span>
                <button
                  type="button"
                  onClick={cancelarEdicionRegion}
                  className="text-[11px] underline font-semibold hover:opacity-80"
                >
                  Cancelar edición
                </button>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={submitRegion} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral mb-1">Nombre de la Región *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Zona Centro, Costa, Norte..."
                  value={nuevaRegionNombre}
                  onChange={(e) => setNuevaRegionNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Descripción</label>
                <input
                  type="text"
                  placeholder="Detalle opcional..."
                  value={nuevaRegionDesc}
                  onChange={(e) => setNuevaRegionDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                {regionEditandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicionRegion}
                    className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-neutral/5"
                  >
                    Descartar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModalRegionOpen(false);
                    cancelarEdicionRegion();
                    setFiltroRegionesBusqueda("");
                  }}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-neutral/5"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  {regionEditandoId ? "Guardar Cambios" : "+ Registrar Región"}
                </button>
              </div>
            </form>

            {/* Lista de Regiones Existentes */}
            <div className="border-t border-black/10 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral/70">
                  Regiones Registradas ({regiones.length})
                </span>
                <span className="text-[11px] text-neutral/50 font-semibold">
                  Mostrando {regionesFiltradasModal.length} de {regiones.length}
                </span>
              </div>

              {/* Buscador dentro del modal */}
              {regiones.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral/40" />
                  <input
                    type="text"
                    placeholder="Filtrar regiones por nombre o detalle..."
                    value={filtroRegionesBusqueda}
                    onChange={(e) => setFiltroRegionesBusqueda(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 text-xs bg-surfacecontainer/40 border border-black/10 rounded-lg focus:outline-none focus:border-primary"
                  />
                  {filtroRegionesBusqueda && (
                    <button
                      type="button"
                      onClick={() => setFiltroRegionesBusqueda("")}
                      className="absolute right-2 top-1.5 text-neutral/40 hover:text-neutral"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {regiones.length === 0 ? (
                  <div className="text-center py-3 text-neutral/50">No hay regiones registradas.</div>
                ) : regionesFiltradasModal.length === 0 ? (
                  <div className="text-center py-3 text-neutral/50">
                    No se encontraron regiones que coincidan con la búsqueda.
                  </div>
                ) : (
                  regionesFiltradasModal.map((r) => (
                    <div
                      key={r.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        regionEditandoId === r.id
                          ? "border-primary bg-primary/5"
                          : "border-black/10 bg-surfacecontainer/20 hover:bg-surfacecontainer/40"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-neutral truncate">{r.nombre}</div>
                        {r.descripcion && (
                          <div className="text-[10px] text-neutral/60 truncate">{r.descripcion}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => iniciarEdicionRegion(r)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition flex items-center gap-1 shrink-0"
                        title="Editar nombre o descripción de la región"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: GESTIÓN DE COMPLEJOS / LUGARES (CREAR Y EDITAR) */}
      {/* ========================================================================= */}
      {modalLugarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-black/10 max-w-lg w-full p-6 space-y-4 shadow-xl text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold text-primary">
                  {lugarEditandoId ? "Editar Complejo / Lugar" : "Gestión de Complejos y Plazas"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setModalLugarOpen(false);
                  cancelarEdicionLugar();
                  setFiltroLugaresBusqueda("");
                  setFiltroLugaresRegionId("");
                }}
                className="text-neutral/50 hover:text-neutral"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Aviso de modo edición */}
            {lugarEditandoId && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <span className="font-bold">Editando complejo seleccionado</span>
                <button
                  type="button"
                  onClick={cancelarEdicionLugar}
                  className="text-[11px] underline font-semibold hover:opacity-80"
                >
                  Cancelar edición
                </button>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={submitLugar} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-neutral">Región Perteneciente *</label>
                  <button
                    type="button"
                    onClick={() => {
                      cancelarEdicionRegion();
                      setModalRegionOpen(true);
                    }}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    + Gestionar Regiones
                  </button>
                </div>
                <select
                  required
                  value={nuevoLugarRegionId}
                  onChange={(e) => setNuevoLugarRegionId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary"
                >
                  <option value="">Seleccione región...</option>
                  {regiones.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Nombre del Complejo o Plaza *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Plaza Esmeralda, Nave 3..."
                  value={nuevoLugarNombre}
                  onChange={(e) => setNuevoLugarNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Dirección</label>
                <input
                  type="text"
                  placeholder="Ubicación física..."
                  value={nuevoLugarDireccion}
                  onChange={(e) => setNuevoLugarDireccion(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                {lugarEditandoId && (
                  <button
                    type="button"
                    onClick={cancelarEdicionLugar}
                    className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-neutral/5"
                  >
                    Descartar
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModalLugarOpen(false);
                    cancelarEdicionLugar();
                    setFiltroLugaresBusqueda("");
                    setFiltroLugaresRegionId("");
                  }}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-neutral/5"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  {lugarEditandoId ? "Guardar Cambios" : "+ Registrar Complejo"}
                </button>
              </div>
            </form>

            {/* Lista de Complejos Existentes */}
            <div className="border-t border-black/10 pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-neutral/70">
                  Complejos Registrados ({lugares.length})
                </span>
                <span className="text-[11px] text-neutral/50 font-semibold">
                  Mostrando {lugaresFiltradosModal.length} de {lugares.length}
                </span>
              </div>

              {/* Filtros dentro del modal de complejos */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral/40" />
                  <input
                    type="text"
                    placeholder="Filtrar por nombre o dirección..."
                    value={filtroLugaresBusqueda}
                    onChange={(e) => setFiltroLugaresBusqueda(e.target.value)}
                    className="w-full pl-8 pr-7 py-1 text-xs bg-surfacecontainer/40 border border-black/10 rounded-lg focus:outline-none focus:border-primary"
                  />
                  {filtroLugaresBusqueda && (
                    <button
                      type="button"
                      onClick={() => setFiltroLugaresBusqueda("")}
                      className="absolute right-2 top-1.5 text-neutral/40 hover:text-neutral"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="w-40 shrink-0">
                  <select
                    value={filtroLugaresRegionId}
                    onChange={(e) =>
                      setFiltroLugaresRegionId(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-2 py-1 text-xs bg-surfacecontainer/40 border border-black/10 rounded-lg focus:outline-none focus:border-primary font-medium text-neutral cursor-pointer"
                  >
                    <option value="">Todas las regiones</option>
                    {regiones.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {lugares.length === 0 ? (
                  <div className="text-center py-3 text-neutral/50">No hay complejos registrados.</div>
                ) : lugaresFiltradosModal.length === 0 ? (
                  <div className="text-center py-3 text-neutral/50">
                    No se encontraron complejos con los filtros seleccionados.
                  </div>
                ) : (
                  lugaresFiltradosModal.map((lug) => (
                    <div
                      key={lug.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        lugarEditandoId === lug.id
                          ? "border-primary bg-primary/5"
                          : "border-black/10 bg-surfacecontainer/20 hover:bg-surfacecontainer/40"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-neutral truncate">{lug.nombre}</span>
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-surfacecontainer text-neutral/80 shrink-0">
                            {lug.region_nombre || "Sin región"}
                          </span>
                        </div>
                        {lug.direccion && (
                          <div className="text-[10px] text-neutral/60 truncate">{lug.direccion}</div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => iniciarEdicionLugar(lug)}
                        className="px-2.5 py-1 text-[11px] font-bold text-primary hover:bg-primary/10 rounded-lg transition flex items-center gap-1 shrink-0"
                        title="Editar nombre, dirección o región de este complejo"
                      >
                        <Edit2 className="w-3 h-3" />
                        Editar
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO LOCAL */}
      {/* ========================================================================= */}
      {modalLocalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <h3 className="font-headline text-sm font-bold text-primary">Registrar Local o Caseta Comercial</h3>
              <button onClick={() => setModalLocalOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={crearLocalSubmit} className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-neutral">Complejo / Lugar *</label>
                  <button
                    type="button"
                    onClick={() => setModalLugarOpen(true)}
                    className="text-[10px] text-primary font-bold hover:underline"
                  >
                    + Nuevo Complejo
                  </button>
                </div>
                <select
                  required
                  value={localLugarId}
                  onChange={(e) => setLocalLugarId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary"
                >
                  <option value="">Seleccione complejo...</option>
                  {lugares.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre} ({l.region_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Número Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Local A, Caseta 2, Local 104"
                    value={localNumero}
                    onChange={(e) => setLocalNumero(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-neutral/50">Identificador físico oficial</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Alias o Identificador Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Local Sur, Caseta Esquina, Local A"
                    value={localNickname}
                    onChange={(e) => setLocalNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                  <span className="text-[10px] text-neutral/50">Ubicación física permanente (NO nombre del inquilino)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Monto de Renta Sugerido ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={localRentaSugerida}
                  onChange={(e) => setLocalRentaSugerida(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Descripción / Metros Cuadrados</label>
                <input
                  type="text"
                  placeholder="Detalles de tamaño o ubicación interna..."
                  value={localDescripcion}
                  onChange={(e) => setLocalDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalLocalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Guardar Local
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR LOCAL */}
      {/* ========================================================================= */}
      {modalEditarLocalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <h3 className="font-headline text-sm font-bold text-primary">Editar Local o Caseta Comercial</h3>
              <button onClick={() => setModalEditarLocalOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editarLocalSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral mb-1">Complejo / Lugar *</label>
                <select
                  required
                  value={editLocalLugarId}
                  onChange={(e) => setEditLocalLugarId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary"
                >
                  <option value="">Seleccione complejo...</option>
                  {lugares.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nombre} ({l.region_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Número Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Local A, Caseta 2, Local 104"
                    value={editLocalNumero}
                    onChange={(e) => setEditLocalNumero(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-neutral/50">Identificador físico oficial</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Alias o Identificador Físico *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Local Sur, Caseta Esquina, Local A"
                    value={editLocalNickname}
                    onChange={(e) => setEditLocalNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                  <span className="text-[10px] text-neutral/50">Ubicación física permanente</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Monto de Renta Sugerido ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={editLocalRentaSugerida}
                  onChange={(e) => setEditLocalRentaSugerida(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Descripción / Metros Cuadrados</label>
                <input
                  type="text"
                  placeholder="Detalles de tamaño o ubicación interna..."
                  value={editLocalDescripcion}
                  onChange={(e) => setEditLocalDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalEditarLocalOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO CONTRATO */}
      {/* ========================================================================= */}
      {modalContratoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <h3 className="font-headline text-sm font-bold text-primary">Activar Contrato de Arrendamiento</h3>
              <button onClick={() => setModalContratoOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={crearContratoSubmit} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral mb-1">Local / Caseta *</label>
                <select
                  required
                  value={contratoLocalId}
                  onChange={(e) => setContratoLocalId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary font-medium"
                >
                  <option value="">Seleccione local...</option>
                  {locales.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.nickname} (No. {loc.numero_fisico} - {loc.lugar_nombre})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Nombre Completo del Arrendatario *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sandra Karina López Morales"
                    value={contratoArrendatario}
                    onChange={(e) => setContratoArrendatario(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                  <span className="text-[10px] text-neutral/50">Persona o razón social que firma</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Nombre Comercial / Giro del Negocio</label>
                  <input
                    type="text"
                    placeholder="Ej. Estética Sandra, El Bar, Laboratorio"
                    value={contratoNombreComercial}
                    onChange={(e) => setContratoNombreComercial(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold text-primary"
                  />
                  <span className="text-[10px] text-neutral/50">Nombre comercial mientras esté vigente</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="10 dígitos"
                    value={contratoTelefono}
                    onChange={(e) => setContratoTelefono(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="contacto@correo.com"
                    value={contratoEmail}
                    onChange={(e) => setContratoEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={contratoFechaInicio}
                    onChange={(e) => setContratoFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Fecha Fin (Opcional)</label>
                  <input
                    type="date"
                    value={contratoFechaFin}
                    onChange={(e) => setContratoFechaFin(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Renta Mensual Pactada ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={contratoMontoRenta}
                    onChange={(e) => setContratoMontoRenta(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Día de Corte Mensual *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={contratoDiaCorte}
                    onChange={(e) => setContratoDiaCorte(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-neutral/50 mt-0.5">Día límite del mes para abono</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalContratoOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-secondary text-primary font-bold rounded-xl shadow-sm hover:bg-secondary/90"
                >
                  Activar Contrato
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR CONTRATO DE ARRENDAMIENTO */}
      {/* ========================================================================= */}
      {modalEditarContratoOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-headline text-sm font-bold text-primary">
                  Editar Contrato de Arrendamiento
                </h3>
              </div>
              <button
                onClick={() => setModalEditarContratoOpen(false)}
                className="text-neutral/50 hover:text-neutral"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Inmueble asignado (solo lectura) */}
            <div className="p-2.5 rounded-xl bg-surfacecontainer/40 border border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral/60 font-semibold block">Inmueble / Local</span>
                <span className="font-bold text-neutral text-xs">{editContratoLocalInfo}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  editContratoVigente ? "bg-teal-100 text-teal-800" : "bg-neutral/20 text-neutral/70"
                }`}
              >
                {editContratoVigente ? "Contrato Vigente" : "Finalizado"}
              </span>
            </div>

            {/* Nota de advertencia contable */}
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
              <span className="font-bold">Aviso sobre contabilidad y adeudos:</span> Corregir el monto o fecha de inicio recalculará los adeudos pendientes futuros, sin alterar los pagos ya registrados históricamente.
            </div>

            <form onSubmit={guardarEdicionContrato} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Arrendatario / Titular *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre completo..."
                    value={editContratoArrendatario}
                    onChange={(e) => setEditContratoArrendatario(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                  <span className="text-[10px] text-neutral/50">Persona o razón social que firma</span>
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Nombre Comercial / Giro del Negocio</label>
                  <input
                    type="text"
                    placeholder="Ej. Boutique Karina, Barbería..."
                    value={editContratoNombreComercial}
                    onChange={(e) => setEditContratoNombreComercial(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold text-primary"
                  />
                  <span className="text-[10px] text-neutral/50">Nombre comercial en este periodo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="10 dígitos"
                    value={editContratoTelefono}
                    onChange={(e) => setEditContratoTelefono(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    placeholder="contacto@correo.com"
                    value={editContratoEmail}
                    onChange={(e) => setEditContratoEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Fecha de Inicio *</label>
                  <input
                    type="date"
                    required
                    value={editContratoFechaInicio}
                    onChange={(e) => setEditContratoFechaInicio(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Fecha de Fin (Opcional)</label>
                  <input
                    type="date"
                    value={editContratoFechaFin}
                    onChange={(e) => setEditContratoFechaFin(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-neutral mb-1">Renta Mensual Pactada ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editContratoMontoRenta}
                    onChange={(e) =>
                      setEditContratoMontoRenta(e.target.value === "" ? "" : Number(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Día de Corte Mensual (1-31) *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={editContratoDiaCorte}
                    onChange={(e) => setEditContratoDiaCorte(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-neutral mb-1">Estatus del Contrato</label>
                <select
                  value={editContratoVigente ? "1" : "0"}
                  onChange={(e) => setEditContratoVigente(e.target.value === "1")}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl bg-surfacecontainer/40 focus:outline-none focus:border-primary font-semibold"
                >
                  <option value="1">Vigente (Activo)</option>
                  <option value="0">Finalizado (Concluido)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/10">
                <button
                  type="button"
                  onClick={() => setModalEditarContratoOpen(false)}
                  className="px-3.5 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold hover:bg-neutral/5"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
