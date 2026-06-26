---
name: hub-ayuda-enlaces-verificables
description: Decide si un recurso puede entrar en el hub de ayuda segun su caracter oficial verificable y el alcance actual solo de enlaces.
metadata:
  tipo: decision
---

# Hub de ayuda: enlaces verificables

Incluye solo organizaciones serias con URL oficial que responda por HTTP con estado 2xx o 3xx. Si una linea u organismo oficial no tiene una landing estable verificable, excluyelo o sustituyelo por una pagina oficial correcta. No anadas recursos que requieran moderacion, backend o tratamiento de datos sensibles: el alcance actual del hub es solo enlaces.

Evidencia ancla: `plan/plan.md` fija el objetivo como un hub de ayuda confiable y deja fuera de alcance los modulos que requieren moderacion, backend o integraciones; `plan/task/00.md` fija la seleccion automatica de candidatas sin intervencion humana; `plan/task/01.md` obliga a verificar cada URL por HTTP y a descartar o sustituir cualquier URL que no responda con 2xx/3xx; `plan/task/01.md` y `plan/task/01.evidencia.txt` reflejan ademas el rechazo previo por evidencia incompleta de URLs.
