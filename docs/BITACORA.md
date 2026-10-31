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

## 2026-10-20 — Bienvenida y exploración del catálogo

- Bloque autorizado por el usuario: el inicio conserva la marca con la flor, el campus, mensaje, créditos y accesos al catálogo; no monta las barras de navegación ni el pie de página. Las páginas interiores mantienen navegación según rol y estrenan pie con propósito, enlaces, referencia UNIPAZ y contacto pendiente.
- Se incorporó un símbolo SVG sin palabras a la marca existente, con nombre y subtítulo conservados. No se añadieron dependencias.
- Los filtros por tipo son botones con estado seleccionado y contadores que respetan búsqueda, familia, género, fotografía y modelo. Descubre una especie selecciona entre los resultados actuales y queda deshabilitado si no hay resultados.
- Esqueletos de carga en catálogo y ficha; los errores del catálogo ofrecen reintento. Navegación fija por descripción, morfología, ecología, usos, precauciones, fuentes y secciones existentes; destinos con margen para evitar que sus títulos queden cubiertos.
- Vista rápida con apertura desde la dirección de la tarjeta y salida breve, conservación del foco, Escape y temporizadores liberados. Fichas con entrada suave de texto y fotografía. Movimiento reducido omite animaciones y desplazamiento suave.
- Validación: 19 pruebas unitarias correctas y compilación Vite correcta. `scripts/check-refresh-ui.mjs` verifica bienvenida, logo, carga, filtros, selección aleatoria filtrada, navegación, QR sin solapamiento, pie, cierre/foco, ancho móvil, movimiento reducido, rol admin y reintento con registros sintéticos. Pasaron las regresiones `check-model-duplicates.mjs` y `check-collection-transition.mjs`. Capturas inspeccionadas y revisión independiente aplicada.
- Entrega local; sin publicación, escrituras en producción ni cambios en backend o reglas. Hotspots y rediseño de QR siguen pendientes.

## 2026-10-20 — Entrada animada con Anime.js

- Se integró la variante de hibisco aprobada por el usuario con Anime.js 4.5.0, fijado en package.json y pnpm-lock.yaml. El módulo de animación se carga bajo demanda, sin CDN, video o dependencias de las carpetas de demostración.
- Al abrir inicialmente `/` se presenta la flor sobre blanco durante aproximadamente 3 segundos, seguida de una breve brisa y un desvanecimiento de 260 ms hacia el campus. La bienvenida se monta en segundo plano. Al navegar de vuelta desde el catálogo no se repite; una recarga del inicio sí la reproduce. Los accesos directos a fichas y otras rutas no muestran la entrada.
- Omitir y Escape permiten continuar. El contenido de fondo permanece inert durante la entrada y recupera interacción, desplazamiento y foco en el título del campus al terminar. Movimiento reducido omite la secuencia. Fallos de importación abren la bienvenida y existe un límite de espera de 5 segundos. Temporizadores y animaciones se liberan al desmontar.
- Validación: 19 pruebas unitarias y compilación correctas. `scripts/check-intro-ui.mjs` pasó etapas SVG, finalización, desbloqueo, omisión, Escape, movimiento reducido, móvil, acceso directo, regreso sin repetición y fallo simulado de importación. Revisión independiente sin hallazgos importantes. Demostraciones y producción sin cambios.

## 2026-10-20 — Retiro de la pantalla de carga

Por petición del usuario se retiró toda la entrada de hibisco de la aplicación: componente, SVG, estilos, módulo de animación, prueba específica y dependencia Anime.js. El inicio vuelve a mostrar directamente el campus. Se mantienen las demostraciones independientes fuera del proyecto y el resto de mejoras autorizadas. README y arquitectura reflejan el estado actual. El rediseño del QR queda pendiente de referencias y definición del usuario; no se modificó en este cambio.

## 2026-10-21 — Tarjeta QR del campus

- Se implementó la referencia aprobada para pantalla e impresión: fotografía del campus con capa verde, marca Flora Viva, nombre común, nombre científico y familia, junto a un panel beige con QR, enlace al sitio y el archivo de logo UNIPAZ aportado por el usuario. Se conserva el crédito de Paolo Forero Vásquez.
- Una sola composición `Label` alimenta la vista y el portal de impresión. La tarjeta es horizontal en escritorio y papel; se apila en móviles para conservar legibilidad. La altura crece cuando los nombres son largos. Impresión en A4 con tarjeta de 180 mm de ancho, sin interfaz ni animaciones.
- Entrada de tarjeta de 280 ms al entrar en pantalla, sin animaciones continuas sobre el código. Movimiento reducido desactiva la entrada. No se añadieron bibliotecas ni cambios de permisos.
- Se conserva la generación QR canónica, negro sobre blanco, margen de cuatro módulos y corrección M. El código apunta a la ficha; el enlace de texto apunta al sitio. PNG y SVG continúan descargando el código individual; la tarjeta se imprime o guarda como PDF desde el diálogo del navegador.
- Validación específica: `check-qr-card-ui.mjs` pasó contenido dinámico, imágenes, enlace, aislamiento de impresión, móvil, nombres largos y movimiento reducido con registros simulados. Los PDFs normal, sin fondos y con nombre largo tienen una página y se revisaron visualmente. Un lector independiente decodificó la captura y las tres versiones PDF rasterizadas hacia la ruta correcta de especie. No se publicaron cambios ni se escribieron datos de producción.

## 2026-10-21 — Pie de página y presentación del proyecto

- Diseño aprobado: fondo verde bosque, textos crema, tres columnas, ramas SVG decorativas, marca Flora Viva y logo UNIPAZ en blanco. Adaptación vertical en móvil.
- Enlaces Inicio, Especies y Sobre el proyecto. Nueva ruta pública /sobre-el-proyecto/ con los tres párrafos aprobados por el usuario y la frase de conservación.
- Instagram, Facebook y YouTube son iconos informativos sin enlace ni botón; etiqueta Próximamente. Sin contactos inventados. El inicio sigue sin pie de página.
- Validación: build Vite correcto; comprobación local con Playwright de contenido, enlaces, redes inertes, exclusión del inicio y ausencia de desbordamiento a 390/768/1024 px. Capturas de escritorio y móvil inspeccionadas en work/footer-preview. Cambios solo locales, sin despliegue.

