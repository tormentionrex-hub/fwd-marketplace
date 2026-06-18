# Historial de mejoras — Skill Brief

Registro cronologico de cada iteracion del skill. Sirve para entender por que el entrenamiento llego a donde esta y que no repetir.

---

## Iteracion 1 — Formulario manual sin IA
**Fecha**: antes de 2026-06-16
**Estado**: descartado

El empresario llenaba un formulario manual con campos de titulo, descripcion, area, tecnologias. No habia asistencia de IA. El flujo era estatico y dependia de que el empresario supiera redactar una descripcion tecnica, lo que resultaba en proyectos mal descritos o vacios.

---

## Iteracion 2 — Chat con burbujas (chatbot)
**Fecha**: 2026-06-16
**Estado**: rechazado por el usuario

Se implemento un chat de ida y vuelta estilo ChatGPT: burbujas de mensajes, el empresario escribia en un input y la IA respondia mensaje a mensaje. El usuario lo rechazo:

> "veo que cambiaste todo ese apartado y lo devolviste a como un chatbot, no quiero eso, quiero que siga el diseño de antes"

**Leccion**: el flujo debe sentirse como un formulario guiado, no como un chat.

---

## Iteracion 3 — Flujo multi-paso estilo Freelancer.com
**Fecha**: 2026-06-16
**Estado**: base actual, en mejora continua

Se reimplemento el flujo inspirado en Freelancer.com/post-project:
- Textarea libre para el brief
- Preguntas aparecen una a la vez con opciones de seleccion
- Contador "1 de 3"
- Al terminar: overlay de generacion y redirect al formulario pre-llenado

El usuario aprobo este diseño.

---

## Iteracion 4 — Modelo openrouter/free
**Fecha**: 2026-06-16
**Estado**: activo

Se migro de Gemini (SDK de Google) a `openrouter/free` que rota entre 24 modelos gratuitos. Ventaja: costo cero. Desventaja: menor consistencia en el formato de salida.

**Problema encontrado**: algunos modelos gratuitos devuelven el JSON envuelto en bloques markdown (` ```json {...} ``` `), lo que rompe `JSON.parse()` directamente.

**Solucion**: funcion `extraerJSON()` con 3 intentos en cascada:
1. `JSON.parse()` directo
2. Extraer contenido de bloque ` ```json ``` `
3. Regex para encontrar el primer `{...}` en el texto

**Ademas**: se elimino `response_format: { type: 'json_object' }` del body porque varios modelos gratuitos no lo soportan y fallaban silenciosamente.

---

## Iteracion 5 — Spinner prematuro
**Fecha**: 2026-06-16
**Estado**: corregido

El spinner "Haciendolo realidad..." aparecia al hacer clic en "Proximo" antes de que la IA generara las preguntas. El usuario lo reporto:

> "cuando el empresario ponga la idea simple o clara de inmediante le van a salir preguntas hacia abajo... solo cuando se hayan realizado las 7 o 10 preguntas maximo ahora si podra salir dicha animacion, pero solo al final"

**Solucion**: se elimino el estado `cargando-preguntas` como estado de pantalla completa. Se reemplazo por `cargandoPreguntas: boolean` que muestra tres puntos animados debajo del textarea mientras se cargan las preguntas, sin cambiar de pantalla.

---

## Iteracion 6 — Preguntas irrelevantes
**Fecha**: 2026-06-16
**Estado**: corregido con entrenamiento de prompt

La IA generaba preguntas como "Con quien trabajaran los estudiantes en este proyecto?" — completamente fuera de contexto. El usuario lo reporto con una captura de pantalla.

> "este tipo de pregunta es inecesario, entrena a los agentes para solo realizar preguntas para realizar una descripcion a lo que solicita el empresario... no le preguntes cosas personales o con quien trabajaran porque no tiene que ver"

**Solucion**: se agrego en el prompt del Agente 1 una lista explicita de PREGUNTAS PERMITIDAS y PREGUNTAS PROHIBIDAS. La lista prohibida incluye explicitamente: equipo, presupuesto, plazos, datos personales, proceso de contratacion, el marketplace y los estudiantes.

---

## Iteracion 7 — Descripcion con formato de documentacion tecnica fria
**Fecha**: 2026-06-17
**Estado**: corregido con entrenamiento de prompt

La descripcion generada usaba listas, guiones y lenguaje de especificacion tecnica ("Backend RESTful y una aplicacion movil nativa hibrida. El backend gestionara..."). El usuario pidio un cambio de tono:

> "Quiero que el agente a la hora de dar la descripcion actue como un asistente especializado en transformar solicitudes de proyectos empresariales en descripciones claras y profesionales. La respuesta debe sentirse como una persona explicando su necesidad."

**Solucion**: se reescribio el prompt del Agente 2 para que redacte en primera persona del plural ("Nuestro negocio busca...", "Queremos desarrollar..."), con conectores naturales, sin listas ni bullets. Texto narrativo continuo de minimo 200 palabras.

**Ademas**: el titulo ahora debe ser original y especifico al rubro, no generico.

---

## Iteracion 8 — Error al generar y seleccion bloqueada
**Fecha**: 2026-06-17
**Estado**: corregido

Dos problemas reportados simultaneamente:

**Problema A**: error "No pudimos generar el proyecto. Intenta de nuevo en unos segundos." aparecia porque `openrouter/free` es intermitente. Al fallar, el componente volvia al paso `brief` perdiendo el contexto de respuestas.

**Solucion A**:
- Reintento automatico en servidor (1 intento extra con 1.2s de espera)
- Boton "Reintentar generacion" en la UI cuando hay contexto guardado y se volvio al brief

**Problema B**: el empresario no podia seleccionar todas las opciones que quisiera porque la logica de `radio` sobreescribia la seleccion anterior.

**Solucion B**:
- Se elimino toda la logica de tipo `radio` del componente
- Todas las opciones se comportan como checkbox: el empresario selecciona las que quiera
- El Agente 1 ahora genera todas las preguntas con `tipo: "checkbox"`
- El indicador visual siempre es cuadrado (no circular)

---

## Proximas mejoras identificadas (pendientes)

- [ ] Agregar contexto del sector del empresario al brief (si ya lo tiene en el perfil)
- [ ] Mejorar las opciones cuando el brief es muy corto (menos de 30 palabras)
- [ ] Detectar si el brief ya incluye suficiente detalle y saltar algunas preguntas
- [ ] Medir cuantos empresarios usan "Saltar" vs responder — si muchos saltan la misma pregunta, esa pregunta no es util
- [ ] Agregar una 4a pregunta opcional si el brief es ambiguo
- [ ] Probar con modelo especifico en openrouter en lugar del router `free` para mayor consistencia
