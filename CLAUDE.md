# CLAUDE.md — Instrucciones obligatorias para agentes IA

Este archivo se inyecta automáticamente en cada conversación de Claude Code en este repo. Las reglas de abajo son **obligatorias** y no negociables.

## Sobre el proyecto

**FWD Marketplace** — marketplace de proyectos universitarios. Next.js 15 full-stack en TypeScript, base de datos PostgreSQL en Supabase, ORM Prisma, Auth Supabase. Single-repo, deploy en Vercel.

Detalle de arquitectura y convenciones: ver [ARCHITECTURE.md](ARCHITECTURE.md).
Setup local, scripts y troubleshooting: ver [README.md](README.md).

---

## REGLA #1 — Commits SIEMPRE con la skill `commit`

**Cuando el usuario pida un commit (en cualquier forma: "haz un commit", "comitea esto", "guarda los cambios", "/commit", etc.) DEBES invocar la skill `commit` ANTES de hacer cualquier otra cosa relacionada con git.**

La skill está en [.claude/skills/commit/SKILL.md](.claude/skills/commit/SKILL.md) y contiene:
- Las reglas de Conventional Commits específicas de este repo
- Los tipos permitidos (`feat`, `fix`, `docs`, `refactor`, `chore`, etc.)
- Cómo redactar el mensaje para que pase commitlint
- El flujo paso a paso (revisar diff, stagear con cuidado, redactar, commit)

**No improvises mensajes de commit.** El repo tiene Husky + commitlint configurado: si el mensaje no cumple el formato exacto, el commit es rechazado. La skill conoce las reglas exactas y evita que pierdas tiempo en intentos fallidos.

---

## REGLA #1.5 — Traer cambios SIEMPRE con la skill `pull`

**Cuando el usuario pida traer cambios (en cualquier forma: "trae los cambios", "actualiza", "pull de dev", "trae lo nuevo", "sync con dev", "/pull", etc.) DEBES invocar la skill `pull` ANTES de hacer cualquier otra cosa.**

La skill está en [.claude/skills/pull/SKILL.md](.claude/skills/pull/SKILL.md) y hace UNA cosa única: ejecuta `git pull origin dev` y reporta el resultado.

**Reglas duras de esta skill**:
- Ejecutar SOLO `git pull origin dev`. Nada de `fetch`, `rebase`, `merge`, `checkout`, `stash`.
- Si falla por CUALQUIER motivo (conflicto, working tree dirty, network, etc.): **PARÁ inmediatamente** y decile al usuario "Llamá a Christopher". No intentes resolverlo vos.
- No correr `npm install` ni `prisma generate` por iniciativa propia aunque cambien archivos relacionados — solo sugerirlo en el reporte.

---

## REGLA #2 — Nunca saltar hooks

**NUNCA** usar `--no-verify`, `--no-gpg-sign`, ni ninguna bandera que salte los hooks `commit-msg` o `pre-commit`. Si un hook falla:

1. Leer el error real
2. Corregir el código (si fue lint) o el mensaje (si fue commitlint)
3. Hacer un commit NUEVO (no `--amend` salvo que el usuario lo pida explícito)

Los hooks existen para mantener calidad — saltarlos es engañar al equipo.

---

## REGLA #3 — Nunca tocar `.env`

- **NUNCA** comitear `.env` (está en `.gitignore` y debe permanecer ahí).
- **NUNCA** mostrar el contenido completo de `.env` en respuestas — si necesitas referenciar una variable, usá su nombre, no su valor.
- **NUNCA** poner credenciales hardcodeadas en código fuente. Todo va por `process.env`.
- Si el usuario te pide la `service_role` key o `DATABASE_URL`, recordarle que esas son secretas y NO van al frontend.

---

## REGLA #4 — Reparto de capas (NO cruzar)

Resumen — el detalle está en [ARCHITECTURE.md](ARCHITECTURE.md):

1. **La DB se toca SOLO desde el servidor** (`src/server/` o `src/app/api/`) vía Prisma.
2. **El navegador (Client Components) NUNCA consulta la DB directamente.** Llama a `/api/...`.
3. **Supabase = solo Auth.** Para datos, usar Prisma.
4. Patrón en capas: `repository` → `service` → `route handler`.

---

## REGLA #5 — Antes de proponer un cambio grande

- **Leer ARCHITECTURE.md** si vas a tocar `db`, `supabase`, `middleware`, `server/`, o `prisma/schema.prisma`.
- **Confirmar con el usuario** antes de:
  - Modificar `prisma/schema.prisma` (afecta a todo el equipo)
  - Cambiar `next.config.ts`, `tsconfig.json`, configuración de ESLint o Tailwind
  - Instalar nuevas dependencias pesadas
  - Refactorizar capas compartidas (`lib/db.ts`, `lib/supabase/*`, `middleware.ts`)
- **`npm run build` debe pasar** antes de declarar terminado cualquier cambio.

---

## Referencia rápida

| Si querés... | Mirá |
|---|---|
| Hacer un commit | Skill [`commit`](.claude/skills/commit/SKILL.md) |
| Traer cambios desde dev | Skill [`pull`](.claude/skills/pull/SKILL.md) |
| Entender arquitectura / reparto de capas | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Setup local, variables de entorno, troubleshooting Supabase | [README.md](README.md) |
| Reglas de commitlint | [commitlint.config.js](commitlint.config.js) |
