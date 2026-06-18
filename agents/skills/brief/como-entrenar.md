# Como entrenar la skill Brief — Guia diaria

Este documento explica como identificar problemas en el comportamiento de la IA y como corregirlos de forma sistematica. El objetivo es que cada dia de uso deje el skill un poco mejor que el dia anterior.

---

## Donde viven los prompts

| Que cambiar | Archivo |
|---|---|
| Preguntas que genera la IA | `src/lib/ia-preguntas.ts` → constante `SISTEMA` |
| Descripcion y titulo que genera la IA | `src/lib/ia-proyecto.ts` → constante `PROMPT_SISTEMA` |
| Formato JSON esperado | Las secciones "Devuelve UNICAMENTE el siguiente JSON" dentro de cada prompt |

Despues de cualquier cambio: `npx tsc --noEmit` para verificar que no hay errores de TypeScript, y actualizar `entrenamiento.md` con la nueva version del prompt.

---

## Ciclo de mejora diaria

### 1. Observar

Usar el flujo completo en `localhost:3000/es/empresario/nuevo-proyecto` con distintos tipos de brief:

| Tipo | Ejemplo |
|---|---|
| Brief muy corto | "quiero una app" |
| Brief sin terminos tecnicos | "necesito algo para llevar mis pedidos" |
| Brief de un sector especifico | "tenemos una clinica y queremos citas online" |
| Brief ya detallado | "necesito un sistema con login, roles admin/cliente, CRUD de productos y exportacion a Excel" |
| Brief ambiguo o mixto | "ocupo una skill para automatizar correos electronicos" |

### 2. Evaluar las preguntas generadas

Preguntas buenas:
- Son especificas al brief recibido (no genericas)
- Hablan del producto, no del proceso de contratacion
- Las opciones tienen sentido para ese tipo de negocio
- El empresario puede responderlas sin saber de tecnologia

Preguntas malas (agregar a PROHIBIDAS si aparecen):
- Mencionan al equipo, los estudiantes, el marketplace, presupuesto o plazo
- Son identicas sin importar el brief (demasiado genericas)
- Tienen opciones tecnicas que el empresario no entiende
- Preguntan algo que ya estaba explicito en el brief

### 3. Evaluar la descripcion generada

Descripcion buena:
- Suena como si el empresario la hubiera escrito
- Esta en primera persona del plural ("Nuestro negocio...", "Queremos...")
- Texto fluido con conectores, sin listas ni bullets
- Un estudiante universitario podria leerla y entender que tiene que construir
- El titulo es especifico y refleja el rubro y el valor del proyecto

Descripcion mala:
- Suena a documentacion tecnica fria o a una especificacion de requisitos
- Usa listas, guiones o estructuras rigidas
- El titulo es generico ("Sistema de gestion", "Plataforma web")
- Dice "no hay informacion suficiente" o pide mas contexto
- Repite exactamente lo que el empresario escribio sin agregar valor

### 4. Registrar y corregir

Si se identifica un problema:

1. Abre `src/lib/ia-preguntas.ts` o `src/lib/ia-proyecto.ts`
2. Localiza la seccion del prompt donde deberia estar la regla
3. Agrega la regla como ejemplo concreto en PERMITIDAS o PROHIBIDAS
4. Prueba el mismo brief que fallo
5. Si mejora: actualizar `entrenamiento.md` y agregar una entrada a `historial-mejoras.md`

---

## Patrones de fallo conocidos y su solucion

### La IA genera JSON dentro de bloques markdown

**Sintoma**: error en el log `[ia-preguntas] No se pudo extraer JSON`
**Causa**: el modelo gratuito activo en ese momento ignora la instruccion "JSON puro"
**Solucion actual**: `extraerJSON()` maneja esto automaticamente con 3 intentos

Si el problema persiste mas de 3 dias seguidos, considerar:
- Usar un modelo especifico en vez de `openrouter/free`
- Agregar la instruccion en el mensaje de usuario ademas del sistema

### Las preguntas son identicas sin importar el brief

**Sintoma**: el empresario escribe briefs completamente distintos y las 3 preguntas son siempre las mismas
**Causa**: el modelo esta ignorando el brief y usando plantillas propias
**Solucion**: agregar al principio del mensaje de usuario: "BRIEF ESPECIFICO DEL EMPRESARIO (adapta TODAS tus preguntas a esta idea en particular):"

### La descripcion es muy corta o no llega a 200 palabras

**Sintoma**: descripcion de 2-3 oraciones, sin detalle
**Causa**: el modelo no siguio la instruccion de minimo 200 palabras
**Solucion**: reformular la instruccion con mas enfasis: "OBLIGATORIO: la descripcion debe tener MINIMO 200 palabras. Cuenta las palabras antes de responder. Si tienes menos de 200, expande con mas detalles del negocio, los usuarios o las funcionalidades."

### El titulo sigue siendo generico

**Sintoma**: titulos como "Sistema de automatizacion de correos" o "Plataforma de gestion"
**Causa**: el modelo no esta leyendo suficiente contexto especifico del brief
**Solucion**: agregar ejemplos de titulos buenos y malos en el prompt:
```
TITULOS MALOS (no usar):
- "Sistema de gestion de X"
- "Plataforma web de X"
- "Aplicacion para X"

TITULOS BUENOS (este nivel de especificidad):
- "Portal de reservas y turnos para clinica odontologica en Costa Rica"
- "App movil de pedidos con menu QR para el Sushi Bar Nakama"
- "Herramienta de automatizacion de correos de seguimiento para agencia inmobiliaria"
```

---

## Checklist antes de dar por buena una iteracion del prompt

- [ ] Se probaron al menos 5 tipos de brief distintos
- [ ] Las preguntas son contextuales (distintas para briefs distintos)
- [ ] Ninguna pregunta menciona equipo, budget, plazos, marketplace o estudiantes
- [ ] La descripcion esta en primera persona del plural y fluye como texto natural
- [ ] El titulo es especifico al rubro del empresario
- [ ] El JSON siempre parsea correctamente (revisar consola del servidor)
- [ ] No hay errores de TypeScript (`npx tsc --noEmit`)
- [ ] Se actualizo `entrenamiento.md` con la version nueva del prompt
- [ ] Se agrego una entrada en `historial-mejoras.md`

---

## Cuando considerar cambiar de modelo

El modelo `openrouter/free` es adecuado para desarrollo y pruebas. Considerar un modelo pago cuando:

- Los fallos ocurren mas de 2 veces por hora en produccion
- La calidad de las preguntas o descripciones es sistematicamente baja
- Los tiempos de respuesta superan los 10 segundos regularmente

Modelos recomendados para escalar (en orden de costo/calidad):
1. `google/gemini-flash-1.5` — rapido, barato, buen JSON
2. `anthropic/claude-haiku-4-5` — muy confiable, soporte nativo de JSON
3. `anthropic/claude-sonnet-4-6` — maxima calidad, costo mas alto