### 2026-10-21 — Laterales botánicos del pie de página

- Sustituidas las ramas geométricas por una imagen botánica transparente basada en la maqueta aprobada: acuarela desde el borde inferior izquierdo y follaje verde desde el superior derecho, parcialmente recortados.
- Recurso WebP local de 138.576 bytes, carga diferida, sin interacción y excluido de accesibilidad por ser decorativo. El contenido permanece como HTML seleccionable y enlaces reales.
- Ajustado el espacio de las columnas; en móvil se atenúan los laterales y se suaviza su recorte. Sin cambios en la bienvenida ni publicación en Vercel.
- Validación: compilación Vite correcta; Playwright verifica la ruta informativa, redes sin enlaces, exclusión en inicio y ausencia de desbordamiento a 390/768/1024 px; capturas de escritorio y móvil revisadas visualmente.

## 2026-10-21 — Editor manual de puntos informativos 3D

- Admin: añadir puntos sobre la superficie GLB mediante raycast, títulos y descripciones, seleccionar, recolocar y eliminar; persistencia en model_hotspots. Cambiar o retirar el modelo limpia sus puntos previa confirmación. Límite 30 puntos; se impide guardar durante la validación del archivo.
- Profesor: modelo y puntos en propuestas privadas; subida solo a su borrador y sin sobrescritura, inspección por admin, rechazo/corrección y publicación conjunta del modelo y puntos al aprobar.
- Visitantes: puntos numerados y lista alternativa para consultar textos, sin controles de edición. Carga diferida y limpieza de object URLs preservadas; no se añaden textos botánicos automáticamente.
- Se incorporó el modelo existente del girasol (especie local 8) al emulador, que todavía no lo tenía. No se añadieron puntos de prueba a esa ficha.
- Validación: 22 pruebas unitarias, 12 pruebas de integración con emuladores, prueba de navegador con GLB real (colocación, edición, recolocación, eliminación y móvil), guardado real mediante callable en ficha temporal con modelo de girasol y recuperación tras recarga. Registros temporales limpiados. Build correcto y diff sin errores de espacio.
- Revisión independiente detectó una carrera de guardado durante validación GLB; corregida en ambos formularios, con prueba de demora artificial de 900 ms. Comprobación adicional de formulario de ejemplares tras ajustar su guardado.
- Pendiente solo publicación autorizada: frontend, Functions y Storage rules. No se desplegó a Firebase ni Vercel.

### 2026-10-21 — Viñetas dentro del visor 3D

- Al seleccionar un punto, título y descripción aparecen en una viñeta superpuesta dentro del visor, conectada al marcador. Sigue la proyección del punto durante giro/zoom, se mantiene dentro del visor, admite texto largo con desplazamiento y cierre mediante botón o Escape.
- Marcador visual reducido de 36 a 23 px, conservando objetivo de pulsación de 44 px. La ficha pública ya no muestra el panel informativo exterior; la lista alternativa permite seleccionar puntos y el formulario de edición sigue separado del modelo.
- Validación: prueba unitaria de posicionamiento en bordes y móvil; navegador con GLB real, tamaño del marcador, ausencia del panel público exterior, contención y cierre de viñeta en móvil; captura revisada. Build correcto. Solo cambios locales.

### 2026-10-21 — Logo con contorno y marcadores discretos

- Sustituida la flor en cabecera, pie y tarjetas QR (pantalla/impresión) por la última imagen suministrada por el usuario. Se conserva transparencia y contorno claro; se recortó el margen transparente y optimizó a WebP de 55.038 bytes, sin regenerar el dibujo.
- Marcadores 3D reducidos de 23 a 16 px y sin números visibles. Se conservan el área de pulsación de 44 px, etiquetas accesibles, selección por lista y viñetas.
- Validación: build correcto; pruebas de navegador del pie responsive y hotspots con GLB real pasan, incluyendo tamaño 16 px, ausencia de números y apertura/cierre de viñetas. Cambios locales, sin despliegue.

### 2026-10-21 — Icono de escaneo QR

- Redibujado el icono SVG de teléfono y mano siguiendo la referencia del usuario: contornos redondeados, señal de toque y mano con relleno del panel para evitar líneas del teléfono atravesándola. Vector nítido compartido por pantalla e impresión, sin dependencias.
- Prueba previa a publicación: build correcto; check-qr-card-ui pasa con escritorio, móvil, nombres largos, imágenes y aislamiento de impresión. Captura de tarjeta revisada. Sin despliegue.

### 2026-10-21 — Retirada del icono QR

- Por petición del usuario se elimina el icono de teléfono/mano de la tarjeta compartida para pantalla e impresión, junto con sus estilos. Se conserva el texto de escaneo, el código y los demás elementos.
- Validación: build correcto. Cambio local, sin despliegue.

## 2026-10-21 — Pasaporte botánico al escanear QR
- Integrado el diseño aprobado en `/especies/:id/explorar/`: tarjeta aislada, sin cabecera/pie general, acabado holográfico y oscilación de 7 px. Pausa manual, al abrir 3D, al ocultar pestaña y respeto a movimiento reducido.
- Información real de Firestore, foto y autoría, primer párrafo de descripción, familia y hábito; avisos de demostración/borrador. Sin altura inventada ni datos fijos del prototipo.
- Modelo opcional reutiliza ModelViewer y sus puntos informativos. Carga por solicitud. Enlace a ficha completa conserva `/especies/:id/`.
- Los nuevos QR de pantalla, impresión y descarga usan `speciesExploreUrl`; se conserva `speciesPublicUrl` para direcciones completas. No se desplegó a Vercel.
- Validación: pnpm test (24/24), pnpm build correcto (advertencias existentes de tamaño de chunks); revisión independiente sin hallazgos materiales. Edge/Playwright con emuladores: visitante anónimo, datos y fotografía reales del girasol, pausa, carga GLB, móvil 390 px sin desbordamiento, navegación a ficha completa, especie inexistente y movimiento reducido. Capturas inspeccionadas; pruebas locales en work/check-passport.mjs.

