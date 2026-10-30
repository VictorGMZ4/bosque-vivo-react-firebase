// Centro del campus de UNIPAZ (coordenadas facilitadas por el equipo, 2026-10-30).
export const campus={latitude:7.069607105011221,longitude:-73.74561487578953};
export const campusRadiusKm=2;
// Distancia en kilómetros entre dos puntos {latitude,longitude} (fórmula del haversine).
export function distanceKm(a,b){const rad=d=>d*Math.PI/180,dLat=rad(b.latitude-a.latitude),dLon=rad(b.longitude-a.longitude),h=Math.sin(dLat/2)**2+Math.cos(rad(a.latitude))*Math.cos(rad(b.latitude))*Math.sin(dLon/2)**2;return 2*6371*Math.asin(Math.sqrt(h));}
