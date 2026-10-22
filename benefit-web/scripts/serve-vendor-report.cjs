const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const report=path.resolve(__dirname,'../docs/vendor-creation/report.html');
http.createServer((req,res)=>{
 if(req.url!=='/'){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});res.end(fs.readFileSync(report));
}).listen(9324,'127.0.0.1',()=>console.log('Vendor assessment: http://127.0.0.1:9324'));
