import { useState, useEffect } from "react";
import {
  X,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  KeyRound,
  Shield,
  Briefcase,
  User,
} from "lucide-react";
import { permisosApi } from "../../infrastructure/permisos.api";
import type { ModuloSistema, VerificarTcausrResponse } from "../../domain/permisos.types";
import { notify } from "../../../../core/components/notifierTostify";

interface ModalNuevoUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  modulos: ModuloSistema[];
  onUsuarioCreado: (nuevoUsername: string) => void;
}

const generarPasswordTemporal = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let randomPart = "";
  for (let i = 0; i < 4; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `Alcatraz#${randomPart}`;
};

export function ModalNuevoUsuario({
  isOpen,
  onClose,
  modulos,
  onUsuarioCreado,
}: ModalNuevoUsuarioProps) {
  const [identificador, setIdentificador] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [verificacion, setVerificacion] = useState<VerificarTcausrResponse | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Formulario posterior a verificación
  const [rolId, setRolId] = useState<number>(2); // Por defecto: Recepción
  const [modulosSeleccionados, setModulosSeleccionados] = useState<string[]>([
    "RESERVAS",
    "PAGOS",
    "CORTES",
    "REPORTES",
  ]);
  const [passwordTemporal, setPasswordTemporal] = useState<string>("");
  const [copiado, setCopiado] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setIdentificador("");
      setVerificacion(null);
      setHasSearched(false);
      setRolId(2);
      setModulosSeleccionados(["RESERVAS", "PAGOS", "CORTES", "REPORTES"]);
      setPasswordTemporal(generarPasswordTemporal());
      setCopiado(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBuscarTcausr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = identificador.trim();
    if (!query) {
      notify.warning("Por favor ingresa un identificador de usuario.");
      return;
    }

    setIsChecking(true);
    try {
      const resp = await permisosApi.verificarTcausr(query);
      setVerificacion(resp);
      setHasSearched(true);

      if (resp.yaRegistrado) {
        notify.info(`El usuario "${query}" ya se encuentra registrado.`);
      } else if (resp.existeEnTcausr) {
        notify.success(`Usuario encontrado en merksyst: ${resp.datosTcausr?.nombreCompleto || query}`);
      } else {
        notify.info(`Usuario no encontrado en merksyst. Se creará como nuevo usuario en el sistema.`);
        setPasswordTemporal(generarPasswordTemporal());
      }
    } catch {
      notify.error("Error al validar el usuario con la base de datos.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleToggleModulo = (clave: string) => {
    setModulosSeleccionados((prev) =>
      prev.includes(clave) ? prev.filter((c) => c !== clave) : [...prev, clave]
    );
  };

  const handleSeleccionarTodos = () => {
    if (modulosSeleccionados.length === modulos.length) {
      setModulosSeleccionados([]);
    } else {
      setModulosSeleccionados(modulos.map((m) => m.clave));
    }
  };

  const handleCopiarPassword = async () => {
    if (!passwordTemporal) return;
    try {
      await navigator.clipboard.writeText(passwordTemporal);
      setCopiado(true);
      notify.success("Contraseña temporal copiada al portapapeles");
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      notify.info(`Contraseña: ${passwordTemporal}`);
    }
  };

  const handleGuardar = async () => {
    const cleanUser = identificador.trim();
    if (!cleanUser) {
      notify.warning("El identificador es requerido.");
      return;
    }

    if (verificacion?.yaRegistrado) {
      notify.error("Este usuario ya está registrado en el sistema.");
      return;
    }

    const esDeTcausr = Boolean(verificacion?.existeEnTcausr);

    setIsSubmitting(true);
    try {
      await permisosApi.crearUsuario({
        username: cleanUser,
        rol_id: Number(rolId),
        modulos: modulosSeleccionados,
        esDeTcausr,
        passwordTemporal: esDeTcausr ? undefined : passwordTemporal,
      });

      notify.success(`Usuario "${cleanUser}" creado exitosamente.`);
      onUsuarioCreado(cleanUser);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || "Error al crear el usuario";
      notify.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn font-body">
      <div className="bg-white rounded-2xl border border-black/10 shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="p-5 border-b border-black/5 flex items-center justify-between bg-surfacecontainer/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline font-bold text-lg text-primary">
                Agregar Usuario Nuevo
              </h2>
              <p className="text-xs text-neutral/60">
                Consulta en el catálogo de personal o registra un nuevo acceso.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral/50 hover:text-neutral hover:bg-black/5 rounded-lg transition"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-neutral">
          {/* Paso 1: Identificador y Búsqueda */}
          <div className="space-y-2">
            <label className="font-bold text-neutral flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>Identificador de Usuario</span>
              <span className="text-neutral/50 font-normal">(ej. clave de tcausr o alias)</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ej. ABDIEL, AFRANCO, JUANP..."
                  value={identificador}
                  onChange={(e) => {
                    setIdentificador(e.target.value.toUpperCase());
                    if (hasSearched) setHasSearched(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleBuscarTcausr();
                  }}
                  className="w-full pl-3 pr-3 py-2 bg-surfacecontainer/30 border border-black/10 rounded-xl focus:outline-none focus:border-primary font-mono font-bold text-neutral uppercase"
                />
              </div>
              <button
                type="button"
                onClick={() => handleBuscarTcausr()}
                disabled={isChecking || !identificador.trim()}
                className="px-4 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center gap-2 shadow-sm text-xs cursor-pointer"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-3.5 h-3.5" />
                    <span>Comprobar</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Resultado de la Verificación */}
          {hasSearched && verificacion && (
            <div className="space-y-5 animate-fadeIn">
              {/* Caso: Ya registrado */}
              {verificacion.yaRegistrado && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-900 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-amber-900">
                      Usuario ya registrado
                    </h4>
                    <p className="text-xs text-amber-800 mt-1">
                      El usuario <strong>{identificador}</strong> ya se encuentra dado de alta en
                      el sistema. Puedes buscarlo en la matriz inferior de la pantalla para ajustar sus módulos.
                    </p>
                  </div>
                </div>
              )}

              {/* Caso: Existe en tcausr (y NO está registrado) */}
              {!verificacion.yaRegistrado && verificacion.existeEnTcausr && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Usuario localizado en el catálogo</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-neutral/50 block text-[10px] uppercase font-bold">
                        Nombre Completo
                      </span>
                      <strong className="text-neutral font-semibold">
                        {verificacion.datosTcausr?.nombreCompleto}
                      </strong>
                    </div>
                    <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-500/10">
                      <span className="text-neutral/50 block text-[10px] uppercase font-bold">
                        Puesto Registrado
                      </span>
                      <strong className="text-neutral font-semibold">
                        {verificacion.datosTcausr?.puesto || "N/A"}
                      </strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 pt-1">
                    ℹ️ Sus credenciales (usuario y contraseña) se copiarán automáticamente desde TCA para que inicie sesión directamente con sus accesos habituales.
                  </p>
                </div>
              )}

              {/* Caso: NO existe en tcausr (Usuario nuevo desde cero) */}
              {!verificacion.yaRegistrado && !verificacion.existeEnTcausr && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-950 space-y-2">
                    <div className="flex items-center gap-2 text-blue-800 font-bold">
                      <AlertCircle className="w-4 h-4 text-blue-600" />
                      <span>El usuario no existe en el catálogo (Registro Nuevo)</span>
                    </div>
                    <p className="text-xs text-blue-900/80">
                      Se creará un nuevo usuario nativo en el sistema. Se generó automáticamente una contraseña temporal que deberás entregarle al colaborador.
                    </p>
                  </div>

                  {/* Contraseña Temporal */}
                  <div className="p-4 bg-surfacecontainer/60 rounded-xl border border-black/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-bold flex items-center gap-1.5 text-neutral">
                        <KeyRound className="w-3.5 h-3.5 text-primary" />
                        <span>Contraseña Temporal Generada</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setPasswordTemporal(generarPasswordTemporal())}
                        className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerar</span>
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={passwordTemporal}
                        className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl font-mono font-bold text-neutral text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleCopiarPassword}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-2xs ${
                          copiado
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white text-neutral hover:bg-surfacecontainer border-black/10"
                        }`}
                      >
                        {copiado ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiado ? "Copiada" : "Copiar"}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral/60">
                      ⚠️ El usuario estará obligado a cambiar esta contraseña en su primer inicio de sesión.
                    </p>
                  </div>
                </div>
              )}

              {/* Configuración de Rol y Permisos (Disponible si NO está registrado aún) */}
              {!verificacion.yaRegistrado && (
                <div className="space-y-4 pt-2 border-t border-black/5">
                  {/* Selector de Rol */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-neutral flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-primary" />
                      <span>Rol del Usuario</span>
                    </label>
                    <select
                      value={rolId}
                      onChange={(e) => setRolId(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-surfacecontainer/40 border border-black/10 rounded-xl focus:outline-none focus:border-primary font-medium text-xs text-neutral"
                    >
                      <option value={2}>Recepción (Operativo general)</option>
                      <option value={3}>Contabilidad (Finanzas y cortes)</option>
                      <option value={1}>Usuario de Dirección (Acceso Total)</option>
                    </select>
                  </div>

                  {/* Selección de Módulos */}
                  {rolId !== 1 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-neutral flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span>Módulos Permitidos Iniciales</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleSeleccionarTodos}
                          className="text-[11px] text-primary hover:underline font-semibold"
                        >
                          {modulosSeleccionados.length === modulos.length
                            ? "Desmarcar todos"
                            : "Seleccionar todos"}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                        {modulos.map((m) => {
                          const seleccionado = modulosSeleccionados.includes(m.clave);
                          return (
                            <button
                              key={m.clave}
                              type="button"
                              onClick={() => handleToggleModulo(m.clave)}
                              className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between text-xs cursor-pointer ${
                                seleccionado
                                  ? "bg-primary/5 border-primary/30 text-primary font-bold shadow-2xs"
                                  : "bg-surfacecontainer/20 border-black/5 text-neutral/70 hover:bg-surfacecontainer/40"
                              }`}
                            >
                              <div className="flex flex-col">
                                <span className="text-xs">{m.nombre}</span>
                                <span className="text-[9px] font-mono opacity-60 font-normal">
                                  {m.clave}
                                </span>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                                  seleccionado
                                    ? "bg-primary text-white border-primary"
                                    : "border-black/20 bg-white"
                                }`}
                              >
                                {seleccionado && <Check className="w-3 h-3" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 text-primary text-xs">
                      ℹ️ El <strong>Usuario de Dirección</strong> tiene acceso irrestricto a todos los módulos del sistema de manera automática.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="p-4 border-t border-black/5 bg-surfacecontainer/20 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-surfacecontainer/80 text-neutral text-xs font-semibold rounded-xl border border-black/10 transition shadow-2xs"
          >
            Cancelar
          </button>
          {hasSearched && verificacion && !verificacion.yaRegistrado && (
            <button
              type="button"
              onClick={handleGuardar}
              disabled={isSubmitting}
              className="px-5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Guardar y Registrar</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
