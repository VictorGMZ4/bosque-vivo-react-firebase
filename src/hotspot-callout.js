export function placeCallout({x,y,width,height,boxWidth,boxHeight}){
 const clamp=(n,min,max)=>Math.max(min,Math.min(n,max));
 const above=y-boxHeight-26>=12;
 return {left:clamp(x-boxWidth/2,12,width-boxWidth-12),top:clamp(above?y-boxHeight-26:y+26,12,height-boxHeight-12),above};
}
