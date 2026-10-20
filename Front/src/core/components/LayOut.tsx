import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import {
  HandCoins,
  ReceiptText,
  LogOut,
  Hotel,
  Calendar,
  X,
  Menu,
  ClipboardMinus,
  ChevronDown,
  BarChart3,
  Building2,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AdminLayout() {
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isReportesOpen, setIsReportesOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Configuración de los botones de navegación
  const menuItems = [
    { name: "Reservas", path: "/reservas", icon: Calendar },
    { name: "Pagos", path: "/pagos", icon: HandCoins },
    { name: "Cortes", path: "/cortes", icon: ReceiptText },
    { name: "Estado de Resultados", path: "/estado-resultados", icon: BarChart3 },
    ...(import.meta.env.VITE_ENABLE_RENTAS === "true"
      ? [{ name: "Control de Rentas", path: "/rentas", icon: Building2 }]
      : []),
    // { name: "Reportes", path: "/reporteador", icon: ClipboardMinus },
  ];

  useEffect(() => {
    if (location.pathname.startsWith("/reporteador")) {
      setIsReportesOpen(true);
    }
  }, [location.pathname]);

  // Validadores de activación visual
  const isReportesActive = location.pathname.startsWith("/reporteador");
  const isCalendarioActive = location.pathname === "/reporteador/calendario";
  const isListadoActive = location.pathname === "/reporteador/listado";
  const isBitacoraActive = location.pathname === "/reporteador/bitacora";

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row bg-tertiary font-body text-neutral overflow-hidden relative">
      {/* NAVBAR SUPERIOR - SOLO PARA MOBILE */}
      <header className="md:hidden w-full bg-primary text-white p-4 flex items-center justify-between shadow-md z-40">
        <div className="flex items-center gap-3">
          <Hotel className="text-secondary w-6 h-6" />
          <h1 className="font-headline text-lg font-bold tracking-wide">
            Casa Alcatraz
          </h1>
        </div>
        <button
          onClick={() => setMenuAbierto(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6 text-secondary" />
        </button>
      </header>

      {menuAbierto && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setMenuAbierto(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static top-0 left-0 z-50 w-64 h-full bg-primary flex flex-col justify-between p-5 text-white shadow-xl transform transition-transform duration-300 ease-in-out ${menuAbierto ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div>
          {/* Encabezado Sidebar */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <Hotel className="text-secondary w-8 h-8" />
              <h1 className="font-headline text-xl font-bold tracking-wide">
                Casa Alcatraz
              </h1>
            </div>
            <button
              onClick={() => setMenuAbierto(false)}
              className="md:hidden p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6 text-secondary" />
            </button>
          </div>

          {/* Menú de Opciones */}
          <nav className="space-y-2">
            {/* 1. Render de las pestañas normales */}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuAbierto(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm group border-l-4 relative ${
                    isActive
                      ? "bg-white/10 text-secondary font-bold border-secondary"
                      : "hover:bg-white/5 text-white/80 hover:text-white border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-secondary" : "text-secondary/60"}`}
                  />
                  {item.name}
                </Link>
              );
            })}

            {/* 🌟 2. BOTÓN PADRE DE REPORTES (CON DESPLEGABLE) */}
            <div className="w-full flex flex-col">
              <button
                type="button"
                onClick={() => setIsReportesOpen(!isReportesOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all font-medium text-sm group border-l-4 cursor-pointer ${
                  isReportesActive
                    ? "bg-white/10 text-secondary font-bold border-secondary"
                    : "hover:bg-white/5 text-white/80 hover:text-white border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <ClipboardMinus
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${isReportesActive ? "text-secondary" : "text-secondary/60"}`}
                  />
                  <span>Reportes</span>
                </div>
                {/* Flecha con animación de rotación */}
                <ChevronDown
                  className={`w-4 h-4 text-secondary/70 transition-transform duration-200 ${isReportesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* 🌟 3. SUBMENÚ DESPLEGABLE CON ANIMACIÓN DE ALTURA */}
              <div
                className={`overflow-hidden transition-all duration-300 flex flex-col pl-9 mt-1 space-y-1 ${isReportesOpen ? "max-h-32 opacity-100" : "max-h-0 opacity-0 pointer-events-none"}`}
              >
                {/* Subopción A: Calendario de Reservas */}
                <Link
                  to="/reporteador/calendario"
                  onClick={() => setMenuAbierto(false)}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors font-medium ${
                    isCalendarioActive
                      ? "text-secondary font-bold bg-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  • Calendario de reservas
                </Link>

                {/* Subopción B: Listado de Reservas */}
                <Link
                  to="/reporteador/listado"
                  onClick={() => setMenuAbierto(false)}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors font-medium ${
                    isListadoActive
                      ? "text-secondary font-bold bg-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  • Listado de reservas
                </Link>
                <Link
                  to="/reporteador/bitacora"
                  onClick={() => setMenuAbierto(false)}
                  className={`px-3 py-2 text-xs rounded-lg transition-colors font-medium ${
                    isBitacoraActive
                      ? "text-secondary font-bold bg-white/5"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  • Bitácora de auditoría
                </Link>
              </div>
            </div>
          </nav>
        </div>

        {/* Sección de Usuario y Cerrar Sesión */}
        <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
          <div className="px-2">
            <p className="text-xs opacity-60 uppercase font-semibold tracking-wider">
              Usuario activo
            </p>
            <p className="text-sm font-medium text-secondary truncate">
              {username || "Administrador"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-colors group"
          >
            <LogOut className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
