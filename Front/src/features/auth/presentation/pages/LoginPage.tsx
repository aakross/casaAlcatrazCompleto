import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../../domain/login.schema";
import { useAuth } from "../hooks/useAuth";
import logo from "/logo.png";
import fondo from "/fondo.jpeg";

export function LoginPage() {
  const { signIn, isLoading, error } = useAuth();

  // Configuración de React Hook Form conectado a Zod
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  return (
    // 🎯 1. CONTENEDOR PRINCIPAL: Dividimos la pantalla en 2 secciones usando la cuadrícula de Tailwind (Grid)
    <div className="w-screen h-screen grid grid-cols-1 lg:grid-cols-12 bg-tertiary font-body overflow-hidden">

      {/* 📸 PANEL IZQUIERDO (Ocupa 7 columnas): Contiene la fotografía de Casa Alcatraz */}
      {/* Se oculta en móviles (hidden) y se activa con escala completa en computadoras (lg:block col-span-7) */}
      <div className="hidden lg:block lg:col-span-7 relative w-full h-full bg-neutral">
        <img
          src={fondo} // 🎯 Guarda la foto de la palapa en tu carpeta public con este nombre
          alt="Casa Alcatraz Resort"
          className="w-full h-full object-cover object-center select-none"
        />
        {/* Capa de degradado sutil oscuro para unificar los tonos de la fotografía */}
        <div className="absolute inset-0 bg-black/15 mix-blend-multiply" />
      </div>

      {/* 💼 PANEL DERECHO (Ocupa 5 columnas): Contiene tu formulario y logo */}
      {/* Se centra de forma perfecta tanto en móviles como en computadoras */}
      <div className="col-span-12 lg:col-span-5 flex justify-center items-center p-6 sm:p-12 w-full h-full overflow-y-auto bg-tertiary">
        
        {/* Tarjeta del Formulario Blanca */}
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-black/5 animate-fadeIn">
          
          {/* Cabecera Interna de Marca */}
          <div className="text-center mb-6 flex flex-col items-center">
            <img 
              src={logo} // Tu logo de la flor guardado en la raíz de public
              alt="Logo Casa Alcatraz" 
              className="h-24 object-contain mb-3 drop-shadow-2xs select-none"
            />
            <h1 className="font-headline text-3xl font-bold text-primary tracking-wide">
              Casa Alcatraz
            </h1>
            <p className="text-neutral text-xs font-semibold uppercase tracking-widest mt-1 opacity-60">
              Panel Administrativo de Control
            </p>
          </div>

          {/* Error global que regresa tu API de Axios */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center border border-red-100 font-medium">
              {error}
            </div>
          )}

          {/* Formulario de Acceso */}
          <form
            onSubmit={handleSubmit((data) => signIn(data.user, data.password))}
            className="space-y-4"
          >
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral mb-1.5">
                Nombre de Usuario
              </label>
              <input
                type="text"
                {...register("user")}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 bg-surfacecontainer/50 border rounded-xl focus:outline-none transition-colors text-neutral text-sm font-medium ${
                  errors.user
                    ? "border-red-500 focus:border-red-500"
                    : "border-black/10 focus:border-secondary"
                }`}
                placeholder="Usuario Merksyst"
              />
              {errors.user && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.user.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                {...register("password")}
                disabled={isLoading}
                className={`w-full px-4 py-2.5 bg-surfacecontainer/50 border rounded-xl focus:outline-none transition-colors text-neutral text-sm font-medium ${
                  errors.password
                    ? "border-red-500 focus:border-red-500"
                    : "border-transparent focus:border-secondary"
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón de Submit conectado a tus colores primarios */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-opacity-95 transform active:scale-[0.98] transition-all tracking-wide disabled:bg-gray-400 disabled:pointer-events-none mt-2 cursor-pointer font-label text-sm"
            >
              {isLoading ? "Autenticando..." : "Iniciar Sesión"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}