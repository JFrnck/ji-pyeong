# ADR 0001 — Framework de testing: Vitest en todo el monorepo

## Estado

Aceptado (bootstrap, 2026-07-16).

## Contexto

`nest new` genera boilerplate con Jest como testing framework. `AGENTS.md` sección 6.2
declara Vitest como estándar del proyecto. Hay contradicción entre el default del stack
y la política del proyecto.

## Decisión

Migrar todos los tests (apps y packages) a Vitest. Ejecución diferida a Fase 2.1.

## Consecuencias

- Coherencia total en el testing framework across el monorepo.
- Beneficios de Vitest: velocidad, ESM nativo, DX consistente con el resto del stack Vite.
- Costo one-time: setup de `unplugin-swc` (o alternativa) para que Vitest entienda los
  decoradores de NestJS.
- Durante el bootstrap, los scripts `test` de las apps y packages son no-op temporales
  (exit 0 con mensaje explicativo) para no romper CI.

## Alternativas consideradas

- Mantener Jest en las apps NestJS y Vitest en packages: rechazada por generar dos
  DX distintos en el mismo repo.
- Migrar a Vitest ahora en el bootstrap: rechazada por no ser el foco de la Fase 0
  (esqueleto) y requerir tiempo de configuración cuidadosa.
