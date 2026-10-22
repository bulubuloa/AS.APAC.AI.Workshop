const fs=require('fs'),path=require('path');
const PptxGenJS=require('../../presentations/node_modules/pptxgenjs');
const dir=__dirname;
const data=JSON.parse(fs.readFileSync(path.join(dir,'deck-content.json'),'utf8'));
const pptx=new PptxGenJS();
pptx.layout='LAYOUT_WIDE';
pptx.author='APAC Aspire Digital';
pptx.subject='QA automation tool selection, POC evidence, coverage and pipeline plan';
pptx.title=data.title;
pptx.company='International SOS';
pptx.lang='en-GB';
pptx.theme={headFontFace:'Segoe UI',bodyFontFace:'Segoe UI',lang:'en-GB'};
const C={ink:'142B42',blue:'0B5FA5',body:'34495E',muted:'627488',line:'D4DEE8',dark:'142B42'};
const W=13.333,H=7.5,M=.65;
const names={1:'Tools and why Playwright',2:'Codex versus Claude Code',3:'Recommendation and POC proof',4:'Completed automation and coverage',5:'Partial automation and blockers',6:'Pipeline integration'};
function text(s,str,x,y,w,h,size=22,extra={}){s.addText(str,{x,y,w,h,fontFace:'Segoe UI',fontSize:size,color:C.body,margin:0,breakLine:false,valign:'top',...extra});}
function takeaway(s,str){if(str)text(s,str,M,6.36,11.7,.7,20,{color:C.blue,bold:true});}
function header(s,d,i){
 s.background={color:'FFFFFF'};
 if(d.q)text(s,`${d.q}. ${names[d.q]}`,M,.25,11.7,.3,14,{color:C.blue});
 text(s,d.title,M,.76,12.05,.92,31,{color:C.ink,bold:true});
 text(s,String(i+1).padStart(2,'0'),12.22,7.14,.45,.2,11,{align:'right',color:C.muted});
}
function list(s,items,x,y,w,size=22,step=.83){items.forEach((item,i)=>text(s,item,x,y+i*step,w,step-.08,size,{bullet:{indent:size},hanging:4,paraSpaceAfterPt:8}));}
function table(s,d){
 const cols=d.head.length;
 const widths=cols===2?[3.85,8.15]:d.q===1?[3.1,4.1,4.8]:[3.4,4.4,4.2];
 const rows=[d.head.map(h=>({text:h,options:{bold:true,color:'FFFFFF',fill:C.blue}})),...d.rows.map(r=>r.map(cell=>({text:cell,options:{color:C.ink}})))];
 s.addTable(rows,{x:M,y:1.84,w:12,h:4.16,colW:widths,rowH:.6,fontFace:'Segoe UI',fontSize:17.5,
  margin:[.12,.15,.12,.15],border:{type:'solid',pt:.6,color:C.line},color:C.ink,fill:'FFFFFF',valign:'mid',autoPage:false,
  bold:false,paraSpaceAfterPt:0});
 takeaway(s,d.takeaway);
}
function example(s,d){
 list(s,d.left,M,1.95,5.45,22,1.14);
 let lines=d.code;
 if(d.q===6){lines=['npm ci','npx playwright install --with-deps chromium','POC=../docs/qa-automation-poc/pipeline','node "$POC/preflight.cjs"','npx playwright test --workers=1 --retries=0','node "$POC/validate-junit.cjs" reports/junit.xml 13'];d.takeaway='Draft Linux runner commands; project secrets, image and network still need setup.';}
 text(s,lines.join('\n'),6.55,1.91,6.12,4.05,17,{fontFace:'Consolas',color:C.ink,margin:.16,fill:{color:'F0F4F8'},breakLine:false});
 takeaway(s,d.takeaway);
}
function columns(s,d){
 text(s,d.leftTitle,M,1.86,5.65,.55,23,{bold:true,color:C.blue});
 text(s,d.rightTitle,7.02,1.86,5.65,.55,23,{bold:true,color:C.blue});
 list(s,d.left,M,2.6,5.65,20.5,.85);
 list(s,d.right,7.02,2.6,5.65,20.5,.85);
 takeaway(s,d.takeaway);
}
function evidence(s,d){
 const imgDir=path.join(dir,'../qa-automation-poc/evidence');
 const left=path.join(imgDir,d.images[0]);
 const right=path.join(imgDir,d.images[1]);
 s.addImage({path:left,x:M,y:2.08,w:6.35,h:3.95,sizing:{type:'contain',w:6.35,h:3.95}});
 // Show the top of the long captured detail, including its IDs and values.
 s.addImage({path:right,x:7.23,y:2.08,w:5.42,h:5.42*2252/1280,sizing:{type:'crop',w:5.42,h:3.95,x:0,y:0}});
 text(s,d.captions[0],M,1.8,6.3,.3,17,{bold:true,color:C.blue});
 text(s,d.captions[1]+' (upper section)',7.23,1.8,5.4,.3,17,{bold:true,color:C.blue});
 takeaway(s,d.takeaway);
}
data.slides.forEach((d,i)=>{
 if(d.q===5&&d.type==='table'&&d.rows[0][1]==='9')d.rows[0][0]='Role and account fixtures';
 const s=pptx.addSlide();
 if(d.type==='cover'){
  s.background={color:C.dark};
  text(s,'APAC ASPIRE DIGITAL',M,1.18,11.7,.4,17,{color:'8CBDE5'});
  text(s,d.title,M,2.03,11.7,1.75,43,{bold:true,color:'FFFFFF'});
  text(s,d.subtitle,M,4.03,11.7,.6,24,{color:'FFFFFF'});
  text(s,d.body.join('\n'),M,5.1,11.7,1.35,19,{color:'CCDBEA'});
 }else{
  header(s,d,i);
  if(d.type==='table')table(s,d);
  else if(d.type==='example')example(s,d);
  else if(d.type==='columns')columns(s,d);
  else if(d.type==='evidence')evidence(s,d);
  else {list(s,d.body,M,1.93,11.95,22,.84);takeaway(s,d.takeaway);}
 }
 s.addNotes(d.notes+(d.q?'\nTopic '+d.q+' of six.':'')+'\nExamples are abbreviated unless explicitly identified as executed POC evidence. Pricing is an 8 October 2026 snapshot.');
});
const output=path.join(dir,'output');fs.mkdirSync(output,{recursive:true});
const dest=path.join(output,'QA-Automation-Six-Questions-POC.pptx');
pptx.writeFile({fileName:dest}).then(()=>console.log('Created '+data.slides.length+' slides: '+dest));
