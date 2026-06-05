# Arquitectura — FWD Marketplace

Stack 2 (TypeScript de punta a punta), con **frontend y backend en repos
separados** que se comunican por HTTP (REST/JSON).

```
┌─────────────────────┐        HTTP (REST/JSON)         ┌──────────────────────┐
│   FRONTEND (Next)   │  ───────────────────────────►   │   BACKEND (NestJS)   │
│   este repo          │   Authorization: Bearer <JWT>   │   repo aparte         │
│   deploy: Vercel    │  ◄───────────────────────────   │   deploy: Railway... │
└─────────────────────┘            JSON                  └──────────┬───────────┘
        │ Supabase Auth (login + JWT)                               │ Prisma
        ▼                                                  ┌─────────▼──────────┐
  Supabase (solo Auth)                                     │ Postgres (Supabase) │
                                                           └─────────────────────┘
```

## Reparto de responsabilidades

| | Frontend (este repo) | Backend (repo aparte) |
|---|---|---|
| Tecnología | Next.js 15 + TS + Tailwind | NestJS + TS + Prisma |
| Equipo | 4 devs | 3 devs |
| Hace | UI, SSR/SEO, i18n, login con Supabase | API REST en capas, lógica de negocio, IA |
| Datos | **NO toca la DB directo** | **Único que toca Postgres (vía Prisma)** |

## Reglas que NO se rompen

1. **Solo el backend accede a la base de datos.** El frontend usa Supabase
   **únicamente para Auth** (login y obtención del JWT). Para datos, llama a la
   API de NestJS. Nunca consultes tablas desde el front.
2. **El JWT viaja en cada request** al backend en el header
   `Authorization: Bearer <token>`. El backend lo valida; nunca confíes en
   claims sin verificar.
3. **Secretos:** la `anon key` de Supabase es pública (va con `NEXT_PUBLIC_`).
   La `service_role` key y `DATABASE_URL` viven **solo en el backend**, jamás
   en este repo.
4. **El contrato es OpenAPI.** El backend expone Swagger; si algo cambia, se
   refleja ahí. Idealmente se genera un cliente tipado para el front.

## Cómo el frontend llama al backend

La capa de conexión está en `src/lib/api/`:

- `apiFetch(path, init)` — desde el **servidor** de Next (Server Components /
  Route Handlers). Recomendado para páginas públicas con SSR/SEO. No necesita
  CORS. Adjunta el JWT solo.
- `apiFetchClient(path, init)` — desde el **navegador** (Client Components).
  Para datos interactivos. Requiere `NEXT_PUBLIC_API_URL` y CORS.

La URL del backend se resuelve por variable de entorno (ver `.env.example`):
en local `http://localhost:3001`, en producción la URL del servicio. **El código
no cambia entre entornos, solo la variable.**

## Entornos

| | Frontend | Backend |
|---|---|---|
| Local | `http://localhost:3000` | `http://localhost:3001` |
| Producción | Vercel (dominio del front) | Railway/Render/Fly (`api.*`) |

Para que la demo en producción funcione, **ambos servicios deben estar
desplegados**, con sus variables de entorno cargadas y **CORS del backend
permitiendo el dominio del frontend**.

## Estructura del frontend (este repo)

```
src/
├── app/[locale]/(admin|app|public)/   # rutas por grupo, con i18n
├── components/                        # UI y features
├── i18n/                              # next-intl (routing, navigation, request)
├── lib/
│   ├── api/                           # capa de conexión al backend NestJS
│   └── supabase/                      # clientes de Auth (browser/server/mw)
└── middleware.ts                      # i18n + refresco de sesión Supabase
```
