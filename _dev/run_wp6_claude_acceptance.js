// Claude independent WP6 acceptance checks against the stub build. Blocks every non-127.0.0.1 request
// except Google Fonts in the weight run only.
const puppeteer=require(process.env.TEMP+'/node_modules/puppeteer-core');
const BASE='http://127.0.0.1:'+process.argv[2];
const PAGES=['/','/en/','/solutions/','/solutions/customers/','/solutions/knowledge-and-teams/','/solutions/operations/',
'/scenarios/recording-to-outputs/','/scenarios/agent-assist-onboarding/','/scenarios/documents-across-systems/',
'/scenarios/knowledge-chat-actions/','/scenarios/whatsapp-service-actions/','/how-we-work/','/en/how-we-work/',
'/contact/','/en/contact/','/privacy/','/en/privacy/','/accessibility/','/en/accessibility/'];
const FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
(async()=>{
 const out={base:BASE,ts:new Date().toISOString(),pages:{},blocked:[],allowedExternal:[],links:{},weight:{}};
 const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new',args:['--no-first-run','--no-default-browser-check']});
 async function mk(allowFonts){const p=await b.newPage();await p.setRequestInterception(true);
  p.on('request',r=>{const u=r.url();if(u.startsWith(BASE)||u.startsWith('data:'))return r.continue();
   if(allowFonts&&FONT.test(u)){out.allowedExternal.push(u);return r.continue();}out.blocked.push(u);r.abort();});return p;}
 // 1. errors / 404 / links on all public pages, fonts blocked
 const p=await mk(false); const linkSet=new Set();
 for(const path of PAGES){const rec={console:[],pageerror:[],bad:[]};
  const oc=m=>{if(m.type()==='error'&&!/net::ERR_FAILED/.test(m.text()))rec.console.push(m.text());};
  const oe=e=>rec.pageerror.push(String(e));const or=r=>{if(r.url().startsWith(BASE)&&r.status()>=400)rec.bad.push(r.status()+' '+r.url());};
  p.on('console',oc);p.on('pageerror',oe);p.on('response',or);
  const resp=await p.goto(BASE+path,{waitUntil:'networkidle0'});rec.status=resp.status();
  const hrefs=await p.$$eval('a[href]',as=>as.map(a=>a.href));
  hrefs.forEach(h=>{if(h.startsWith(BASE))linkSet.add(h.split('#')[0]);});
  rec.headings=await p.$$eval('h1,h2,h3,h4,h5,h6',hs=>hs.map(h=>h.tagName));
  rec.lang=await p.$eval('html',h=>h.lang+'/'+h.dir);
  p.off('console',oc);p.off('pageerror',oe);p.off('response',or);out.pages[path]=rec;}
 for(const l of linkSet){const r=await p.goto(l,{waitUntil:'domcontentloaded'}).catch(e=>null);out.links[l]=r?r.status():'ERR';}
 await p.close();
 // 2. home weight, mobile 375, cache disabled; fonts allowed then blocked
 for(const allow of [true,false]){const w=await mk(allow);await w.setViewport({width:375,height:812,isMobile:true,deviceScaleFactor:2});
  const c=await w.target().createCDPSession();await c.send('Network.enable');await c.send('Network.setCacheDisabled',{cacheDisabled:true});
  const meta={},sizes={};c.on('Network.responseReceived',e=>{meta[e.requestId]={url:e.response.url,type:e.type};});
  c.on('Network.loadingFinished',e=>{sizes[e.requestId]=e.encodedDataLength;});
  await w.goto(BASE+'/',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,800));
  const byType={};let total=0,items=[];for(const id in sizes){const m=meta[id]||{type:'?',url:'?'};byType[m.type]=(byType[m.type]||0)+sizes[id];total+=sizes[id];items.push([m.type,m.url,sizes[id]]);}
  out.weight[allow?'fontsAllowed':'fontsBlocked']={total,totalKB:+(total/1024).toFixed(2),byType,items};await w.close();}
 await b.close();
 console.log(JSON.stringify(out,null,1));
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
