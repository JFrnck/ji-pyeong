# WORKFLOW.md — Coordinación entre Antigravity IDE y Claude Code

> **Objetivo:** que dos LLMs distintos trabajen sobre el mismo repo sin pisarse ni introducir conflictos silenciosos.
> Regla mental: **piensa en cada IDE como un colaborador humano remoto**. Aplican las mismas reglas de coordinación: ownership, branches, handoffs, no editar lo mismo al mismo tiempo.

---

## 1. Filosofía de la división

No es "dividir por tarea" sino "dividir por fortaleza". Cada IDE tiene un carácter distinto:

**Claude Code** brilla en:

- Razonamiento cuidadoso sobre lógica compleja.
- Refactors quirúrgicos con muchos archivos pequeños.
- TDD estricto.
- Seguridad, auditoría, verificación.
- Debugging de bugs sutiles.

**Antigravity** (Gemini agents) brilla en:

- Trabajo autónomo multi-paso con contexto grande.
- Scaffolding de proyectos y estructuras.
- Manipulación de muchos archivos a la vez (gracias a los 2M de contexto de Gemini 3.1 Pro).
- Integraciones con navegador (útil para probar el frontend).
- Migraciones y transformaciones sistemáticas.

Usa cada uno donde su fortaleza importa.

---

## 2. Mapa de ownership (autoritativo)

Cada ruta del repo tiene un **owner primario**. El otro IDE puede leer pero no debe editar sin negociación.

### 2.1 Claude Code lidera

| Ruta                                   | Razón                            |
| -------------------------------------- | -------------------------------- |
| `apps/ji-pyeong/src/hitl/**`           | Lógica crítica de seguridad      |
| `apps/ji-pyeong/src/audit/**`          | Hash chain sagrado               |
| `apps/ji-pyeong/src/budget/**`         | Kill switch, presupuesto         |
| `apps/ji-pyeong/src/security/**`       | Sanitizer, whitelists            |
| `apps/ji-pyeong/src/model-provider/**` | Router de LLMs                   |
| `apps/executor/**`                     | RBAC, ejecución aislada          |
| `packages/shared-audit/**`             | Utilidades de auditoría          |
| `docs/adr/**`                          | Decisiones arquitectónicas       |
| Tests de las rutas anteriores          | Coherencia con la implementación |

### 2.2 Antigravity lidera

| Ruta                                                                  | Razón                                                              |
| --------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `apps/web/**`                                                         | Frontend React grande — se beneficia del contexto amplio de Gemini |
| `apps/cli/**`                                                         | Ink CLI, scaffolding rápido                                        |
| `apps/ji-pyeong/src/integrations/**` (Canvas, Google, GitHub, Notion) | Boilerplate de SDKs, buen fit para Gemini                          |
| `infra/k8s/**`                                                        | Manifests Kustomize, muchos archivos similares                     |
| `infra/docker/**`                                                     | Dockerfiles y compose                                              |
| `scripts/**`                                                          | Automatización, seed scripts                                       |
| Migrations de DB (`prisma/migrations` o `drizzle/migrations`)         | Muchas migrations pequeñas                                         |

### 2.3 Compartido (requiere ping antes de editar)

| Ruta                                                     | Nota                                           |
| -------------------------------------------------------- | ---------------------------------------------- |
| `packages/shared-types/**`                               | Tipos que ambos usan; un cambio afecta a todos |
| `AGENTS.md`, `CLAUDE.md`, `docs/**`                      | Documentación                                  |
| `package.json` root, `pnpm-workspace.yaml`, `turbo.json` | Config del monorepo                            |
| `.github/workflows/**`                                   | CI                                             |

---

## 3. Ramas y convenciones

### 3.1 Naming

- `feature/claude/<slug>` — trabajo de Claude Code.
- `feature/antigravity/<slug>` — trabajo de Antigravity.
- `feature/shared/<slug>` — trabajo con ambos IDEs (raro, coordinar).
- `fix/<slug>` — bugfixes (cualquier IDE puede tomarlos).

### 3.2 Ciclo de vida

1. Crear rama desde `main`.
2. Trabajar exclusivamente en tu rama.
3. Push frecuente (al menos al final de cada sesión).
4. PR a `main` cuando esté listo.
5. Solo humano hace el merge final (nunca auto-merge en piezas críticas).

### 3.3 Un IDE, una rama activa

