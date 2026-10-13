# Bitácora — Flora Viva - Bosque Verde

## 2026-10-05 · Roles, aprobación y perfil

Se implementaron Estudiante/Visitante, Profesor/Investigador y Admin. La colección publicada es consultable por todos; los usuarios registrados actualizan su nombre, institución y biografía. Guardar los datos del perfil redirige al inicio solo si la operación tuvo éxito, conforme a la corrección solicitada. El registro permite elegir tipo de cuenta: seleccionar Profesor/Investigador crea una solicitud sin conceder privilegios. En Usuarios, el administrador aprueba o rechaza solicitudes y asigna roles; el usuario puede consultar el estado y volver a solicitarlo después de un rechazo.

El profesor propone fichas con previsualización. Las propuestas se almacenan fuera del catálogo y el administrador puede aprobar/publicar o rechazar con observaciones. La aprobación y la reserva de nombre científico son transaccionales. Se añadió carga, sustitución y retirada de GLB en Editar especie, conservando crédito y validación de GLB autocontenido hasta 30 MB. Los archivos retirados se conservan físicamente.

Los roles en Firestore prevalecen sobre claims antiguos, por lo que una degradación retira permisos incluso con un token antiguo. Los clientes no escriben roles, perfiles ni propuestas directamente; el backend aplica permisos. Se impide cambiar el propio rol administrativo y se revisa la autoridad del actor dentro de la transacción de cambios de rol. Se conserva compatibilidad con el administrador local original basado en claim si aún no tiene documento de rol.

Verificación: build aprobado, cinco pruebas unitarias y seis de integración aprobadas. El recorrido Chrome verificó selección de profesor al registrarse, solicitud pendiente, retorno al inicio al guardar perfil, aprobación de cuenta, propuesta/previsualización, aprobación/publicación de especie, carga GLB, degradación de rol en sesión abierta y diseño móvil, sin errores JavaScript. Las cuentas y registros de QA se retiraron. La revisión independiente solicitada no estuvo disponible por límite de uso del agente; se realizó revisión local y pruebas de permisos, sin atribuir una revisión externa exitosa.

## 2026-10-05 · Modelo 3D del girasol en React

Por nueva solicitud del usuario, se incorporó el GLB original conservado en la exportación, asociado a la especie 8. Se mantiene su crédito y su carácter de ilustración procedural. El visor usa `@google/model-viewer` 4.3.1, controles de cámara, restablecimiento inmediato, instrucciones, estados de carga/error y reintento. El motor y el modelo se cargan al pulsar un botón; no hay rotación automática. Se revocan las URLs blob al desmontar el componente.

Los archivos de modelos se leen desde Storage según publicación de su especie; la escritura desde clientes está denegada. El importador local valida tamaño, cabecera GLB y ausencia de recursos externos, conserva los créditos y no reemplaza modelos ya asignados. No se modificaron campos del CRUD administrativo ni se habilitó producción.

Verificación: compilación aprobada sin ciclos entre bundles; aviso de tamaño del módulo 3D (aproximadamente 297 kB gzip), que se carga bajo demanda. Cinco pruebas de integración aprobadas, incluida lectura de modelo público, denegación de borrador/especie eliminada y rechazo de escrituras. Chrome renderizó el modelo; se verificaron descarga bajo demanda, cámara/restablecimiento, ancho móvil de 390 px y recuperación tras error 403, sin errores JavaScript. Evidencia visual en `work/qa/model-desktop.png` y `model-mobile.png`. Se corrigió un ciclo de bundles durante la integración usando agrupación automática para las dependencias del visor.

## 2026-10-05 · Integración de Tailwind CSS

Se incorporaron Tailwind CSS 4.3.3 y su plugin oficial de Vite, con dependencias bloqueadas en pnpm-lock.yaml. El tema declara colores botánicos reutilizables. Tarjetas, paneles, cuadrículas, imágenes, tablas y diálogos utilizan utilidades mediante `@apply`; el layout React usa también clases del tema directamente. Se mantiene el reset existente importando tema/utilidades sin Preflight, y el CSS específico de animaciones y detalles gráficos. La carpeta original Django conserva sus 105 hashes sin cambios.

