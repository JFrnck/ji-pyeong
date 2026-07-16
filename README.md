# JI-PYEONG — Documentación del proyecto

Este bundle contiene la documentación completa para arrancar y desarrollar JI-PYEONG.

## Estructura

```
├── README.md                    # Este archivo
├── AGENTS.md                    # Directivas para ambos LLMs (leído por Claude Code y Antigravity)
├── CLAUDE.md                    # Directivas específicas de Claude Code (extiende AGENTS.md)
└── docs/
    ├── BLUEPRINT.md             # Plan maestro: arquitectura, roadmap, reglas duras
    ├── WORKFLOW.md              # Cómo usar Claude Code + Antigravity sin colisiones
    ├── MODEL_ROUTING.md         # Qué modelo usar para cada tipo de tarea
    └── PROMPTS.md               # Prompts iniciales por fase, listos para copiar/pegar
```

## Orden de lectura

### Para el owner (tú)

1. **BLUEPRINT.md** — entiende la arquitectura completa.
2. **WORKFLOW.md** — entiende cómo se coordinan los dos IDEs.
3. **MODEL_ROUTING.md** — entiende qué modelo elegir cuándo.
4. **PROMPTS.md** — este es tu manual de operación.

### Para los LLMs (automático)

Claude Code y Antigravity leen automáticamente `AGENTS.md` y (Claude Code) `CLAUDE.md` cuando abren el repo. En cada sesión, los prompts de `PROMPTS.md` les indican qué otros docs leer según la tarea.

## Setup inicial del repo

Cuando crees el repo real:

1. Copia estos archivos a la raíz del repo:
   - `README.md` → `README.md` (puedes reescribirlo para el proyecto en sí).
   - `AGENTS.md` → `AGENTS.md` (raíz del repo).
   - `CLAUDE.md` → `CLAUDE.md` (raíz del repo).
   - `docs/` → `docs/`.

2. Crea también estos archivos vacíos que se irán llenando:
   - `STATUS.md` (raíz) — coordinación entre IDEs.
   - `docs/adr/` (directorio) — Architecture Decision Records.
   - `docs/runbooks/` (directorio) — Runbooks operativos.

3. Inicializa git y commitea la documentación como primer commit.

4. Abre el repo en Claude Code y verifica que carga `CLAUDE.md` correctamente. Prueba: pregúntale "resume las 10 reglas de oro del proyecto"; debería responder con la lista de `BLUEPRINT.md` sección 15.

5. Abre el repo en Antigravity y verifica que carga `AGENTS.md`. Prueba similar.

6. Copia el primer prompt de `PROMPTS.md` (Fase 1.1) en Antigravity para arrancar la Fase 1.

## Filosofía en una línea

**Empezar por lo aburrido y crítico** (infra, backups, HITL, audit, budget) **antes que por lo divertido y visible** (dashboard con Monaco, applets, agentes autónomos).

El sistema es útil cuando puedes confiar en él. La confianza se construye con las capas de abajo, no con la interfaz de arriba.

## Cambios a la documentación

Todo cambio a estos docs se hace por PR con revisión humana. La documentación es código y aplica el mismo estándar.

Cuando actualices un modelo en `MODEL_ROUTING.md`, actualiza también `config/models.yaml` en el mismo PR. Sin excepciones.
