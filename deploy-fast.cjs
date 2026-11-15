// Use the supported project-local Firebase CLI. No internal monkey-patching.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const cli=path.join(__dirname,'node_modules/firebase-tools/lib/bin/firebase.js');
if(!require('node:fs').existsSync(cli)){console.error('Install firebase-tools as a devDependency first.');process.exit(1);}
const result=spawnSync(process.execPath,[cli,'deploy','--only','hosting,database','--project','scorear2'],{cwd:__dirname,stdio:'inherit',windowsHide:true});
process.exit(result.status ?? 1);
