---
name: planificar
description: En fase 0 de ralph, usa la convencion local `plan/plan.md` y `plan/task/*.md`, y anade preparacion de entorno para builds de Next cuando la tarea incluya npm run build o verificacion de build.
metadata:
  tipo: metodologia
---

En fase 0 de `ralph`, no arranques buscando `plan.md` ni `task/*.md` en la raiz: en este repo el plan vive en `plan/plan.md` y las hojas en `plan/task/*.md`. Usa esa convencion desde el primer comando de descubrimiento y en cualquier texto de trabajo, salvo que el usuario nombre otra ruta explicita. La evidencia local es concreta y repetida: en `.ralph/logs/iteration-000058-20260626-231806.log` se fallo primero con `rg -n "[.]" plan.md task/07.md` y `sed -n '1,220p' task/07.md` en raiz; en `.ralph/logs/iteration-000047-20260626-231118.log` se repitio el mismo patron con `task/06.md`. En ambos casos la correccion real fue abrir `plan/plan.md` y `plan/task/0N.md`.

Durante el descubrimiento del bucle, limitate al workspace actual y a rutas conocidas del repo. No escanees `$HOME`, no lances `find /Users/...` ni `rg --files /Users/...` para localizar `plan`, `task` o `skills`: en este repo eso solo anade ruido y falsos bloqueos. La evidencia local es directa: en `.ralph/logs/iteration-000001-20260626-224317.log` se intento abrir `/Users/n603325/.codex/skills/.system/ralph/SKILL.md`, despues `find /Users/n603325 ...` y `rg --files /Users/n603325 ...`, lo que produjo una cascada de `Operation not permitted`; en `.ralph/logs/iteration-000003-20260627-234959.log` y `.ralph/logs/iteration-000066-20260626-232238.log` se repitio el error base con `plan.md` y `task/*.md` fuera de `plan/`.

Si una tarea menciona `npm run build`, validacion de build o evidencia de build, inserta desde la planificacion una subtarea explicita de preparacion de entorno.

Si una tarea enlaza rutas concretas del repo como contexto de trabajo, inserta como primera subtarea una validacion del contexto enlazado antes de implementar.

Regla:
- Antes de localizar la primera pendiente, inspeccionar `plan/plan.md` y `plan/task/*.md`; no usar `plan.md` ni `task/*.md` a secas.
- Restringir cualquier descubrimiento a rutas del workspace y del repo ya conocidas; para skills locales usar `skills/...`, y para planes `plan/...`.
- No buscar `plan`, `task` ni `SKILL.md` fuera del repo ni bajo `$HOME`.
- Definir `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` inline en el comando de build o en la evidencia del comando.
- El objetivo es evitar el falso fallo `supabaseUrl is required`.
- Antes de tocar codigo, releer los ficheros enlazados en la tarea y confirmar que el contexto sigue vigente; si no lo esta, actualizar primero el propio fichero `plan/task/NN.md` para reflejar el estado real antes de seguir.

Aplicacion minima:
- Empezar cualquier exploracion del bucle con una lectura o busqueda sobre `plan/plan.md` y `plan/task/*.md`.
- Si hace falta localizar algo, usar solo rutas relativas al repo ya esperables como `plan/`, `plan/task/` y `skills/`; no ampliar el radio de busqueda fuera del workspace.
- Anadir una subtarea previa del tipo: preparar entorno de build con variables publicas de Supabase inline.
- Cuando la tarea describa componentes, pantallas o tablas concretas, anadir una subtarea inicial del tipo: validar contra el estado actual del repo que el contexto enlazado sigue actualizado y es relevante.
- Exigir que la evidencia deje visible el uso inline de esas variables o remita a la skill `skills/next-build-supabase-env`.

Anclajes obligatorios:
- `.ralph/logs/iteration-000001-20260626-224317.log`
- `.ralph/logs/iteration-000003-20260627-234959.log`
- `.ralph/logs/iteration-000066-20260626-232238.log`
- `.ralph/logs/iteration-000047-20260626-231118.log`
- `.ralph/logs/iteration-000058-20260626-231806.log`
- `.ralph/logs/iteration-000013-20260626-225111.log`
- `.ralph/logs/iteration-000014-20260626-225137.log`
- `.ralph/logs/iteration-000021-20260626-194029.log`
- `plan/task/03.md`
- `plan/task/04.evidencia.txt`
- `skills/next-build-supabase-env`
- `plan/task/01.md`
- `plan/task/02.md`
- `plan/task/03.md`
- `plan/task/04.md`
- `plan/task/05.md`
- `plan/task/06.md`
- `plan/task/07.md`
- `plan/task/08.md`

No cierres una planificacion de build sin esta preparacion si la tarea depende de `next build` o de su verificacion.
