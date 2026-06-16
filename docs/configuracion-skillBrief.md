# PROMPT PARA CLAUDE CODE — Feature "Brief Builder" (Agente de IA)

> **Cómo usar este archivo:** copia TODO el contenido desde la línea "===== INICIO DEL PROMPT =====" hasta el final y pégalo como tu primer mensaje en Claude Code, dentro de tu repositorio del marketplace ya abierto. Está escrito para que Claude Code trabaje por fases, te muestre lo que hará antes de tocar archivos, y deje todo funcional.

---

## Notas para ti (Yarvis) — léelas, NO las pegues

Esto es lo que el prompt ya tiene resuelto, para que no te agarre por sorpresa:

1. **No es una "skill" de Claude Code, es una feature de software.** Lo que describiste (Next.js + API + orquestador de IA) es una aplicación. El prompt le pide a Claude Code que construya esa feature dentro de tu repo existente.
2. **Fallback real, no decorativo.** El prompt obliga a validar la salida con Zod y a *lanzar error a propósito* cuando el JSON viene mal, para que el fallback al siguiente modelo de verdad se dispare. Tu `try/catch` original solo cubría caídas del servidor, no respuestas malas.
3. **Dos formas de salida = schema con `discriminatedUnion`.** "preguntando" y "brief_final" son dos shapes distintos. El prompt usa un único Zod discriminado por el campo `fase`.
4. **IDs de modelo NO hardcodeados.** Van en `.env.local` y en un archivo de config. El prompt le ordena a Claude Code verificar los IDs vigentes en la doc de OpenRouter antes de usarlos. No se inventan nombres de modelo.
5. **Claves de API:** las pones tú, server-side. El prompt prohíbe exponerlas al cliente y prohíbe que Claude Code escriba tus claves.
6. **El empresario manda siempre.** Saltar, escribir libre, sobrescribir, terminar antes — todo eso es requisito de UI, no opcional.

**Lo que tú tienes que hacer manualmente (el prompt te lo recuerda al final):**
- Crear cuenta en OpenRouter y poner `OPENROUTER_API_KEY` en `.env.local`.
- Confirmar los IDs de modelo vigentes (Claude / Gemini / GPT) en la página de modelos de OpenRouter.

---

===== INICIO DEL PROMPT =====

# TAREA: Construir la feature "Brief Builder" en este repositorio

Eres un ingeniero senior trabajando dentro de mi repositorio existente. Vamos a construir una feature llamada **Brief Builder**: un agente de IA que toma la idea corta y no técnica de un empresario y, mediante preguntas guiadas de opción múltiple, produce un **brief técnico estructurado (JSON)** que rellena el formulario de publicación de un marketplace que conecta empresarios con programadores.

Trabaja **por fases**. Al terminar cada fase, haz una pausa breve, dime qué hiciste y qué sigue, y espera mi "ok" antes de continuar con cambios grandes. No reescribas archivos existentes sin avisarme.

## Principios que NO puedes violar

1. **El empresario tiene control total.** La IA solo SUGIERE; el empresario SIEMPRE decide. Debe poder: saltar cualquier pregunta, escribir texto libre, sobrescribir cualquier sugerencia (incluido el stack tecnológico), añadir lo que quiera, y terminar antes de tiempo generando el brief con lo que haya. Nunca bloquees el avance por respuestas faltantes.
2. **Nunca expongas claves de API al cliente.** Toda llamada a modelos de IA ocurre en el servidor (API route / server action). Las claves van en variables de entorno server-side.
3. **No inventes IDs de modelo.** Los IDs de los modelos los verificas en la documentación vigente de OpenRouter y los dejas en config/env. Si no puedes verificar uno, usa un placeholder claramente marcado `# CONFIRMAR ID` y avísame.
4. **No escribas mis claves de API.** Si un archivo `.env.local` necesita claves, deja los nombres de variable y un valor placeholder; yo pongo las claves reales.
5. **Validación antes de confiar.** Toda respuesta de un modelo se valida con Zod antes de devolverla. JSON inválido = error que dispara el fallback.

---

## FASE 0 — Reconocimiento del repositorio (no escribas código todavía)

Antes de tocar nada, inspecciona el repo y repórtame:

- Framework y versión (Next.js App Router vs Pages Router; versión exacta).
- Gestor de paquetes (npm / pnpm / yarn).
- TypeScript sí/no. Configuración de Tailwind / librería de UI existente.
- Dónde viven las rutas de API y los componentes (estructura de carpetas).
- Si ya existe el formulario de publicación de proyecto: dónde está y qué campos tiene (necesito mapear el brief a esos campos).
- Si ya hay alguna integración de IA o variables de entorno relacionadas.

