const fs=require('node:fs'),path=require('node:path');
const folder='docs/vendor-creation';
const text=fs.readFileSync(folder+'/CREATION-TC.md','utf8');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let html='',table=false,list=false;
for(const line of text.split('\n')){
 if(line.startsWith('|')){if(!table){html+='<div class="table"><table>';table=true;}if(/^\|[- :|]+\|$/.test(line))continue;html+='<tr>'+line.split('|').slice(1,-1).map(c=>'<td>'+esc(c.trim())+'</td>').join('')+'</tr>';continue;}
 if(table){html+='</table></div>';table=false;}
 if(/^(-|\d+\.) /.test(line)){if(!list){html+='<ul>';list=true;}html+='<li>'+esc(line.replace(/^(-|\d+\.) /,''))+'</li>';continue;}
 if(list){html+='</ul>';list=false;}
 if(line.startsWith('![')){const img=fs.readFileSync(folder+'/evidence/full-input/all-fields-populated.png').toString('base64');html+='<figure><img src="data:image/png;base64,'+img+'" alt="Populated input evidence"><figcaption>Input coverage only; vendor was not saved.</figcaption></figure>';}
 else if(line.startsWith('## '))html+='<h2>'+esc(line.slice(3))+'</h2>';
 else if(line.startsWith('# '))html+='<h1>'+esc(line.slice(2))+'</h1>';
 else if(line.trim())html+='<p>'+esc(line)+'</p>';
}
if(list)html+='</ul>';if(table)html+='</table></div>';
const page='<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vendor Creation - BenefitDB and CMS</title><style>body{font:16px/1.6 system-ui;margin:0;background:#f3f5f8;color:#203047}main{max-width:1150px;margin:auto;padding:35px 25px}h1{font-size:30px;border-bottom:4px solid #d92331;padding-bottom:18px}h2{margin-top:32px}.table{overflow:auto}table{width:100%;border-collapse:collapse;background:white;font-size:14px}td{padding:12px;border:1px solid #dce3eb;vertical-align:top}tr:first-child{font-weight:bold;background:#e5edf5}figure{background:white;padding:16px;text-align:center}img{max-width:100%;max-height:1000px;object-fit:contain}figcaption{font-size:14px;color:#617084}</style><main>'+html+'</main></html>';
fs.writeFileSync(folder+'/creation-report.html',page);
fs.writeFileSync(folder+'/report.html',page);
console.log('Focused report generated: one creation TC with BenefitDB/CMS comparison.');
