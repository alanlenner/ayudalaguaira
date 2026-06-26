---
name: next-build-supabase-env
description: Evita falsos bloqueos al verificar `next build` en este repo cuando Supabase exige variables publicas en tiempo de importacion.
metadata:
  tipo: pitfall
---

Sintoma observable: `npm run build` falla durante el prerender de `/` con `Error: supabaseUrl is required`, aunque el cambio que se esta verificando no toque Supabase.

En este proyecto, `src/lib/supabase.ts` crea el cliente al importar el modulo y lee `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` de forma inmediata. Cualquier verificacion automatica de build debe aportar esas variables publicas, aunque sean placeholders, para no mezclar un fallo de entorno con el trabajo real de la tarea.

Metodo recomendado para evidencia tecnica:
- Ejecuta `npm run build` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` definidas inline en el mismo comando.
- Si solo se necesita validar compilacion del frontend y no acceso real a Supabase, usa valores placeholder con forma valida y documenta en la evidencia que el ajuste solo evita el fallo de importacion.
- Si el build falla sin esas variables, no atribuyas el error al cambio funcional hasta repetir la comprobacion con el entorno minimo completo.

Evidencia ancla: `src/lib/supabase.ts` lee ambas variables y crea el cliente al cargar el modulo; `plan/task/02.evidencia.txt` y `.ralph/logs/iteration-000067-20260626-201342.log` muestran el fallo `supabaseUrl is required`; `.ralph/logs/iteration-000069-20260626-201442.log` documenta que el checkpoint de `task/02` se valido al repetir `npm run build` con variables publicas de Supabase fijadas inline.
