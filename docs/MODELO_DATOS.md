# Modelo de datos de Flora Viva Bosque Verde

Firestore se organiza en colecciones con identificadores string. Las especies importadas conservan la PK Django en el ID, por ejemplo `species/8`, y la ruta web `/especies/8/`. Los registros nuevos usan ID automático de Firestore; las referencias siempre son strings.

| Colección | Campos y función |
|---|---|
| species | common_name, scientific_name, family, genus, order, synonyms, habit, description, morphology, ecology, uses, precautions, references, photo, photo_credit, model_credit, is_published, is_demo, specimen_count, created_at, updated_at; datos históricos legacy_photo/legacy_model_3d al importar |
| specimens | species_id, code, zone, latitude, longitude, height, observed_on, notes y timestamps para registros nuevos |
| photos | species_id, path, caption, credit, position y timestamps para registros nuevos |
| scientific_names | SHA-256 del nombre normalizado como ID; campo id con propietario species |
| specimen_codes | SHA-256 del código normalizado como ID; campo id con propietario specimens |

No se almacenan contraseñas en Firestore. Firebase Authentication almacena identidades. `roles/{uid}` define student/teacher/admin y prevalece sobre claims anteriores; se conserva fallback al claim admin para el administrador inicial sin documento de rol. El backend y las reglas consultan ese rol. Los clientes no escriben directamente documentos. Las colecciones de unicidad tampoco son legibles por clientes.

Lecturas públicas de especies requieren is_published=true; la consulta del catálogo aplica ese filtro. Las lecturas de fotos/ejemplares dependen de la publicación del padre. Staff puede ver borradores. Storage permite lectura con la misma condición y cargas administrativas de imágenes hasta 8 MB. La aplicación usa blobs del SDK para evitar convertir las fotos privadas en enlaces con token persistente.

La creación/edición/eliminación de especies y ejemplares ocurre en transacciones, junto con índices únicos y el contador de ejemplares. El borrado de especies consulta realmente la colección de ejemplares y no confía solo en el contador. Elimina los registros de galería asociados, con límite de 400 fotos por transacción; no borra físicamente archivos. Coordenadas deben suministrarse por pares; no hay mapa.

Los nombres científicos se normalizan por espacios y mayúsculas/minúsculas para unicidad. Los nombres almacenados conservan su escritura. Las fechas de observación son ISO YYYY-MM-DD y los timestamps usan Firestore. Los créditos y campos vacíos se conservan; la exportación no crea fuentes botánicas.

No hay migración productiva o de cuentas reales en esta etapa. El helper de importación está bloqueado fuera de los emuladores locales y no sobrescribe registros ya existentes. Los modelos GLB se almacenan en Storage, se asocian mediante model_3d y se visualizan bajo demanda. El administrador puede cargar modelos de hasta 30 MB.

Colecciones nuevas: `roles` (rol y autor/fecha del cambio), `profiles` (nombre, institución, biografía), `role_requests` (solicitud de profesor, estado, email y revisión), `submissions` (ficha propuesta, autor, estado y revisión). Perfil y solicitudes solo son legibles por propietario/administrador. Las propuestas solo aparecen en species después de aprobarse transaccionalmente. Véase ROLES.md.
