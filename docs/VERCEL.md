# Publicación y mantenimiento de Flora Viva en Vercel

Actualizado el **27 de octubre de 2026** con los despliegues y comprobaciones documentados del 22 de octubre. El sitio ya está publicado: esta guía describe su mantenimiento y no una instalación pendiente desde cero.

## 1. Servicios y direcciones existentes

| Recurso | Valor |
|---|---|
| Dominio principal | https://floraviva-unipaz.vercel.app |
| Dominio anterior conservado | https://bosque-vivo-react-firebase.vercel.app |
| Proyecto Vercel | `flora-viva/bosque-vivo-react-firebase` |
| Repositorio | https://github.com/VictorGMZ4/bosque-vivo-react-firebase |
| Rama de producción | `main` |
| Proyecto Firebase | `flora-viva---bosque-verde` |
| Bucket | `flora-viva---bosque-verde.firebasestorage.app` |
| Functions | `mutate`, `workspace`; `us-central1`; Node 22 |

Vercel sirve React y los recursos estáticos. Firebase mantiene Authentication, Firestore, Storage y las funciones que validan los permisos. Los emuladores `demo-bosque-vivo` son exclusivamente locales. No se usa el servidor Django para ejecutar esta aplicación.

`floraviva.vercel.app` ya pertenecía a otro equipo; se eligió y conectó `floraviva-unipaz.vercel.app`. No hace falta crear otro proyecto Vercel ni otro proyecto Firebase para publicar cambios.

## 2. Avances publicados

El commit `3851cb9` integró el pasaporte QR, editor manual de puntos 3D, viñetas dentro del visor, logo actualizado, pie de página, apartado Sobre el proyecto y composición botánica del catálogo. El despliegue `DkH3JWPgbH16kMUob2S1CsQkV2JH` terminó Ready en Production.

Después se guardó `VITE_PUBLIC_SITE_URL=https://floraviva-unipaz.vercel.app` y se redesplegó el mismo código. La versión `bosque-vivo-react-firebase-axa80s9qs-flora-viva.vercel.app` quedó Ready. Las funciones `mutate` y `workspace` y las reglas de Storage también se actualizaron. Un timeout inicial se resolvió reintentando las funciones por separado y comprobando su actualización correcta.

Se corrigió además CORS del bucket: admitía únicamente el origen antiguo y bloqueaba las fotos y modelos descargados desde el nuevo dominio. La configuración final conserva ambos orígenes. El detalle cronológico está en [BITACORA.md](BITACORA.md).

## 3. Preparar una actualización

Desde la carpeta React, usa Node 22.12+ de la rama 22 y pnpm 11:

```powershell
pnpm.cmd install --frozen-lockfile
pnpm.cmd test
# En otra terminal, iniciar antes los emuladores con pnpm.cmd emulators:
pnpm.cmd test:integration
pnpm.cmd build
```

El workspace instala tanto React como `functions`. No ejecutes `npm install --prefix functions` sobre los enlaces de pnpm: puede provocar errores de instalación ajenos al código de la aplicación. No hace falta instalar gulp.

Revisa el diff y los archivos que se enviarán. No subas `work`, exports de emuladores, `.env` reales, credenciales, cuentas de servicio, `node_modules` ni `dist`. La carpeta Django hermana permanece separada.

## 4. Backend antes del frontend cuando cambia el contrato

Los puntos manuales introdujeron `model_hotspots` y las propuestas incorporaron archivos GLB. El backend antiguo rechaza esos campos y sus reglas antiguas no admiten la subida de modelos en propuestas. Por eso se publicó el backend antes del nuevo cliente.

Para cambios de funciones o Storage:

```powershell
pnpm.cmd exec firebase login
pnpm.cmd exec firebase deploy --only "functions,storage" --project flora-viva---bosque-verde --non-interactive
```

Si la modificación también afecta reglas o índices de Firestore, incluye `firestore` en `--only`. Conserva las comillas en PowerShell y el proyecto explícito: `.firebaserc` tiene el proyecto demo como predeterminado. No ejecutes `firebase init` sobre la configuración existente.

