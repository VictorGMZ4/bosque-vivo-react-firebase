import {pwaPlugin} from './pwa-plugin.js';
import {defineConfig} from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[tailwindcss(),pwaPlugin()],server:{host:'127.0.0.1',port:5174,strictPort:true},preview:{host:'127.0.0.1',port:4174,strictPort:true},build:{outDir:'dist'}});
