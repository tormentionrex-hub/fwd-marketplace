// URL base del backend (NestJS, repo aparte).
// En local apunta a http://localhost:3001; en producción a la URL del servicio
// desplegado (p. ej. https://api.fwd-marketplace.com). Solo cambia la env var,
// nunca el código.
//
// - API_URL: disponible solo en el servidor de Next (SSR / Route Handlers).
// - NEXT_PUBLIC_API_URL: se inyecta en el navegador (Client Components). Requiere
//   CORS habilitado en el backend.
export const API_BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3001';
