# CLAUDE.md — Directivas específicas para Claude Code

> Este archivo lo carga Claude Code automáticamente. Extiende (no reemplaza) `AGENTS.md`.
> **Lee `AGENTS.md` primero.** Todo lo declarado allí aplica. Aquí solo va lo específico a Claude Code.

---

## 1. Selección de modelo

### 1.1 Reglas por tipo de tarea

| Tarea                                                  | Modelo recomendado | Cuándo escalar a Opus |
| ------------------------------------------------------ | ------------------ | --------------------- |
| Refactor rutinario, features pequeñas, bugfixes obvios | **Sonnet 5**       | Nunca — Sonnet basta  |
| Escribir tests, docs, migrations                       | **Sonnet 5**       | Nunca                 |
| Diseño de arquitectura, decisiones no triviales        | **Opus 4.8**       | Default aquí          |
| Debug de bugs sutiles (race conditions, memory leaks)  | **Opus 4.8**       | Default aquí          |
| Auditoría de seguridad, revisión de HITL/audit/secrets | **Opus 4.8**       | Default aquí          |
| Preguntas rápidas, "cómo se hace X"                    | **Haiku 4.5**      | Nunca                 |

Si dudas: **Sonnet 5**. Si el problema requirió >30 min sin progreso: cambia a **Opus 4.8**.

### 1.2 Extended thinking

- Actívalo (`thinking: enabled`) para:
  - Bugs no reproducibles.
  - Diseños de arquitectura.
  - Análisis de logs complejos.
  - Tareas de HITL classifier y audit log.
- Déjalo apagado para tareas mecánicas (crear boilerplate, escribir tests obvios).

---

## 2. Comportamiento en Claude Code

### 2.1 Planning mode

Actívalo (Shift+Tab dos veces en la terminal) para:

- Cualquier cambio que toque >5 archivos.
- Cualquier cambio en `apps/ji-pyeong/src/hitl/`, `apps/ji-pyeong/src/audit/`, `apps/executor/`.
- Cualquier cambio en manifests de infra (`infra/k8s/`).
- Cualquier cambio de dependencias en `package.json`.

Cuando el plan esté listo, léelo con el owner línea por línea antes de aceptar.

### 2.2 Tool use

- **Read** antes de **Edit**. Nunca edites un archivo que no acabas de leer.
- **Grep/Glob** antes de asumir dónde vive el código.
- **Bash** para: linting, tests, git ops. Nunca para cambios destructivos sin confirmación.

### 2.3 Sub-agentes

- Usa `Task` con sub-agentes para búsquedas paralelas ("busca todos los usos de X y también todos los usos de Y").
- No los uses para tareas secuenciales — se pierden en contexto.
- Límite: 3 sub-agentes concurrentes por sesión.

---

## 3. Áreas de responsabilidad principal

Claude Code lidera estas partes del código (ver `docs/WORKFLOW.md` para el mapa completo):

- `apps/ji-pyeong/src/hitl/**` — clasificador HITL, timeouts, aprobaciones.
- `apps/ji-pyeong/src/audit/**` — audit log, hash chain, verificación de integridad.
- `apps/ji-pyeong/src/budget/**` — budget guard, kill switch, rate limiter.
- `apps/ji-pyeong/src/security/**` — injection sanitizer, whitelists, RBAC validator.
- `apps/executor/**` — todo el Executor.
- `packages/shared-audit/**` — utilidades de auditoría compartidas.
- Tests de las piezas anteriores.
- ADRs (Architecture Decision Records) en `docs/adr/`.

---

## 4. Comandos frecuentes

> **Nota:** algunos de estos comandos solo existen a partir de fases posteriores del roadmap (ver `docs/BLUEPRINT.md` sección 14). Antes de correr uno, verifica que esté en `package.json`. Si no está, revisa en qué fase se agrega.

```bash
# --- Disponibles desde Fase 1 (bootstrap) ---
pnpm install                       # Instalar dependencias
pnpm dev                           # Correr todo el stack en dev (paralelo)
pnpm --filter ji-pyeong dev        # Solo el orchestrator
pnpm --filter executor dev         # Solo el executor
pnpm typecheck                     # Type check global
pnpm lint                          # Lint global
pnpm test                          # Unit tests

# --- Disponibles desde Fase 2 (núcleo del orchestrator) ---
pnpm test:integration              # Integration tests con testcontainers
pnpm test:coverage                 # Coverage report
pnpm db:migrate                    # Aplicar migraciones Prisma/Drizzle
pnpm db:migrate:down               # Rollback última migración

# --- Disponibles desde Fase 6 (dashboard) ---
pnpm test:e2e                      # E2E con Playwright

# --- Disponibles desde Fase 7 (producción) ---
pnpm build:docker                  # Build imágenes Docker de las apps
```

---

## 5. Estilo de comunicación en la sesión

- **Español por defecto** (owner escribe en español). Cambiar a inglés solo si el owner lo pide o si es contenido técnico donde el inglés es estándar (nombres de funciones, mensajes de commit).
- **Directo, sin flattery**. No abras respuestas con "great question" o similares.
- **Explica el porqué** de cada decisión no obvia.
- **Cuando no estás seguro, dilo.** "Creo que X, pero verifica con tests" es mejor que afirmarlo con confianza fingida.

---

## 6. Coordinación con Antigravity

Antes de empezar cualquier trabajo:

1. Lee `STATUS.md` (raíz del repo) para ver qué está haciendo Antigravity ahora.
2. Verifica que tu rama no colisiona con `feature/antigravity/*` activas.
3. Si tu tarea toca archivos que Antigravity está editando, **detente** y coordina con el owner.

Al terminar tu sesión:

1. Actualiza `STATUS.md` marcando tu trabajo como completo o en pausa.
2. Deja tu rama en estado limpio (commits pushed, sin cambios uncommitted).

Ver `docs/WORKFLOW.md` para el protocolo completo.

---

## 7. Cuando algo requiere criterio del owner

Situaciones donde debes preguntar en lugar de decidir:

- El blueprint no cubre el caso.
- Hay 2+ formas razonables y ninguna es claramente mejor.
- Un cambio afecta la seguridad, HITL o audit log.
- Necesitas introducir una librería nueva.
- Un test que "debería fallar" está pasando.
- Un test que "debería pasar" está fallando por razones que no entiendes.

Formato de pregunta:

> Contexto: [1-2 líneas]
> Opciones: [A, B, C con trade-offs]
> Mi recomendación: [una, con razón]
> ¿Sigo?
