import {spawn} from 'node:child_process';
const env={...process.env,GCLOUD_PROJECT:'demo-bosque-vivo',FIRESTORE_EMULATOR_HOST:'127.0.0.1:8080',FIREBASE_AUTH_EMULATOR_HOST:'127.0.0.1:9099',FIREBASE_STORAGE_EMULATOR_HOST:'127.0.0.1:9199'};
const mode=process.argv[2];
if(!['import','models','test'].includes(mode))throw Error('Usa import, models o test.');
const args=mode==='import'?['functions/scripts/import-local.mjs']:mode==='models'?['functions/scripts/import-models-local.mjs']:['--test','--test-concurrency=1','tests/integration.test.mjs','tests/roles.test.mjs','tests/expansion.test.mjs','tests/collections.test.mjs','tests/learning.test.mjs','tests/storage-proposals.test.mjs','tests/hotspots-integration.test.mjs'];
const child=spawn(process.execPath,args,{env,stdio:'inherit'});child.on('exit',code=>process.exit(code||0));
