# Flora Viva Bosque Verde

Primera etapa funcional de la migración a React y Firebase. Aplicación independiente de la carpeta hermana `bosque-vivo`: no utiliza Django para ejecutar el catálogo, autenticación, CRUD o fotografías. La carpeta original quedó intacta. El nombre de la aplicación es **Flora Viva · Bosque Verde**, con referencia institucional UNIPAZ.

La portada incorpora la planta 3D original de Django con giro/zoom, respaldo visual y reintento. El visor restaura el verde perdido al exportar el material procedural de Blender, sin modificar el GLB. Las fichas públicas incluyen una etiqueta QR de impresión con nombre común/científico, identidad institucional y descargas PNG/SVG. `VITE_PUBLIC_SITE_URL` fija el dominio definitivo de los códigos.

Para publicar React en Vercel y mantener Firebase como backend, consulta la [guía paso a paso de Vercel](docs/VERCEL.md). Se incluye `vercel.json` para las rutas. No se ha efectuado un despliegue real.

## Qué funciona en esta entrega

- Catálogo público con búsqueda por nombre científico/común, sinónimos y familia, filtros de familia/tipo y paginación local de nueve fichas.
- Ficha con identificación, taxonomía, textos botánicos, foto principal y créditos, galería y ejemplares.
- Ingreso y registro mediante Firebase Authentication. Roles Estudiante/Visitante, Profesor/Investigador y Admin, asignados por backend; solicitud de profesor con aprobación administrativa. Sin registro público de administradores.
- Crear, editar, publicar/despublicar y eliminar especies; unicidad de nombre científico validada en servidor mediante transacción.
- Crear, editar y eliminar ejemplares, códigos únicos, validación de fechas/coordenadas/altura y bloqueo del borrado de especies con ejemplares.
- Subir y cambiar fotografía principal; añadir, editar créditos/descripción/orden y eliminar registros de galería. Fotografías JPG/PNG/WebP hasta 8 MB; acceso a archivos según publicación de la especie.
- QR hacia `/especies/{id}/` de la nueva aplicación. Los identificadores originales se conservan. Los QR anteriores y el sitio Django no fueron modificados; para conservar códigos ya impresos al publicar, el origen público y esas rutas deben seguir disponibles.

**Actualmente se usa Firebase emulado en el computador, sin proyecto productivo ni facturación.** La ficha del girasol incluye el modelo GLB original mediante `@google/model-viewer`: carga bajo demanda, giro/zoom, restablecimiento de cámara y reintento de descarga. Se preserva el crédito original. Se añadieron instalación PWA y guardado de fichas públicas para lectura sin conexión; los modelos 3D requieren conexión. No se incluyó mapa.

La ampliación incorpora propuestas con fotografías y reenvío, notificaciones internas, colecciones privadas, comparación y filtros, cuestionarios, consulta offline e historial con papelera. Consulta [la guía de las siete funcionalidades](docs/FUNCIONALIDADES.md).

La navegación y las pantallas de cuenta se renovaron siguiendo `emil-design-eng`: barras principal y de herramientas diferenciadas, acceso/registro con identidad botánica, control de visibilidad de contraseña y perfil con resumen de cuenta, rol y formulario privado. El diseño se adapta a móvil, conserva el guardado con regreso al inicio y respeta movimiento reducido. Las solicitudes de profesor siguen requiriendo aprobación administrativa.

El GLB se guarda en Storage bajo `species/{id}/models/` y se obtiene mediante un blob sujeto a reglas de publicación. El administrador puede cargar GLB desde Editar especie, sustituirlos o retirar la referencia y editar el crédito. Los demás roles no pueden subir modelos. Tras reconstruir el inventario local, ejecuta `node scripts/run-local.mjs models` para importar los GLB autocontenidos (hasta 30 MB) desde la copia existente sin sobrescribir modelos asignados. El girasol ocupa aproximadamente 2 MB. El módulo del visor pesa unos 297 kB comprimidos y se descarga únicamente al pulsar «Cargar modelo 3D». Se requiere WebGL; la fotografía sigue disponible en la ficha.

