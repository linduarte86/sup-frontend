// Configurações do cliente, como URLs de API.

import { env } from "next-runtime-env";

export const clientConfig = {
  apiUrl: env("NEXT_PUBLIC_API_BACKEND_URL"),
};