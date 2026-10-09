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
