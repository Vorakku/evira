import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import {buildWorker} from './worker-build.mjs';
await buildWorker('dist/server/index.js','production');
await mkdir('dist/.openai',{recursive:true});await copyFile('.openai/hosting.json','dist/.openai/hosting.json');
await writeFile('dist/server/package.json','{"type":"module"}\n');
console.log('Built React client + Prisma Worker backend.');
