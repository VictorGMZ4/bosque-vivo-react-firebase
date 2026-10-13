# Registrar especies desde Word o Excel

En **Administración → Registrar especie**, o **Mis propuestas → Proponer especie** para profesores, aparece el apartado **Completar desde una plantilla**.

1. Descarga Word o Excel desde ese apartado.
2. Word: completa la columna Información de una única ficha. Excel: escribe una especie por fila en la hoja Especies; conserva la primera fila de encabezados.
3. Completa nombre común, nombre científico, familia y tipo de planta. Elige Árbol, Arbusto, Herbácea, Palmera o Trepadora. No inventes datos desconocidos.
4. Guarda en `.docx` o `.xlsx` y selecciona **Subir plantilla rellenada**. Se admite hasta 5 MB y 100 filas con especies en Excel. No se admiten archivos `.doc`, `.xls` ni formatos de macros. Las fórmulas se señalan para sustituirlas por texto.
5. Confirma el reemplazo del formulario. Revisa los datos, las observaciones y la previsualización. El archivo se lee en el navegador; no se almacena en Firebase.
6. Pulsa **Guardar especie** (administrador) o **Enviar a revisión** (profesor). La carga por sí sola no registra ni publica nada. Los profesores conservan el proceso de aprobación existente.

Si hay varias filas, después de guardar o enviar una especie se carga la siguiente pendiente. El selector permite elegir otra; cambiar de fila descarta sus cambios sin guardar previa confirmación. Un error de guardado conserva el formulario para corregirlo y reintentar. Al terminar se abre la última ficha o la lista de propuestas.

El lote permanece solo durante la sesión del formulario: al salir o recargar tendrás que volver a cargarlo. Las especies ya guardadas permanecen en Firebase; evita volver a registrar esas filas. Los duplicados y permisos siguen sujetos a las validaciones existentes del servidor.

Las imágenes incrustadas en Office no se importan. El administrador puede añadir fotos después de crear la especie, desde Editar ficha. El profesor puede adjuntar fotografías en el formulario de propuesta.

## Mantenimiento y comprobación

- `scripts/create-plant-templates.py` regenera las dos plantillas con python-docx y openpyxl.
- `pnpm test` incluye pruebas del lector y de copias rellenadas de las plantillas descargables, con datos sintéticos.
- `scripts/check-plant-import-ui.mjs` comprueba la interfaz con Playwright y Edge. Define `PLAYWRIGHT_MODULE` con la ruta absoluta a `playwright/index.mjs` y ejecuta `node scripts/check-plant-import-ui.mjs`. Inicia Vite en el puerto 4189 y lo cierra al terminar. Autenticación y funciones están simuladas: no escribe en Firebase.

La importación admite exclusivamente las plantillas definidas, no interpreta textos libres ni identifica especies automáticamente.
