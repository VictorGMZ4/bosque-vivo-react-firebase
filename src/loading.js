import {useEffect,useState,useSyncExternalStore} from 'react';
let pending=0;
const listeners=new Set();
export const getSnapshot=()=>pending;
export function subscribe(listener){listeners.add(listener);return()=>listeners.delete(listener);}
export function start(){pending++;listeners.forEach(listener=>listener());}
export function finish(){if(!pending)return;pending--;listeners.forEach(listener=>listener());}
export const usePending=()=>useSyncExternalStore(subscribe,getSnapshot,()=>0);
export function useSlow(active,delay=8000){const [slow,setSlow]=useState(false);useEffect(()=>{setSlow(false);if(!active)return;const timer=setTimeout(()=>setSlow(true),delay);return()=>clearTimeout(timer);},[active,delay]);return active&&slow;}