Tras un timeout, consulta primero:

```powershell
pnpm.cmd exec firebase functions:list --project flora-viva---bosque-verde
```

Que una función aparezca ACTIVE no demuestra que incorpore el código nuevo. Revisa la operación de despliegue y, si es necesario, reintenta solo la función afectada:

```powershell
pnpm.cmd exec firebase deploy --only "functions:workspace" --project flora-viva---bosque-verde --non-interactive
```

El backend utiliza el bucket `<projectId>.firebasestorage.app` salvo que `STORAGE_BUCKET` lo sustituya. No cambies roles, reglas o IAM para ocultar errores de descarga. La infraestructura productiva ya existe; no es necesario habilitar facturación de nuevo. Mantén el seguimiento de consumo y presupuesto del proyecto.

## 5. Publicar el frontend

El proyecto está conectado a GitHub y publica `main`. Después de revisar y validar un commit, su envío a esa rama inicia el despliegue. En Vercel comprueba el commit, el entorno Production y el estado Ready antes de dar por terminada la publicación.

Configuración de referencia del proyecto en Vercel. `vercel.json` fija framework, compilación, salida, reescrituras y cabeceras; la instalación y la versión de Node se definen en el panel de Vercel (Settings → Build and Deployment) o las detecta Vercel a partir de `pnpm-lock.yaml`:

| Campo | Valor |
|---|---|
| Framework | Vite |
| Root Directory | Raíz del repositorio React |
| Build Command | `pnpm build` |
| Output Directory | `dist` |
| Install Command | `pnpm install --frozen-lockfile` |
| Node recomendado | 22.x |

`vercel.json` incluye la reescritura de rutas hacia `index.html` y evita cachear `/sw.js` mediante Cache-Control. Vercel no despliega automáticamente las funciones ni las reglas de Firebase.

### Variables de Production

| Variable | Valor o procedencia |
|---|---|
| `VITE_USE_EMULATORS` | `false` exactamente |
| `VITE_FIREBASE_PROJECT_ID` | `flora-viva---bosque-verde` |
| `VITE_FIREBASE_API_KEY` | Configuración web de la app Firebase existente |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` de esa app; no sustituirlo por el dominio Vercel |
| `VITE_FIREBASE_STORAGE_BUCKET` | `flora-viva---bosque-verde.firebasestorage.app` |
| `VITE_FIREBASE_APP_ID` | `appId` de esa app |
| `VITE_PUBLIC_SITE_URL` | `https://floraviva-unipaz.vercel.app` |

Las variables `VITE_` se incorporan al cliente al compilar. Nunca coloques claves privadas ni cuentas de servicio en ellas. Para cambiarlas, selecciona Production en los ajustes de variables/entornos, guarda y realiza un **Redeploy** del código vigente. Cambiar el valor sin compilar no actualiza los QR.

Vercel pidió verificación por correo para editar el valor de la URL. Completa la verificación mediante el flujo de la cuenta; no guardes códigos temporales en el repositorio ni en documentación. Para Preview conviene un backend de prueba: reutilizar producción permite operar sobre sus datos reales.

## 6. Dominio, QR y caché

El destino esperado de un QR es:

```text
https://floraviva-unipaz.vercel.app/especies/{id}/explorar/
```

La carta ofrece «Ver ficha completa» hacia `/especies/{id}/`. El enlace «Conoce nuestro sitio web» de la etiqueta usa la raíz del dominio. No redirijas todas las rutas de ficha completa a la carta: ambas vistas tienen una función distinta.

Los QR PNG/SVG/PDF ya descargados o impresos contienen la dirección anterior y no cambian al redesplegar. Regenera los archivos antes de imprimir. El dominio anterior se conserva, pero eso no transforma los QR existentes.

