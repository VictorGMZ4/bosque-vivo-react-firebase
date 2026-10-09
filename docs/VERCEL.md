# Publicar Flora Viva en Vercel con Firebase

Guía del 8 de octubre de 2026. La configuración está preparada; no se ha publicado el proyecto ni habilitado facturación desde esta sesión.

Vercel sirve React, los estilos y la planta de bienvenida. Firebase mantiene Authentication, Firestore, Storage y las Cloud Functions que comprueban los permisos. **No necesitas Firebase Hosting si eliges Vercel.** Los emuladores de tu computador no pueden actuar como backend de la página pública.

## 1. Preparar Firebase real

En la consola de Firebase crea o selecciona tu proyecto. Copia su **ID de proyecto** (no el nombre visible). No utilices `demo-bosque-vivo`.

1. En Authentication habilita el proveedor Correo electrónico/contraseña.
2. Crea una base Cloud Firestore en modo producción y el bucket de Storage. Elige las ubicaciones con cuidado; las funciones de esta aplicación usan `us-central1`.
3. En Configuración del proyecto → General → Tus apps, registra una aplicación web y guarda los valores de `firebaseConfig` para el paso 4. No hace falta activar Hosting.
4. Para desplegar las Cloud Functions necesitas el plan **Blaze**, vinculado a facturación. Vercel no elimina ese requisito. Configura alertas de presupuesto, teniendo presente que no son un límite automático de gasto. [Requisito oficial de Firebase](https://firebase.google.com/docs/functions/get-started).

## 2. Publicar el backend y sus reglas

Abre en VS Code la carpeta **bosque-vivo-react-firebase**. Usa Node 22.12 o superior de la rama 22 para validar el mismo runtime declarado en las funciones. En PowerShell ejecuta, uno por uno:

```powershell
pnpm.cmd install --frozen-lockfile
npx.cmd firebase-tools login
npx.cmd firebase-tools deploy --only "functions,firestore,storage" --project TU_ID_REAL
```

Sustituye `TU_ID_REAL` por tu ID. El sufijo `.cmd` evita el bloqueo de archivos `.ps1` de PowerShell. Si pnpm no está instalado, instala primero Node y ejecuta `npm.cmd install -g pnpm`.

`pnpm install` desde la raíz instala tanto React como `functions`, porque ambas carpetas forman parte de `pnpm-workspace.yaml`. No ejecutes `npm install --prefix functions` sobre esta instalación: npm puede tratar los enlaces de pnpm como paquetes locales y ejecutar scripts de desarrollo de Firebase Admin, fallando por falta de `gulp`. No hace falta instalar gulp para usar Firebase Admin. La advertencia `EBADENGINE` con Node 24 es independiente: usa Node 22 para coincidir con el runtime de las funciones.

El comando publica las funciones `mutate` y `workspace`, reglas e índices; no publica Firebase Hosting. Conserva `--project TU_ID_REAL`: el valor predeterminado local del repositorio es un proyecto de demostración. No ejecutes `firebase init` sobre estos archivos, ya están configurados.

El backend asume un bucket con nombre `TU_ID_REAL.firebasestorage.app`. Si tu bucket tiene otro nombre (por ejemplo, termina en `appspot.com`), crea un archivo local `functions/.env.TU_ID_REAL` con `STORAGE_BUCKET=nombre-exacto-del-bucket` antes de desplegar. No incluyas `gs://`. No subas este archivo al repositorio.

## 3. Subir el código a GitHub

Crea un repositorio con el contenido de **bosque-vivo-react-firebase**, incluido `vercel.json`, `public/models`, las reglas y el archivo de bloqueo de pnpm. Mantén el `.gitignore` suministrado. No subas `work`, exportaciones de emuladores, `.env` reales, credenciales, `node_modules` ni `dist`.

El proyecto Django permanece separado. Si tu repositorio contiene ambas carpetas, tendrás que seleccionar la carpeta de React como directorio raíz en Vercel.

## 4. Crear el proyecto Vercel

En Vercel selecciona **Add New → Project** e importa el repositorio de GitHub. Configura:

| Campo | Valor |
|---|---|
| Root Directory | `.` si el repositorio contiene solo React; `bosque-vivo-react-firebase` si contiene la carpeta padre |
| Framework Preset | Vite |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Install Command | `pnpm install --frozen-lockfile` |
| Node.js Version | 22.x |

En **Environment Variables**, añade estos valores al entorno Production:

| Variable | Valor |
|---|---|
| `VITE_USE_EMULATORS` | `false` (exactamente) |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` de Firebase |
| `VITE_FIREBASE_API_KEY` | `apiKey` de Firebase |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` de Firebase, normalmente `TU_ID.firebaseapp.com` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` exacto, sin `gs://` |
| `VITE_FIREBASE_APP_ID` | `appId` de Firebase |
| `VITE_PUBLIC_SITE_URL` | Opcional al principio; después, `https://tu-dominio-estable.vercel.app` |

Estas variables `VITE_` se incorporan al navegador; nunca pongas claves privadas ni cuentas de servicio en ellas. La seguridad depende de Authentication, reglas y funciones. Para despliegues Preview configura preferiblemente otro proyecto Firebase de pruebas: usar las mismas variables permite modificar los datos reales desde esas versiones.

Pulsa **Deploy**. El `vercel.json` incluido permite abrir directamente `/especies/8/` y otras rutas React. [Documentación oficial de Vite en Vercel](https://vercel.com/docs/frameworks/frontend/vite).

## 5. Conectar el dominio definitivo

1. Copia el dominio estable que Vercel asignó al proyecto; evita enlaces temporales de cada despliegue.
2. En Firebase → Authentication → Settings → Authorized domains añade el dominio, por ejemplo `flora-viva.vercel.app`, sin `https://` ni rutas. Conserva el `authDomain` original en las variables. [Dominios autorizados](https://firebase.google.com/docs/auth/faq-and-troubleshooting).
3. En Vercel → Settings → Environment Variables fija `VITE_PUBLIC_SITE_URL` con `https://` y sin rutas, consultas ni fragmentos. Esto hace que las etiquetas QR apunten siempre al sitio estable.
4. Realiza un **Redeploy** desde Deployments para incorporar las variables modificadas. [Gestión de variables en Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables).

## 6. Configurar CORS para los archivos de Storage

La ficha descarga modelos y archivos mediante el SDK y blobs; el bucket debe permitir solicitudes GET desde tu sitio. Crea un archivo `cors.json` con tu dominio real:

```json
[
  {
    "origin": ["https://tu-dominio-estable.vercel.app"],
    "method": ["GET"],
    "maxAgeSeconds": 3600
  }
]
```

En Google Cloud Shell, selecciona tu proyecto, sube ese archivo y ejecuta:

```sh
gsutil cors set cors.json gs://NOMBRE_EXACTO_DEL_BUCKET
```

Sustituye el nombre del bucket. Si usas un dominio propio, añádelo también a `origin`. CORS no concede permisos sobre archivos privados; las reglas siguen aplicándose. [Instrucciones oficiales de Storage](https://firebase.google.com/docs/storage/web/download-files).

## 7. Crear el primer administrador y cargar contenido

Registra tu cuenta en la página publicada. Como propietario del proyecto Firebase, copia su UID desde Authentication → Users. En Firestore crea (o edita) el documento `roles/UID_DE_TU_CUENTA` y establece el campo de texto `role` a `admin`. Hazlo únicamente para tu cuenta administrativa. Cierra sesión y vuelve a entrar. Los demás roles se administran desde la aplicación.

**Desplegar código no migra los datos ni las cuentas de los emuladores.** En el proyecto real el catálogo empezará vacío hasta cargar contenido. Puedes crear especies desde Administración; para trasladar el catálogo local conservando IDs, fotos y códigos QR hace falta una migración de datos controlada. No publiques las exportaciones locales ni uses `import:local` contra producción: ese proceso está diseñado para los emuladores.

## 8. Comprobar antes de imprimir o compartir

- Abre el dominio y una ficha directamente en una ventana privada; recarga la ficha para comprobar las rutas.
- Prueba registro, guardar perfil y solicitud/aprobación de profesor con cuentas de prueba.
- Desde Administración comprueba creación, edición y publicación; confirma que un estudiante no puede modificar el catálogo.
- Verifica fotos y modelos de Storage. La planta de bienvenida se sirve desde Vercel y es independiente de esos archivos.
- Genera una etiqueta QR desde una ficha publicada, comprueba que muestra el dominio estable y prueba su lectura desde un teléfono. En impresión desactiva encabezados/pies del navegador y usa escala 100%.
- Los modelos 3D requieren conexión. El guardado offline conserva las fichas compatibles, no los GLB.

Las comprobaciones de esta entrega son locales. El despliegue real, las reglas en tu proyecto, la facturación y el escaneo de una impresión física deben comprobarse después de configurar tus servicios.
