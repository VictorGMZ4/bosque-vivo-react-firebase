# Mejoras pendientes

Propuestas anotadas el 2026-10-30 (America/Bogota) para implementarlas más adelante. Cada una se diseña y aprueba antes de empezar; el trabajo se reparte entre Claude y Codex.

## Para visitantes y estudiantes
1. **«Cerca de ti» en el mapa**: con la ubicación en el campus, lista de especies cercanas ordenadas por distancia. **Hecho (local).**
2. **Ruta o búsqueda del tesoro botánica**: cuestionario de Aprender que pide encontrar especies en el mapa; se marcan al llegar cerca o al escanear su QR.
3. **Del QR al mapa**: la ficha abierta desde el QR muestra «Estás aquí» junto a la planta y las especies vecinas.
4. **Fotos más ligeras al subir**: compresión en el navegador (WebP de unos 1600 px) leyendo antes el GPS, que la compresión elimina.

## Para profesores y administración
5. **Informe de actividad para profesores**: propuestas revisadas, especies publicadas y resultados de cuestionarios, exportable a CSV o Excel.
6. **Exportar el inventario**: especies, ejemplares y coordenadas en CSV.
7. **Restaurar fotos o ejemplares sueltos** desde la papelera.
8. **Fase 2 de archivos sin uso**: cuarentena con plazo antes de borrar.

## Pulido visual
9. **Ficha de especie más atractiva**: galería a pantalla completa, mapa integrado y mejor jerarquía visual. **Hecho (local).**
10. **Modo oscuro** coherente en toda la app. **Hecho (local).**
11. **Mensajes de error limpios**: quitar el sufijo «[400]» que añade el cliente de Functions. **Hecho (local).**

## Antes de producción
12. **Correo institucional para profesores e investigadores** (anotada el 2026-10-31; obligatoria antes del próximo despliegue): solo una cuenta registrada con correo `@unipaz.edu.co` puede recibir el rol de profesor o de investigador. La comprobación va en el servidor y en las reglas, no solo en la pantalla. Hoy ningún usuario tiene el rol de profesor, así que no hay cuentas que migrar. Falta crear el rol «investigador» (hoy no existe) y definir sus permisos. **Hecho (local).**
13. **App Check** (reCAPTCHA) para las Functions.
14. **Búsqueda y paginación en servidor** cuando el inventario supere las 1.000 especies.
15. Revisión con `security-review` y `code-review` antes de desplegar los commits pendientes.