## 2026-10-21 — Plantas laterales del catálogo y carga directa del pasaporte
- CatalogBotanicals muestra hasta diez ilustraciones alternadas en los márgenes, según altura real del catálogo. Entrada única con IntersectionObserver; ResizeObserver adapta distribución al filtrar/redimensionar. Sin eventos de puntero, sin cubrir contenido, sin alargar artificialmente la página. Móvil con recortes menores; movimiento reducido sin transición. Solo se monta en Catalog.
- Activos preparados con image_gen integrado (dos tiras transparentes de cinco referencias) y optimizados a WebP: public/images/catalog-botanicals-1.webp y catalog-botanicals-2.webp. Son adaptaciones decorativas de las imágenes entregadas, no fotografías identificativas de especies.
- ModelViewer acepta autoLoad=false por defecto; Explore lo activa al montar el visor después de abrir «Explora la especie en 3D». Se elimina el segundo clic solo en ese recorrido. Mantiene estados de carga/error, reintento y puntos existentes.
- Validación real: pnpm build correcto; Edge/Playwright: diez decoraciones, revelado progresivo, márgenes sin superposición, búsqueda vacía, móvil 390 px sin desbordamiento, aislamiento de rutas, movimiento reducido. Prueba del pasaporte valida ausencia del segundo botón, GLB cargado, navegación completa y errores. Capturas revisadas en work/catalog-botanicals-*.png. Sin despliegue.

## 2026-10-21 — Ajuste de bordes y fichas móviles del catálogo
- Se suavizan los extremos de las ilustraciones con máscaras CSS, ocultando los fragmentos periféricos de las tiras y evitando cortes rectos visibles. Inclinaciones individuales de 8–14 grados, conservadas con movimiento reducido.
- En móvil se reserva más margen lateral: contenido 44 px más estrecho, fichas con relleno menor y controles conservados. Una columna hasta 600 px para mantener legibilidad. Sin cambios en la ficha del QR.
- Validación: compilación correcta; Playwright comprueba revelado, filtros, ausencia de solapamiento y desbordamiento móvil, aislamiento y movimiento reducido. Captura móvil revisada. Sin publicación.

## 2026-10-22 — Composición natural de los laterales
- Aplicada la muestra revisada: cuatro imágenes separadas (rama y palma desde la derecha, variegada y ave del paraíso desde la izquierda). La base de los tallos queda fuera del viewport; orientación individual. Se reemplaza la tira de diez motivos por estas cuatro composiciones para evitar fragmentos vecinos.
- Eliminadas máscaras, difuminación y opacidad decorativa. Archivos en public/images/catalog-{branch,palm,variegated,bird}.webp; derivados con image_gen integrado y optimizados conservando alfa. La palma es una adaptación de frondas completas de la referencia, no un recorte rectangular.
- Revelado por traslación de la imagen observando un contenedor fijo, corregido después de que la prueba detectara que observar la misma imagen desplazada impedía su entrada. Mantiene preferencias de movimiento reducido, márgenes móviles y aislamiento del catálogo.
- Verificado: compilación correcta; prueba Edge pasa con cuatro motivos, aparición al bajar, no solapamiento con contenido ni desbordamiento móvil, filtros y movimiento reducido. Captura de escritorio revisada. No publicado.

## 2026-10-22 — Escala de plantas laterales en móvil
- Las cuatro ilustraciones usan el mismo ancho en píxeles en escritorio y móvil (253/265/170/138), en lugar de reducirse con el margen. En pantallas estrechas cambia su anclaje exterior para mostrar fragmentos grandes conservando el espacio del contenido y la base del tallo fuera de pantalla.
- Verificado con Edge/Playwright: aparición al desplazarse, cuatro motivos, filtros, ausencia de desbordamiento horizontal móvil y movimiento reducido. Sin despliegue.

## 2026-10-22 — Carta simplificada y diez ilustraciones del catálogo
- El visor de la carta usa presentación compacta: instrucciones accesibles sin texto visible, sin lista externa de puntos y crédito plegable. Conserva carga automática, marcadores y viñetas. La ficha completa y el editor mantienen sus controles.
- Se completan seis ilustraciones individuales (enredadera, platanera, rama, monstera, caladio y heliconia), derivadas de referencias del usuario con fondo transparente y optimizadas a WebP. Diez motivos distribuidos según altura disponible, con aparición al desplazarse, orientación por tallo y escala compartida móvil/escritorio; sin máscaras difuminadas.
- Verificación: build correcto (advertencias de tamaño de bundles/importaciones existentes); navegador Edge: diez motivos, aparición progresiva, filtros, movimiento reducido, ausencia de desbordamiento móvil y exclusividad del catálogo. Carta: carga 3D, dos puntos conservados, créditos plegados, navegación y vista móvil. Revisión visual de capturas escritorio/móvil.
- Cambios locales; sin despliegue ni modificaciones de datos de especies.

