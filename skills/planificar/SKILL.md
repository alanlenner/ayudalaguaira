---
name: planificar
description: En fase 0 de ralph, anade preparacion de entorno para builds de Next cuando la tarea incluya npm run build o verificacion de build.
metadata:
  tipo: metodologia
---

En fase 0 de `ralph`, si una tarea menciona `npm run build`, validacion de build o evidencia de build, inserta desde la planificacion una subtarea explicita de preparacion de entorno.

Regla:
- Definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` inline en el comando de build o en la evidencia del comando.
- El objetivo es evitar el falso fallo `supabaseUrl is required`.

Aplicacion minima:
- Anadir una subtarea previa del tipo: preparar entorno de build con variables publicas de Supabase inline.
- Exigir que la evidencia deje visible el uso inline de esas variables o remita a la skill `skills/next-build-supabase-env`.

Anclajes obligatorios:
- `plan/task/03.md`
- `plan/task/04.evidencia.txt`
- `skills/next-build-supabase-env`

No cierres una planificacion de build sin esta preparacion si la tarea depende de `next build` o de su verificacion.
