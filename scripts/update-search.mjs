import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {sources,paths,validate} from '../search/common.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
await mkdir(resolve(root,'search/sources'),{recursive:true});
const records=[],status=[];
for(const source of sources){
 const path=resolve(root,'search/sources/'+source+'.json');let index;let error='';
 try{const response=await fetch('https://tbzarchive.com/'+paths[source]+'/search-index.json',{signal:AbortSignal.timeout(30000),cache:'no-store'});if(!response.ok)throw Error('HTTP '+response.status);index=validate(await response.json(),source);await writeFile(path,JSON.stringify(index));}
 catch(e){error=String(e.message);console.warn(source+': '+error+'; keeping saved snapshot');index=validate(JSON.parse(await readFile(path,'utf8')),source);}
 records.push(...index.records);status.push({source,generatedAt:index.generatedAt,sourceUpdatedAt:index.sourceUpdatedAt,count:index.records.length,retained:!!error,error});
}
await writeFile(resolve(root,'search/index.json'),JSON.stringify({schemaVersion:1,generatedAt:new Date().toISOString(),sources:status,records}));
console.log('Combined '+records.length+' records.');