## 2026-10-22 — Preparación de publicación autorizada
- Dominio floraviva-unipaz.vercel.app conectado al proyecto existente bosque-vivo-react-firebase; Vercel confirma configuración válida. floraviva.vercel.app no disponible.
- Verificación previa: 24 pruebas unitarias y 12 de integración en emuladores correctas; build Vite correcto. Revisión estática adicional sin bloqueos críticos/importantes.
- Actualización del backend Firebase iniciada antes de publicar el cliente: las nuevas escrituras requieren model_hotspots y reglas de modelos de propuestas.
- URL pública de QR pendiente de verificación por correo requerida por Vercel. Se conserva el dominio anterior.
- Despliegue de reglas Storage confirmado. El primer despliegue de funciones terminó con timeout; ambas figuran ACTIVE pero workspace conserva la versión anterior, por lo que se reintenta esa función antes de publicar el cliente.
- Resultado de publicación: workspace y mutate actualizadas con confirmación Successful update operation. Commit 3851cb9 enviado a main; Vercel deployment DkH3JWPgbH16kMUob2S1CsQkV2JH Ready en Production.
- Comprobación pública: floraviva-unipaz.vercel.app/catalogo carga las dos especies productivas y siete ilustraciones correspondientes a su altura; carta de Sangre toro abre sin barra superior ni pie. No se copiaron datos de emuladores.
- Pendiente: Vercel exige verificación por correo para editar VITE_PUBLIC_SITE_URL. Los QR publicados aún usan bosque-vivo-react-firebase.vercel.app (dominio conservado y funcional); falta fijar https://floraviva-unipaz.vercel.app y redesplegar.
- QR finalizado: verificación de identidad completada por el propietario, VITE_PUBLIC_SITE_URL guardada como https://floraviva-unipaz.vercel.app y redespliegue de producción Ready (bosque-vivo-react-firebase-axa80s9qs-flora-viva.vercel.app). La etiqueta muestra el dominio nuevo. El SVG descargado coincide exactamente con un QR generado para https://floraviva-unipaz.vercel.app/especies/3twoxvQ0zquGNcMNRnOk/explorar/.
- Una pestaña previamente abierta conservaba el cliente anterior en el service worker; cerrar las pestañas antiguas permite activar la actualización. No se guardaron códigos de verificación ni credenciales en archivos del proyecto.

## 2026-10-22 — Descargas multimedia tras cambio de dominio
- Causa confirmada: CORS del bucket flora-viva---bosque-verde.firebasestorage.app solo admitía GET/HEAD desde bosque-vivo-react-firebase.vercel.app. El dominio nuevo quedaba excluido.
- Se agregó https://floraviva-unipaz.vercel.app para GET/HEAD y Content-Type, conservando la política anterior, reglas de Storage e IAM. Lectura posterior de la configuración confirmó el cambio.
- La foto de Arizá volvió a cargar como blob y decodificó correctamente en el dominio nuevo.

## 2026-10-27 — Actualización de documentación operativa
- README.md reorganizado para reflejar producción, dominio definitivo, QR al pasaporte, visor compacto, puntos manuales de admin/profesor, diseño botánico y separación de datos locales/productivos.
- docs/VERCEL.md actualizado como guía de mantenimiento del proyecto existente: orden backend/frontend, variables, despliegues confirmados, CORS con ambos orígenes, caché PWA y regeneración de QR descargados.
- Se retiran afirmaciones obsoletas de ausencia de despliegue, exclusividad local y carga de modelos solo por admin. Se distinguen comprobaciones históricas del 22 de octubre de pendientes no verificados.
- Validación de esta actualización: contraste con código, configuración y bitácora; revisión de enlaces locales y diff. Solo documentación, sin despliegue ni cambios de datos o permisos.

## 2026-10-28 — Limpieza de código muerto y documentación coherente con producción
- Primer cambio de Claude en el equipo, aprobado por el usuario antes de validarse.
- Eliminada `requireAdmin` de `functions/domain.js`: no se llamaba y solo comprobaba el claim `admin`, sin consultar `roles/{uid}`. Retiradas sus importaciones en `functions/index.js` y `functions/service.js`, y sus aserciones en `tests/domain.test.mjs`. Los permisos siguen aplicándose con `requireRole` y están cubiertos en `tests/roles.test.mjs`. Sin cambios de comportamiento, reglas ni contrato de las funciones.
- README: retirados los puertos de sesión 4188/4197 (solo existen 5174 y 4174 con `strictPort`) y el enlace absoluto a Sobre el proyecto. VERCEL.md aclara que instalación y versión de Node se configuran en el panel de Vercel, no en `vercel.json`.
- ROLES, MODELO_DATOS, FUNCIONALIDADES y ARQUITECTURA ya no afirman ausencia de despliegue; documentan modelos y puntos en propuestas de profesores, `model_3d`/`model_hotspots` y `submissions.model`. ARQUITECTURA conserva su historial con una nota de estado actual.
- Validación: `pnpm test` 24/24; `pnpm test:integration` 12/12 con emuladores demo-bosque-vivo; `pnpm build` correcto (advertencias de tamaño de chunks ya existentes); `functions/index.js` carga y exporta `mutate` y `workspace`.
- Observación: desde Git Bash, `pnpm emulators` no encuentra Java aunque detecta el JRE de Autopsy; probablemente porque el script añade `Path` mientras ese entorno usa `PATH` (hipótesis sin confirmar). Se arrancó exportando `JAVA_HOME` y `PATH`, sin modificar el script. No se probó desde PowerShell.
- Sin commit ni despliegue. Para producción bastaría con redesplegar Functions, pero el cambio no altera su comportamiento y puede esperar a la próxima publicación.

