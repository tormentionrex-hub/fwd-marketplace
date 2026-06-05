# Arquitectura — FWD Marketplace

**Next.js full-stack en TypeScript, UN SOLO repositorio.** Frontend y backend
viven juntos. Base de datos PostgreSQL (Supabase) vía **Prisma**. Autenticación
con **Supabase Auth**. Todo el equipo (frontend y backend) trabaja en este repo.

```
Navegador ──► Next.js (este repo) ──► PostgreSQL (Supabase)
                ├─ UI       src/app/[locale]/...
                ├─ API      src/app/api/...     (Route Handlers = capa REST)
                ├─ Lógica   src/server/...      (services + repositories)
                ├─ Datos    src/lib/db.ts       (Prisma)
                └─ Auth     Supabase (cookie de sesión)
```

## Por qué un solo repo

Un solo lenguaje (TS), un solo deploy, una sola URL. **Sin CORS ni reenvío de
JWT entre servicios.** Menos piezas = la demo en producción es más fácil de
hacer funcionar. Para un equipo aprendiendo con fecha de entrega, es lo más
simple y robusto.

## Reparto de carpetas (quién toca qué)

| Frontend (4 devs) | Backend (3 devs) | Compartido |
|---|---|---|
| `src/app/[locale]/` páginas y UI | `src/app/api/` endpoints REST | `src/lib/supabase/` auth |
| `src/components/` componentes | `src/server/` lógica y datos | `src/types/` tipos |
| `src/i18n/` textos/locales | `src/lib/db.ts` cliente Prisma | `src/middleware.ts` |
| | `prisma/` schema y migraciones | |

## Regla de oro

1. **La base de datos se toca SOLO desde el servidor** (`src/server` o
   `src/app/api`) vía Prisma. El navegador (Client Components) **nunca** consulta
   la DB: llama a `/api/...`.
2. **Supabase = solo Auth** (login y sesión). **Prisma = datos.**
3. La `anon key` de Supabase es pública; la `service_role` key y `DATABASE_URL`
   van **solo en variables de entorno**, nunca en el código ni commiteadas.

## Patrón en capas (cómo el backend agrega un endpoint)

1. **repository** (`src/server/repositories/x.repository.ts`): queries Prisma.
2. **service** (`src/server/services/x.service.ts`): lógica de negocio, usa el repo.
3. **route handler** (`src/app/api/x/route.ts`): recibe el HTTP, valida la
   entrada, llama al service y responde JSON. Si requiere sesión, protégelo con
   `getUser()`.

Los **Server Components** pueden llamar al service directo (sin pasar por `/api`)
para renderizar en el servidor con SEO.

## Auth (simple, same-origin, sin Bearer)

La sesión vive en una cookie que `src/middleware.ts` refresca en cada request.
En el servidor:

```ts
import { getUser } from '@/server/auth/get-user';

const user = await getUser();
if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
```

No hay que mandar tokens a mano: como todo es el mismo origen, la cookie viaja sola.

## Cómo trabajamos en equipo (para no pisarnos)

- `main` y `dev` **protegidas**: nadie pushea directo. Se trabaja en ramas por
  feature: `feat/<nombre>-<tarea>` (ej. `feat/ana-login`).
- Todo cambio entra por **Pull Request hacia `dev`**, revisado por alguien más.
- Mantené tu rama al día seguido: `git pull origin dev` y resolvé conflictos
  temprano (no acumules una semana de diferencia).
- **Respetá el reparto de carpetas.** Si tocás algo compartido (`db`,
  `supabase`, `middleware`, `types`), avisalo en el PR para que nadie choque.
- Commits chicos y descriptivos (Conventional Commits: `feat`, `fix`, `chore`,
  `docs`, `refactor`).
- **Antes de abrir el PR: `npm run build` debe pasar.**

## Setup en tu máquina

```bash
npm install                       # instala deps y genera el cliente Prisma
cp .env.example .env.local        # y llená las claves (pedilas al equipo)
npm run prisma:generate           # si hace falta regenerar el cliente
npm run dev                       # http://localhost:3000  (redirige a /es)
```

## Producción

- Deploy en **Vercel** (un solo servicio). Cargar las variables de entorno en
  el panel de Vercel.
- Migraciones a la DB de producción: `npm run prisma:deploy`.
- Verificar que responde: `GET /api/health` → `{ "status": "ok" }`.
