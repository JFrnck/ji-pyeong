# apps/executor

Microservicio de ejecución aislada de JI-PYEONG. NestJS.

## Responsabilidades

- Único servicio autorizado a hablar con Kubernetes (`@kubernetes/client-node`).
- RBAC estricto: solo puede crear/destruir pods en el namespace `agents-sandbox`.
- Warm pool de pods Deno para ejecución rápida de código LLM-generado.
- Escalado a Modal para tareas pesadas.

Ver `docs/BLUEPRINT.md` sección 4.2 y `AGENTS.md` sección 5.3 (separación de privilegios).

## Desarrollo

```bash
pnpm --filter executor dev
```

Puerto por defecto: 3001.
