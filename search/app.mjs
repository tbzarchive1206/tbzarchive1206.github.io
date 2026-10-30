import {aliases,sources,validate,prepare,search,safeThumbnail} from './common.mjs?v=thumbnails-3';
const $=id=>document.getElementById(id), keys=['q','collection','member','year','platform','sort'];
let records=[],loaded=false,limit=30,timer,scrollTarget=0;
const labels={livestreams:'Livestreams',radio:'Radio',events:'Events',scans:'Scans'};
function option(id,value,label=value){const o=document.createElement('option');o.value=value;o.textContent=label;$(id).append(o);}
Object.keys(aliases).forEach(m=>option('member',m));
function read(){const p=new URLSearchParams(location.search);for(const k of keys){const value=p.get(k)|| (k==='sort'?'relevance':'');$(k).value=value;if($(k).value!==value)$(k).selectedIndex=0;}limit=Number(history.state?.limit)||30;scrollTarget=Number(history.state?.scroll)||0;}
function save(){history.replaceState({...history.state,limit,scroll:scrollY},'',location.href);}
function commit(){clearTimeout(timer);save();const p=new URLSearchParams();for(const k of keys){const v=$(k).value.trim();if(v&&!(k==='sort'&&v==='relevance'))p.set(k,v);}const url=location.pathname+(p.size?'?'+p:'');if(url!==location.pathname+location.search)history.pushState({limit:30,scroll:0},'',url);limit=30;render();}
function el(tag,text,cls){const n=document.createElement(tag);n.textContent=text;if(cls)n.className=cls;return n;}
function preview(record){
 const link=el('a','','result-preview');link.href=record.url;link.setAttribute('aria-label','Open '+record.title);link.addEventListener('click',save);
 const fallback=el('span',labels[record.collection],'preview-fallback');fallback.setAttribute('aria-hidden','true');link.append(fallback);
 const src=safeThumbnail(record.thumbnail);if(src){const image=document.createElement('img');image.alt='';image.width=120;image.height=90;image.loading='lazy';image.decoding='async';image.referrerPolicy='no-referrer';image.addEventListener('error',()=>{image.remove();link.classList.add('preview-unavailable');},{once:true});image.src=src;link.append(image);}else link.classList.add('preview-unavailable');return link;
}
function render(){if(!loaded)return;const filters=Object.fromEntries(keys.map(k=>[k,$(k).value.trim()]));const found=search(records,filters);$('status').textContent=found.length+' results · '+Math.min(limit,found.length)+' shown';$('results').replaceChildren();for(const r of found.slice(0,limit)){
 const li=el('li','','result'),context=el('div','','context');context.append(el('span',labels[r.collection]),el('span',r.date||'Date unknown'),el('span',r.platform||r.type));li.append(context,preview(r));const h=el('h3',''),a=el('a',r.title);a.href=r.url;a.addEventListener('click',save);h.append(a);li.append(h);
 if(r.description)li.append(el('p',r.description.length>280?r.description.slice(0,277)+'…':r.description));li.append(el('p',r.members.length?r.members.join(' · '):'Group / members not individually tagged','members'));
 if(r.itemCount>0)li.append(el('p',r.itemCount+' '+(r.collection==='scans'?'scans':'media files')));$('results').append(li);
 }if(!found.length)$('results').append(el('li','No results. Try fewer filters, another keyword or a different date.','result'));$('more').hidden=found.length<=limit;
}
async function load(){
 $('retry').hidden=true;$('status').textContent='Loading archive…';
 try{const response=await fetch('./index.json',{cache:'no-cache'});if(!response.ok)throw Error('HTTP '+response.status);const index=await response.json();if(index.schemaVersion!==1||!Array.isArray(index.sources))throw Error('Invalid index');for(const source of sources)validate({schemaVersion:1,generatedAt:index.generatedAt,source,records:index.records.filter(r=>r.collection===source)},source);records=index.records.map(prepare);loaded=true;
  for(const id of ['year','platform'])while($(id).options.length>1)$(id).remove(1);
  [...new Set(records.map(r=>r.date.slice(0,4)).filter(Boolean))].sort().reverse().forEach(y=>option('year',y));[...new Set(records.map(r=>r.platform).filter(Boolean))].sort().forEach(p=>option('platform',p));
  $('coverage').replaceChildren(...index.sources.map(s=>el('li',labels[s.source]+': '+s.count+' results · index generated '+new Date(s.generatedAt).toLocaleString()+(s.retained?' · saved snapshot retained':''))));
  $('notice').textContent=index.sources.some(s=>s.retained)?'Some collections use their last saved index. See coverage and updates below.':'';read();render();if(scrollTarget)requestAnimationFrame(()=>scrollTo(0,scrollTarget));
 }catch(e){loaded=false;$('status').textContent='Search could not be loaded. Please try again.';$('retry').hidden=false;}
}
$('searchForm').addEventListener('submit',e=>{e.preventDefault();commit();});$('q').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(commit,350);});
keys.filter(k=>k!=='q').forEach(k=>$(k).addEventListener('change',commit));
$('reset').addEventListener('click',()=>{for(const k of keys)$(k).value=k==='sort'?'relevance':'';commit();});
$('more').addEventListener('click',()=>{limit+=30;render();save();});$('retry').addEventListener('click',load);addEventListener('pagehide',save);
addEventListener('popstate',()=>{clearTimeout(timer);read();render();requestAnimationFrame(()=>scrollTo(0,scrollTarget));});
read();load();
