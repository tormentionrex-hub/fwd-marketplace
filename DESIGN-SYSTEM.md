# FWD Marketplace — Design System

Sistema visual de FWD Marketplace Costa Rica. Estilo SaaS moderno (inspiración Stripe / Linear /
Vercel / Product Hunt) manteniendo la identidad FWD. Stack: Next.js 15 (App Router), Tailwind CSS v4,
Framer Motion, next-themes.

## 1. Fundación

### Tipografía
- **Display / títulos:** Space Grotesk → utilidad `font-display`.
- **Texto / contenido:** Inter → utilidad `font-sans` (por defecto en `body`).
- Cargadas con `next/font/google` en `src/app/[locale]/layout.tsx`.

### Color — Marca (constante en claro/oscuro)
| Token | Hex |
|---|---|
| `fwd-azul` (primario) | `#008FD4` |
| `fwd-morado` | `#662D91` |
| `fwd-turquesa` | `#20BEC6` |
| `fwd-amarillo` | `#FFCB05` |
| `fwd-naranja` | `#F7901E` |
| `fwd-magenta` | `#EC008C` |

Uso: `bg-fwd-azul`, `text-fwd-magenta`, etc.

### Color — Superficies semánticas (dependientes del tema)
Definidas como variables CSS en `:root` / `.dark` y expuestas como utilidades Tailwind:

| Utilidad | Claro | Oscuro |
|---|---|---|
| `bg-bg` | `#FFFFFF` | `#0B1120` |
| `bg-surface` | `#FFFFFF` | `#0F172A` |
| `bg-surface-2` | `#F8FAFC` | `#1E293B` |
| `border-border` | `#E2E8F0` | `#1E293B` |
| `text-text` | `#0F172A` | `#F1F5F9` |
| `text-text-muted` | `#64748B` | `#94A3B8` |

> Siempre usar estos tokens (no `slate-*` ni `white`/`black` directos) para que el dark mode funcione.

### Utilidades de marca (`globals.css`)
- `.text-gradient-fwd` — texto con degradado azul→morado→magenta.
- `.bg-gradient-fwd` / `.bg-gradient-fwd-soft` — fondos con degradado de marca.
- `.glass` — glassmorphism sutil (translúcido + blur + borde), theme-aware.
- `.gradient-border` — borde con degradado.
- `.animate-aurora` + keyframes `fwd-float`, `fwd-drift`, `fwd-aurora`.

### Dark mode
- `next-themes` con `attribute="class"` (`ThemeProvider` en el layout raíz).
- Tailwind v4 configurado con `@custom-variant dark (&:where(.dark, .dark *))` → `dark:` usa la clase, no el SO.
- Toggle: `ThemeToggle` (flotante en el layout raíz e inline en el sidebar). Persiste la preferencia.
- Respeta `prefers-reduced-motion`.

## 2. Componentes (`src/components/ui/`)

| Componente | Notas |
|---|---|
| `Button` | Variantes `primary · secondary · outline · ghost · danger`; tamaños `sm · md · lg`; `loading`, `fullWidth`, `href` (→ Link). Foco accesible, micro-interacción CSS. |
| `Input` / `Textarea` / `PasswordInput` / `SearchInput` | Label, hint, error visual, icono, `focus:ring` de marca, tokens de tema. |
| `Card` (+ `CardHeader/Body/Footer`) | Variantes `default · glass · gradient-border · interactive`. |
| `Badge` | `neutral · info · success · danger · warning · brand · accent · outline · featured`. |
| `Modal` | Portal + `AnimatePresence`, cierre por overlay/Esc, bloqueo de scroll. |
| `Avatar` | Imagen o iniciales con degradado; `ring` opcional. |
| `StatCard` | KPI con icono, valor, delta y acento de color. |
| `MiniChart` | Gráfico de barras en SVG puro (sin librería). |
| `EmptyState` | Estado vacío premium reutilizable. |
| `SectionHeading` | Eyebrow + título + descripción. |
| `motion/*` | `Reveal`, `FadeIn`, `SlideUp`, `Stagger`/`StaggerItem`, `HoverLift` (Framer Motion, 200–400 ms). |

### Tarjetas de dominio (`src/components/features/cards/`)
`ProductCard`, `ProjectCard`, `CompanyCard`, `EventCard`, `UserCard` — estilo Product Hunt/Dribbble:
cover de marca, badges, estado, favorito, hover premium (elevación + sombra).

## 3. Animaciones
- Framer Motion. Patrones: Fade In, Slide Up, Scale, Hover Lift, stagger en grids.
- Duraciones 0.2–0.4 s, easing `[0.21, 0.5, 0.27, 1]`.
- Entradas de sección con `whileInView` + `viewport={{ once: true }}`.

## 4. Responsive
Breakpoints Tailwind por defecto (`sm 640 · md 768 · lg 1024 · xl 1280 · 2xl 1536`).
Grids 1→2→3(→4) columnas; hero y formularios fluidos; sidebar colapsa a scroll horizontal en móvil.

## 5. Accesibilidad (WCAG AA)
- `focus-visible` con anillo de marca en botones/inputs/toggle.
- Labels y `aria-*` en formularios, Modal (`role="dialog"`, Esc) y toggles.
- Contraste de texto sobre superficies en ambos temas.
- `prefers-reduced-motion` reduce animaciones.

---

## Páginas — problema → propuesta (resumen UX/UI)

| Página | Problema | Propuesta |
|---|---|---|
| **Landing** (`(public)/page.tsx`) | Fondo plano, flechas sin integrar, CTAs débiles. | Hero con auroras + flechas en movimiento, headline en degradado "Futuro Digital Juntos", stats glass, secciones de valor, empresas y CTA. |
| **Login / Registro** | Formularios genéricos centrados. | Split layout estilo Stripe: panel de marca con beneficios + formulario con inputs e iconos. |
| **Recuperar** | Card simple. | Mismo split layout + componentes del sistema y estados de éxito. |
| **Marketplace** | Lista básica de 3 ítems. | Buscador + filtros + orden, grid animado con `ProductCard`, categorías y destacados. |
| **Detalle producto** | Placeholder. | Layout real: cover, info, beneficios, autor, precio/acciones y relacionados. |
| **Dashboard** | Cards planas. | SaaS: KPIs (`StatCard`), gráfico semanal (`MiniChart`), ofertas, oportunidades y eventos; sidebar glass con toggle. |
| **Perfil público** | Card vertical simple. | Estilo LinkedIn: banner, avatar, stats, sobre mí, logros, skills por nivel y portafolio. |
| **Editar perfil** | Inputs slate hardcodeados. | Migrado a tokens del sistema (theme-aware). |
| **Proyectos / placeholders** | Texto plano "placeholder". | Tokens del sistema + `EmptyState` premium consistente. |
