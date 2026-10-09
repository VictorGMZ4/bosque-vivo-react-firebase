# Plan de ejecución de la primera etapa

Estado: los seis pasos de esta etapa local están ejecutados y verificados el 2026-10-05. Resultados y pendientes productivos en [BITACORA.md](BITACORA.md) e [INFORME_AVANCE.md](INFORME_AVANCE.md).

1. Capturar hashes del proyecto Django y crear aplicación hermana.
2. Escribir pruebas de validación y backend; observar fallos y luego implementar campos, normalización, permisos, unicidad y relaciones.
3. Crear configuración Firebase, reglas y emuladores; probar acceso público, borradores y rechazo de escrituras directas.
4. Crear React: catálogo con búsqueda/filtros/paginación, ficha, ingreso, panel, CRUD de especies/ejemplares/galería y carga de fotos.
5. Exportar SQLite en modo solo lectura y cargar únicamente emuladores, conservando identificadores; copiar medios referenciados sin alterar origen. Cuentas locales de QA separadas de las reales.
6. Ejecutar build, pruebas unitarias/integración y recorrido navegador móvil/escritorio. Comparar hashes de Django; revisión independiente; documentar evidencia y límites.

Decisión: el usuario autorizó iniciar la migración completa a Firebase, con aplicación separada. Se avanza sobre esa arquitectura acordada; producción espera configuración real y una decisión posterior de despliegue. No hay Git en la carpeta de origen; no se inventan commits.
