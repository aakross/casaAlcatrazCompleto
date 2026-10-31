import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import { LoginPage } from "../../features/auth/presentation/pages/LoginPage";
import { useAuthStore } from "../../core/store/authStore";
import { AdminLayout } from "../components/LayOut";
import { ReservasPage } from "../../features/reservacion/presentation/pages/ReservasPage";
import { CortesPage } from "../../features/cortes/presentation/pages/CortesPage";
import { PagosPage } from "../../features/pagos/presentation/pages/PagosPage";
import { ReporteadorPage } from "../../features/reporteador/presentation/pages/ReporteadorPage";
import { ListadoReservasReportePage } from "../../features/reportes/presentation/pages/ListadoReservasReportePage";
import { BitacoraBorradosPage } from "../../features/reporteador/presentation/pages/BitacoraBorradosPage";
import { EstadoResultadosPage } from "../../features/estado-resultados/presentation/pages/EstadoResultadosPage";
import { RentasPage } from "../../features/rentas/presentation/pages/RentasPage";
import { GestionPermisosPage } from "../../features/permisos/presentation/pages/GestionPermisosPage";

interface ProtectedRouteProps {
  allowedRoles?: number[]; // Mantenido por retrocompatibilidad
  requiredPermission?: string; // Validación dinámica de módulos
}

function ProtectedRoute({ allowedRoles, requiredPermission }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);
  const hasPermission = useAuthStore((state) => state.hasPermission);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Verificación dinámica por clave de permiso
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  // Verificación por rol numérico (retrocompatible)
  if (allowedRoles && (roleId === null || (!allowedRoles.includes(roleId) && roleId !== 1))) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

const router = createBrowserRouter(
  [
    {
      element: <PublicRoute />,
      children: [
        {
          path: "/login",
          element: <LoginPage />,
        },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [
            {
              path: "/",
              element: (
                <div className="font-headline text-primary text-3xl font-bold">
                  Control de Ingresos
                </div>
              ),
            },
            {
              element: <ProtectedRoute requiredPermission="PAGOS" />,
              children: [
                {
                  path: "/pagos",
                  element: <PagosPage />,
                },
              ],
            },
            {
              path: "/anticipos",
              element: (
                <div className="font-headline text-primary text-3xl font-bold">
                  Control de Anticipos
                </div>
              ),
            },
            {
              element: <ProtectedRoute requiredPermission="RESERVAS" />,
              children: [
                {
                  path: "/reservas",
                  element: <ReservasPage />,
                },
              ],
            },
            {
              element: <ProtectedRoute requiredPermission="CORTES" />,
              children: [
                {
                  path: "/cortes",
                  element: <CortesPage />,
                },
              ],
            },
            {
              element: <ProtectedRoute requiredPermission="ESTADO_RESULTADOS" />,
              children: [
                {
                  path: "/estado-resultados",
                  element: <EstadoResultadosPage />,
                },
              ],
            },
            ...(import.meta.env.VITE_ENABLE_RENTAS === "true"
              ? [
                  {
                    element: <ProtectedRoute requiredPermission="RENTAS" />,
                    children: [
                      {
                        path: "/rentas",
                        element: <RentasPage />,
                      },
                      {
                        path: "rentas",
                        element: <RentasPage />,
                      },
                    ],
                  },
                ]
              : []),
            {
              element: <ProtectedRoute requiredPermission="REPORTES" />,
              children: [
                {
                  path: "/reporteador",
                  children: [
                    {
                      path: "calendario",
                      element: <ReporteadorPage />,
                    },
                    {
                      path: "listado",
                      element: <ListadoReservasReportePage />,
                    },
                    {
                      path: "bitacora",
                      element: <BitacoraBorradosPage />,
                    },
                  ],
                },
              ],
            },
            {
              element: <ProtectedRoute requiredPermission="PERMISOS" />,
              children: [
                {
                  path: "/permisos",
                  element: <GestionPermisosPage />,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: "/no-autorizado",
      element: (
        <div className="p-8 font-body text-center space-y-3">
          <div className="text-rose-600 font-extrabold text-2xl font-headline">Acceso Restringido</div>
          <p className="text-neutral/70 text-sm max-w-md mx-auto">
            No tienes los permisos asignados para visualizar este módulo. Contacta a un administrador para solicitar acceso.
          </p>
        </div>
      ),
    },
    {
      path: "*",
      element: (
        <div className="p-6 font-body text-neutral text-center">
          404 - Página no encontrada
        </div>
      ),
    },
  ],
  {
    basename: "/casaalcatraz",
  },
);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