## Iniciar en Windows

Requisitos: Node 22.12+ (Node 22 recomendado para Cloud Functions), pnpm 11 y Java 21 accesible en PATH o JAVA_HOME. En esta sesión se utilizó Node 24.19.0 y los emuladores ejecutaron las funciones con Node 24; el runtime productivo declarado es Node 22 y debe verificarse antes de publicar. El script de arranque puede aprovechar el Java 21 ya instalado por Autopsy en este equipo, sin modificar esa instalación ni las variables del sistema.

Desde esta carpeta:

```powershell
pnpm install --frozen-lockfile
pnpm emulators
```

El primer arranque descarga los binarios oficiales y requiere conexión. Se guardan en `work/firebase-emulators`; los servicios escuchan solo en 127.0.0.1. El estado se conserva en `work/emulator-data` cuando se cierra ordenadamente con Ctrl+C; si existe un export válido se restaura al iniciar. Auth 9099, Firestore 8080, Functions 5001 y Storage 9199; los puertos deben estar libres.

En otra terminal:

```powershell
pnpm build
pnpm preview
```

Abre [la aplicación compilada](http://127.0.0.1:4174/catalogo/). Para desarrollar con recarga automática usa `pnpm dev` y http://127.0.0.1:5174. React muestra un aviso visible de evaluación local. Las peticiones van directamente al SDK Firebase/emuladores; no necesitan el servidor Django.

## Datos originales y acceso local

La copia local ya contiene siete especies: seis publicadas y un borrador. Se mantuvieron los valores del inventario, incluidos nombres y marcas de demostración; no se corrigieron ni inventaron datos botánicos. El inventario original no contenía ejemplares ni fotografías de galería; estos flujos se comprobaron con registros QA temporales y se retiraron después de las pruebas.

La cuenta administrativa local tiene credenciales aleatorias en **`work/local-access.json`**. Abre ese archivo localmente para ingresar en `/ingresar/`. No son credenciales Django ni de una cuenta real. No publiques ni compartas ese archivo, los exports de Auth o la carpeta work.

Si necesitas reconstruir una copia inicial a partir del Django hermano:

```powershell
..\bosque-vivo\.venv\Scripts\python.exe scripts/export_django.py
pnpm import:local
```

El exportador usa únicamente SQLite en modo solo lectura y la biblioteca estándar de Python; no importa Django. Incluye especies, ejemplares y fotos con sus medios referenciados; excluye tablas de usuarios/sesiones/credenciales. Guarda todo en `work/import`. La importación solo acepta `demo-bosque-vivo` con los cuatro hosts locales; nunca apunta a producción. No sobrescribe registros existentes en el emulador. Los códigos/nombres se reservan transaccionalmente y se rechazan colisiones. Los archivos de destino se normalizan para aceptar nombres originales con espacios/acentos. Tras importar se crea/habilita solo la cuenta administrativa del emulador.

Las fotos retiradas y los archivos de QA permanecen físicamente en Storage para una futura limpieza con respaldo. Al eliminar la especie, sus archivos dejan de ser legibles por visitantes. No se usan URLs públicas con tokens de descarga: la interfaz obtiene blobs mediante el SDK y aplica reglas.

## Roles y colaboración

Consulta [la guía de roles](docs/ROLES.md). El registro permite seleccionar Estudiante/Visitante o solicitar Profesor/Investigador. El administrador revisa cuentas en Usuarios y especies en Revisiones. Mi perfil permite guardar nombre, institución y biografía; después vuelve al inicio. La previsualización de texto está disponible antes de guardar o enviar una especie. Los profesores pueden adjuntar hasta cinco fotografías con descripción y créditos, corregir propuestas rechazadas y reenviarlas; el administrador aprueba la ficha con sus fotografías.

## Estructura

El diseño integra **Tailwind CSS 4** mediante el plugin oficial `@tailwindcss/vite`. `src/styles.css` define la paleta botánica con `@theme` y componentes con `@apply` para tarjetas, paneles, cuadrículas, tablas y diálogos; el layout React también usa utilidades del tema. Se conservan el reset existente y CSS específico para tipografía, detalles visuales y animaciones accesibles. Las utilidades se generan localmente durante el build, sin CDN. Referencia: [integración oficial con Vite](https://tailwindcss.com/docs/installation/using-vite).

| Carpeta | Responsabilidad |
|---|---|
| `src/` | React, rutas, Firebase SDK, autenticación y componentes de consulta/administración |
| `functions/` | Backend callable, validación y transacciones de datos |
| `firebase/` | Reglas Firestore/Storage e índices |
| `scripts/` | Arranque, exportación de solo lectura y comprobación de integridad |
| `tests/` | Validación, permisos/CRUD reales en emuladores y recorrido de navegador |
| `docs/` | Arquitectura, modelo de datos, bitácora y pendientes |
| `work/` | Datos/emuladores/credenciales/evidencia local; nunca entrega pública |

## Pruebas

Con emuladores funcionando:

```powershell
pnpm test
pnpm test:integration
pnpm build
# Si Playwright está disponible en el runtime:
$env:PLAYWRIGHT_MODULE="ruta/al/modulo/playwright"
$env:BROWSER_PATH="C:/Program Files/Google/Chrome/Application/chrome.exe"
node tests/browser.cjs
node tests/features-browser.cjs
```

Validación de la ampliación del 7 de octubre: ocho pruebas unitarias y once de integración aprobadas, incluidos roles, moderación, colecciones, aprendizaje, notificaciones, papelera y permisos de archivos. Siete recorridos nuevos en Chrome verificaron las funciones integradas, incluida la recarga offline con fotografías; evidencia en `work/qa/features-results.json`. Pruebas de reglas esperan rechazos PERMISSION_DENIED; esos avisos en la consola son evidencia de denegación, no fallos de la suite. Chrome automatizado verificó el catálogo en 375/390/768/1440 px, ingreso, administración y CRUD de especies/ejemplares/fotos, borradores, bloqueo de borrado y cierre de sesión, sin errores JavaScript. Evidencia `work/qa/browser-results.json` y capturas. La comprobación `scripts/check-django.py` comparó 105 hashes de origen (incluyendo SQLite, medios, código y documentación): sin cambios. Excluye entornos virtuales, node_modules, work, staticfiles y __pycache__.

## Preparación para Firebase real

`.env.example` describe configuración web pública; nunca coloques una clave de cuenta de servicio en variables VITE_. La app usa emuladores por defecto. Para un proyecto real hacen falta proyecto Firebase, proveedor Email/Password habilitado, Firestore, Storage, backend desplegado, reglas e índices publicados y rol administrador asignado desde Admin SDK. No basta con copiar la configuración web.

El despliegue de Functions y Storage implica habilitar Blaze y revisar consumo. **No se habilitó ni desplegó nada en esta entrega.** Las credenciales Django y sus hashes de contraseñas no se trasladaron a Firebase; el acceso de las personas reales requiere una estrategia específica. La política de App Check, CORS productivo para blobs, regiones, dominio y continuidad de QR debe revisarse antes de publicar. La aplicación local no constituye validación de esos servicios productivos.

La consulta inicial descarga como máximo 1.000 especies y pagina en el cliente, adecuada para este inventario pequeño. Una colección grande necesita paginación/índices y búsqueda de servidor. No hay edición offline ni bloqueo/eliminación de cuentas desde la interfaz. El historial registra cambios nuevos; no reconstruye operaciones anteriores a su incorporación. La carga de foto y el guardado Firestore son operaciones distintas; un fallo puede dejar un archivo huérfano que debe limpiarse. El diálogo de eliminación y la interfaz necesitan evaluación exhaustiva de accesibilidad y dispositivos físicos; la verificación actual es emulada.

Referencias oficiales consultadas: [emuladores](https://firebase.google.com/docs/emulator-suite/install_and_configure), [funciones callable](https://firebase.google.com/docs/functions/callable), [claims y permisos](https://firebase.google.com/docs/auth/admin/custom-claims), [runtime Node](https://firebase.google.com/docs/functions/manage-functions). Detalles de la entrega en [bitácora](docs/BITACORA.md).