Entrégame un resumen corto y **un plan de integración** que respete las convenciones que ya existen en el repo. Si algo del diseño que propongo abajo choca con el repo, dímelo y propón la adaptación. **Espera mi ok antes de la Fase 1.**

---

## FASE 1 — Contrato de datos (el schema es la fuente de verdad)

Crea el schema Zod que define las DOS formas de respuesta del agente, discriminadas por el campo `fase`. Este schema lo usan tanto el backend (validación + structured output) como el frontend (tipos).

Archivo sugerido: `lib/brief/schema.ts` (ajusta la ruta a las convenciones del repo).

```ts
import { z } from "zod";

// Forma 1: el agente está haciendo una pregunta
export const PreguntaSchema = z.object({
  fase: z.literal("preguntando"),
  progreso: z.object({
    actual: z.number().int().min(1),
    total_estimado: z.number().int().min(1),
  }),
  pregunta: z.object({
    id: z.string(),
    texto: z.string(),
    por_que: z.string(),
    tipo_seleccion: z.enum(["unica", "multiple"]),
    opciones: z.array(z.string()).min(2), // SIEMPRE incluye "Otro (especificar)" como última opción
  }),
});

// Forma 2: el agente entrega el brief final
export const BriefFinalSchema = z.object({
  fase: z.literal("brief_final"),
  nombre_proyecto: z.string(),
  resumen_ejecutivo: z.string(),
  descripcion_detallada: z.string(),
  requisitos_funcionales: z.array(z.string()),
  stack_sugerido: z.object({
    es_sugerencia: z.boolean(),
    nota: z.string(),
    opciones: z.array(
      z.object({ nombre: z.string(), pros: z.string(), contras: z.string() })
    ),
    stack_fijado_por_empresario: z.string().nullable(),
  }),
  entregables: z.array(z.string()),
  criterios_de_aceptacion: z.array(z.string()),
  estimacion: z.object({
    es_orientativa: z.boolean(),
    presupuesto_rango: z.string(),
    plazo_rango: z.string(),
  }),
  nivel_experiencia_requerido: z.string(),
  categorias_tags: z.array(z.string()),
  preguntas_abiertas_para_el_freelancer: z.array(z.string()),
  campos_a_confirmar: z.array(z.string()),
  // Bloque del segundo agente (opcional, se rellena solo si el analizador corre):
  analisis_tecnico: z
    .object({
      riesgos_detectados: z.array(z.string()),
      supuestos_realizados: z.array(z.string()),
      preguntas_criticas_faltantes: z.array(z.string()),
    })
    .nullable()
    .optional(),
});

export const RespuestaAgenteSchema = z.discriminatedUnion("fase", [
  PreguntaSchema,
  BriefFinalSchema,
]);

export type RespuestaAgente = z.infer<typeof RespuestaAgenteSchema>;
```

Exporta también los tipos TypeScript inferidos. **Espera mi ok.**

---

## FASE 2 — System prompt compartido

Crea `lib/brief/prompt.ts` que exporte el system prompt como una constante única (lo usan todos los modelos, para comportamiento consistente). Usa EXACTAMENTE este contenido como base (puedes inyectar el schema JSON al final por código, no lo dupliques a mano):

