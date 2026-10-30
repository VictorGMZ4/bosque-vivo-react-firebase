// Pines del mapa: gota con la silueta del tipo de planta; verde para fotografías y ámbar para ejemplares.
export const habitIcons={
 tree:'M12 21v-8.5m0 3.5 3-2.6m-3 .6-2.6-2.2M8 14.6a3.9 3.9 0 0 1-2.4-6.9A6.5 6.5 0 0 1 18.4 7.7 3.9 3.9 0 0 1 16 14.6Z',
 shrub:'M4.5 17.5c-1.6-2.4-.2-5.7 2.8-5.8.2-2.9 3-4.6 4.7-2.9 1.8-1.7 4.6 0 4.7 2.9 3 .1 4.4 3.4 2.8 5.8Zm7.5 0V21',
 herb:'M12 21V10m0 4.5c-3.3 0-5.8-2.2-5.8-6 3.3 0 5.8 2.2 5.8 6Zm0-3c0-3.8 2.5-6 5.8-6 0 3.8-2.5 6-5.8 6Z',
 palm:'M12 21V9.5m0 0C9.4 6.4 5.6 6.2 3 8.3m9 1.2c2.6-3.1 6.4-3.3 9-1.2M12 9.5C11.4 5.6 8.6 3.2 5.4 3m6.6 6.5c.6-3.9 3.4-6.3 6.6-6.5',
 climber:'M7 21V3m0 16c5 0 7-3 4-5.5S10 8 15 7M15 7c1.9 0 3.4-1.2 3.6-3.1-1.9 0-3.4 1.2-3.6 3.1Zm-3.6 6.2c-1.9.2-3.5-.8-3.9-2.7 1.9-.2 3.5.8 3.9 2.7Zm1.4 5.3c1.7.6 3.6 0 4.4-1.7-1.7-.6-3.6 0-4.4 1.7Z',
 leaf:'M19 5c-8-1-14 2.6-14 8.5A5.5 5.5 0 0 0 10.5 19C16.7 19 20 13 19 5ZM5 19l9-9'
};
export const pinColors={photo:'#2f7d4f',specimen:'#c27c12',me:'#2a6fdb'};
export function pinHtml(point,selected=false){
 const color=pinColors[point.type]||pinColors.photo,icon=habitIcons[point.habit]||habitIcons.leaf;
 return `<span class="map-pin${selected?' is-selected':''}"><svg viewBox="0 0 36 46" width="36" height="46" aria-hidden="true"><path d="M18 44.5S3.5 28.6 3.5 17.5a14.5 14.5 0 0 1 29 0C32.5 28.6 18 44.5 18 44.5Z" fill="${color}" stroke="#fff" stroke-width="2.5"/><circle cx="18" cy="17.5" r="10.5" fill="#fff"/><g transform="translate(10 9.5) scale(.6667)" fill="none" stroke="${color}" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="${icon}"/></g></svg></span>`;
}
