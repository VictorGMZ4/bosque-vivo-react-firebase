# Modelo de datos de Flora Viva Bosque Verde

Firestore se organiza en colecciones con identificadores string. Las especies importadas conservan la PK Django en el ID, por ejemplo `species/8`, y la ruta web `/especies/8/`. Los registros nuevos usan ID automático de Firestore; las referencias siempre son strings.

| Colección | Campos y función |
|---|---|
| species | common_name, scientific_name, family, genus, order, synonyms, habit, description, morphology, ecology, uses, precautions, references, photo, photo_credit, model_3d, model_credit, model_hotspots, is_published, is_demo, specimen_count, created_at, updated_at; datos históricos legacy_photo/legacy_model_3d al importar |
| specimens | species_id, code (se genera solo al registrar desde foto: tres letras del nombre común y un consecutivo, p. ej. GIR-001), photo (ruta en species/{id}/photos/), zone (opcional), latitude, longitude, height, observed_on, notes y timestamps para registros nuevos |
| photos | species_id, path, caption, credit, position y timestamps para registros nuevos |
| scientific_names | SHA-256 del nombre normalizado como ID; campo id con propietario species |
| specimen_codes | SHA-256 del código normalizado como ID; campo id con propietario specimens |

No se almacenan contraseñas en Firestore. Firebase Authentication almacena identidades. `roles/{uid}` define student/teacher/admin y prevalece sobre claims anteriores; se conserva fallback al claim admin para el administrador inicial sin documento de rol. El backend y las reglas consultan ese rol. Los clientes no escriben directamente documentos. Las colecciones de unicidad tampoco son legibles por clientes.

Lecturas públicas de especies requieren is_published=true; la consulta del catálogo aplica ese filtro. Las lecturas de fotos/ejemplares dependen de la publicación del padre. Staff puede ver borradores. Storage permite lectura con la misma condición y cargas administrativas de imágenes hasta 8 MB. La aplicación usa blobs del SDK para evitar convertir las fotos privadas en enlaces con token persistente.

La creación/edición/eliminación de especies y ejemplares ocurre en transacciones, junto con índices únicos y el contador de ejemplares. El borrado de especies consulta realmente la colección de ejemplares y no confía solo en el contador. Elimina los registros de galería asociados, con límite de 400 fotos por transacción; no borra físicamente archivos. Coordenadas deben suministrarse por pares.

Ubicación de fotografías (desde el 2026-10-30): `photos.location`, `species.photo_location` y `submissions.photos[].location` guardan `{latitude,longitude,source}` con seis decimales; `source` es `exif` (GPS de la foto), `device` (ubicación del dispositivo) o `manual` (marcada en el mapa). Es opcional: omitirla al editar conserva la anterior y `null` la retira; retirar la foto principal retira su ubicación. Al aprobar una propuesta, la ubicación se copia con cada foto. `species.map_points` es el resumen público del mapa (hasta 500 puntos: foto principal, galería sin repetirla y ejemplares con coordenadas), recalculado por las Functions en la misma transacción que cualquier cambio de la especie, su galería o sus ejemplares. Las especies existentes lo generan en su próxima edición.

Los nombres científicos se normalizan por espacios y mayúsculas/minúsculas para unicidad. Los nombres almacenados conservan su escritura. Las fechas de observación son ISO YYYY-MM-DD y los timestamps usan Firestore. Los créditos y campos vacíos se conservan; la exportación no crea fuentes botánicas.

Producción (`flora-viva---bosque-verde`, desde el 2026-10-22) tiene su propio inventario y sus propias cuentas: no se migraron datos ni usuarios desde los emuladores. El helper de importación está bloqueado fuera de los emuladores locales y no sobrescribe registros ya existentes. Los modelos GLB se almacenan en Storage, se asocian mediante `model_3d` y se visualizan bajo demanda. El administrador puede cargar modelos de hasta 30 MB.

`species.model_hotspots` guarda hasta 30 puntos informativos `{id,title,description,position:[x,y,z],normal:[x,y,z]}` (título 100 y descripción 2000 caracteres, normal unitaria). Sustituir o retirar `model_3d` vacía la lista. En `submissions`, el campo `model:{path,credit,hotspots}` conserva el modelo propuesto bajo `submissions/{id}/models/`, separado de `data`; al aprobar se copia a `species/{id}/models/`.

`species.created_by` guarda el UID de quien registró la especie directamente (desde el 2026-10-30) y `submitted_by` el de quien propuso una especie aprobada; ambos determinan qué especies puede editar un profesor. `submission_limits/{uid}.last_sent_at` registra el último envío a revisión de un estudiante (límite de 24 horas); solo lo escriben las Functions. Las notificaciones de propuestas usan la audiencia `reviewers` (profesores y administradores).

Colecciones nuevas: `roles` (rol, autor/fecha del cambio y bloqueo: `disabled`, `disabled_reason`, `disabled_by`, `disabled_at`), `profiles` (nombre, institución, biografía), `role_requests` (solicitud de profesor, estado, email y revisión), `submissions` (ficha propuesta, autor, estado y revisión). Perfil y solicitudes solo son legibles por propietario/administrador. Las propuestas solo aparecen en species después de aprobarse transaccionalmente. Véase ROLES.md.
