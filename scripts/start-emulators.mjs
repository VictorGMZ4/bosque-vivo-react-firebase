import {spawn} from 'node:child_process';
import {existsSync,mkdirSync} from 'node:fs';
import path from 'node:path';
const environment={...process.env};
const javaRoot=environment.JAVA_HOME || (process.platform==='win32'&&existsSync('C:/Program Files/Autopsy-4.23.1/jre/bin/java.exe')?'C:/Program Files/Autopsy-4.23.1/jre':null);
if(javaRoot){environment.JAVA_HOME=javaRoot;environment.Path=path.join(javaRoot,'bin')+path.delimiter+(environment.Path||environment.PATH||'');}
environment.FIREBASE_EMULATORS_PATH=path.resolve('work/firebase-emulators');
mkdirSync('work',{recursive:true});
const args=['node_modules/firebase-tools/lib/bin/firebase.js','emulators:start','--project','demo-bosque-vivo','--only','auth,firestore,functions,storage','--export-on-exit','work/emulator-data'];
if(existsSync('work/emulator-data/firebase-export-metadata.json'))args.push('--import','work/emulator-data');
const child=spawn(process.execPath,args,{env:environment,stdio:'inherit'});
child.on('exit',code=>process.exit(code||0));