No abras dos ramas en el mismo IDE a la vez. Si necesitas cambiar de contexto, commitea o stash, cambia de rama, y cuando vuelvas revisa `STATUS.md`.

---

## 4. STATUS.md — mecanismo de coordinación ligero

En la raíz del repo, un archivo `STATUS.md` que ambos IDEs leen al empezar y actualizan al terminar.

### 4.1 Formato

```markdown
# STATUS

## Última actualización: 2026-07-15 14:30 (America/Lima)

## En progreso

### Claude Code

- **Rama:** `feature/claude/hitl-classifier`
- **Descripción:** Implementando el clasificador HITL para tools de Google Calendar.
- **Archivos activos:**
  - `apps/ji-pyeong/src/hitl/classifier.ts`
  - `apps/ji-pyeong/src/hitl/classifier.spec.ts`
- **Estado:** En desarrollo activo. No editar estos archivos.

### Antigravity

- **Rama:** `feature/antigravity/canvas-integration`
- **Descripción:** Scaffolding de la integración con Canvas LMS.
- **Archivos activos:**
  - `apps/ji-pyeong/src/integrations/canvas/**`
- **Estado:** En desarrollo activo. No editar estos archivos.

## Bloqueados / esperando

- Canvas integration bloquea la Fase 3 hasta que el Executor esté listo.
- Owner debe decidir: ¿scope de Google OAuth incluye Drive o solo Gmail+Calendar?

## Recientemente completado (últimos 7 días)

- 2026-07-14: `feature/claude/audit-hash-chain` merged.
- 2026-07-13: `feature/antigravity/k3s-manifests` merged.
```

### 4.2 Reglas

- **Actualiza al empezar** una sesión de trabajo: añade tu rama, tus archivos.
- **Actualiza al terminar** una sesión: mueve a "recientemente completado" o marca como "en pausa".
- **Antes de editar** un archivo, verifica que no aparezca en la sección "En progreso" del otro IDE.
- Si detectas colisión: **detente**, escribe al owner, negocia.

---

## 5. Protocolo de handoff

Cuando una tarea termina en un IDE y continúa en otro:

1. El IDE que termina hace:
   - Commit + push de todo su trabajo.
   - PR abierto o merge a `main` si está listo.
   - Actualiza `STATUS.md` marcando su parte como completa.
   - Escribe una nota de handoff en el PR o en `STATUS.md`: "Antigravity: la interface `HITLClassifier` está lista en `packages/shared-types`, puedes empezar a consumirla en `integrations/canvas`."

2. El IDE que empieza:
   - Pull latest de `main`.
   - Lee la nota de handoff.
   - Lee los archivos relevantes antes de editar.
   - Actualiza `STATUS.md` con su nueva rama.

---

## 6. Selección de modelos por IDE

### 6.1 En Claude Code

| Situación                                       | Modelo        | Razón                                       |
| ----------------------------------------------- | ------------- | ------------------------------------------- |
| Trabajo diario, features rutinarias, bugfixes   | **Sonnet 5**  | Default. Suficiente, rápido, económico      |
| Diseño de arquitectura, decisiones no triviales | **Opus 4.8**  | Consistencia superior en razonamiento largo |
| Debug de bug sutil o revisión de seguridad      | **Opus 4.8**  | Menos probable a dejar pasar flaws          |
| Preguntas triviales                             | **Haiku 4.5** | Barato y rápido                             |

Ver `MODEL_ROUTING.md` para la tabla completa.

### 6.2 En Antigravity

| Situación                                          | Modelo                          | Razón                                                    |
| -------------------------------------------------- | ------------------------------- | -------------------------------------------------------- |
| Trabajo autónomo largo, coding agente              | **Gemini 3.5 Flash**            | Default. Mejor en Terminal-Bench y MCP Atlas que 3.1 Pro |
| Manipulación de codebase grande (>500k tokens)     | **Gemini 3.1 Pro**              | 2M context window único en el mercado                    |
| Análisis de PDFs de Canvas / docs largos           | **Gemini 3.1 Pro**              | Multimodal + contexto largo                              |
| Antigravity Agent para tareas multi-paso autónomas | **antigravity-preview-05-2026** | Sandbox managed integrado                                |

### 6.3 Cuándo cambiar de IDE

Cambia de Claude Code a Antigravity si:

- La tarea requiere leer >20 archivos a la vez.
- Necesitas manipular un PDF grande o docs.
- Vas a hacer scaffolding masivo (crear 50+ archivos).
- El trabajo es browser-based (probar el dashboard end-to-end).

Cambia de Antigravity a Claude Code si:

- La tarea es de precisión quirúrgica (refactor de 10 líneas críticas).
- Estás tocando HITL, audit, budget, security, o Executor.
- Necesitas TDD estricto con muchas iteraciones cortas.
- Estás debuggeando un bug sutil.

---

## 7. Reglas anti-colisión

### 7.1 Nunca editar simultáneamente

Nunca dos IDEs sobre el mismo archivo. Punto. Aunque estén "cerca en tiempo" (uno lo terminó hace 5 minutos), verifica que el push esté hecho y el otro IDE haya hecho pull antes de tocar.

### 7.2 Regla del "reciente"

Si un archivo fue tocado en `main` en las últimas 24 h por el otro IDE, dale prioridad de review antes de modificarlo. Su LLM tenía contexto fresco de ese archivo.

### 7.3 Package.json y config del monorepo

Nunca simultáneamente. Añadir una dependencia = ping al owner primero.

### 7.4 Migrations

Antigravity crea nuevas migrations. Claude Code no. Excepción: bugfix en una migration ya creada.

### 7.5 Tests

Cada IDE escribe sus propios tests. Nunca modifiques tests que otro IDE escribió salvo que el test esté roto (en ese caso, díselo al owner).

---

## 8. Cuando algo sale mal

### 8.1 Conflicto de merge

- No lo resuelve el LLM automáticamente.
- Escala al owner con contexto: qué rama, qué archivos, qué intenta cada lado.

### 8.2 STATUS.md desactualizado

- El primer IDE en detectarlo lo corrige y avisa al owner.
- El owner decide si hay pérdida real de trabajo.

### 8.3 Un IDE editó archivo del otro

- El IDE afectado revierte los cambios en su rama.
- Escribe issue con etiqueta `coordination-fail` para revisión.
- El owner decide si la lógica se traslada al owner correcto.

### 8.4 Duda sobre ownership

- Si un archivo nuevo no encaja claramente en el mapa: elige el IDE cuyo trabajo lo motivó, y añádelo al mapa via PR a `WORKFLOW.md`.

---

## 9. Sesiones típicas

### 9.1 Sesión mixta: nueva feature end-to-end

Ejemplo: añadir integración con Notion.

1. **Antigravity** (Gemini 3.5 Flash): scaffolding.
   - Crea `apps/ji-pyeong/src/integrations/notion/`.
   - Instala SDK.
   - Boilerplate del módulo NestJS.
   - Crea tipos base en `packages/shared-types/notion.ts`.
   - Escribe integration tests con testcontainers.
   - PR abierto, STATUS.md actualizado.

2. **Claude Code** (Sonnet 5): tools + HITL.
   - Lee el trabajo de Antigravity.
   - Declara tools en el registry con `hitlLevel`.
   - Añade tests para el clasificador HITL cubriendo las nuevas tools.
   - Añade entradas al audit log si aplica.
   - PR abierto, STATUS.md actualizado.

3. **Owner**: revisa ambos PRs, mergea en orden.

### 9.2 Sesión pura Claude: refactor de seguridad

Ejemplo: reforzar el sanitizer de prompt injection.

- Solo Claude Code. Rama `feature/claude/sanitizer-hardening`.
- STATUS.md declara los archivos bloqueados.
- Antigravity, si está corriendo, no toca `src/security/**`.

### 9.3 Sesión pura Antigravity: manifests de infra

Ejemplo: añadir un HorizontalPodAutoscaler para NestJS.

- Solo Antigravity. Rama `feature/antigravity/hpa`.
- Solo `infra/k8s/**`.

---

## 10. Métricas de la colaboración

Cada mes, revisa:

- **PRs por IDE:** aproximadamente balanceado (no tiene que ser 50/50, pero un extremo indica que estás subutilizando uno).
- **Conflictos de merge:** debería ser cerca de 0. Si son >2/mes, el mapa de ownership está mal.
- **Bugs por área:** si un área tiene muchos bugs, considera cambiar el IDE que la lidera.

Documenta ajustes en un ADR (`docs/adr/`) y actualiza `WORKFLOW.md`.
