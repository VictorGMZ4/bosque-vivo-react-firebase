# Roles y revisión de aportes

| Rol | Colección publicada | Perfil propio | Aportar especies | Gestión |
|---|---|---|---|---|
| Estudiante o Visitante | Consultar | Nombre, institución, biografía | No | No |
| Profesor o Investigador | Consultar | Nombre, institución, biografía | Enviar propuesta a revisión | Consultar propuestas propias y sus resultados |
| Admin | Consultar y gestionar borradores | Nombre, institución, biografía | Crear directamente o revisar | CRUD, fotos, GLB, aprobación y roles |

Sin sesión se puede consultar la colección pública. El registro nunca concede privilegios: elegir profesor genera `role_requests/{uid}` pendiente. El administrador verifica al solicitante en **Usuarios → Solicitudes de profesores** y aprueba o rechaza; rechazar requiere observaciones. El solicitante conserva acceso de consulta hasta aprobación y puede seguir el estado desde Mi perfil.

Tras iniciar sesión o registrarse se abre Mi perfil. **Guardar mis datos** guarda mediante backend y devuelve al inicio; ante un error permanece en el formulario. El correo de acceso se muestra como identificación, no se edita en este formulario.

Las propuestas (`submissions`) incluyen autor, datos, estado, fotografías e historial de decisiones. El profesor accede a Mis propuestas → Proponer especie → Previsualizar ficha → Enviar a revisión. Puede adjuntar hasta cinco fotografías y corregir/reenviar propuestas rechazadas. El administrador entra en Revisiones → Ver propuesta → Aprobar y publicar, o Rechazar propuesta. Aprobar crea la especie, incorpora las fotografías y reserva su nombre científico una sola vez. Modelos y ejemplares se gestionan por el administrador después de aprobar la ficha. Se muestran hasta 500 propuestas; el listado de cuentas pagina de 50 en 50.

Todos los usuarios con sesión disponen de colecciones personales, notificaciones y cuestionarios publicados con resultados privados. Profesores y administradores pueden crear cuestionarios; cada profesor edita los suyos. El administrador también accede al historial y a la papelera. Consulta [la guía de funcionalidades](FUNCIONALIDADES.md).

`roles/{uid}` define student, teacher o admin; `profiles/{uid}` contiene datos personales. Solo las Functions escriben estas colecciones. Un rol explícito siempre prevalece sobre el claim administrativo previo; ausencia de rol mantiene compatibilidad con el administrador local original. El administrador no puede modificar su propio rol. Los cambios se reflejan en la sesión por suscripción a Firestore.

Las aprobaciones son dentro de la aplicación; no se enviaron correos ni notificaciones externas. No se implementó eliminación/bloqueo de cuentas ni verificación automática de vinculación académica. Todo sigue en emuladores locales.