```
# ROL
Eres "Brief Builder", el asistente de IA de un MARKETPLACE que conecta EMPRESARIOS
con PROGRAMADORES. Tu usuario es siempre un EMPRESARIO: una persona de negocio que
normalmente NO sabe de tecnología y que describe un problema o una idea de forma
corta e informal.

# CÓMO FUNCIONA LA PÁGINA (contexto)
El empresario publica un "proyecto" pero escribe poco y en lenguaje no técnico
(ej.: "quiero una app para vender mis pasteles"). Los programadores necesitan una
descripción clara, estructurada y técnica para postularse con propuesta, precio y
plazo. Tu trabajo es cerrar esa brecha: tomas la idea corta, haces pocas preguntas
guiadas y fáciles (el empresario solo elige opciones), y produces un brief completo
y técnico. El brief rellena automáticamente el formulario de publicación.

# PRINCIPIO INVIOLABLE: EL EMPRESARIO TIENE EL CONTROL TOTAL
Tú solo SUGIERES; él SIEMPRE decide. Puede saltar cualquier pregunta, escribir texto
libre, añadir lo que quiera y sobrescribir cualquier sugerencia tuya, INCLUIDO el
stack tecnológico. Nunca impongas nada ni bloquees el avance por respuestas
faltantes. Si decide terminar antes, generas el brief con lo que haya.

# PROCESO (5 fases)
1. ENTRADA: recibes la idea inicial (puede ser una sola frase vaga).
2. CLASIFICACIÓN (interna y silenciosa): identifica el tipo de proyecto
   (app móvil, sitio/web app, e-commerce, automatización de procesos,
   integración/API, IA o análisis de datos, diseño/landing, otro). De esto depende
   qué preguntas tienen sentido. NO muestres esta clasificación.
3. PREGUNTAS ADAPTATIVAS: genera entre 3 y 6 preguntas SEGÚN el tipo de proyecto y
   cuánta información falte. Cada pregunta:
   - Opción múltiple con 2 a 4 opciones concretas y realistas.
   - Indica si es de selección única o múltiple.
   - Incluye SIEMPRE una opción "Otro (especificar)" de texto libre.
   - Acompáñala de una frase corta de POR QUÉ la preguntas.
   - Respeta los botones "Saltar" y "Terminar ahora" que el sistema muestra.
   - NO repreguntes algo que la idea inicial ya respondió.
   Pocas preguntas si la idea ya es rica; hasta 6 si es muy ambigua. Nunca abrumes.
4. SÍNTESIS: cuando el empresario termine o salte, redacta el brief final en el
   ESQUEMA DE SALIDA JSON. Lenguaje claro en el resumen; preciso y técnico en lo que
   leerá el desarrollador. Conserva LITERALMENTE toda preferencia explícita del
   empresario. No inventes datos de negocio que no dio: márcalos como "a confirmar".
5. REFINAMIENTO: tras entregar el brief, ofrece editar o profundizar cualquier
   sección.

# REGLAS DEL STACK TECNOLÓGICO
- Propón 2 o 3 stacks con una frase de pro/contra cada uno.
- Etiqueta SIEMPRE el stack como "Sugerencia — el empresario puede cambiarlo".
- Si el empresario ya nombró tecnologías, trátalas como REQUISITO FIJO y no las
  cambies; como mucho, señala consideraciones sin imponer.

# ESTILO
Cálido, simple y sin jerga al PREGUNTAR (hablas con alguien no técnico). Preciso y
técnico al REDACTAR el brief final (lo lee un desarrollador). No uses emojis salvo
que el usuario los use.

# SALIDA
Responde SIEMPRE en JSON válido siguiendo el esquema indicado por el sistema.
Mientras haya preguntas pendientes, devuelve fase "preguntando". Cuando generes el
brief, devuelve fase "brief_final". No escribas texto fuera del JSON.
```

Además, crea `lib/brief/question-banks.ts` con los bancos de arranque por tipo de proyecto (el modelo los usa como guía, no como guion fijo):

- **App móvil:** plataforma (iOS / Android / Ambas); funciones principales (selección múltiple); método de registro de usuarios.
- **Sitio / web app:** objetivo principal (vender / captar clientes / gestión interna); ¿necesita panel de administración?; ¿ya tiene dominio o identidad de marca?
- **E-commerce:** volumen de productos; pasarelas de pago deseadas; ¿gestión de inventario y envíos?
- **Automatización de procesos:** formato de entrada/salida de datos (PDF / Excel / Word); herramientas actuales (Excel / ERP / correo); volumen o frecuencia.
- **Integración / API:** qué sistemas conectar; dirección de la sincronización; frecuencia.
- **IA o datos:** qué decisión o tarea resolver; qué datos posee ya; ¿necesita panel de visualización?
- **Transversal (última pregunta):** presupuesto aproximado y plazo deseado, con opción "no estoy seguro, sugiéreme tú" (alimenta el bloque de estimación).

**Espera mi ok.**

---

## FASE 3 — Capa de IA con OpenRouter + fallback + validación

Crea la capa de abstracción de IA. Decisión de arquitectura tomada: **OpenRouter** como único endpoint (un solo `OPENROUTER_API_KEY`, varios modelos). Usa el cliente OpenAI-compatible apuntando al baseURL de OpenRouter, o `fetch` directo a su endpoint de chat completions.

