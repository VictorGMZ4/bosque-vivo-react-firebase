# Flora Viva · Bosque Verde

Aplicación de divulgación botánica de UNIPAZ construida con React, Vite y Firebase. Es independiente del proyecto Django de la carpeta hermana `bosque-vivo`.

**Documentación actualizada: 27 de octubre de 2026.** El estado de producción descrito corresponde a los despliegues y comprobaciones realizados el 22 de octubre; no implica una auditoría nueva de producción en esta fecha.

## Sitio publicado

- Sitio principal: **https://floraviva-unipaz.vercel.app**.
- Dominio anterior conservado: https://bosque-vivo-react-firebase.vercel.app.
- Repositorio: https://github.com/VictorGMZ4/bosque-vivo-react-firebase, rama `main`.
- Proyecto Vercel: `flora-viva/bosque-vivo-react-firebase`.
- Proyecto Firebase: `flora-viva---bosque-verde`.
- Storage: `flora-viva---bosque-verde.firebasestorage.app`.
- Backend: funciones callable `mutate` y `workspace`, región `us-central1`, runtime Node 22.

Las mejoras se publicaron desde el commit `3851cb9`. Después se redesplegó el mismo código con `VITE_PUBLIC_SITE_URL=https://floraviva-unipaz.vercel.app` y se corrigió CORS del bucket para admitir el nuevo dominio. Consulta [publicación y mantenimiento en Vercel](docs/VERCEL.md).

## Funcionalidades disponibles

- Catálogo con búsqueda, filtros por familia, género, tipo de planta, fotografía y modelo 3D; contadores, paginación y descubrimiento aleatorio entre los resultados.
- Ficha completa con identificación, taxonomía, descripción, morfología, ecología, usos, precauciones, fuentes, fotografía y ejemplares. La administración de galería permanece para administradores; no se presenta una galería pública en esta versión.
- Vista rápida del catálogo y pasaporte botánico independiente al escanear un QR.
- Firebase Authentication, perfil privado y roles Estudiante/Visitante, Profesor/Investigador y Admin. Las solicitudes de profesor requieren aprobación; no hay registro público de administradores.
- Administración de especies y ejemplares con validación en servidor, nombres científicos y códigos únicos, publicación, historial y papelera.
- Propuestas de profesores con fotografías, modelo 3D, puntos informativos, revisión administrativa, corrección y reenvío; notificaciones internas.
- Colecciones privadas, comparación de especies y cuestionarios evaluados por el servidor.
- Plantillas Word/Excel e importación para revisar la información antes de guardarla. [Guía de importación](docs/IMPORTAR-ESPECIES.md).
- Instalación PWA y guardado de fichas públicas para consulta offline con texto y fotografías. Los modelos 3D requieren conexión.

Consulta también [funcionalidades](docs/FUNCIONALIDADES.md) y [roles](docs/ROLES.md).

## Identidad y diseño

La bienvenida muestra la marca y el campus sin cabecera ni pie general; se retiró la pantalla introductoria de carga. El pie de las páginas interiores incorpora vegetación lateral, logos Flora Viva/UNIPAZ y enlaces Inicio, Especies y Sobre el proyecto (`/sobre-el-proyecto/`). Instagram, Facebook y YouTube permanecen como iconos informativos «Próximamente», sin enlaces.

El catálogo incorpora diez ilustraciones botánicas individuales en WebP transparente. Se muestran desde los costados al bajar, con orientación según cada tallo, sin difuminación. La cantidad visible depende de la altura disponible: un catálogo corto no necesita mostrar las diez. En móvil se conserva la escala de las plantas y se ajustan los márgenes de las fichas. Son decoraciones, no fotografías identificativas de las especies. Las animaciones respetan movimiento reducido.

## QR y carta de presentación

Los QR nuevos abren `/especies/{id}/explorar/` en el dominio definitivo. Esta carta muestra información breve, fotografía, familia, hábito y modelo opcional; mantiene el acabado holográfico y movimiento vertical suave, con pausa y soporte de movimiento reducido. No lleva la cabecera ni el pie general. «Ver ficha completa» abre `/especies/{id}/`.

Al pulsar «Explora la especie en 3D» comienza la carga del modelo, sin un segundo botón. El visor compacto conserva los puntos sobre la planta y sus viñetas; oculta las instrucciones visibles y la lista externa de puntos, y deja el crédito plegado.

«Compartir QR» ofrece una tarjeta con campus, nombres botánicos y marcas institucionales. «Imprimir etiqueta QR» permite imprimirla o guardarla como PDF; «Descargar QR» y «Descargar SVG» descargan el código individual. El icono de teléfono/mano fue retirado. El QR conserva margen blanco, contraste negro/blanco y corrección M.

`VITE_PUBLIC_SITE_URL` fija el origen de los QR al compilar. Los archivos descargados o impresos antes de cambiar la dirección **no se actualizan solos**: deben generarse nuevamente. El dominio anterior se conserva; las rutas de ficha completa siguen disponibles.

## Modelos 3D y puntos manuales

El administrador carga, sustituye o retira GLB desde **Editar especie → Modelo 3D** y puede editar el crédito. El profesor utiliza el editor en su propuesta; el archivo y sus puntos permanecen privados hasta su aprobación. Se aceptan GLB autocontenidos de hasta 30 MB, con validación en cliente y servidor.

