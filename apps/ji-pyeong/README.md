# apps/ji-pyeong

El orquestador principal de JI-PYEONG. NestJS.

## Responsabilidades

- Auth, API REST y WebSocket para las interfaces (web, Telegram, CLI).
- Cron jobs (Shadowing Académico, backups, health checks).
- Router de modelos LLM.
- Clasificador HITL, audit log, budget guard.
- Integraciones externas (Canvas, Google, GitHub, Notion).

Ver `docs/BLUEPRINT.md` sección 4.1 para el layout completo de `src/`.

## Desarrollo

```bash
pnpm --filter ji-pyeong dev
```

Puerto por defecto: 3000.
