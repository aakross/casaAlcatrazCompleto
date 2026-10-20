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

  // Filtros
  const [filtroBusqueda, setFiltroBusqueda] = useState("");
  const [filtroEstatus, setFiltroEstatus] = useState<"TODOS" | "AL CORRIENTE" | "CON ADEUDO">("TODOS");

  // Modales
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [pagoEditando, setPagoEditando] = useState<PagoRenta | null>(null);

  const [modalAuditoriaOpen, setModalAuditoriaOpen] = useState(false);
  const [auditoriasPago, setAuditoriasPago] = useState<AuditoriaPagoRenta[]>([]);
  const [pagoSeleccionadoAuditoria, setPagoSeleccionadoAuditoria] = useState<number | null>(null);

  const [modalBajaPagoOpen, setModalBajaPagoOpen] = useState(false);
  const [pagoBajaId, setPagoBajaId] = useState<number | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("");

  // Modales "Al Vuelo"
  const [modalRegionOpen, setModalRegionOpen] = useState(false);
  const [nuevaRegionNombre, setNuevaRegionNombre] = useState("");
  const [nuevaRegionDesc, setNuevaRegionDesc] = useState("");

  const [modalLugarOpen, setModalLugarOpen] = useState(false);
  const [nuevoLugarRegionId, setNuevoLugarRegionId] = useState<number | "">("");
  const [nuevoLugarNombre, setNuevoLugarNombre] = useState("");
  const [nuevoLugarDireccion, setNuevoLugarDireccion] = useState("");

  const [modalLocalOpen, setModalLocalOpen] = useState(false);
  const [localLugarId, setLocalLugarId] = useState<number | "">("");
  const [localNumero, setLocalNumero] = useState("");
  const [localNickname, setLocalNickname] = useState("");
  const [localRentaSugerida, setLocalRentaSugerida] = useState<number | "">("");
  const [localDescripcion, setLocalDescripcion] = useState("");

  const [modalContratoOpen, setModalContratoOpen] = useState(false);
  const [contratoLocalId, setContratoLocalId] = useState<number | "">("");
  const [contratoArrendatario, setContratoArrendatario] = useState("");
  const [contratoTelefono, setContratoTelefono] = useState("");
  const [contratoEmail, setContratoEmail] = useState("");
  const [contratoFechaInicio, setContratoFechaInicio] = useState("");
  const [contratoFechaFin, setContratoFechaFin] = useState("");
  const [contratoMontoRenta, setContratoMontoRenta] = useState<number | "">("");
  const [contratoDiaCorte, setContratoDiaCorte] = useState<number>(1);

  // Formulario de Pago
  const [formPagoContratoId, setFormPagoContratoId] = useState<number | "">("");
  const [formPagoMonto, setFormPagoMonto] = useState<number | "">("");
  const [formPagoMeses, setFormPagoMeses] = useState<number>(1);
  const [formPagoFechaReal, setFormPagoFechaReal] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [formPagoMetodo, setFormPagoMetodo] = useState<string>("Efectivo");
  const [formPagoReferencia, setFormPagoReferencia] = useState("");
  const [formPagoNota, setFormPagoNota] = useState("");
  const [formPagoMotivoCambio, setFormPagoMotivoCambio] = useState("");

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
  const abrirModalNuevoPago = (contratoId?: number) => {
    setPagoEditando(null);
    setFormPagoContratoId(contratoId || (contratos[0]?.id ?? ""));
    setFormPagoMonto("");
    setFormPagoMeses(1);
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

  // Creación "Al Vuelo": Región
  const crearRegionAlVuelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaRegionNombre.trim()) return;
    try {
      const reg = await rentasApi.createRegion({
        nombre: nuevaRegionNombre.trim(),
        descripcion: nuevaRegionDesc.trim() || undefined,
      });
      notify.success(`Región "${reg.nombre}" creada al instante`);
      setModalRegionOpen(false);
      setNuevaRegionNombre("");
      setNuevaRegionDesc("");
      await cargarCatalogos();
      setNuevoLugarRegionId(reg.id);
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al crear región");
    }
  };

  // Creación "Al Vuelo": Lugar
  const crearLugarAlVuelo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoLugarRegionId || !nuevoLugarNombre.trim()) {
      notify.warning("Seleccione región y asigne un nombre al complejo.");
      return;
    }
    try {
      const lug = await rentasApi.createLugar({
        region_id: Number(nuevoLugarRegionId),
        nombre: nuevoLugarNombre.trim(),
        direccion: nuevoLugarDireccion.trim() || undefined,
      });
      notify.success(`Complejo "${lug.nombre}" registrado`);
      setModalLugarOpen(false);
      setNuevoLugarNombre("");
      setNuevoLugarDireccion("");
      await cargarCatalogos();
      setLocalLugarId(lug.id);
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al registrar complejo");
    }
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

  // Filtro de tabla de adeudos
  const adeudosFiltrados = adeudos.filter((a) => {
    const coincideTexto =
      a.nickname.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      a.arrendatario_nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      a.lugar.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
      a.numero_fisico.toLowerCase().includes(filtroBusqueda.toLowerCase());

    if (filtroEstatus === "TODOS") return coincideTexto;
    return coincideTexto && a.estatus_cartera === filtroEstatus;
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
                      <td className="p-3 font-medium text-neutral">{a.arrendatario_nombre}</td>
                      <td className="p-3 text-right font-medium">
                        ${a.monto_renta_mensual.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-center font-bold text-neutral/70">{a.meses_cobrables}</td>
                      <td className="p-3 text-center font-bold text-emerald-700">{a.meses_pagados}</td>
                      <td className="p-3 text-center font-extrabold text-rose-600">
                        {a.meses_adeudo > 0 ? a.meses_adeudo : 0}
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
                  <th className="p-3 text-center">Meses Cubiertos</th>
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
                      <td className="p-3 text-center font-bold text-neutral">
                        {p.meses_cubiertos} mes(es)
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
            <div className="flex justify-between items-center">
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
                  onClick={() => setModalRegionOpen(true)}
                  className="px-3 py-1.5 bg-surfacecontainer hover:bg-surfacecontainer/80 text-neutral text-xs font-bold rounded-xl transition"
                >
                  + Región
                </button>
                <button
                  onClick={() => setModalLugarOpen(true)}
                  className="px-3 py-1.5 bg-surfacecontainer hover:bg-surfacecontainer/80 text-neutral text-xs font-bold rounded-xl transition"
                >
                  + Complejo
                </button>
                <button
                  onClick={() => setModalLocalOpen(true)}
                  className="px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl shadow-2xs hover:bg-primary/90 transition"
                >
                  + Nuevo Local
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locales.length === 0 ? (
                <div className="col-span-full text-center py-8 text-neutral/50 text-xs">
                  No hay locales registrados aún. Agregue el primero usando el botón "+ Nuevo Local".
                </div>
              ) : (
                locales.map((loc) => (
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
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          loc.ocupado ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {loc.ocupado ? "Rentado" : "Disponible"}
                      </span>
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
                      {loc.arrendatario_actual && (
                        <div className="text-emerald-700 font-medium">
                          <span className="font-bold">Inquilino:</span> {loc.arrendatario_actual}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contratos Vigentes */}
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-headline text-base font-bold text-primary">
                  Contratos de Arrendamiento Activos
                </h3>
                <p className="text-xs text-neutral/60">
                  Condiciones de renta pactadas, días de corte y vigencias
                </p>
              </div>

              <button
                onClick={() => setModalContratoOpen(true)}
                className="px-3 py-1.5 bg-secondary text-primary text-xs font-bold rounded-xl shadow-2xs hover:bg-secondary/90 transition"
              >
                + Nuevo Contrato
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-black/5">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-surfacecontainer/60 text-neutral font-bold border-b border-black/5">
                    <th className="p-3">Local</th>
                    <th className="p-3">Arrendatario</th>
                    <th className="p-3">Contacto</th>
                    <th className="p-3">Fecha Inicio</th>
                    <th className="p-3 text-center">Día de Corte</th>
                    <th className="p-3 text-right">Renta Mensual</th>
                    <th className="p-3 text-center">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {contratos.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-neutral/50 font-medium">
                        No hay contratos registrados.
                      </td>
                    </tr>
                  ) : (
                    contratos.map((c) => (
                      <tr key={c.id} className="hover:bg-surfacecontainer/20 transition">
                        <td className="p-3 font-bold text-primary">{c.local_nickname}</td>
                        <td className="p-3 font-semibold text-neutral">{c.arrendatario_nombre}</td>
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
                  onChange={(e) => setFormPagoContratoId(Number(e.target.value))}
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
                    onChange={(e) => setFormPagoMeses(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>
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
      {/* MODAL: NUEVA REGIÓN (AL VUELO) */}
      {/* ========================================================================= */}
      {modalRegionOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <h3 className="font-headline text-sm font-bold text-primary">Registrar Región al Vuelo</h3>
              <button onClick={() => setModalRegionOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={crearRegionAlVuelo} className="space-y-3">
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
                <button
                  type="button"
                  onClick={() => setModalRegionOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Guardar Región
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO LUGAR / COMPLEJO (AL VUELO) */}
      {/* ========================================================================= */}
      {modalLugarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 border border-black/10 text-xs">
            <div className="flex justify-between items-center border-b border-black/10 pb-2">
              <h3 className="font-headline text-sm font-bold text-primary">Registrar Complejo / Lugar al Vuelo</h3>
              <button onClick={() => setModalLugarOpen(false)} className="text-neutral/50 hover:text-neutral">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={crearLugarAlVuelo} className="space-y-3">
              <div>
                <label className="block font-bold text-neutral mb-1">Región Perteneciente *</label>
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
                <button
                  type="button"
                  onClick={() => setModalLugarOpen(false)}
                  className="px-3 py-1.5 border border-black/15 rounded-xl text-neutral font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-primary text-white font-bold rounded-xl shadow-sm hover:bg-primary/90"
                >
                  Guardar Complejo
                </button>
              </div>
            </form>
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
                    placeholder="Ej. Local 104, Caseta B-2"
                    value={localNumero}
                    onChange={(e) => setLocalNumero(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold text-neutral mb-1">Nickname / Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Frutería Don Pepe"
                    value={localNickname}
                    onChange={(e) => setLocalNickname(e.target.value)}
                    className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                  />
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

              <div>
                <label className="block font-bold text-neutral mb-1">Nombre Completo del Arrendatario *</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre y apellidos del inquilino"
                  value={contratoArrendatario}
                  onChange={(e) => setContratoArrendatario(e.target.value)}
                  className="w-full px-3 py-2 border border-black/15 rounded-xl focus:outline-none focus:border-primary font-semibold"
                />
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
    </div>
  );
}
