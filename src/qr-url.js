export function speciesPublicUrl(id,currentOrigin,configuredOrigin=''){
 const source=configuredOrigin.trim()||currentOrigin;
 let url;try{url=new URL(source);}catch{throw Error('Revisa VITE_PUBLIC_SITE_URL: debe ser una dirección web completa.');}
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.pathname!=='/'||url.search||url.hash)throw Error('VITE_PUBLIC_SITE_URL debe contener solo el origen, por ejemplo https://flora-viva.vercel.app.');
 return new URL(`/especies/${encodeURIComponent(id)}/`,url.origin).href;
}
export function speciesExploreUrl(id,currentOrigin,configuredOrigin=''){
 return speciesPublicUrl(id,currentOrigin,configuredOrigin)+'explorar/';
}
