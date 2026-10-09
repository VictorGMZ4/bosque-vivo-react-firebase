# Ampliación funcional aprobada — 2026-10-06

El usuario autorizó implementar los siete puntos propuestos juntos. Se conserva el proyecto Django original y se trabaja con Firebase local.

1. Propuestas: borrador, fotografías y créditos, revisión, rechazo motivado, corrección y reenvío; observaciones conservadas por revisión.
2. Notificaciones internas: nuevas solicitudes/propuestas para administradores y decisiones para autores; lectura individual, sin mensajes externos.
3. Favoritos y colecciones personales privadas por usuario.
4. Comparación de hasta tres especies y filtros basados en datos disponibles.
5. Cuestionarios creados por profesores/administradores, corrección en servidor y resultados personales.
6. PWA instalable y guardado explícito de fichas públicas para consulta offline, sin guardar administración, credenciales o GLB.
7. Historial de cambios y papelera de especies con restauración controlada, preservando galerías y unicidad.

Ejecución: módulos independientes en paralelo (aprendizaje, colecciones, offline); integración principal de moderación/notificaciones/auditoría. Se validarán reglas, autorización, transacciones, compilación y recorridos reales en navegador. No se considera listo producción hasta configurar y verificar Firebase real.

## Resultado — 2026-10-07

Los siete módulos quedaron integrados. Verificación: ocho pruebas unitarias, once de integración con emuladores, siete recorridos funcionales nuevos y doce comprobaciones del catálogo/CRUD original en Chrome. Se probó recarga sin red con texto y fotografía realmente descargados. Compilación correcta; permanecen avisos de tamaño de bundle. Los 105 hashes del proyecto Django no cambiaron. Guía de uso y límites: [FUNCIONALIDADES.md](FUNCIONALIDADES.md).
