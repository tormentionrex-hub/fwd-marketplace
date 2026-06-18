# Skill: Brief — Creacion de proyectos con IA

## Que hace esta skill

La skill **Brief** es el flujo completo que permite a un empresario en FWD Marketplace describir su idea de negocio de forma libre y convertirla automaticamente en un proyecto estructurado listo para publicar.

El empresario no necesita saber de tecnologia. Puede escribir algo tan simple como "ocupo una app para mi restaurante" y la IA genera las preguntas correctas, interpreta las respuestas y produce una descripcion tecnica completa junto con titulo, area de negocio, plazo estimado y stack de tecnologias.

---

## Flujo completo (estado actual)

```
[PASO 1] Empresario escribe su idea libre en el textarea (brief)
         → Hace clic en "Proximo" o Ctrl+Enter
         → Animacion de puntos "Fordy esta leyendo tu idea..."

[PASO 2] IA genera 3 preguntas contextuales (POST /api/proyectos/preguntas-ia)
         → Las preguntas aparecen una por una estilo Freelancer.com
         → El empresario puede marcar TODAS las opciones que quiera (checkbox libre)
         → Puede saltar cualquier pregunta
         → Puede usar "Utilice mi descripcion anterior" para saltarse todas

[PASO 3] Al responder la ultima pregunta:
         → Overlay "Haciendolo realidad..." con animacion giratoria
         → POST /api/proyectos/generar-ia con brief + respuestas
         → IA genera: titulo original, descripcion narrativa, areaNegocio, plazoDias, tecnologias

[PASO 4] Se crea el borrador real en la base de datos
         → Redirect automatico a /empresario/proyectos/{id}/editar
         → Formulario pre-llenado con todo lo generado
         → El empresario revisa, ajusta si quiere, y publica
```

---

## Archivos de esta skill

| Archivo | Rol |
|---|---|
| `src/lib/ia-preguntas.ts` | Llama a OpenRouter y genera las 3 preguntas (server-only) |
| `src/lib/ia-proyecto.ts` | Llama a OpenRouter y genera el proyecto estructurado (server-only) |
| `src/app/api/proyectos/preguntas-ia/route.ts` | Endpoint POST que expone ia-preguntas al frontend |
| `src/app/api/proyectos/generar-ia/route.ts` | Endpoint POST que expone ia-proyecto al frontend |
| `src/components/features/empresario/crear-con-ia.tsx` | UI completa del flujo multi-paso |
| `src/app/[locale]/(empresario)/empresario/nuevo-proyecto/page.tsx` | Pagina que monta el componente |
| `src/server/validation/proyectos.schema.ts` | Schemas Zod: preguntasIaSchema, generarProyectoIaSchema |

---

## Proveedor de IA

- **Modelo**: `openrouter/free` — router de OpenRouter que distribuye entre ~24 modelos gratuitos
- **URL**: `https://openrouter.ai/api/v1/chat/completions`
- **Variable de entorno**: `OPENROUTER_API_KEY`
- **Resilencia**: reintentos automaticos (1 reintento con 1.2s de espera) ante fallos transitorios
- **Extraccion JSON**: fallback triple (parse directo → bloque markdown → regex `{...}`) porque los modelos gratuitos a veces envuelven el JSON en markdown

---

## Contexto del negocio (lo que la IA debe saber)

FWD Marketplace es una plataforma costarricense donde empresas y emprendedores publican proyectos tecnologicos para que equipos de estudiantes universitarios los desarrollen. El empresario paga, los estudiantes aplican y construyen.

La IA debe generar proyectos que:
- Sean comprensibles para un equipo de desarrollo universitario
- Tengan suficiente detalle tecnico para que los estudiantes sepan que hacer
- Sean reales, especificos y motivadores para que los estudiantes quieran postularse
