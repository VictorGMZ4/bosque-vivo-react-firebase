# Flora Viva Bosque Verde con React y Firebase

Fecha: 2026-10-05, America/Bogota. Aplicación nueva, separada del proyecto Django, que permanece intacto. Alcance autorizado: catálogo, fichas y CRUD administrativo de especies, ejemplares y fotografías. Incluye visor GLB del girasol, carga administrativa de modelos, perfiles y revisión de cuentas/especies. No incluye mapa.

Frontend React + Vite, rutas /catalogo/, /especies/:id/, /ingresar/ y /gestion/. Firebase Authentication identifica al equipo; roles autoritativos en Firestore conceden permisos; el claim admin original solo se usa si no existe documento de rol. Visitantes leen exclusivamente especies publicadas. Firestore almacena species, specimens, photos y registros de unicidad. Storage almacena fotografías bajo species/{id}/; las reglas controlan lectura según publicación y escritura por administrador. Cloud Functions callable validan mutaciones, unicidad y relaciones mediante transacciones; los clientes no escriben directamente en Firestore.

Los identificadores Django se conservan al importar, para mantener rutas de fichas. Exportación SQLite en modo solo lectura, sin usuarios, contraseñas ni sesiones. Importación inicial exclusivamente al emulador. No se despliega, activa facturación ni migra usuarios reales en esta entrega. El proyecto local usa demo-bosque-vivo: no conecta a recursos productivos. La configuración productiva se ofrece como plantilla explícita.

Datos públicos actuales y medios se copiarán para comprobar el catálogo. Los borradores se conservan en el emulador y quedan excluidos de visitantes. El rol administrador solo se asigna con herramientas confiables. Formularios incluyen validación y errores visibles; borrado de especie con ejemplares se impide. Archivos retirados no se eliminan físicamente sin política de limpieza.

La ampliación del 7 de octubre incorpora PWA con service worker propio, caché de recursos estáticos versionada e IndexedDB para copias explícitas de textos/fotografías públicos. Nunca se guardan respuestas de API en esa caché; no hay edición offline ni almacenamiento offline de GLB. La migración productiva sigue pendiente.

Rutas adicionales: /registro/, /perfil/, /usuarios/, /propuestas/ y /propuestas/nueva/. La callable workspace aplica permisos de perfil, solicitudes, revisión y roles. La aprobación de especie crea su registro e índice único de forma atómica. El frontend escucha su rol para actualizar los permisos de navegación.

Módulos nuevos de `workspace`: moderación con archivos inmutables de propuestas, notificaciones con lecturas individuales, colecciones privadas, aprendizaje con calificación en servidor e historial/papelera. Las rutas /mi-coleccion/, /comparar/, /aprender/, /notificaciones/, /historial/ y /sin-conexion/ integran estas funciones. Firestore deniega acceso directo a sus colecciones privadas; cada callable valida identidad y permisos. Los cuestionarios separan la versión del estudiante de las soluciones, y cada intento conserva la versión respondida. El historial de catálogo se escribe en la misma transacción que la mutación; restaurar una especie verifica unicidad y la devuelve como borrador con su galería. Véase [la guía funcional y de datos](FUNCIONALIDADES.md).

El rediseño de cuentas concentra ingreso, registro y perfil en `src/pages/Account.jsx`, cargado por ruta; sustituye sus implementaciones anteriores en Admin/Community. `SiteHeader.jsx` reúne navegación y herramientas según la sesión. `account.css` contiene estilos acotados a estas superficies e interacciones breves; `ui/Icon.jsx` comparte iconos vectoriales sin dependencias. Se mantienen las callables, reglas, rutas y flujo de aprobación existentes. Los controles de contraseña admiten gestores, pegado, teclado y etiquetas accesibles.


## Bienvenida, impresión y alojamiento — 2026-10-08

`WelcomeModel` importa el visor de forma diferida y sirve `public/models/welcome-plant.glb`, copia intacta del modelo Django. Restaura el verde base de las hojas desde la escena original sin alterar el GLB. El giro es opcional, se pausa fuera de pantalla y con movimiento reducido. Hay póster de respaldo y cada reintento usa una URL nueva para evitar reutilizar fallos almacenados por el cargador.

