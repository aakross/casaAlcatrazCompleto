import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Lock,
  UserPlus,
} from "lucide-react";
import { permisosApi } from "../../infrastructure/permisos.api";
import type { ModuloSistema, UsuarioConPermisos } from "../../domain/permisos.types";
import { notify } from "../../../../core/components/notifierTostify";
import { ModalNuevoUsuario } from "../components/ModalNuevoUsuario";
import { useAuthStore } from "../../../../core/store/authStore";

export function GestionPermisosPage() {
  const currentUsername = useAuthStore((s) => s.username);
  const [modulos, setModulos] = useState<ModuloSistema[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioConPermisos[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [guardandoId, setGuardandoId] = useState<number | null>(null);
  const [isModalNuevoUsuarioOpen, setIsModalNuevoUsuarioOpen] = useState(false);

  const cargarDatos = async () => {
    setIsLoading(true);
    try {
      const [mods, usrs] = await Promise.all([
        permisosApi.getModulos(),
        permisosApi.getUsuarios(),
      ]);
      setModulos(mods);
      setUsuarios(usrs);
    } catch {
      notify.error("Error al cargar configuración de permisos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleTogglePermiso = async (usuario: UsuarioConPermisos, moduloClave: string) => {
    if (usuario.rol_id === 1) {
      notify.info("El usuario Administrador cuenta con todos los permisos por defecto.");
      return;
    }

    const tienePermiso = usuario.permisos.includes(moduloClave);
    const nuevoEstado = !tienePermiso;

    // Actualización optimista en el estado local
    setUsuarios((prev) =>
      prev.map((u) => {
        if (u.id === usuario.id) {
          const nuevosPermisos = nuevoEstado
            ? [...u.permisos, moduloClave]
            : u.permisos.filter((p) => p !== moduloClave);
          return { ...u, permisos: nuevosPermisos };
        }
        return u;
      })
    );

    setGuardandoId(usuario.id);
    try {
      await permisosApi.togglePermiso(usuario.id, moduloClave, nuevoEstado);
      notify.success(
        `Permiso "${moduloClave}" ${nuevoEstado ? "habilitado" : "deshabilitado"} para ${usuario.username}`
      );
    } catch {
      notify.error("No se pudo actualizar el permiso");
      // Revertir
      cargarDatos();
    } finally {
      setGuardandoId(null);
    }
  };

  const handleToggleEstado = async (usuario: UsuarioConPermisos) => {
    if (usuario.username.toLowerCase() === "sistemas" || usuario.rol_id === 1) {
      notify.warning("El usuario de sistemas/dirección está protegido y no puede ser inactivado.");
      return;
    }

    const nuevoEstado = !usuario.activo;

    // Actualización optimista
    setUsuarios((prev) =>
      prev.map((u) => (u.id === usuario.id ? { ...u, activo: nuevoEstado } : u))
    );

    try {
      await permisosApi.toggleEstadoUsuario(usuario.id, nuevoEstado);
      notify.success(
        `Usuario "${usuario.username}" ${nuevoEstado ? "activado" : "inactivado"} exitosamente.`
      );
    } catch (err: any) {
      notify.error(err.response?.data?.error || "Error al actualizar estado del usuario");
      cargarDatos();
    }
  };

  const esSistemasActual = currentUsername?.toLowerCase() === "sistemas";

  const usuariosVisibles = usuarios
    .filter((u) => (esSistemasActual ? true : u.username.toLowerCase() !== "sistemas"))
    .filter(
      (u) =>
        u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.rol_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.origen.toLowerCase().includes(busqueda.toLowerCase())
    );

  return (
    <div className="space-y-6 animate-fadeIn text-neutral font-body">
      {/* Encabezado */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-headline text-2xl font-bold text-primary">
                  Gestor de Permisos de Acceso
                </h1>
                <p className="text-xs text-neutral/60">
                  Control dinámico de acceso a módulos. Los módulos deshabilitados serán completamente invisibles en el menú del usuario.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsModalNuevoUsuarioOpen(true)}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Agregar usuario nuevo</span>
            </button>

            <button
              onClick={cargarDatos}
              disabled={isLoading}
              className="px-4 py-2 bg-surfacecontainer hover:bg-surfacecontainer/80 text-neutral text-xs font-bold rounded-xl transition flex items-center gap-2 border border-black/5 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-primary" : ""}`} />
              <span>Recargar</span>
            </button>
          </div>
        </div>

        {/* Buscador de usuarios */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-black/5">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral/40" />
            <input
              type="text"
              placeholder="Buscar por nombre de usuario, rol u origen..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-surfacecontainer/40 border border-black/10 rounded-xl focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral/60">
            <Users className="w-4 h-4 text-primary" />
            <span>
              Total: <strong className="text-neutral font-bold">{usuariosVisibles.length}</strong> usuarios
            </span>
          </div>
        </div>
      </div>

      {/* Matriz de Permisos */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surfacecontainer/60 text-neutral font-bold border-b border-black/5">
                <th className="p-3.5 min-w-[180px]">Usuario</th>
                <th className="p-3.5 min-w-[130px]">Rol / Origen</th>
                <th className="p-3.5 min-w-[120px] text-center">Estado</th>
                {modulos.map((m) => (
                  <th key={m.clave} className="p-3.5 text-center min-w-[110px]" title={m.nombre}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-bold text-[11px] text-primary">{m.nombre}</span>
                      <span className="text-[9px] font-mono text-neutral/50 font-normal">
                        {m.clave}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {isLoading && usuarios.length === 0 ? (
                <tr>
                  <td colSpan={modulos.length + 3} className="p-8 text-center text-neutral/50 font-medium">
                    Cargando usuarios y módulos...
                  </td>
                </tr>
              ) : usuariosVisibles.length === 0 ? (
                <tr>
                  <td colSpan={modulos.length + 3} className="p-8 text-center text-neutral/50 font-medium">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuariosVisibles.map((u) => {
                  const esSuperAdmin = u.rol_id === 1;

                  return (
                    <tr key={u.id} className="hover:bg-surfacecontainer/20 transition">
                      {/* Usuario */}
                      <td className="p-3.5 font-semibold text-primary">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                            {u.username.substring(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-neutral text-xs">{u.username}</div>
                            <div className="text-[10px] text-neutral/50">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Rol & Origen */}
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              esSuperAdmin
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : "bg-surfacecontainer text-neutral/80 border border-black/5"
                            }`}
                          >
                            {u.rol_nombre}
                          </span>
                          <span className="text-[9px] font-mono text-neutral/50">
                            Origen: {u.origen}
                          </span>
                        </div>
                      </td>

                      {/* Estado (Activo / Inactivo) con Switch Interactivo */}
                      <td className="p-3.5 text-center">
                        {u.username.toLowerCase() === "sistemas" || esSuperAdmin ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Activo</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleEstado(u)}
                            disabled={guardandoId === u.id}
                            title={u.activo ? "Clic para inactivar usuario" : "Clic para activar usuario"}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition border cursor-pointer ${
                              u.activo
                                ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200 shadow-2xs"
                                : "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {u.activo ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Activo</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-red-500" />
                                <span>Inactivo</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Columnas de Módulos (Toggles) */}
                      {modulos.map((m) => {
                        const tienePermiso = esSuperAdmin || u.permisos.includes(m.clave);

                        return (
                          <td key={m.clave} className="p-3 text-center">
                            {esSuperAdmin ? (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200/60"
                                title="Acceso total por rol Administrador"
                              >
                                <Lock className="w-2.5 h-2.5 text-emerald-600" />
                                Total
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={guardandoId === u.id}
                                onClick={() => handleTogglePermiso(u, m.clave)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                                  tienePermiso
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                                    : "bg-surfacecontainer/40 text-neutral/40 border-black/10 hover:bg-surfacecontainer hover:text-neutral"
                                }`}
                                title={`Clic para ${tienePermiso ? "revocar" : "conceder"} acceso a ${m.nombre}`}
                              >
                                {tienePermiso ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Permitido</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3 text-neutral/30" />
                                    <span>Denegado</span>
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para crear usuario nuevo */}
      <ModalNuevoUsuario
        isOpen={isModalNuevoUsuarioOpen}
        onClose={() => setIsModalNuevoUsuarioOpen(false)}
        modulos={modulos}
        onUsuarioCreado={() => {
          cargarDatos();
        }}
      />
    </div>
  );
}
