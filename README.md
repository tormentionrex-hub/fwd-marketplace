# FWD Marketplace

Marketplace de proyectos universitarios donde empresarios contratan equipos de estudiantes. Plataforma full-stack en un único repositorio Next.js con base de datos Supabase y Prisma.

Detalle de arquitectura y convenciones del equipo: ver [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Lenguaje | TypeScript 5 |
| Estilos | Tailwind CSS 4 + shadcn/ui + Radix |
| i18n | next-intl |
| Base de datos | PostgreSQL 17 en Supabase (free tier) |
| ORM | Prisma 6 |
| Auth | Supabase Auth (`@supabase/ssr` con cookies) |
| Almacenamiento | Cloudinary |
| Email | SMTP genérico (`EMAIL_USER` / `EMAIL_PASS`) |
| Deploy | Vercel |

---

## Prerrequisitos

- Node.js 20 o superior
- npm (viene con Node)
- Acceso al proyecto Supabase del equipo (pedir invitación al owner)
- Cuenta de GitHub con acceso al repo

---

## Setup local

### 1. Clonar e instalar

```bash
git clone <repo-url>
cd fwd-marketplace
npm install     # corre `prisma generate` automaticamente via postinstall
```

### 2. Configurar variables de entorno

Copiá el ejemplo y pedile las claves al equipo:

```bash
cp .env.example .env
```

Estructura del `.env` (sin valores reales):

```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...   # alias del anon key, formato JWT
NEXT_PUBLIC_SUPABASE_ANON_KEY=...          # mismo valor que arriba
SUPABASE_SECRET_KEY=...                    # service_role key — NUNCA al cliente

# PRISMA (Postgres en Supabase)
# DATABASE_URL → pooler Transaction (6543) para runtime de la app
# DIRECT_URL   → pooler Session     (5432) para `prisma migrate` / `db pull`
DATABASE_URL=postgresql://postgres.<ref>:<password>@aws-N-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.<ref>:<password>@aws-N-<region>.pooler.supabase.com:5432/postgres

# CORREOS
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=

# CLOUDINARY
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI
GOOGLE_GENERATIVE_AI_API_KEY=
ANTHROPIC_API_KEY=

# OAUTH
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
```

**Importante sobre el host del pooler (`aws-N`):** ver la sección [Troubleshooting Supabase](#troubleshooting-supabase) más abajo. **No copiar la cadena de la documentación**, copiarla del modal "Connect" del Dashboard.

### 3. Arrancar

```bash
node test-db.js       # smoke test de conexión a la DB
npm run dev           # http://localhost:3000  (redirige a /es por i18n)
```

Si `test-db.js` falla con `tenant/user not found`, leer la sección [Troubleshooting Supabase](#troubleshooting-supabase).

---

## Scripts disponibles

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en `:3000` |
| `npm run build` | Build de producción (debe pasar antes de cada PR) |
| `npm run start` | Sirve el build de producción |
| `npm run lint` | ESLint sobre todo el repo |
| `npm run prisma:generate` | Regenera el cliente Prisma a partir del schema |
| `npm run prisma:migrate` | Crea y aplica una migración nueva (dev) |
| `npm run prisma:deploy` | Aplica migraciones pendientes (prod / CI) |
| `npm run prisma:studio` | Abre Prisma Studio (GUI de la DB) en `:5555` |
| `node test-db.js` | Smoke test rápido de conexión a Supabase |

---

## Estructura del repo

```
fwd-marketplace/
  prisma/
    schema.prisma            # 18 modelos (usuarios, perfiles, proyectos, chats, etc.)
  src/
    app/
      [locale]/              # rutas con i18n (es / en)
        (public)/            # rutas publicas (login, register, landing)
      api/                   # Route Handlers (capa REST)
      globals.css
    components/              # UI compartida (shadcn-style)
    server/                  # lógica de negocio: services, repositories, auth
    lib/
      db.ts                  # singleton de PrismaClient
      supabase/              # clientes Supabase (browser, server, middleware)
      utils.ts
    i18n/                    # configuración next-intl
    middleware.ts            # refresca la cookie de sesión Supabase
    types/                   # tipos compartidos
  messages/                  # bundles de textos por locale
  public/                    # estáticos
  ARCHITECTURE.md            # decisiones de arquitectura y patrones
  CLAUDE.md                  # contexto para agentes IA
```

Reparto de quién toca qué carpeta: ver [ARCHITECTURE.md](ARCHITECTURE.md#reparto-de-carpetas-quién-toca-qué).

---

## Reglas clave del proyecto

Resumen — el detalle está en [ARCHITECTURE.md](ARCHITECTURE.md):

1. **La DB se toca SOLO desde el servidor** (`src/server/` o `src/app/api/`) vía Prisma. El navegador llama a `/api/...`, nunca consulta Postgres directo.
2. **Supabase = solo Auth.** Datos = **Prisma**.
3. Patrón en capas: `repository` → `service` → `route handler`.
4. La sesión vive en una cookie refrescada por `src/middleware.ts`. En el servidor se obtiene con `getUser()` (sin Bearer tokens).
5. **Nunca commitear `.env`.** La `service_role` key y `DATABASE_URL` solo en variables de entorno.
6. **Antes de abrir un PR: `npm run build` debe pasar.**

---

## Workflow del equipo

- `main` y `dev` están **protegidas**. No se hace push directo.
- Trabajar en ramas por feature: `feat/<nombre>-<tarea>` (ej. `feat/ana-login`).
- Todo cambio entra por **Pull Request hacia `dev`**, revisado por alguien más.
- Mantener la rama al día: `git pull origin dev` frecuente.
- Commits chicos siguiendo **Conventional Commits** (validado automáticamente, ver sección [Commits](#commits)).
- Si tocás algo compartido (`db`, `supabase`, `middleware`, `types`), avisar en el PR para evitar choques.

---

## Commits

Este repo usa **Husky + commitlint** para validar todos los mensajes de commit. Si el mensaje no sigue el formato, el commit se rechaza automáticamente.

### Setup (automático)

Al correr `npm install`, el script `prepare` instala los hooks de git. No hay que hacer nada manual.

Hooks configurados:

| Hook | Qué hace |
|---|---|
| `pre-commit` | Corre ESLint con `--fix` sobre los archivos staged (vía lint-staged) |
| `commit-msg` | Valida el mensaje contra las reglas de `commitlint.config.js` |

### Formato del mensaje

```
<type>(<scope opcional>): <subject>

<body opcional, explica POR QUÉ>
```

Tipos permitidos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Reglas duras:
- Subject ≤ 100 caracteres, sin punto final.
- Body con líneas ≤ 120 caracteres.
- En español (consistente con el repo).
- Modo imperativo presente: "añadir", no "añadido".

### Ejemplos

```
feat(auth): añadir endpoint POST /api/auth/login con Supabase
fix(prisma): corregir host del pooler en .env.example
docs: añadir sección de troubleshooting de Supabase en README
refactor(server): extraer cliente Prisma a singleton en lib/db.ts
chore(deps): subir Next.js a 15.5.19
```

### Hacer commits con Claude Code

Si usás Claude Code en este repo, está incluida una skill llamada **`commit`** que sabe todo esto. Para usarla, simplemente decile a Claude:

> "haz un commit de los cambios"
> "comitea lo que hice"
> "/commit"

Claude leerá la skill, revisará el diff actual, redactará un mensaje correcto siguiendo nuestras reglas y creará el commit. Si el hook falla, intentará corregir antes de pedirte ayuda.

Definición de la skill: [.claude/skills/commit/SKILL.md](.claude/skills/commit/SKILL.md).

### Traer cambios de dev con Claude Code

Hay también una skill **`pull`** que corre `git pull origin dev` y nada más. Sirve para mantener tu rama al día. Decile a Claude:

> "trae los cambios"
> "actualiza el proyecto"
> "sync con dev"
> "/pull"

Si el pull falla por cualquier motivo (conflicto, working tree dirty, network), la skill **te dirá que llames a Christopher** en vez de intentar "arreglarlo" con comandos que pueden empeorar el problema.

Definición: [.claude/skills/pull/SKILL.md](.claude/skills/pull/SKILL.md).

### Si querés saltarte un hook (NO recomendado)

Los hooks existen por una razón. `--no-verify` salta TODO y deja entrar código que rompe lint o mensajes mal formateados. **No usarlo**. Si un hook falla legítimamente, abrir un issue para arreglar la regla.

---

## Troubleshooting Supabase

### Error: `FATAL: (ENOTFOUND) tenant/user postgres.<ref> not found`

**Causa más común**: el prefijo `aws-N` del host del pooler está mal en `DATABASE_URL` / `DIRECT_URL`.

Los hosts del pooler Supavisor tienen formato `aws-N-<region>.pooler.supabase.com` donde `N` (0, 1, 2, ...) **varía por proyecto**, no por región. La documentación oficial siempre muestra `aws-0` como ejemplo, pero un proyecto particular puede vivir en `aws-1`, `aws-2`, etc.

**Solución**: copiar el host EXACTO desde el Dashboard:

1. [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto
2. Arriba a la derecha, botón verde **"Connect"**
3. Seleccionar **"Transaction pooler"**
4. La cadena que aparece ahí es la canónica. Reemplazar el host en `DATABASE_URL`
5. Repetir para **"Session pooler"** y reemplazar en `DIRECT_URL`

### Otros errores comunes

| Error | Causa | Solución |
|---|---|---|
| `Can't reach database server at db.<ref>.supabase.co:5432` | El host directo solo está en IPv6 (free tier) y tu red es IPv4 | Usar el pooler, NO el host directo |
| `password authentication failed` | Password incorrecta | Resetear en Dashboard → Settings → Database → Reset DB password |
| `Project paused` en el Dashboard | Free tier pausa proyectos tras 7 días inactivos | Botón **Restore project** en el Dashboard |
| Status `Unhealthy` en Dashboard | Postgres caído / restarting | Settings → General → Project availability → **Restart project** |

### Tipos de connection string

| Modo | Host | Puerto | Cuándo usar |
|---|---|---|---|
| Direct | `db.<ref>.supabase.co` | 5432 | Solo si tu red soporta IPv6 (raro) o tenés el IPv4 add-on (pago) |
| Pooler Transaction | `aws-N-<region>.pooler.supabase.com` | 6543 | **App runtime, serverless** — `DATABASE_URL` |
| Pooler Session | `aws-N-<region>.pooler.supabase.com` | 5432 | **Migraciones / `db pull`** — `DIRECT_URL` |

---

## Estado actual del proyecto

### Funcionando

- Conexión Prisma a Supabase via pooler (Transaction + Session)
- Schema Prisma con 18 modelos sincronizado con la DB
- Auth Supabase configurado en `src/lib/supabase/` y `src/middleware.ts`
- i18n con next-intl (`es` / `en`)
- Build pasa
- `.env` correctamente ignorado por git

### Pendiente

- **Policies RLS** para las 18 tablas de `public.*`. Hoy tienen RLS habilitado sin policies, lo que significa que cualquier query desde el cliente con `anon_key` devuelve vacío. Requiere definir la lógica de acceso por entidad (quién ve qué) antes de escribirlas.
- **Limpieza de duplicación**: existen dos sets de clientes Supabase en `src/lib/*.ts` (raíz, no se usa) y `src/lib/supabase/*.ts` (el bueno, importado por 2 archivos). Borrar los de la raíz cuando se confirme que ningún PR pendiente los necesite.

---

## Deploy

- **Vercel** (un solo servicio para todo el repo).
- Cargar todas las variables de entorno en el panel de Vercel (Project Settings → Environment Variables).
- Migraciones a producción: `npm run prisma:deploy` desde CI o local con el `.env` apuntando a producción.

---

## Recursos

- [Next.js App Router](https://nextjs.org/docs/app)
- [Prisma con Supabase](https://supabase.com/docs/guides/database/prisma)
- [Supabase Auth con SSR](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Connection pooling Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Tailwind v4](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