`SpeciesQR` genera SVG y PNG desde una ruta pública validada por `speciesPublicUrl`. La etiqueta de impresión se monta mediante portal fuera de la raíz React; el CSS oculta el resto de la interfaz únicamente cuando existe esa etiqueta. `VITE_PUBLIC_SITE_URL` fija un origen estable. IDs y rutas se conservan.

Vercel sirve `dist` con fallback SPA. Firebase mantiene Authentication, Firestore, Storage, reglas y funciones. Véase [VERCEL.md](VERCEL.md). El service worker no precarga GLB ni motor 3D. Django permanece independiente.


### Portada del campus (2026-10-12)
`CampusWelcome` se monta únicamente en el inicio. Una imagen HTML prioritaria sirve como respaldo; el módulo diferido `campus-scene` dibuja la misma fotografía con Three.js. `campus-scene-math` mantiene cobertura completa al mover la cámara y redimensionar. La escena se libera al desmontar y no intercepta el desplazamiento. La frase, enlaces y créditos son HTML accesible. La fotografía en `public/images/campus-unipaz.webp` procede del archivo aportado por el usuario y conserva su crédito institucional. No hay mapa ni localizaciones interactivas.
## Importación de plantillas Office

`PlantImport` carga bajo demanda el lector `species-import.js`. Se extrae únicamente texto de los campos botánicos permitidos de las plantillas DOCX/XLSX. Se limita el archivo a 5 MB, el contenido ZIP declarado a 20 MB y 1000 entradas, y Excel a 100 especies. XML con DTD/entidades se rechaza y las fórmulas no se ejecutan. React muestra los valores como texto; no se inyecta HTML del documento.

Los datos rellenan los formularios existentes de administración y propuestas. Cada registro requiere guardado explícito y mantiene los endpoints, permisos y validaciones de Firebase existentes. Las propuestas siguen `draftSubmission` y `submitDraft`. Los documentos y el lote permanecen en memoria del navegador, sin almacenamiento adicional ni nuevas reglas. Las plantillas versionadas están en `public/templates`.

### Transición a la colección

El inicio `/` monta `CampusWelcome` sin consultar ni renderizar el catálogo. `/catalogo/` monta `Catalog`. `CollectionTransition` permanece alrededor del contenido durante la navegación: desvanece el texto, acerca el campus y usa una capa fotográfica que sale hacia arriba al revelar el catálogo. Limpia temporizadores al terminar o desmontar. Los enlaces conservan su destino real y el modo de movimiento reducido omite la animación.

### Vista rápida y galería

`SpeciesQuickView` utiliza el registro ya cargado por el catálogo. `PhotoGallery` presenta los recursos ya autorizados de la ficha; `StorageImage` mantiene el acceso a Storage y el respaldo cuando falta una fotografía. `BotanicalDialog` monta un diálogo nativo mediante portal para evitar conflictos con animaciones de la página, conserva el foco y restaura el desplazamiento al cerrar. No hay nuevos endpoints ni permisos.

La galería interactiva está desactivada por decisión del usuario (2026-10-13); la administración conserva los registros y controles de fotografías. ModelViewer y SpeciesQR usan claves diferenciadas entre hermanos para evitar acumulación de nodos al actualizar la ficha.

### Navegación y exploración visual (2026-10-20)

`Layout` pasa `welcome` a `SiteHeader` y omite `SiteFooter` únicamente en `/`. La marca conserva nombre y subtítulo con `brand-flower.svg` como símbolo. `SiteFooter` se comparte entre las rutas interiores; no contiene datos de contacto inventados.

`Catalog` filtra los registros existentes en memoria: `candidates` aplica todos los filtros excepto tipo, alimenta sus contadores, y `matches` aplica el tipo seleccionado. La exploración aleatoria usa `matches`, sin consultas adicionales. `LoadingState` contiene esqueletos no interactivos; un reintento reinicia la consulta cuando falla. Las respuestas de componentes desmontados se descartan.