Verificación ejecutada: build Vite aprobado; doce comprobaciones de catálogo/administración/CRUD y cinco de movimiento/accesibilidad visual aprobadas en Chrome, sin errores JavaScript. Se comprobaron vistas de 375, 390, 768 y 1440 px. La integración conserva el diseño aprobado; no supone que todo el CSS personalizado haya sido reemplazado por utilidades. Guía de mantenimiento en README.

## 2026-10-05 · Animaciones de interfaz

Tras aprobar el estilo propuesto, se añadieron entradas suaves en páginas, ilustración botánica, tarjetas y estadísticas; aparición escalonada en el catálogo; elevación/zoom con cursor; respuestas de botones y campos; y entrada de avisos y diálogos. Se usan únicamente CSS, sin dependencias nuevas. Los efectos con cursor se limitan a dispositivos con puntero preciso. La preferencia `prefers-reduced-motion` desactiva animaciones, transiciones y transformaciones interactivas.

Verificación: compilación Vite aprobada y cinco comprobaciones Chrome aprobadas (entradas, hover/zoom después de finalizar la entrada, movimiento reducido, ausencia de desbordamiento a 375/768 px e ingreso/estadísticas), sin errores JavaScript. Capturas e informe en `work/qa/motion-*`. La comparación de los 105 archivos de Django sigue sin cambios. El comando pnpm intentó una reinstalación automática sin terminal; se verificó el build directamente con el Vite ya instalado, sin reinstalar dependencias.

## 2026-10-05 · Primera etapa React y Firebase local

Se creó una aplicación independiente en `bosque-vivo-react-firebase`, respetando la solicitud de conservar el proyecto Django. El documento conceptual se utilizó como referencia de arquitectura; el alcance implementado corresponde a catálogo, administración y CRUD, sin mapa ni girasol/visor 3D.

React consume Authentication, Firestore, Storage y Functions mediante Firebase SDK. El backend valida permisos de administrador, campos, unicidad y relaciones con transacciones. Las reglas impiden escrituras directas y ocultan borradores a visitantes. La fotografía se obtiene como blob sujeto a reglas, sin tokens públicos permanentes.

La exportación SQLite en modo solo lectura conservó siete especies (seis públicas y un borrador), cero ejemplares y cero fotos de galería. Se copiaron los dos medios referenciados; el modelo GLB se conserva como dato histórico. No se trasladaron cuentas, sesiones ni contraseñas Django. La cuenta administrativa de evaluación se creó exclusivamente en Authentication emulado, con credenciales aleatorias en el archivo local ignorado `work/local-access.json`.

### Evidencia

- Build Vite aprobado. Los avisos de directivas `use client` de React Router no impiden la compilación de esta SPA.
- Cinco pruebas unitarias y cuatro de integración aprobadas en emuladores reales. Incluyen validaciones, permisos, unicidad, borradores, relaciones, importación y Storage.
- Doce comprobaciones del navegador aprobadas, sin errores JavaScript: catálogo, búsqueda, filtros, paginación, acceso, CRUD completo, fotos, publicación y cierre de sesión. Tamaños 375, 390, 768 y 1440 px, sin desbordamiento de página.
- Los registros QA de datos se retiraron; los archivos físicos de prueba se mantienen sujetos a reglas hasta una limpieza posterior.
- Se exportó y restauró el estado de los emuladores. Evidencia local en `work/qa`, `work/emulator-data` y `work/django-integrity.json`.
- Comparación de 105 hashes de archivos de origen: sin cambios. Se excluyen carpetas de runtime/cache indicadas en el informe de integridad.

### Revisión y correcciones

La revisión independiente detectó dos casos de importación: reserva de código de ejemplar que podía sobrescribir otro propietario y nombres de medios incompatibles con las reglas. Se corrigieron con una transacción que rechaza colisiones y nombres derivados de hash/extensión; se añadieron pruebas de regresión aprobadas. Se corrigió también la separación de bundles Vite después de observar una carga circular en navegador, y se repitió el recorrido completo con éxito.

