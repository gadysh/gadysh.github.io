// Claude acceptance of the WP6 asset fix: independent cold first-visit weight (desktop + mobile UA), / and /en/.
// Fresh browser context, cache disabled. Only 127.0.0.1 and Google Fonts are allowed; everything else is aborted.
// Headless Chrome may skip the favicon fetch, so it is added from a real request when the page did not load it.
const puppeteer=require(process.env.TEMP+'/node_modules/puppeteer-core');
const BASE='http://127.0.0.1:'+process.argv[2];const FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
const LIMIT=614400;
async function run(b,major,path,mobile){
 const ctx=await b.createBrowserContext();const w=await ctx.newPage();const blocked=[];
 await w.setRequestInterception(true);w.on('request',r=>{const u=r.url();if(u.startsWith(BASE)||u.startsWith('data:')||FONT.test(u))return r.continue();blocked.push(u);r.abort();});
 if(mobile){await w.setUserAgent(`Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`);await w.setViewport({width:375,height:812,isMobile:true,hasTouch:true,deviceScaleFactor:2});}
 else{await w.setUserAgent(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Safari/537.36`);await w.setViewport({width:1366,height:900,deviceScaleFactor:1});}
 const c=await w.target().createCDPSession();await c.send('Network.enable');await c.send('Network.setCacheDisabled',{cacheDisabled:true});
 const meta={},sizes={};c.on('Network.responseReceived',e=>{meta[e.requestId]={url:e.response.url,type:e.type,status:e.response.status};});
 c.on('Network.loadingFinished',e=>{sizes[e.requestId]=e.encodedDataLength;});
 await w.goto(BASE+path,{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,800));
 let items=[];for(const id in sizes){const m=meta[id]||{};items.push({type:m.type,status:m.status,bytes:sizes[id],url:m.url});}
 let favAdded=false;
 if(!items.some(i=>/favicon\.png/.test(i.url||''))){const href=await w.evaluate(()=>{const l=document.querySelector('link[rel~="icon"][type="image/png"]');return l&&l.href;});
  if(href){const before=Object.keys(sizes).length;await w.evaluate(u=>fetch(u,{cache:'no-store'}).then(r=>r.arrayBuffer()),href);await new Promise(r=>setTimeout(r,300));
   for(const id in sizes){const m=meta[id]||{};if((m.url||'')===href&&!items.some(i=>i.url===href)){items.push({type:'Favicon(fetched)',status:m.status,bytes:sizes[id],url:href});favAdded=true;}}}}
 const total=items.reduce((s,i)=>s+i.bytes,0);
 const res={path,mobile,ua:await w.evaluate(()=>navigator.userAgent),total,totalKB:+(total/1024).toFixed(2),underLimit:total<=LIMIT,favAdded,
  logo:items.filter(i=>/logo-symbol/.test(i.url)),favicon:items.filter(i=>/favicon/.test(i.url)),fonts:items.filter(i=>FONT.test(i.url)).map(i=>({bytes:i.bytes,url:i.url})),
  items:items.sort((a,b)=>b.bytes-a.bytes),blocked};
 await ctx.close();return res;}
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new'});
 const ver=await b.version();const major=(ver.match(/\/(\d+)\./)||[])[1]||'140';const out={chrome:ver,base:BASE,limit:LIMIT,runs:[]};
 for(const [p,m] of [['/',false],['/',true],['/en/',false],['/en/',true]])out.runs.push(await run(b,major,p,m));
 console.log(JSON.stringify(out,null,1));await b.close();})();