## 2026-10-29 — Bloqueo y desbloqueo de cuentas
- Diseño aprobado por el usuario antes de implementarse. Solo cambios locales con emuladores demo-bosque-vivo; sin commit ni despliegue.
- Backend: `roleFor` rechaza cuentas con `roles/{uid}.disabled`, y `workspace` lo comprueba al entrar, cubriendo también perfil, colecciones, notificaciones y cuestionarios. Nueva acción `setAccountStatus` (solo admin, nunca sobre la propia cuenta, motivo obligatorio al bloquear): marca el bloqueo conservando el rol, deshabilita la cuenta en Authentication, revoca sesiones, registra `audit` (entidad `account`) y notifica el desbloqueo. `listUsers` informa el estado. `setRole` y la aprobación de profesor usan merge para no borrar un bloqueo.
- Reglas: `admin()` y `teacher()` de Firestore y Storage exigen `disabled != true`, porque el token vigente sigue siendo válido hasta una hora.
- Frontend: Usuarios muestra Estado (Activa/Bloqueada) y Bloquear (con motivo) o Desbloquear (con confirmación). Una sesión bloqueada se cierra y vuelve a Ingresar con el aviso; `auth/user-disabled` muestra el mismo mensaje. Se añadió `.status.error` para la etiqueta Bloqueada.
- Pruebas: nuevo `tests/accounts.test.mjs`, incluido en `test:integration`. Comprueba permisos para bloquear, autobloqueo, motivo, rechazo en workspace y Storage con token aún válido, admin bloqueado sin acceso a perfiles ajenos, conservación del bloqueo al cambiar rol, auditoría, desbloqueo y notificación.
- Validación: `pnpm test` 24/24; `pnpm test:integration` 13/13; `pnpm build` correcto (advertencias de chunks existentes). En el navegador local con `pnpm dev` y cuentas QA temporales: bloqueo desde Usuarios con motivo, etiqueta y mensaje; ingreso de la cuenta bloqueada rechazado con aviso; una sesión abierta bloqueada mediante la función se cerró y volvió a Ingresar con el aviso; desbloqueo con confirmación. En 375 px la página no se desborda y la tabla se desplaza dentro de su contenedor; con el formulario de motivo abierto la columna de asignación queda estrecha pero usable. Cuentas QA y sus registros eliminados.
- Observación: el emulador arrancó sin datos porque no existe `work/emulator-data`; quedan exportaciones antiguas `firebase-export-*` en la raíz, sin restaurar. La cuenta de `work/local-access.json` no existe en este estado, así que la prueba de interfaz usó un administrador QA temporal.
- Para producción hará falta publicar juntos Functions, reglas de Firestore y Storage y frontend, solo con autorización.

## 2026-10-29 — Restauración del inventario local de emuladores
- Por petición del usuario. Los emuladores arrancaban vacíos porque no existía `work/emulator-data`; solo había tres exportaciones sueltas en la raíz (`firebase-export-*`, del 7 y 13 de octubre), restos de cierres anteriores.
- Se detuvieron los emuladores en ejecución forzando el cierre (Firebase CLI, Firestore y runtime de Storage, verificados por línea de comandos) para que su exportación al salir, vacía, no sobrescribiera la restauración.
- Se copió la exportación más reciente, `firebase-export-1791872274272XZRDPx` (2026-10-13), a `work/emulator-data`; `diff -rq` confirmó una copia idéntica. Las tres exportaciones originales se conservan sin cambios. No se buscaron otras exportaciones posteriores: no existe ninguna en la carpeta `bosque-vivo`.
- Estado restaurado: 3 cuentas (incluida la de `work/local-access.json`), 7 especies (6 publicadas y 1 borrador, `species/6`), girasol con foto y GLB (`species/8/models/original.glb`, 2.007.136 bytes), 0 ejemplares y 16 archivos en Storage. Trece imágenes pertenecen a especies QA que ya no existen, y `species/8/photos/9d07aa7a-….png` no está referenciada (no hay registros en `photos`). Las 14 quedan como huérfanas, útiles para probar su informe. No se corrigieron datos botánicos ni registros de demostración.
- Verificado en el navegador local: ingreso de la cuenta administrativa local, Usuarios con 3 cuentas activas y catálogo con las 6 especies publicadas.
- Para conservar cambios futuros, los emuladores deben cerrarse con Ctrl+C (exportación al salir). Si se cierran forzosamente, `work/emulator-data` conserva este estado restaurado.

## 2026-10-29 — Informe de archivos sin uso (solo lectura)
- Diseño aprobado por el usuario antes de implementarse. Fase 1 del tratamiento de huérfanos: no mueve ni elimina archivos; la cuarentena queda para una fase posterior. Solo cambios locales con emuladores demo-bosque-vivo; sin commit ni despliegue.
- Backend: nuevo `functions/storage-report.js` con `orphanReport`, despachado desde `workspace` (acción `orphanReport`). Exige rol admin, así que una cuenta bloqueada queda rechazada. Considera en uso `species.photo`, `model_3d`, `legacy_photo` y `legacy_model_3d`; `photos.path`; `submissions.photos[].path` y `submissions.model.path`; y las mismas rutas dentro de `trash`, para no dejar sin archivos una restauración. Los archivos modificados hace menos de 7 días se cuentan como recientes sin evaluar. Cada huérfano indica motivo: especie inexistente, propuesta inexistente, no referenciado o fuera de las carpetas conocidas. La fecha de corte solo se puede fijar desde las pruebas.
- Frontend: sección **Archivos sin uso** al final de Historial y papelera, con botón Generar informe, resumen y tabla (archivo, tamaño, fecha, motivo).
- Pruebas: nuevo `tests/storage-report.test.mjs`, incluido en `test:integration`. Comprueba que estudiante y admin bloqueado son rechazados, que los archivos recientes no se listan, y con una fecha de corte de 8 días después: archivos en uso y de la papelera excluidos, los cuatro motivos, cuadre de totales y que el informe no borra nada.
- Validación: `pnpm test` 24/24; `pnpm test:integration` 14/14; `pnpm build` correcto (advertencias de chunks existentes). En el navegador local con la cuenta administrativa restaurada: 18 archivos revisados, 2 en uso (foto y GLB del girasol), 2 recientes y 14 sin uso, los mismos 14 identificados en la restauración.
- Ajustes aprobados por el usuario tras la primera verificación:
  - Tamaños en KB por debajo de 1 MB y en MB a partir de ahí, con formato `es-CO` (antes, los archivos pequeños aparecían como 0.00 MB). Los archivos de menos de 0,05 KB se muestran como 0 KB.
  - `tests/integration.test.mjs` dejaba restos en cada ejecución: `species/{id}/photos/qa.png` en Storage y entradas «QA Storage» y «QA Ceiba» en `trash`. Son los 2 archivos recientes del informe y, previsiblemente, el origen de los 13 huérfanos de QA. Ahora ambas pruebas borran su archivo y su entrada de papelera; los registros de `audit` se conservan.
  - Validación de los ajustes: `pnpm test` 24/24; `pnpm test:integration` 14/14; `pnpm build` correcto. Antes y después de una ejecución completa de integración, los emuladores tenían los mismos 18 archivos, 4 entradas de papelera y 7 especies. En el navegador, el resumen muestra 14 sin uso (1,4 KB).
  - No se limpiaron los restos de QA ya existentes (2 archivos recientes, 4 entradas de papelera y 13 huérfanos antiguos); los huérfanos se conservan para probar la fase de cuarentena.