### Pendientes de producción

No existe todavía proyecto Firebase real, facturación habilitada ni despliegue. Se debe verificar Node 22 (los emuladores usaron Node 24), configurar servicios y roles reales, publicar reglas/índices, revisar App Check/CORS/regiones y acordar dominio/continuidad de QR. Quedan para otra etapa PWA/offline, mapa/3D, búsqueda de servidor para inventarios grandes, auditoría/restauración, limpieza de archivos huérfanos y evaluación completa de accesibilidad.

## 2026-10-07 · Siete funcionalidades sobre React/Firebase

Se integraron propuestas con fotografías, corrección y reenvío; avisos internos con lectura individual; favoritos y colecciones privadas; comparación de hasta tres especies y nuevos filtros; cuestionarios de profesores con calificación y resultados privados; PWA con guardado explícito de fichas públicas; historial y papelera con restauración como borrador.

La revisión de las pruebas detectó y corrigió: historial que mostraba una publicación incorrecta tras restaurar, sobrescritura de fotos permitida por el emulador al interpretar la subida como creación, blobs descargados sin tipo MIME y caché estática incompatible con la cabecera Vary: Origin de Vite. Las reglas ahora exigen recurso inexistente para crear fotografías de propuestas; el guardado offline usa el MIME validado de Storage y la caché solo omite Vary para archivos públicos expresamente incluidos y versionados.

Validación ejecutada: 8/8 pruebas unitarias y 11/11 pruebas de integración; regresión de auditoría repetida tras ajustar el estado de aprobación. Compilación Vite correcta, con avisos de tamaño y módulos importados de forma estática/dinámica. Chrome: siete recorridos nuevos completos y doce del catálogo/CRUD anterior, ambos sin errores JavaScript. Se verificó la ficha del girasol con foto tras desconectar la red y recargar, así como exclusión de API Firebase y visor 3D de la caché. Capturas y resultados en work/qa. Comparación de 105 hashes Django: ningún cambio. Se retiraron las fichas/cuentas de prueba y sus entradas identificadas de papelera e historial.

La guía docs/FUNCIONALIDADES.md describe rutas, roles, límites y prueba manual. Esta ampliación sustituye los pendientes históricos de PWA, auditoría y restauración mencionados más arriba. La publicación real, Node 22 productivo, dispositivos físicos, App Check/CORS y limpieza de archivos huérfanos siguen pendientes; no se desplegó ni habilitó facturación.

## 2026-10-07 · Navegación, acceso y perfil con emil-design-eng

Se aplicó la skill instalada de Emil Kowalski al rediseño solicitado. Las dos barras distinguen navegación principal, herramientas y cuenta, con iconos, estados activos y adaptación móvil. Login y registro comparten una composición botánica de dos paneles y controles consistentes; se incorporó mostrar/ocultar contraseña con nombre accesible. El registro explica el alcance del rol elegido. El perfil separa identidad/rol, accesos personales y datos editables, con iniciales, contador de biografía, reintento de carga y estados de guardado. Se conservó el regreso al inicio tras guardar y la solicitud de aprobación para profesores.

Las transiciones de interacción duran 140–240 ms, se limitan a propiedades explícitas, evitan desplazamientos al navegar con teclado y respetan prefers-reduced-motion. No se añadieron dependencias, librerías de animación ni cambios de backend/reglas. El original Django continúa intacto.

Validación: build Vite correcto (continúan advertencias conocidas sobre tamaño/importaciones); ocho pruebas unitarias aprobadas. El recorrido tests/account-design-browser.cjs verificó diseño sin desbordamiento a 360/390/768/1440 px, contraseña visible/oculta, error de credenciales, registro con solicitud, perfil persistente, regreso al inicio, movimiento reducido, teclado y cierre de sesión móvil, sin errores JavaScript. tests/roles-browser.cjs confirmó además aprobación administrativa, propuesta de especies, carga de GLB y revocación de permisos en sesión. Capturas y resultados en work/qa. Integridad Django: 105 archivos comparados, ningún cambio. La adaptación móvil se comprobó en Chrome automatizado; no se probó en un teléfono físico.