`BotanicalDialog` recibe una dirección de origen decorativa para la entrada/salida de la vista rápida, mantiene el diálogo modal hasta completar el cierre y limpia su temporizador. Los enlaces a ficha siguen navegando inmediatamente. `refresh.css` aplica transiciones breves, navegación de ficha fija y márgenes para todos los destinos. Se respeta movimiento reducido. No hay nuevos permisos, persistencia o llamadas de escritura.

### Tarjeta QR para pantalla y papel

`SpeciesQR` conserva `speciesPublicUrl` y el generador qrcode. La composición `Label` se renderiza con los mismos datos tanto en `.qr-preview` como en el portal `.qr-print-sheet`. Las imágenes del campus y las marcas se sirven desde `public/images`; `unipaz-logo.png` es el archivo original aportado por el usuario. La capa verde y el fondo beige incluyen SVG decorativos para conservar contraste incluso al imprimir sin fondos.

`species-qr.css` sustituye los antiguos estilos de QR de `welcome-qr.css`, mantiene códigos negros sobre blanco y usa un contenedor adaptable para la versión móvil. El portal no pertenece al contenedor móvil y siempre imprime horizontal en A4. La altura es automática para no truncar nombres. Un IntersectionObserver dispara solo la entrada de la tarjeta y se libera al desmontarse; impresión y movimiento reducido omiten animaciones. Las descargas PNG/SVG siguen siendo del código individual, mientras que Imprimir permite obtener la tarjeta completa como PDF.

El pie de página de las páginas interiores enlaza a `/sobre-el-proyecto/`, que contiene la presentación aprobada del proyecto. Sus iconos sociales son informativos y no tienen destinos configurados. Estilos encapsulados en `src/site-footer.css`; decoraciones SVG sin dependencias adicionales.

### Hotspots 3D manuales

`ModelViewer` comparte renderizado y captura de posición/normal con `ModelEditor`. La colocación usa `positionAndNormalFromPoint` de model-viewer; los botones son slots hotspot anclados a coordenadas del modelo, con lista HTML alternativa para consultar los textos. Referencia: https://modelviewer.dev/examples/annotations/. Se usa la pose estática del modelo; no se reproduce animación esquelética.

`species.model_hotspots`: lista de hasta 30 objetos `{id,title,description,position:[x,y,z],normal:[x,y,z]}`. Validación estricta en `functions/domain.js`; título 100, descripción 2000, vectores finitos y normal unitaria. `ModelEditor` valida GLB autocontenido y bloquea el guardado durante la comprobación. Reemplazo y retirada requieren confirmación y limpian puntos.

Las propuestas conservan `model:{path,credit,hotspots}` separado de `data`, bajo `submissions/{id}/models/*.glb`. Storage solo permite creación por profesor/admin propietario de borrador, sin sobrescritura, y lectura del autor o admin. `submitDraft` valida ruta, tamaño, MIME y contenido GLB; `reviewSpecies` copia el archivo a `species/{id}/models/` y publica los puntos en la misma transacción que la ficha. Rechazar/corregir conserva el modelo propuesto. Solo backend escribe datos de especies.

### Entrada desde códigos QR
Los códigos nuevos abren `/especies/:id/explorar/`, un pasaporte botánico público sin navegación global. Reutiliza los permisos de lectura, StorageImage y ModelViewer (incluidos los puntos guardados). La ficha completa sigue en `/especies/:id/`. El visor se monta al expandir su sección y carga por solicitud; la animación se pausa durante la exploración 3D. Los estilos están delimitados a passport-layout/species-passport.

### Decoración exclusiva del catálogo
CatalogBotanicals monta una capa absoluta limitada a los márgenes. El contenido y los filtros conservan prioridad visual e interactiva. Se muestran hasta diez motivos según la altura disponible; no se crean filas vacías para alojarlos. Los WebP con transparencia residen en public/images/catalog-botanicals-1.webp y catalog-botanicals-2.webp.