## 2026-10-30 — Botones separados en propuestas y autores visibles
- Parte del paquete de cuatro mejoras aprobado por el usuario (separación de botones, autores, permisos de profesor/estudiante y mapa). Este registro cubre las dos primeras. Solo cambios locales con emuladores demo-bosque-vivo; sin despliegue.
- Separación: se recorrieron 15 pantallas a ancho de escritorio y a 375 px midiendo la distancia entre botones y etiquetas, y se revisó en el código lo que no tiene datos locales. Solo la tarjeta de propuesta tenía la etiqueta de estado pegada a «Ver propuesta» (0 px). Ahora ambos van en `.actions` (12 px y salto de línea si no caben).
- Autores: nuevo `functions/people.js` (nombre del perfil o de Authentication y correo; cuenta inexistente sin datos). `historyList` y `trashList` devuelven `actor`; Historial muestra «Hecho por» en cada cambio y la papelera «Retirada por». Nueva acción `submissionAuthors` (solo admin por ahora; devuelve únicamente los autores de las propuestas pedidas) para mostrar «Propuesta por» en cada tarjeta y en el detalle. Sin datos se muestra «Cuenta no disponible».
- Pruebas: nuevo `tests/authors.test.mjs` (autor en historial y papelera, autores de propuestas, rechazo a estudiante y a entrada inválida, cuenta eliminada).
- Validación: `pnpm test` 24/24; `pnpm test:integration` 15/15; `pnpm build` correcto. En el navegador local, con una propuesta y profesora QA temporales (después borradas): la etiqueta y el botón quedan a 12 px, «Propuesta por: Profesora QA (correo)» aparece en la tarjeta y en el detalle, e Historial muestra el nombre y correo del administrador local en sus cambios y «Cuenta no disponible» en los de cuentas de prueba ya eliminadas.
- Observación: los emuladores se habían cerrado forzosamente al terminar la sesión anterior, así que se perdieron los cambios locales posteriores a la restauración (incluidas las 4 entradas QA de la papelera); el inventario restaurado sigue intacto.

## 2026-10-30 — Profesores publican directamente; estudiantes proponen con límite diario
- Tercera mejora del paquete aprobado por el usuario, con sus decisiones: el profesor crea y edita lo suyo, revisan profesores y administración. Solo cambios locales con emuladores demo-bosque-vivo; sin despliegue.
- Backend: `mutate` admite `teacher`. Puede crear especies (se guarda `created_by`) y editar especies, fotografías y ejemplares solo de especies propias (`created_by` o `submitted_by`, helper `owns` en `access.js`); no puede eliminar nada. `draftSubmission`, `submitSpecies` y `submitDraft` admiten estudiantes, sin modelo 3D, con un borrador abierto y un envío a revisión cada 24 horas (`submission_limits/{uid}`, en la misma transacción); reenviar una propuesta ya revisada no consume el turno. `reviewSpecies` admite profesores y rechaza revisar la propuesta propia. Los avisos de propuestas usan la audiencia `reviewers` (profesores y administradores). `submissionAuthors` admite profesores, que no reciben autores de borradores ajenos.
- Reglas: Firestore deja a un profesor leer sus especies sin publicar, con su galería y ejemplares, y las propuestas ajenas que no son borrador. Storage deja subir fotos de propuesta a cualquier cuenta activa dueña del borrador (los GLB siguen siendo de profesores), a quien revisa leer los archivos de propuestas enviadas y al profesor subir y leer archivos de sus especies.
- Frontend: menú «Mis especies» y «Revisiones» para profesores y «Mis propuestas» para estudiantes. Mis especies lista solo las propias, sin Eliminar. La ficha muestra Editar, galería y ejemplares a su dueño, y los botones de eliminar solo a Admin. El editor de propuestas oculta el modelo 3D a estudiantes. Revisiones combina las propuestas propias y las enviadas por otros.
- Pruebas: nuevo `tests/contributors.test.mjs` (publicación y edición propias, rechazo sobre especies ajenas y al eliminar, lectura de borradores, Storage, borrador único, sin GLB, límite de 24 h, corrección que no consume turno, revisión por profesores y nunca la propia, avisos, envío pasadas 24 h). Ajustadas aserciones que daban por hecho las reglas anteriores: en `roles.test.mjs` el profesor ya no tiene prohibido crear especies y el estudiante no puede revisar; en `hotspots-integration.test.mjs` las comprobaciones negativas pasan al estudiante, porque la especie aprobada pertenece al profesor; en `expansion.test.mjs` se cuentan solo los avisos propios del profesor, que ahora también recibe los de revisión.
- Validación: `pnpm test` 24/24; `pnpm test:integration` 16/16; `pnpm build` correcto. En el navegador local, con profesora y estudiante QA temporales: la profesora publica una especie y ve Editar sin Eliminar; el estudiante no ve el modelo 3D, envía una propuesta y el segundo envío se bloquea indicando la fecha (31 de octubre, 12:15 p. m.) y que su borrador queda guardado; un tercer intento avisa del borrador abierto; la profesora ve solo la propuesta enviada, con su autor, la aprueba y recibe el aviso. Cuentas y registros QA eliminados (7 especies, 0 propuestas y 3 cuentas, como antes).
- Durante la validación, tres ejecuciones fallidas de `roles.test.mjs` dejaron 4 propuestas y 4 límites de QA (el estudiante pudo enviar con la regla nueva); se eliminaron. El primer mensaje del límite usaba `resource-exhausted`, que el cliente mostraba con «[429]», y tenía punto doble; ahora usa `failed-precondition`.
- Observación sin cambios: el cliente de Functions añade el estado HTTP a todos los mensajes de error (por ejemplo «[400]»), también en funciones previas. Para producción hará falta publicar juntos Functions, reglas de Firestore y Storage y frontend, solo con autorización.