También pasó el recorrido completo tests/browser.cjs: doce comprobaciones de catálogo, filtros, paginación, acceso, CRUD de especies/ejemplares/fotos, borradores y cierre de sesión, sin errores JavaScript. Se retiraron sus entradas QA identificadas de historial y papelera y se guardó el estado local de los emuladores.

El export local generó correctamente sus archivos, pero Windows rechazó el renombrado final con EPERM. Se recuperó mediante copia de la carpeta temporal a work/emulator-data y comparación de hashes; los exports temporales se excluyen también mediante .gitignore. No se modificó la configuración de Firebase productivo.


## 2026-10-08 — Bienvenida 3D, etiqueta QR y Vercel

- Integrada copia de la planta GLB de la portada Django y su póster, con interacción, giro opcional, movimiento reducido y recuperación ante descarga fallida. Se restaura el color procedural perdido en la exportación usando el verde base de la escena original.
- Etiqueta QR con identidad Flora Viva, identificación de especie, SVG vectorial para impresión, descarga PNG de 1200 px y origen público configurable. La impresión incluye solamente la etiqueta.
- Configuración SPA para Vercel y guía detallada de Firebase real, variables, dominio, CORS, administrador inicial y límites de la migración de datos. No se desplegó ni habilitó facturación.
- Validación: build Vite correcto (advertencias de tamaño de chunks e imports existentes); 10 pruebas unitarias correctas. Chrome local: carga GLB, giro, movimiento reducido, 390/1440 px sin desbordamiento, impresión exclusiva de etiqueta y PDF generado, fallo de red y reintento exitoso, sin errores JS de página. Artefactos locales en work/qa. No se ha probado una impresión física ni producción Node 22; ejecución local Node 24.
- Integridad Django: 105 archivos comprobados, cero cambios.

## 2026-10-09 — Instalación de Functions

Corregida la guía Vercel: el workspace pnpm ya instala functions. npm --prefix functions install ejecutaba prepare en el enlace local de firebase-admin y fallaba por gulp ausente. Verificado pnpm install --frozen-lockfile: dos proyectos, salida 0, dependencias actualizadas. Persiste advertencia de Node 24 frente al runtime declarado Node 22; no se cambió el Node del sistema ni se desplegó.



## 2026-10-12 — Bienvenida del campus con Three.js

- Portada en `/` con la fotografía aérea aportada por el usuario, frase HTML y catálogo debajo en la misma página; `/catalogo/` conserva el acceso directo.
- Three.js 0.183.2 como dependencia directa. Escena fotográfica en plano con cámara ortográfica y desplazamiento suave con ratón; no representa una reconstrucción 3D del campus.
- Carga diferida, pausa manual, renderizado a demanda y suspensión fuera de pantalla/pestaña. Respaldo HTML sin WebGL y preferencia de movimiento reducido. Limpieza de recursos al navegar.
- Fotografía convertida a WebP (1.84 MB frente a 11.05 MB), sin recorte del archivo ni eliminación del crédito. Crédito adicional visible en la portada.
- Recursos Three.js excluidos de la precarga PWA. Sin cambios de backend, Django ni despliegues.
- Validación: 12 pruebas de Node correctas, compilación Vite correcta; revisión en navegador de portada, enlace al catálogo y ancho móvil de 390 px. El navegador informó que Firestore local no estaba accesible y mostró cero especies; no se verificó un catálogo poblado en esta revisión.
## 2026-10-12 — Plantillas rellenables e importación de especies

- Word con ficha de dos páginas y Excel con una especie por fila, instrucciones y lista de tipos de planta. Descargas en los formularios de administración y propuestas.
- Lectura local de DOCX/XLSX, avisos de campos pendientes, límites y fórmulas; revisión editable antes del guardado. Lotes de hasta 100 filas con avance individual y conservación de datos si falla el guardado.
- Se mantiene el circuito de aprobación del profesor y el control de acceso existente. No se modificaron backend, reglas ni Django; no hubo despliegue.
- Validación: `pnpm test` (19 pruebas) y `pnpm build` correctos; lector probado con copias rellenadas de ambas plantillas, entradas dañadas, XML con entidades, fórmulas, campos repetidos y límites de archivo; prueba de interfaz con Firebase simulado para carga sin guardado, error y reintento, avance de fila, flujo de profesor, bloqueo de estudiante y ancho móvil sin desbordamiento.
- Word se renderizó con Microsoft Word y se inspeccionaron ambas páginas; el renderizador empaquetado no encontró LibreOffice. Excel se abrió y se exportó una vista de los encabezados para revisar su presentación. Los PDF/PNG de comprobación permanecen en `work`, ignorado por Git.


