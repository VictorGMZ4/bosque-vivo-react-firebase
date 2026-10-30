# Roles y revisión de aportes

| Rol | Colección publicada | Perfil propio | Aportar especies | Gestión |
|---|---|---|---|---|
| Estudiante o Visitante | Consultar | Nombre, institución, biografía | No | No |
| Profesor o Investigador | Consultar | Nombre, institución, biografía | Enviar propuesta a revisión | Consultar propuestas propias y sus resultados |
| Admin | Consultar y gestionar borradores | Nombre, institución, biografía | Crear directamente o revisar | CRUD, fotos, GLB, aprobación y roles |

Sin sesión se puede consultar la colección pública. El registro nunca concede privilegios: elegir profesor genera `role_requests/{uid}` pendiente. El administrador verifica al solicitante en **Usuarios → Solicitudes de profesores** y aprueba o rechaza; rechazar requiere observaciones. El solicitante conserva acceso de consulta hasta aprobación y puede seguir el estado desde Mi perfil.

Tras iniciar sesión o registrarse se abre Mi perfil. **Guardar mis datos** guarda mediante backend y devuelve al inicio; ante un error permanece en el formulario. El correo de acceso se muestra como identificación, no se edita en este formulario.

Las propuestas (`submissions`) incluyen autor, datos, estado, fotografías e historial de decisiones. El profesor accede a Mis propuestas → Proponer especie → Previsualizar ficha → Enviar a revisión. Puede adjuntar hasta cinco fotografías y corregir/reenviar propuestas rechazadas. El administrador entra en Revisiones, donde cada propuesta muestra quién la hizo (nombre y correo), → Ver propuesta → Aprobar y publicar, o Rechazar propuesta. Aprobar crea la especie, incorpora las fotografías y reserva su nombre científico una sola vez. La propuesta también puede incluir un modelo GLB con hasta 30 puntos informativos, que permanecen privados hasta la aprobación; al aprobar, el backend copia el modelo a la especie y publica sus puntos en la misma operación. Los ejemplares los gestiona el administrador después de aprobar la ficha. Se muestran hasta 500 propuestas; el listado de cuentas pagina de 50 en 50.

Todos los usuarios con sesión disponen de colecciones personales, notificaciones y cuestionarios publicados con resultados privados. Profesores y administradores pueden crear cuestionarios; cada profesor edita los suyos. El administrador también accede al historial y a la papelera. Consulta [la guía de funcionalidades](FUNCIONALIDADES.md).

`roles/{uid}` define student, teacher o admin; `profiles/{uid}` contiene datos personales. Solo las Functions escriben estas colecciones. Un rol explícito siempre prevalece sobre el claim administrativo previo; ausencia de rol mantiene compatibilidad con el administrador local original. El administrador no puede modificar su propio rol. Los cambios se reflejan en la sesión por suscripción a Firestore.

## Bloqueo de cuentas

En **Usuarios**, el administrador ve el estado de cada cuenta (Activa o Bloqueada). **Bloquear** exige un motivo de hasta 500 caracteres; **Desbloquear** pide confirmación. Nadie puede bloquear su propia cuenta, por lo que siempre queda al menos un administrador activo.

Al bloquear, la función `workspace` (`setAccountStatus`) marca `disabled` en `roles/{uid}` conservando el rol, deshabilita la cuenta en Authentication y revoca sus sesiones. Como el token vigente de la persona sigue siendo válido hasta una hora, el bloqueo se comprueba también en cada llamada a Functions y en las reglas de Firestore y Storage: una cuenta bloqueada pierde de inmediato todo permiso de profesor o administrador y no puede usar perfil, colecciones, notificaciones, cuestionarios ni propuestas. La sesión abierta se cierra y vuelve a Ingresar con el aviso «Tu cuenta está bloqueada». Cambiar el rol de una cuenta bloqueada no la desbloquea. Cada bloqueo y desbloqueo queda en Historial (entidad `account`) con su motivo; al desbloquear, la persona recibe una notificación.

No hay eliminación de cuentas, para preservar las autorías de propuestas, revisiones e intentos. El bloqueo existe en el código local (2026-10-29); llega a producción solo cuando se publiquen juntos Functions, reglas y frontend.

## Límites

Las aprobaciones son dentro de la aplicación; no se enviaron correos ni notificaciones externas. No hay eliminación de cuentas ni verificación automática de vinculación académica. Estos flujos funcionan tanto en los emuladores locales como en producción (`flora-viva---bosque-verde`, publicado el 2026-10-22); las cuentas de ambos entornos son independientes.
