---
name: git-evidencia-limpia
description: Evita falsos rechazos de juez en tareas que exigen arbol git limpio y evidencia persistida de `git status`.
metadata:
  tipo: pitfall
---

Sintoma observable: la juez rechaza una subtarea de evidencia con mensajes como `el arbol sigue sin estar limpio` o `la evidencia guardada aun muestra cambios pendientes`, aunque el estado git actual ya salga limpio al repetir `git status --short --branch`.

En este proyecto bajo `ralph`, el problema suele ser que la evidencia persistida se genero antes de dejar el arbol limpio o antes de la ultima edicion en `plan/`/`.ralph/`. Si una tarea pide demostrar limpieza del repo:

- Comprueba primero el estado real con `git status --short --branch` desde la raiz del repo.
- Regenera el fichero de evidencia solo cuando ese comando ya no muestre cambios pendientes.
- Si editas despues `plan/task/*.md` o cualquier fichero que la tarea no versiona, asume que la evidencia anterior puede haber quedado obsoleta y vuelvela a capturar antes de pasar por juez.
- La fuente de verdad del checkpoint es la evidencia guardada, no una comprobacion nueva hecha solo en la conversacion.
