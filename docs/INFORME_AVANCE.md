# Informe de avance — Flora Viva - Bosque Verde

Fecha: 5 de octubre de 2026.

La primera etapa dispone de frontend React, backend Firebase Functions y persistencia Firestore/Storage, con autenticación y permisos administrativos. El catálogo conserva los identificadores y datos del inventario original; permite búsqueda, filtros, paginación y consulta de fichas. La administración permite gestionar especies, ejemplares y fotografías, incluyendo publicación de especies y validación de relaciones.

La aplicación funciona actualmente contra emuladores locales. Esta entrega no requiere Django en ejecución. El proyecto original permanece separado y sin cambios en los 105 archivos verificados. La extracción de datos es una herramienta opcional de migración que lee SQLite, no una dependencia del funcionamiento de React.

La compilación, cinco pruebas unitarias, cuatro de integración y doce comprobaciones de navegador resultaron satisfactorias. Se verificaron permisos de visitantes/administradores, protección de borradores, operaciones CRUD, fotografías y presentación en móvil/escritorio. La evidencia y los límites se detallan en [BITACORA.md](BITACORA.md).

El siguiente hito será conectar un proyecto Firebase real y validar su configuración antes de publicar. Aún no se habilitaron facturación ni servicios productivos. Mapa y girasol/visor 3D se excluyeron conforme al alcance solicitado; PWA/offline y funciones avanzadas quedan pendientes.
