export const aliases = {
 SANGYEON:['sangyeon','lee sangyeon','상연','이상연'],JACOB:['jacob','bae jacob','배제이콥','제이콥'],
 YOUNGHOON:['younghoon','kim younghoon','영훈','김영훈'],HYUNJAE:['hyunjae','lee jaehyun','현재','이재현'],
 JUYEON:['juyeon','lee juyeon','주연','이주연'],KEVIN:['kevin','kevin moon','moon hyungseo','케빈','문형서'],
 Q:['q','changmin','ji changmin','큐','지창민','창민'],NEW:['new','chanhee','choi chanhee','뉴','최찬희','찬희'],
 SUNWOO:['sunwoo','kim sunwoo','선우','김선우'],ERIC:['eric','son youngjae','에릭','손영재'],
 HAKNYEON:['haknyeon','ju haknyeon','juhaknyeon','학년','주학년'],HWALL:['hwall','hyunjun','heo hyunjun','활','허현준']
};
export const sources=['livestreams','radio','events','scans'];
export const paths={livestreams:'livestream-archive',radio:'radio-archive',events:'events',scans:'scans'};
export function normalize(s){return String(s??'').normalize('NFKC').toLowerCase().replace(/[_–—]/gu,' ').replace(/\s+/gu,' ').trim();}
function escaped(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}
export function memberMatches(value,alias){return new RegExp('(^|[^\\p{L}\\p{N}])'+escaped(alias)+'(?=$|[^\\p{L}\\p{N}])','u').test(value);}
export function membersOf(s){s=normalize(s).replace(/\bnew\s+era\b/gu,'');return Object.entries(aliases).filter(([,a])=>a.some(x=>memberMatches(s,x))).map(([k])=>k);}
export function descriptionMembers(value){return membersOf(String(value||'').split(/\r?\n/u).filter(line=>/^\s*members\s*:/iu.test(line)).map(line=>line.replace(/^\s*members\s*:/iu,'')).join(' '));}
export function dateOf(value,year){
 const s=String(value??'');let m=s.match(/(?:^|\D)(20\d{2})[-/.]([01]\d)[-/.]([0-3]\d)(?!\d)/u);
 if(!m){const t=s.match(/(?:^|\D)(\d{2})([01]\d)([0-3]\d)(?!\d)/u);if(t)m=[t[0],'20'+t[1],t[2],t[3]];}
 if(m){const iso=`${m[1]}-${m[2]}-${m[3]}`;if(Number.isFinite(Date.parse(iso+'T00:00:00Z'))&&new Date(iso+'T00:00:00Z').toISOString()===iso+'T00:00:00.000Z')return {date:iso,datePrecision:'day'};}
 const y=String(year||s.match(/(?:^|\D)(20\d{2})(?!\d)/u)?.[1]||'');return /^20\d{2}$/u.test(y)?{date:y,datePrecision:'year'}:{date:'',datePrecision:'unknown'};
}
export function safeThumbnail(value){
 if(!value)return '';try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password?u.href:'';}catch{return '';}
}
export function validate(index,source){
 if(!Number.isFinite(Date.parse(index.generatedAt||''))||index.schemaVersion!==1||index.source!==source||!Array.isArray(index.records)||!index.records.length)throw Error('Invalid or empty index: '+source);
 const ids=new Set();for(const r of index.records){const u=new URL(r.url);if(typeof r.id!=='string'||!r.id||ids.has(r.id)||r.collection!==source||typeof r.title!=='string'||typeof r.description!=='string'||typeof r.platform!=='string'||typeof r.date!=='string'||!['unknown','year','month','day'].includes(r.datePrecision)||!Array.isArray(r.members)||!Array.isArray(r.tags)||u.origin!=='https://tbzarchive.com'||!u.pathname.startsWith('/'+paths[source]+'/'))throw Error('Invalid record: '+r.id);if(r.thumbnail!==undefined&&(typeof r.thumbnail!=='string'||safeThumbnail(r.thumbnail)!==r.thumbnail))throw Error('Invalid thumbnail: '+r.id);ids.add(r.id);}
 return index;
}
export function prepare(r){return {...r,_text:normalize([r.title,r.description,r.platform,r.type,r.collection,...r.tags].join(' ')),_title:normalize(r.title)};}
export function search(records,filters={}){
 let q=normalize(filters.q), requested=[];
 // Longest aliases first, so "Ji Changmin" is consumed as one member.
 const all=Object.entries(aliases).flatMap(([member,a])=>a.map(alias=>({member,alias}))).sort((a,b)=>b.alias.length-a.alias.length);
 for(const {member,alias} of all){if(member==='NEW'&&/\bnew era\b/u.test(q))continue;if(memberMatches(q,alias)){requested.push(member);q=q.replace(new RegExp('(^|[^\\p{L}\\p{N}])'+escaped(alias)+'(?=$|[^\\p{L}\\p{N}])','gu'),'$1 ');}}
 let exactDate='';q=q.replace(/\b(?:20\d{2}-[01]\d-[0-3]\d|\d{6})\b/gu,token=>{try{const d=dateOf(token);if(d.datePrecision==='day'){exactDate=d.date;return ' ';}}catch{}return token;});
 const terms=q.trim().split(/\s+/u).filter(Boolean);
 return records.filter(r=>(!filters.collection||r.collection===filters.collection)&&(!filters.member||r.members.includes(filters.member))&&requested.every(m=>r.members.includes(m))&&(!filters.year||r.date.startsWith(filters.year))&&(!filters.platform||r.platform===filters.platform)&&(!exactDate||r.date===exactDate)&&terms.every(t=>r._text.includes(t)||r.date.startsWith(t))).map(r=>({...r,_score:(q&&r._title===q?100:0)+terms.reduce((n,t)=>n+(r._title.includes(t)?10:1),0)})).sort((a,b)=>(!a.date&&!b.date?0:!a.date?1:!b.date?-1:0)|| (filters.sort==='oldest'?a.date.localeCompare(b.date)||a.id.localeCompare(b.id):filters.sort==='newest'?b.date.localeCompare(a.date)||a.id.localeCompare(b.id):b._score-a._score||b.date.localeCompare(a.date)||a.id.localeCompare(b.id)));
}
