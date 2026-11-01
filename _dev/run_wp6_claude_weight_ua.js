// Home weight re-run with a standard mobile Chrome UA (headless UA can change Google Fonts format).
const puppeteer=require(process.env.TEMP+'/node_modules/puppeteer-core');
const BASE='http://127.0.0.1:'+process.argv[2];const FONT=/^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
(async()=>{const b=await puppeteer.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:'new'});
 const ver=await b.version();const w=await b.newPage();const blocked=[];
 await w.setRequestInterception(true);w.on('request',r=>{const u=r.url();if(u.startsWith(BASE)||u.startsWith('data:')||FONT.test(u))return r.continue();blocked.push(u);r.abort();});
 const major=(ver.match(/\/(\d+)\./)||[])[1]||'140';
 await w.setUserAgent(`Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 Mobile Safari/537.36`);
 await w.setViewport({width:375,height:812,isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const c=await w.target().createCDPSession();await c.send('Network.enable');await c.send('Network.setCacheDisabled',{cacheDisabled:true});
 const meta={},sizes={};c.on('Network.responseReceived',e=>{meta[e.requestId]={url:e.response.url,type:e.type,mime:e.response.mimeType};});
 c.on('Network.loadingFinished',e=>{sizes[e.requestId]=e.encodedDataLength;});
 await w.goto(BASE+'/',{waitUntil:'networkidle0'});await new Promise(r=>setTimeout(r,800));
 let total=0;const items=[];for(const id in sizes){const m=meta[id]||{};total+=sizes[id];items.push([m.type,m.mime,sizes[id],m.url]);}
 console.log(JSON.stringify({chrome:ver,ua:await w.evaluate(()=>navigator.userAgent),total,totalKB:+(total/1024).toFixed(2),items,blocked},null,1));await b.close();})();