### 3.1 Config de modelos — `lib/brief/models.ts`
- Define el orden de fallback: **principal = Claude**, **fallback 1 = Gemini**, **fallback 2 = GPT**.
- Los IDs de modelo se leen de variables de entorno, con un default documentado. **VERIFICA los IDs vigentes en la página de modelos de OpenRouter antes de fijarlos**; si no puedes verificarlos en este momento, deja el valor como `"CONFIRMAR_ID"` y márcalo con un comentario `// CONFIRMAR en openrouter.ai/models`.
- Estructura sugerida:

```ts
export const MODEL_CHAIN = [
  { label: "claude",  id: process.env.BRIEF_MODEL_PRIMARY  ?? "CONFIRMAR_ID" },
  { label: "gemini",  id: process.env.BRIEF_MODEL_FALLBACK1 ?? "CONFIRMAR_ID" },
  { label: "gpt",     id: process.env.BRIEF_MODEL_FALLBACK2 ?? "CONFIRMAR_ID" },
];
```

### 3.2 Orquestador — `lib/brief/orchestrator.ts`
Implementa `generateBrief(messages, { runAnalyzer }: { runAnalyzer?: boolean })`:

1. Recorre `MODEL_CHAIN` en orden.
2. Para cada modelo: llama a OpenRouter pidiendo salida JSON. Donde el modelo lo soporte, usa `response_format` para forzar JSON; **no asumas que todos lo soportan** — algunos modelos de OpenRouter ignoran `response_format`. Por eso el paso siguiente es obligatorio.
3. **Parseo robusto + validación Zod:** extrae el JSON de la respuesta (incluso si viene envuelto en texto o en un bloque ```), hazle `JSON.parse`, y valídalo con `RespuestaAgenteSchema.safeParse`.
   - Si el parseo o la validación fallan → **lanza error** (no devuelvas basura). Eso pasa al siguiente modelo de la cadena.
   - Permite **1 reintento** dentro del mismo modelo antes de caer al siguiente (a veces el segundo intento ya devuelve JSON limpio).
4. Si **todos** los modelos fallan, devuelve un objeto de error controlado (NO lances al cliente una pantalla rota). El frontend debe poder mostrar "No pude generar la sugerencia ahora, pero puedes continuar manualmente" y dejar al empresario seguir — coherente con el principio de control total.
5. Loguea (server-side) qué modelo respondió y cuántos reintentos hubo, para depurar.

> Nota sobre fallback nativo de OpenRouter: OpenRouter ofrece un mecanismo propio de fallback entre modelos (revisa su doc vigente, p. ej. el parámetro de lista de modelos / routing). PUEDES usarlo como capa extra, pero implementa igualmente el fallback explícito en la aplicación: es el que controlas y el que valida con Zod. No dependas solo del routing del proveedor.

### 3.3 Segundo agente — `lib/brief/analyzer.ts` (opcional, con toggle)
- Solo corre si `runAnalyzer === true` (toggle controlado por env `BRIEF_ENABLE_ANALYZER` y/o por un flag en el request).
- Toma el `brief_final` ya generado y lo manda a un modelo (mismo OpenRouter, puede ser un modelo más barato) con un system prompt de **revisor técnico** que detecta: ambigüedades, requisitos faltantes, riesgos, alcance oculto, dependencias externas.
- Devuelve y se valida (Zod) el bloque:
```json
{ "riesgos_detectados": [], "supuestos_realizados": [], "preguntas_criticas_faltantes": [] }
```
- Ese bloque se inserta en `analisis_tecnico` del brief. Si el analizador falla, el brief se entrega igual SIN ese bloque (nunca rompas el flujo principal por el agente opcional).

**Espera mi ok.**

---

## FASE 4 — API route (servidor)

Crea la ruta `POST /api/brief` (ajusta a App Router o Pages Router según la Fase 0).

- **Entrada:** `{ messages: ChatMessage[], runAnalyzer?: boolean }`. El frontend conserva el historial completo y lo reenvía en cada llamada → el backend es **stateless** (sin base de datos al inicio).
- Llama a `generateBrief(messages, { runAnalyzer })`.
- **Salida:** el JSON validado (forma `preguntando` o `brief_final`), o el objeto de error controlado.
- Server-side only. La `OPENROUTER_API_KEY` nunca llega al cliente.
- Maneja: body inválido, timeouts, y el caso "todos los modelos cayeron".

**Espera mi ok.**

---

## FASE 5 — UI del flujo (respetando el control total del empresario)

Construye la UI tipo conversación guiada, siguiendo las convenciones de componentes del repo. Componentes mínimos:

1. **Entrada inicial:** un campo donde el empresario escribe su idea en una frase. Botón "Empezar".
2. **Tarjeta de pregunta** (cuando `fase === "preguntando"`):
   - Muestra `pregunta.texto` y, en chico/secundario, `pregunta.por_que`.
   - Renderiza `opciones` como botones. Si `tipo_seleccion === "multiple"`, permite marcar varias; si es `"unica"`, una sola.
   - La opción "Otro (especificar)" abre un campo de **texto libre**.
   - Barra de progreso con `progreso.actual / progreso.total_estimado`.
   - Botones SIEMPRE visibles: **"Saltar"** (avanza sin responder) y **"Terminar ahora"** (fuerza la generación del brief con lo que haya).
   - El empresario puede, además, escribir texto libre en cualquier momento aunque haya opciones.
3. **Vista del brief final** (cuando `fase === "brief_final"`):
   - Muestra cada sección del brief de forma legible.
   - **Cada sección es editable** por el empresario (sobrescribir resumen, requisitos, etc.).
   - En el stack: muestra las opciones con pros/contras y la etiqueta "Sugerencia — el empresario puede cambiarlo", con un campo para fijar su propio stack (`stack_fijado_por_empresario`).
   - Si existe `analisis_tecnico`, muéstralo en una sección aparte ("Revisión técnica") claramente marcada como apoyo.
   - Botón **"Rellenar formulario de publicación"** que mapea el brief a los campos del formulario existente (usa el mapeo detectado en la Fase 0). Si un campo del brief no tiene equivalente, déjalo accesible para copiar.
   - Botón **"Refinar"** / "Editar una sección" que reanuda la conversación pidiéndole al modelo profundizar en una sección concreta.
4. **Estado del lado del cliente:** mantén el array `messages` en el estado del componente y reenvíalo en cada `POST /api/brief`. Cada turno del empresario (selección, texto libre, saltar, terminar) se traduce a un mensaje `user` legible antes de enviarlo.
5. **Manejo de error de IA:** si el backend devuelve el error controlado, muestra un aviso amable y deja al empresario continuar manualmente (rellenar el formulario a mano). Nunca pantalla en blanco.

**Espera mi ok.**

---

## FASE 6 — Variables de entorno y documentación

- Crea/actualiza `.env.example` (NO `.env.local` con claves reales) con:
  ```
  OPENROUTER_API_KEY=
  BRIEF_MODEL_PRIMARY=
  BRIEF_MODEL_FALLBACK1=
  BRIEF_MODEL_FALLBACK2=
  BRIEF_ENABLE_ANALYZER=false
  ```
- Crea un `README` corto de la feature (`lib/brief/README.md`) explicando: arquitectura, cómo cambiar el orden de modelos, cómo activar el segundo agente, y los pasos manuales que debo hacer yo (poner la API key, confirmar IDs de modelo en openrouter.ai/models).
- **Recuérdame explícitamente** en tu mensaje final: (a) crear la cuenta de OpenRouter y pegar la key, y (b) confirmar los IDs de modelo vigentes.

---

## FASE 7 — Pruebas y verificación (no te saltes esto)

1. **Tipos y build:** corre el typecheck / build del proyecto y deja todo en verde.
2. **Test del schema:** un test que valide que un `preguntando` de ejemplo y un `brief_final` de ejemplo pasan `RespuestaAgenteSchema`, y que un JSON malo es rechazado.
3. **Test del fallback (mock):** simula que el modelo principal devuelve JSON inválido y verifica que la cadena cae al siguiente y que un JSON válido finalmente se devuelve. No necesitas pegar a la API real para esto: mockea la llamada.
4. **Prueba manual end-to-end:** documenta los pasos para probar con "quiero una app para vender mis pasteles" → debe generar 3-6 preguntas adaptativas → al "Terminar ahora" debe entregar un `brief_final` válido.
5. Repórtame qué probaste, qué pasó y qué quedó pendiente.

---

## Restricciones finales (recordatorio)

- No bloquees nunca al empresario por falta de respuestas.
- No expongas claves al cliente. No escribas mis claves reales en ningún archivo.
- No inventes IDs de modelo ni features de OpenRouter que no puedas verificar; si dudas, márcalo `// CONFIRMAR` y dímelo.
- Toda salida de modelo se valida con Zod antes de usarse.
- Respeta las convenciones del repo existente; no reescribas archivos sin avisarme.

Empieza por la **FASE 0** y espera mi ok entre fases.

===== FIN DEL PROMPT =====