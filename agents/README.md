# Agents — FWD Marketplace

Documentacion de todos los agentes de IA y automatizaciones del proyecto.

## Estructura

```
agents/
  skills/
    brief/          <- Flujo "Crear con IA": brief -> preguntas -> proyecto
  automatizaciones/ <- Tareas programadas y flujos sin intervencion manual
```

## Skills disponibles

| Skill | Ruta | Estado |
|---|---|---|
| Brief | `skills/brief/` | Activo en produccion |

## Como leer esta documentacion

Cada skill tiene su propia carpeta con cuatro archivos:

- `README.md` — que hace, flujo completo, archivos involucrados
- `entrenamiento.md` — prompts actuales, reglas y parametros de la IA
- `historial-mejoras.md` — registro de cada iteracion con el problema y la solucion
- `como-entrenar.md` — guia para seguir mejorando el skill dia a dia

Cuando se haga una mejora a cualquier agente, actualizar siempre `entrenamiento.md` con la nueva version del prompt e `historial-mejoras.md` con el registro del cambio.
