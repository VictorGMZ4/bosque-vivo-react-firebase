# Ampliación funcional de Flora Viva · Bosque Verde

Estas funciones se desarrollaron para React y Firebase emulado, manteniendo separado el proyecto Django. No requieren que el hosting esté publicado para probarlas localmente.

| Función | Dónde usarla | Comportamiento |
|---|---|---|
| Propuestas y correcciones | Mis propuestas / Revisiones | Profesor o administrador envía una ficha y hasta cinco fotos JPG, PNG o WebP de 8 MB cada una. Cada foto lleva descripción y campo de crédito. El administrador aprueba o rechaza con observaciones. El autor puede corregir y reenviar; las decisiones anteriores se conservan. |
| Notificaciones | Notificaciones | Avisos internos de solicitudes, propuestas, decisiones y cambios de rol. Cada usuario tiene su propio estado de lectura. El botón Actualizar consulta los avisos nuevos. No envía correos ni notificaciones push. |
| Favoritos y colecciones | Guardar especie / Mi colección | Hasta 100 favoritos y 20 colecciones privadas por usuario. Borrar una colección conserva sus favoritos sin colección. Si una especie deja de ser pública, sus datos ya no se muestran. |
| Comparación y filtros | Colección / Comparar especies | Comparación de hasta tres fichas publicadas y filtros por familia, género, tipo de planta, fotografía y modelo 3D. Los campos vacíos indican No documentado. |
| Cuestionarios | Aprender | Profesores crean y editan sus cuestionarios; el administrador puede administrar cualquiera. Entre 1 y 10 preguntas con 2–4 opciones. Los estudiantes responden los publicados. La calificación se calcula en el backend y cada persona consulta sus resultados. No se incluyen respuestas correctas en la versión del cuestionario entregada al estudiante antes del intento. |
| PWA y consulta offline | Cómo instalar / Guardar sin conexión / Sin conexión | Guarda explícitamente una copia de textos y fotos públicos en el dispositivo. La biblioteca permite leer y eliminar copias sin iniciar sesión. No incluye GLB, administración ni edición offline. |
| Historial y papelera | Historial y papelera, solo Admin | Registra nuevas altas, ediciones y retiradas de especies, ejemplares y fotografías, además de aprobaciones y restauraciones. Retirar una especie archiva su ficha y galería. Restaurarla recupera ambas como borrador y comprueba que no exista otro registro con el mismo nombre científico. |

## Recorrido sugerido

1. Ingresa con un profesor aprobado y abre Mis propuestas → Proponer especie.
2. Completa los datos, añade fotos y envía a revisión.
3. Con un administrador, abre Revisiones y prueba el rechazo con observaciones. El profesor recibirá un aviso y podrá corregir y reenviar.
4. Aprueba la propuesta y abre su ficha pública. Con una cuenta de estudiante, guárdala y organízala desde Mi colección.
5. Abre Comparar especies y selecciona dos o tres fichas. En Aprender, un profesor puede publicar una actividad para que los estudiantes respondan.
6. Guarda una ficha pública sin conexión. Después de la primera carga completa de la aplicación compilada, desconecta la red y abre Sin conexión.
7. Como administrador, retira una especie sin ejemplares asociados y recupérala desde Historial y papelera. Revisa y publica el borrador recuperado desde Administración.

## Datos y permisos

Los módulos nuevos se atienden mediante la función callable `workspace`. Las reglas deniegan acceso directo a favoritos, cuestionarios con soluciones, resultados, avisos, historial y papelera. El servidor determina el usuario desde su sesión y valida permisos; no confía en un UID o rol enviado por la interfaz.

Colecciones Firestore nuevas: `personal_collections`, `learning_quizzes`, `learning_results/{uid}/attempts`, `notifications`, `notification_reads/{uid}/items`, `audit` y `trash`. Las propuestas existentes en `submissions` incorporan fotografías, revisión e historial de decisiones. Sus archivos viven en `submissions/{id}/photos`; solo el autor autorizado puede crearlos mientras la propuesta es borrador. No se pueden sobrescribir desde el cliente. Al aprobar, el backend copia las fotografías al directorio de la especie.

## Alcance y límites

- La PWA se activa en la compilación de producción (`pnpm build` y `pnpm preview`), sobre localhost o HTTPS. La instalación depende del navegador. La validación de escritorio no reemplaza una prueba en teléfonos reales.
- Las copias offline son públicas y quedan en ese navegador hasta retirarlas o borrar sus datos. Pueden estar desactualizadas y siguen disponibles aunque la ficha se retire después del guardado. No son un respaldo del catálogo. El navegador puede liberar su almacenamiento.
- El guardado offline admite hasta 60 MB de fotografías por ficha. El visor 3D y los servicios Firebase no se guardan en la caché del service worker.
- Se muestran hasta 100 operaciones recientes en historial y 100 especies en papelera. Las propuestas admiten un número limitado de revisiones. Los cuestionarios listan hasta 100 publicados y 100 administrados; cada usuario consulta sus 100 intentos más recientes. Para volúmenes mayores debe añadirse paginación.
- Los cuestionarios son actividades formativas: permiten intentos sucesivos y muestran soluciones tras responder. No incluyen supervisión de exámenes ni informes grupales para profesores.
- La papelera restaura especies y galerías; no ofrece restauración individual de ejemplares o fotografías eliminados. Se mantiene el bloqueo de retirada de especies con ejemplares asociados.
- Las subidas/copia de archivos y las transacciones Firestore son operaciones separadas. Un fallo puede dejar archivos sin referencia; no se borran físicamente sin una política posterior de respaldo y limpieza.
- Antes de publicar: configurar Firebase real, desplegar backend, reglas e índices, verificar Node 22, dominios y CORS de Storage. No se activó facturación ni se desplegó infraestructura en esta ampliación.
