# Planta de la portada

Esta carpeta React contiene copias del GLB y póster originales como `welcome-plant.glb` y `welcome-poster.jpg`. Los archivos Blender y scripts mencionados abajo permanecen en Django. El visor restaura el verde base de `refine_render.py` sin alterar el GLB. Se conserva a continuación la descripción de origen.

Modelo original ilustrativo creado para Bosque Vivo. No es una captura ni una representacion validada de una especie del campus.

- `bosque-vivo.blend`: escena editable, 17 hojas curvas, nervaduras, tallo, materiales procedurales, luces y movimiento de brisa.
- `planta-bosque-vivo.glb`: planta reutilizable en un visor 3D. Los materiales procedurales de Blender se simplifican al exportar GLB; el video conserva la apariencia renderizada.
- `render_video.py`: vuelve a renderizar la escena guardada. Desde esta carpeta, ejecuta Blender en segundo plano con `blender -b --python render_video.py`.
- El video y la imagen de respaldo se guardan en `static/cinematic/`.

La portada pausa el video al salir de pantalla o cambiar de pestana. Respeta la preferencia de reducir movimiento y ahorro de datos; el usuario puede iniciar la reproduccion manualmente. El archivo se sirve localmente, sin depender de un servicio de video externo.
