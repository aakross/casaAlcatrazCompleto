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

interface ProtectedRouteProps {
  allowedRoles?: number[]; // Lista de roles numéricos válidos
}

function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const token = useAuthStore((state) => state.token);
  const roleId = useAuthStore((state) => state.roleId);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && (roleId === null || !allowedRoles.includes(roleId))) {
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
          // 2. ENVOLVEMOS LAS SECCIONES DENTRO DEL LAYOUT DEL SIDEBAR
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
              element: <ProtectedRoute allowedRoles={[1, 3]} />,
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
              element: <ProtectedRoute allowedRoles={[1, 2]} />,
              children: [
                {
                  path: "/reservas",
                  element: <ReservasPage />,
                },
              ],
            },
            {
              element: <ProtectedRoute allowedRoles={[1, 3]} />,
              children: [
                {
                  path: "/cortes",
                  element: <CortesPage />,
                },
              ],
            },
            {
              element: <ProtectedRoute allowedRoles={[1, 3]} />,
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
                    element: <ProtectedRoute allowedRoles={[1, 2, 3]} />,
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
              element: <ProtectedRoute allowedRoles={[1, 3]} />,
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
          ],
        },
      ],
    },
    {
      path: "/no-autorizado",
      element: (
        <div className="p-6 font-body text-red-500 text-center font-bold text-xl">
          No tienes permisos para acceder a esta sección.
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