## 2026-10-30 — Mapa interactivo con la ubicación de las fotografías
- Cuarta y última mejora del paquete aprobado por el usuario (ubicación: GPS de la foto con respaldo; mapa satélite y calles). Solo cambios locales con emuladores demo-bosque-vivo; sin despliegue.
- Dependencias nuevas: `leaflet` 1.9.4 y `exifr` 7.1.3, cargadas bajo demanda (Leaflet queda en su propio fragmento de unos 150 kB). Se usó Leaflet directamente en lugar de `react-leaflet`, previsto en el diseño, para no añadir otra dependencia.
- Datos: ubicación opcional `{latitude,longitude,source}` en fotos de galería (`photos.location`), foto principal (`species.photo_location`) y fotos de propuestas, validada en `domain.js` (`validateLocation`). `species.map_points`, calculado por `mapPoints`, resume los puntos públicos; `mutate` lo recalcula en la misma transacción al cambiar la especie, su galería o sus ejemplares, y la aprobación de propuestas lo crea copiando la ubicación de cada foto. No se añadieron ubicaciones a especies existentes: aparecerán cuando alguien las registre.
- Frontend: `LocationPicker` lee el GPS de la foto al elegirla; si no lo trae, ofrece «Usar mi ubicación actual» y «Marcar en el mapa», y permite quitarla. Se integra en la foto principal del editor de especies, en Añadir fotografía de la ficha y en cada foto de las propuestas. `MapView` (marcadores circulares, ventana con miniatura protegida por reglas y enlace a la ficha) sirve para la página pública `/mapa/` (nuevo acceso «Mapa» en la barra de herramientas) y para la sección «Mapa de la especie» de cada ficha. Sin conexión, avisa de que la necesita. El service worker no intercepta las teselas.
- Pruebas: nuevo `tests/map.test.mjs` (validación y redondeo, conservar/retirar, puntos sin duplicar la portada) incluido en `pnpm test`, y `tests/map-integration.test.mjs` (recálculo al crear, editar y eliminar fotos, ejemplares y portada; ubicación inválida rechazada; aprobación de propuesta de estudiante con ubicación).
- Validación: `pnpm test` 26/26; `pnpm test:integration` 17/17; `pnpm build` correcto. En el navegador local, con una especie QA temporal (después borrada, con su foto): un JPEG generado con GPS EXIF (7.0651, -73.8542) mostró «Ubicación tomada de la fotografía» con su marcador; «Marcar en el mapa» la sustituyó; al guardar, la ficha mostró la sección Mapa con su punto, y `/mapa/` mostró «1 punto de 1 especie» sobre la capa satelital, con miniatura en la ventana emergente y «Ver ficha» navegando dentro de la app. A 375 px no hay desbordamiento horizontal y el mapa mide 339 × 560 px. No se probaron la ubicación del dispositivo (requiere permiso real del navegador) ni fotos reales de móviles; muchos móviles y aplicaciones borran el GPS al compartir fotos.
- Inventario local sin cambios tras la limpieza: 7 especies y 16 archivos.

## 2026-10-30 — Ubicación del visitante y zoom con la rueda en el mapa
- Diseño aprobado por el usuario, que facilitó las coordenadas del campus de UNIPAZ (7.069607105011221, -73.74561487578953). Solo cambios locales; sin despliegue.
- `src/campus.js` (nuevo): centro del campus, radio de 2 km y distancia haversine. El mapa abre en el campus en vez del centro de Barrancabermeja.
- `/mapa/`: aviso «¿Estás en el campus?» con «Usar mi ubicación» e «Ir al campus». El permiso se pide al pulsar, no al entrar, porque los navegadores penalizan las peticiones sin gesto de la persona. Con permiso, se dibuja «Estás aquí» con su círculo de precisión; a 2 km o menos centra en la persona (zoom 18) y, más lejos, lleva al campus indicando la distancia. Si se rechaza el permiso, lleva al campus y explica cómo activarlo. La ubicación no se guarda ni se envía.
- Rueda del ratón: siempre activa en `/mapa/`; en el mapa de la ficha y en el de marcar ubicación, se activa al hacer clic y se desactiva al sacar el ratón, con una nota bajo el mapa.
- Corrección encontrada al probar: `flyTo` de Leaflet lanza «Invalid LatLng (NaN, NaN)» si el contenedor aún no tiene tamaño, y al ocurrir en un efecto de React dejaba la página en blanco. Ahora, sin tamaño o con movimiento reducido, se usa `setView`. La inicialización asíncrona de Leaflet usa siempre los puntos, la ubicación y el destino más recientes.
- Pruebas: nuevo `tests/campus.test.mjs` (distancias y radio) en `pnpm test`.
- Validación: `pnpm test` 27/27; `pnpm build` correcto; sin cambios de backend. En el navegador local a 1280 × 800 (ubicación simulada, porque el panel no puede conceder el permiso): en el campus mostró «Estás en el campus» con el punto azul y zoom 18; desde Bogotá, «Estás a 265 km del campus; te mostramos el campus»; con permiso rechazado, el aviso y el campus. Con rueda real: en `/mapa/` alejó y acercó (17 → 15 → 17) sin desplazar la página; en la ficha de «Cayeno» (especie local registrada por el usuario, solo leída) la rueda desplazó la página hasta hacer clic, entonces alejó el mapa (17 → 15), y al sacar el ratón volvió a desplazar la página. Sin desbordamiento horizontal.