La PWA guarda el shell de una versión y el nuevo service worker espera a que se cierren los clientes anteriores. Se reprodujo un caso donde una segunda pestaña abierta mantuvo el generador de QR antiguo aunque Vercel ya mostrara Ready. Para comprobar la actualización:

1. Guarda cualquier edición pendiente.
2. Cierra todas las pestañas y ventanas instaladas de Flora Viva en ese navegador.
3. Reabre el dominio principal y revisa la dirección visible en la etiqueta.
4. Descarga un QR nuevo y comprueba que abre la carta de la especie correcta. Una ventana privada permite contrastar con una sesión sin caché anterior.

Al añadir otro dominio, revisa también Firebase Authentication → Settings → Authorized domains para los flujos de autenticación que lo requieran. No se documentó una comprobación específica de esa lista tras este cambio de dominio; no debe darse por verificada por el solo hecho de que cargue el catálogo.

## 7. CORS de fotografías y modelos

`StorageImage` y `ModelViewer` descargan archivos con `getBlob`. Las reglas de Storage y CORS resuelven cuestiones distintas: una especie publicada puede ser legible según las reglas y aun así fallar en el navegador si su origen no está admitido.

Configuración confirmada tras la corrección:

```json
[
  {
    "origin": ["https://bosque-vivo-react-firebase.vercel.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  },
  {
    "origin": ["https://floraviva-unipaz.vercel.app"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

Para mantenerla desde Google Cloud Shell, consulta y respalda primero la política existente; `cors set` sustituye la lista completa. Guarda la lista revisada como `cors.json` y aplica:

```sh
gsutil cors get gs://flora-viva---bosque-verde.firebasestorage.app
gsutil cors set cors.json gs://flora-viva---bosque-verde.firebasestorage.app
gsutil cors get gs://flora-viva---bosque-verde.firebasestorage.app
```

La corrección realizada añadió solo el origen nuevo y preservó los permisos, IAM y origen anterior. No se usó `*` ni se hicieron públicos archivos privados. Tras recargar se verificaron la foto y el modelo de Arizá. No todos los alias temporales de Preview están autorizados por esta política.

## 8. Datos, cuentas y validación de publicación

El catálogo productivo tiene su propio contenido. Publicar React/Functions no migra usuarios, especies, fotos o modelos del emulador. `import:local` solo admite el entorno demo: nunca debe apuntarse a producción. Una migración de contenido requiere un procedimiento separado con respaldo, preservación de IDs y autorías.

Los administradores existentes gestionan usuarios y propuestas desde la aplicación. Para una instalación nueva, la asignación inicial de administrador debe realizarla el propietario autorizado del backend; nunca mediante un formulario público o un cambio de permisos en el cliente.

Antes de compartir una nueva versión:

- Comprueba el dominio principal, catálogo, ficha completa y carta mediante navegación directa.
- Verifica fotografías y GLB desde el dominio real, no solo desde localhost o la URL temporal del despliegue.
- Abre el visor desde la carta, selecciona un punto y comprueba su viñeta; valida guardado y moderación con cuentas autorizadas y datos de prueba controlados.
- Revisa que la etiqueta muestre el dominio nuevo y que el código descargado abra `/explorar/`; prueba también el escaneo físico antes de imprimir un lote.
- Verifica móvil, movimiento reducido y actualización desde una sesión con caché. Los GLB requieren conexión.
- Confirma que ninguna publicación haya copiado credenciales o datos de emuladores.

Evidencia histórica del 22 de octubre: 24 pruebas unitarias, 12 de integración y build correctos; frontend Ready, ambas Functions actualizadas, QR SVG comprobados para Sangre toro y Arizá, y descarga/renderizado de medios de Arizá después de corregir CORS. Esto no certifica todos los dispositivos ni todos los registros actuales.

Referencias operativas: [variables de Vercel](https://vercel.com/docs/environment-variables/managing-environment-variables), [descargas de Storage y CORS](https://firebase.google.com/docs/storage/web/download-files), [funciones Firebase](https://firebase.google.com/docs/functions/manage-functions).
