/// <reference types="vite/client" />

declare module "lucide-react";
declare module "date-fns";
declare module "date-fns/locale";

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENABLE_RENTAS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