## 2026-10-30 — Rediseño visual del mapa de registros
- Diseño aprobado por el usuario, tomando como referencia la estructura de una captura de una aplicación de tareas agrícolas (panel de filtros, mapa satelital grande con controles flotantes, clima y pines en gota). Decisiones del usuario: clima con Open-Meteo y pines en todos los mapas, cada uno con la silueta de su tipo de planta. Solo cambios de frontend; sin despliegue.
- `/mapa/` (`SpeciesMap.jsx`, reescrito): panel plegable con búsqueda, filtros por tipo de registro (Todos, Fotografías, Ejemplares) y por tipo de planta con contadores, y lista de especies con miniatura, nombres, etiquetas y número de puntos. Elegir una especie la centra (con un solo punto abre su ventana) y tocar un pin resalta su especie en la lista. Sobre el mapa: selector de capa, pantalla completa, recuadro de clima, columna de controles (mi ubicación, campus, acercar, alejar) y avisos flotantes. En móvil, el mapa va arriba y el panel debajo, con filtros desplazables.
- `src/pins.js` (nuevo): pines SVG en gota con siluetas propias de árbol, arbusto, herbácea, palmera y trepadora (hoja genérica si no hay tipo), verde para fotografías y ámbar para ejemplares; el pin seleccionado se agranda. `MapView` usa estos pines en todos los mapas, admite controles propios (`controls=false`, `layer`), resalta una especie entera (`selected`), expone `zoomIn`, `zoomOut` y `show` y recalcula su tamaño con `ResizeObserver` al plegar el panel o entrar en pantalla completa. Iconos nuevos en `Icon.jsx`.
- Ajustes al probar: se rediseñaron las siluetas de árbol y trepadora, que no se reconocían; en móvil la lista horizontal de filtros ensanchaba la página a 807 px y se corrigió con `minmax(0,1fr)`.
- Validación: `pnpm test` 27/27; `pnpm build` correcto. En el navegador local a 1280 × 800 y 375 px, con 5 especies QA temporales (una por tipo de planta, después borradas) más «Cayeno» (especie local del usuario, solo leída): filtros (2 pines de ejemplares; «Palmera», solo QA palm), búsqueda, selección con ventana y miniatura, clic en pin que resalta la especie, panel plegable (mapa a 1169 px), capa de calles, clima mostrado (32 °C) y mapa de la ficha con el nuevo pin. Sin desbordamiento horizontal a 375 px. No se probó la pantalla completa real, que el panel integrado no permite.

## 2026-10-30 — Sistema de carga (implementado por Codex, revisado por Claude)
- Diseño aprobado por el usuario. Primera tarea repartida: Codex implementó el sistema de carga a partir de un encargo detallado; Claude hizo en paralelo una auditoría visual (emil-design-eng) sin tocar código, y después revisó el diff, ejecutó las pruebas y lo comprobó en el navegador. Solo frontend; sin despliegue.
- `src/loading.js` (contador de peticiones pendientes con `useSyncExternalStore` y `useSlow`), `src/LoadingProgress.jsx` (barra verde bajo la cabecera, visible tras 200 ms, también durante la carga de pantallas diferidas) y `src/loading.css`. `workspace` y `mutate` cuentan sus llamadas sin cambiar lo que devuelven.
- `LoadingState` gana las variantes page, list, table, form y map, y a los 8 segundos muestra «Está tardando más de lo normal.» con «Reintentar». Sustituyen los textos de carga de Suspense, comprobación de acceso, panel de administración, editores, perfil, propuestas, colecciones y mapa. `StorageImage` muestra un brillo mientras descarga y aparece con un fundido, conservando la ilustración de respaldo. Los botones principales con `busy` muestran un indicador giratorio (`aria-busy`). Todas las animaciones se detienen con movimiento reducido.
- Pruebas: nuevo `tests/loading.test.mjs` (contador) en `pnpm test`.
- Validación (Claude): `pnpm test` 29/29; `pnpm test:integration` 17/17; `pnpm build` correcto. En el navegador local a 1280 × 800, retrasando por script las llamadas a Functions: la barra apareció bajo la cabecera en Historial; Mi colección mostró el esqueleto de lista y, con 10 s de retraso, el aviso de espera larga; el botón «Generar informe» mostró el indicador giratorio. Codex no pudo usar `pnpm` en su entorno (usó npm y `--configLoader native`) ni ejecutar las pruebas de integración; Claude las repitió con `pnpm`.

## 2026-10-31 — Pulido de interacción (auditoría emil-design-eng)
- Ajustes aprobados por el usuario tras la auditoría de interacción. Solo CSS (`styles.css`, `refresh.css`); sin despliegue.
- Variable `--ease-out` (`cubic-bezier(.23,1,.32,1)`) para unificar curvas. Botones: respuesta al pulsar `scale(.97)` en 120 ms y sin el salto de 2 px al pasar el ratón (solo sombra); las pastillas de la ficha ya no saltan. El zoom de las fotos de tarjeta baja de 500 a 300 ms. El cierre del diálogo de vista rápida deja `ease-in` por la curva de salida en 150 ms.
- Mapa: los `hover` de filtros, lista, controles, capa y pines pasan a `@media(hover:hover) and (pointer:fine)`; filtros, especies, controles, capa y pestaña responden al pulsar; los pines usan la curva común. El aviso flotante y el clima aparecen con una entrada de 200 ms (fundido y 8 px). Los botones «Usar mi ubicación» e «Ir al campus» caben en una línea, y el clima se compacta por debajo de 480 px. Todo se desactiva con movimiento reducido.
- Se intentó `@starting-style` para las apariciones, pero en el panel oculto del navegador no se pudo confirmar su efecto; se usó una animación `@keyframes`, verificada al forzar el dibujado (termina en 200 ms con opacidad 1).
- Validación: `pnpm build` correcto; `pnpm test` 29/29. En el navegador local a 1280 × 800: transiciones calculadas con la curva común en pines, filtros y botones; botones del panel en una sola línea; aviso y clima visibles tras la entrada. La respuesta al pulsar no se puede medir por script; se comprobó que las reglas están en el CSS compilado.
