# Roles, propuestas y administración

Requisitos aprobados por el usuario: Estudiante/Visitante consulta colección y edita sus datos; Profesor/Investigador añade especies con aprobación administrativa y edita sus datos; Admin gestiona catálogo, revisiones y roles. Se incluyen carga de GLB y previsualización propuestas en el turno anterior.

Decisiones: registro público siempre lector; roles promovidos solo por administrador. Perfiles propios separados de permisos. Propuestas independientes del catálogo hasta aprobación, con rechazo motivado y previsualización. La aprobación reserva nombre y crea especie en una transacción. Un administrador no puede quitarse a sí mismo el rol. La colección pública excluye borradores y propuestas pendientes.

1. Backend: roles autoritativos en Firestore, perfiles, propuestas/revisión, listado paginado de cuentas; pruebas negativas contra escalada y publicación no autorizada.
2. Reglas Firestore/Storage coherentes; administración de GLB de hasta 30 MB, referencia validada y crédito.
3. React: registro/perfil, navegación por rol, propuestas, revisión y asignación de roles; previsualización antes de guardar y carga de modelo.
4. Verificar build, integración y navegador; revisión independiente de seguridad; actualizar documentación e integridad de Django.

Archivos: functions/access.js y workspace.js concentran permisos/acciones; src/pages/Community.jsx incluye perfil y gestión colaborativa; src/SpeciesPreview.jsx muestra datos antes de enviar. Continúan funciones y componentes existentes para el catálogo. Trabajo solo en la nueva carpeta; sin despliegue ni facturación.