Para crear un punto, pulsa «Añadir punto informativo», selecciona una superficie del modelo y escribe título y descripción. Se puede recolocar o eliminar; al guardar se conserva en `model_hotspots`. Máximo 30 puntos. Cambiar o retirar el modelo limpia los puntos anteriores previa confirmación.

Los visitantes ven marcadores pequeños sin números y, al seleccionarlos, una viñeta dentro del visor que sigue al punto durante giro/zoom. Se mantienen etiquetas accesibles y áreas de pulsación amplias. La ficha completa conserva la lista alternativa; la carta QR utiliza la vista compacta.

Los modelos publicados se guardan en `species/{id}/models/`; los de propuestas en `submissions/{id}/models/`. Fotos y GLB se descargan mediante blobs sujetos a reglas de Storage, no mediante enlaces públicos permanentes con tokens. El origen del sitio debe estar incluido en CORS del bucket.

## Desarrollo local en Windows

Requisitos: Node 22.12+ de la rama 22 para coincidir con Functions, pnpm 11 y Java 21 para emuladores. Las pruebas históricas locales también utilizaron Node 24; producción desplegó Functions con Node 22.

```powershell
pnpm install --frozen-lockfile
pnpm emulators
```

En otra terminal:

```powershell
pnpm dev
# Alternativa: compilar y servir la compilación
pnpm build
pnpm preview
```

Puertos configurados en `vite.config.js`: desarrollo http://127.0.0.1:5174 y preview http://127.0.0.1:4174, ambos con `strictPort`. Si el puerto está ocupado, Vite se detiene en lugar de cambiarlo; libéralo o consulta la URL que muestra la terminal.

Los emuladores usan `demo-bosque-vivo`: Auth 9099, Firestore 8080, Functions 5001 y Storage 9199, solo en 127.0.0.1. El primer arranque necesita conexión para descargar binarios. El estado se guarda en `work/emulator-data` al cerrar ordenadamente con Ctrl+C. La app usa emuladores por defecto; producción requiere `VITE_USE_EMULATORS=false` y la configuración web de Firebase.

## Datos y credenciales locales

La copia migrada de prueba y las especies productivas son inventarios independientes. Publicar código no copia especies, fotos, modelos, usuarios ni contraseñas desde los emuladores. No se inventan datos botánicos ni se sustituyen registros productivos con fixtures.

Las credenciales administrativas del emulador están en `work/local-access.json`. No son una cuenta productiva. No publiques `work`, exports de Authentication, `.env` reales ni cuentas de servicio.

Para reconstruir una copia local desde el Django hermano:

```powershell
..\bosque-vivo\.venv\Scripts\python.exe scripts/export_django.py
pnpm import:local
node scripts/run-local.mjs models
```

El exportador consulta SQLite en solo lectura y excluye usuarios, sesiones y credenciales. La importación solo admite el proyecto demo y hosts de emuladores; no sobrescribe registros existentes. El importador de modelos conserva los ya asignados. Eliminar una referencia no borra automáticamente su archivo físico: la limpieza de huérfanos requiere un proceso con respaldo.

## Estructura

| Carpeta | Responsabilidad |
|---|---|
| `src/` | React, rutas, SDK Firebase, autenticación, catálogo, carta QR y editores |
| `functions/` | Callables, permisos, validación GLB/puntos y transacciones |
| `firebase/` | Reglas Firestore/Storage e índices |
| `public/` | Logos, ilustraciones, recursos estáticos y service worker |
| `scripts/` | Arranque, importación local y comprobaciones |
| `tests/` | Validación y pruebas de permisos/integración |
| `docs/` | Arquitectura, operación y bitácora |
| `work/` | Datos y evidencia local ignorados por Git |

El diseño utiliza Tailwind CSS 4 mediante Vite, más CSS específico. El visor usa `@google/model-viewer`; la portada usa Three.js. Los prototipos de animación no deben confundirse con dependencias de la versión integrada.

## Comprobaciones y límites

```powershell
pnpm test
# Con emuladores iniciados:
pnpm test:integration
pnpm build
```

El 22 de octubre pasaron **24 pruebas unitarias, 12 de integración y el build**. Hubo comprobaciones locales de catálogo responsive, impresión QR, pasaporte, puntos manuales y movimiento reducido. Los avisos PERMISSION_DENIED de pruebas negativas son esperados. El build conserva advertencias de tamaño de bundles e importaciones compartidas.

En producción se confirmó el despliegue Ready, acceso al catálogo y cartas, y que el SVG QR generado coincide con el destino del nuevo dominio. Tras corregir CORS se comprobó la fotografía y el modelo de Arizá. Estas pruebas no equivalen a validar cada dispositivo físico, todos los modelos ni el escaneo de una impresión.

El service worker conserva una versión coherente de la aplicación y espera a que se cierren sus pestañas para activar la siguiente. Si aparece la URL antigua, cierra todas las pestañas y ventanas instaladas de Flora Viva, vuelve a abrir y descarga el QR otra vez; una ventana privada ayuda a distinguir caché de errores de publicación.

Quedan pendientes enlaces sociales/contacto definitivos, completar contenido y medios del inventario, pruebas físicas de accesibilidad/escaneo, revisión de App Check y limpieza de archivos huérfanos. No hay mapa ni edición offline. La consulta descarga hasta 1.000 especies y pagina en el cliente; inventarios mayores requieren búsqueda/paginación en servidor. Fotos y registros se guardan en operaciones separadas.

Historial detallado: [BITACORA.md](docs/BITACORA.md). Arquitectura: [ARQUITECTURA.md](docs/ARQUITECTURA.md).
