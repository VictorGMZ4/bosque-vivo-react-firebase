export function coverCampus(width,height,imageAspect){
 const aspect=Math.max(1,width)/Math.max(1,height);
 const scale=Math.max(1,aspect/imageAspect)*1.08;
 return {width:2*imageAspect*scale,height:2*scale,panX:aspect*.025,panY:.025};
}