## 2026-10-12 — Bienvenida independiente y transición botánica

- El inicio muestra únicamente la bienvenida del campus; el catálogo se consulta en `/catalogo/`. Se retiró la instrucción de desplazarse al catálogo en la misma página.
- Explorar la colección desvanece el mensaje y activa hojas SVG desde los bordes, que se retiran al cambiar de ruta (820 ms). Teclado y movimiento reducido navegan directamente. Se conservan enlaces reales, clic con modificadores y limpieza de temporizadores.
- Comprobación local con Edge/Playwright: separación de rutas, animación, limpieza al terminar, botón Atrás, movimiento reducido y ancho móvil. Captura revisada en `work/transition-preview`.

## 2026-10-12 — Revisión de la transición de bienvenida

Por preferencia del usuario, se retiraron las hojas SVG. La transición actual acerca la fotografía del campus, desvanece el mensaje y desplaza la imagen hacia arriba para revelar la sección de especies en la ruta independiente `/catalogo/`. Las tarjetas que entran en pantalla usan un movimiento corto de 12 px con opacidad, sin bloquear interacción. Movimiento reducido y teclado mantienen navegación inmediata. Prueba de navegador: rutas, ausencia de hojas, limpieza, Atrás, movimiento reducido y ancho móvil correctos. Compilación verificada.

## 2026-10-12 — Retiro de planta decorativa del catálogo

Se retiró el visor WelcomeModel de la cabecera del catálogo a petición del usuario y se ajustó la cabecera a una columna. No se eliminaron especies ni archivos 3D. Compilación verificada.

## 2026-10-13 — Vista rápida y galería de detalles

- Cada tarjeta del catálogo ofrece Vista rápida con fotografía, taxonomía, descripción abreviada, crédito y acceso a la ficha. Cerrar conserva búsqueda y posición, y devuelve el foco al botón de origen.
- La galería incluye fotografía principal y adicionales, miniaturas, ampliación 2×, navegación con flechas y deslizamiento táctil. Se conservan los formularios administrativos y los créditos.
- Diálogos nativos con Escape, confinamiento del foco, bloqueo del desplazamiento de fondo, diseño móvil y movimiento reducido. Sin nuevas dependencias ni cambios en Firebase.
- Validación: 19 pruebas unitarias y compilación correctas. `scripts/check-gallery-ui.mjs` verifica vista rápida, búsqueda conservada, foco, enlace a ficha, flechas, gesto táctil real, miniaturas, zoom y ancho móvil con datos e imágenes simulados. Capturas de escritorio y móvil inspeccionadas. Revisión independiente sin hallazgos importantes. No se probaron fotografías privadas de producción ni se desplegó.

## 2026-10-13 — Espacio entre acciones de guardado

Se añadieron 16 px de separación vertical entre Guardar especie y Guardar sin conexión en la ficha, conservando sus mensajes y comportamiento.

## 2026-10-13 — Retiro de galería y corrección del visor duplicado

Se retiró la galería pública interactiva; se conserva Vista rápida y la gestión administrativa de fotografías sin borrar archivos. Se reprodujo la duplicación del visor: las claves hermanas de ModelViewer y SpeciesQR coincidían con el ID de especie y una actualización de estado generaba tres secciones 3D. Se diferenciaron como model-ID y qr-ID. La prueba `scripts/check-model-duplicates.mjs` falló antes (3 secciones en vez de 1) y pasó después durante cambios repetidos de la ficha. La prueba de vista rápida confirma también ausencia de la galería pública.
