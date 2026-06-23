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

## REGLA #2.5 — Claude NUNCA debe figurar como autor ni co-autor

Los commits los firman las **personas del equipo** (Christopher y sus compañeros). Eso es normal y esperado: cualquier desarrollador humano puede ser autor. Lo **ÚNICO prohibido** es que Claude / el agente IA aparezca en la autoría.

- **NUNCA** agregues el trailer `Co-Authored-By: Claude ...` (ni ningún `Co-Authored-By` de un modelo de IA) al mensaje de commit.
- **NUNCA** te pongas como autor o committer vía `--author`, `GIT_AUTHOR_*`, `GIT_COMMITTER_*`, ni cambiando `user.name`/`user.email` a una identidad de IA.
- El autor/committer debe quedar siempre como el desarrollador humano cuyo git está configurado. Dejá el `user.name`/`user.email` tal cual está; no lo toques.

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

## REGLA #6 — PROHIBIDO usar emojis (cero emojis, sin excepciones)

**NUNCA uses emojis en NINGUNA parte del producto ni del repositorio.** Los emojis se ven poco profesionales y están terminantemente prohibidos en este proyecto. Esta regla es absoluta, amplia y no admite excepciones.

Aplica a **todo** lo que llega a la UI o queda en el código:
- **Texto visible**: títulos, párrafos, labels, botones, placeholders, tooltips, toasts, mensajes de error/éxito, estados vacíos, badges, breadcrumbs.
- **Contenido e i18n**: los mensajes de traducción (`es`/`en`), datos hardcodeados, `metadata`, `alt`, `aria-label`, títulos de página.
- **Diseño y decoración**: NO uses emojis como íconos, viñetas, separadores, bullets ni adornos visuales.
- **Código y comentarios**: nada de emojis en `.tsx`/`.ts`, JSON, comentarios ni documentación de la UI.

**Qué usar en su lugar:**
1. **Íconos de `lucide-react`** (ya está instalado) o los componentes de ícono/SVG propios del proyecto. Es la opción preferida cuando se necesita un símbolo visual.
2. Si no hay un ícono adecuado, **no pongas nada**: texto limpio y profesional es mejor que un emoji.

**Auto-revisión OBLIGATORIA:** antes de dar por terminado cualquier cambio que toque la UI o agregue texto, **revisá si introdujiste algún emoji**. Si encontrás aunque sea uno —en cualquier archivo (`.tsx`, `.ts`, JSON de i18n, etc.)—, **corregilo de inmediato**: reemplazalo por un ícono de `lucide-react` o quitalo, antes de continuar. Si ves emojis preexistentes en el código que estás tocando, señalalos para limpiarlos.

---

## REGLA #7 — Scroll en modales: siempre bloquear el body

Cada vez que se abre un modal (o cualquier overlay/drawer/sheet que cubra la pantalla), se **debe bloquear el scroll del body** para que solo se pueda hacer scroll dentro del modal.

**Implementación DEFINITIVA (copiar exactamente en cada modal):**

```tsx
useEffect(() => {
  const html = document.documentElement;
  const body = document.body;
  const scrollY = window.scrollY;
  const scrollX = window.scrollX;

  const prevHtmlOverflow = html.style.overflow;
  const prevBodyOverflow = body.style.overflow;
  const prevBodyPosition = body.style.position;
  const prevBodyTop = body.style.top;
  const prevBodyLeft = body.style.left;
  const prevBodyRight = body.style.right;

  html.style.overflow = 'hidden';
  body.style.overflow = 'hidden';
  body.style.position = 'fixed';
  body.style.top = `-${scrollY}px`;
  body.style.left = '0';
  body.style.right = '0';

  return () => {
    html.style.overflow = prevHtmlOverflow;
    body.style.overflow = prevBodyOverflow;
    body.style.position = prevBodyPosition;
    body.style.top = prevBodyTop;
    body.style.left = prevBodyLeft;
    body.style.right = prevBodyRight;
    window.scrollTo(scrollX, scrollY);
  };
}, []);
```

Reglas adicionales:
- El `useEffect` va **dentro del componente del modal**, no en quien lo renderiza.
- El backdrop (`fixed inset-0`) debe tener `onWheel={(e) => e.stopPropagation()}` como segunda línea de defensa.
- El div scrollable interno necesita `min-h-0 flex-1 overflow-y-auto overscroll-contain` — sin `min-h-0` el flex no encoge y sin `overscroll-contain` el scroll se propaga al salir del límite.
- El contenedor del modal (inner div) debe tener `overflow-hidden` para que `max-h-[90vh]` recorte correctamente.

**Por qué `overflow: hidden` en body solo NO alcanza:** en Next.js el elemento scrollable raíz es `<html>`, no `<body>`. Bloquear solo body deja `html` libre para scrollear. La técnica `position: fixed + top: -scrollY` es la usada por radix-ui, react-modal y todas las librerías profesionales.

---

## Referencia rápida

| Si querés... | Mirá |
|---|---|
| Hacer un commit | Skill [`commit`](.claude/skills/commit/SKILL.md) |
| Traer cambios desde dev | Skill [`pull`](.claude/skills/pull/SKILL.md) |
| Entender arquitectura / reparto de capas | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Setup local, variables de entorno, troubleshooting Supabase | [README.md](README.md) |
| Reglas de commitlint | [commitlint.config.js](commitlint.config.js) |
| Poner un símbolo/ícono en la UI (NUNCA emojis) | REGLA #6 — usar [`lucide-react`](https://lucide.dev/icons) |
