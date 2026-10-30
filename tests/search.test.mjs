import assert from 'node:assert/strict';
import test from 'node:test';
import {readFile} from 'node:fs/promises';
import {search,prepare,membersOf,dateOf,validate,sources,safeThumbnail} from '../search/common.mjs';
const index=JSON.parse(await readFile(new URL('../search/index.json',import.meta.url),'utf8'));
const records=index.records.map(prepare);
test('optional thumbnails accept HTTPS and reject unsafe URLs',()=>{
 assert.equal(safeThumbnail('https://drive.google.com/thumbnail?id=test&sz=w320'),'https://drive.google.com/thumbnail?id=test&sz=w320');
 for(const bad of ['',null,'javascript:alert(1)','data:image/svg+xml,test','http://example.com/img.jpg','https://user:pass@example.com/img.jpg'])assert.equal(safeThumbnail(bad),'');
 const source='events',template=index.records.find(r=>r.collection===source);
 assert.throws(()=>validate({schemaVersion:1,source,generatedAt:index.generatedAt,records:[{...template,thumbnail:'javascript:alert(1)'}]},source));
 assert.doesNotThrow(()=>validate({schemaVersion:1,source,generatedAt:index.generatedAt,records:[{...template,thumbnail:''}]},source));
});
test('all collection snapshots and result URLs are valid',()=>{
 for(const source of sources)validate({schemaVersion:1,source,generatedAt:index.generatedAt,records:index.records.filter(r=>r.collection===source)},source);
 assert.equal(new Set(records.map(r=>r.id)).size,records.length);
});
test('member aliases produce the same result set',()=>{
 const ids=q=>search(records,{q}).map(r=>r.id);
 assert.ok(ids('Q').length);for(const q of ['Changmin','Ji Changmin','큐','지창민'])assert.deepEqual(ids(q),ids('Q'));
 assert.deepEqual(membersOf('quality New Era'),[]);
});
test('date formats are equivalent and invalid days are never invented',()=>{
 assert.deepEqual(search(records,{q:'260511'}).map(r=>r.id),search(records,{q:'2026-05-11'}).map(r=>r.id));
 assert.deepEqual(dateOf('2026-02-31'),{date:'2026',datePrecision:'year'});
 assert.deepEqual(dateOf('2025'),{date:'2025',datePrecision:'year'});
});
test('all filters combine and undated records stay last in both date sorts',()=>{
 const fixture=[prepare({id:'one',title:'Q live',description:'Dance practice',collection:'livestreams',members:['Q'],date:'2026-05-11',tags:[],type:'Livestream',platform:'Fromm'}),prepare({id:'two',title:'Q live',description:'',collection:'radio',members:['Q'],date:'',tags:[],type:'Radio',platform:'Radio'})];
 assert.equal(search(fixture,{q:'Changmin dance',collection:'livestreams',member:'Q',year:'2026',platform:'Fromm'}).length,1);
 assert.equal(search(fixture,{sort:'oldest'}).at(-1).id,'two');assert.equal(search(fixture,{sort:'newest'}).at(-1).id,'two');
 assert.equal(search(records,{}).length,records.length);
});
