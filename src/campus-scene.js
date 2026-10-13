import * as THREE from 'three';
import {coverCampus} from './campus-scene-math';

// A photograph on a plane: this is not a geographic reconstruction of the campus.
export function createCampusScene(host,image,onReady,onFailure){
 let disposed=false,frame=0,visible=true,enabled=true,texture,mesh,lastTime=0;
 let targetX=0,targetY=0,panX=0,panY=0;
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:false,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,10);
 camera.position.z=2;
 const stop=()=>{cancelAnimationFrame(frame);frame=0;lastTime=0;};
 const request=()=>{if(!disposed&&visible&&!document.hidden&&!frame&&mesh)frame=requestAnimationFrame(render);};
 function render(now){
  frame=0;if(disposed||!visible||document.hidden)return;
  const blend=1-Math.exp(-Math.min(lastTime?(now-lastTime)/1000:.016,.05)*8);lastTime=now;
  camera.position.x+=(targetX-camera.position.x)*blend;camera.position.y+=(targetY-camera.position.y)*blend;
  renderer.render(scene,camera);
  if(Math.abs(camera.position.x-targetX)+Math.abs(camera.position.y-targetY)>.0001)request();else lastTime=0;
 }
 function resize(){
  const {width,height}=host.getBoundingClientRect();if(!width||!height)return;
  camera.left=-width/height;camera.right=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height);
  if(mesh){const cover=coverCampus(width,height,texture.image.width/texture.image.height);mesh.scale.set(cover.width,cover.height,1);panX=cover.panX;panY=cover.panY;targetX=targetY=0;camera.position.x=camera.position.y=0;request();}
 }
 const pointer=event=>{if(!enabled||event.pointerType!=='mouse')return;const box=host.getBoundingClientRect();targetX=((event.clientX-box.left)/box.width*2-1)*panX;targetY=-((event.clientY-box.top)/box.height*2-1)*panY;request();};
 const leave=()=>{targetX=targetY=0;request();};
 const visibility=()=>document.hidden?stop():request();
 const lost=event=>{event.preventDefault();stop();onFailure();};
 host.parentElement.addEventListener('pointermove',pointer);host.parentElement.addEventListener('pointerleave',leave);
 renderer.domElement.addEventListener('webglcontextlost',lost);document.addEventListener('visibilitychange',visibility);
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;visible?request():stop();});observer.observe(host);
 new THREE.TextureLoader().load(image,loaded=>{
  if(disposed){loaded.dispose();return;}texture=loaded;texture.colorSpace=THREE.SRGBColorSpace;
  mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:texture}));scene.add(mesh);resize();renderer.render(scene,camera);onReady();
 },undefined,()=>{if(!disposed)onFailure();});
 return {setEnabled(value){enabled=value;if(!value)leave();},dispose(){
  disposed=true;stop();resizeObserver.disconnect();observer.disconnect();document.removeEventListener('visibilitychange',visibility);
  host.parentElement?.removeEventListener('pointermove',pointer);host.parentElement?.removeEventListener('pointerleave',leave);
  renderer.domElement.removeEventListener('webglcontextlost',lost);mesh?.geometry.dispose();mesh?.material.dispose();texture?.dispose();renderer.dispose();renderer.domElement.remove();
 }};
}
