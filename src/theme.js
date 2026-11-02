// Tema de la interfaz: 'auto' sigue al dispositivo; 'light' y 'dark' se guardan en este navegador.
// index.html aplica el tema guardado antes de pintar para evitar un destello claro.
const key='flora-theme';
export function savedTheme(){try{const value=localStorage.getItem(key);return value==='light'||value==='dark'?value:'auto';}catch{return 'auto';}}
const colors={light:'#234e3a',dark:'#0f1a15'};
export function applyTheme(value){const root=document.documentElement;if(value==='auto')delete root.dataset.theme;else root.dataset.theme=value;document.querySelectorAll('meta[name="theme-color"]').forEach(meta=>meta.setAttribute('content',value==='auto'?colors[meta.media.includes('dark')?'dark':'light']:colors[value]));try{if(value==='auto')localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{}}
