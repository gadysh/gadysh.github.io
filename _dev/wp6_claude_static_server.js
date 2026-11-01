// Minimal static server for the stub build (Claude WP6 acceptance). Own process, 127.0.0.1 only.
const http=require('http'),fs=require('fs'),path=require('path');
const root=process.argv[2],port=+process.argv[3];
const T={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.xml':'application/xml','.txt':'text/plain','.ico':'image/x-icon','.webp':'image/webp','.json':'application/json','.woff2':'font/woff2'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);let f=path.join(root,p);
 try{if(fs.statSync(f).isDirectory())f=path.join(f,'index.html');}catch(e){}
 fs.readFile(f,(e,d)=>{if(e){r.writeHead(404,{'content-type':T['.html']});return r.end(fs.existsSync(path.join(root,'404.html'))?fs.readFileSync(path.join(root,'404.html')):'nf');}
 r.writeHead(200,{'content-type':T[path.extname(f)]||'application/octet-stream','cache-control':'no-store'});r.end(d);});
}).listen(port,'127.0.0.1',()=>console.log('listening',port));
