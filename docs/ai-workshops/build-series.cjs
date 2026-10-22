const fs=require('fs'),path=require('path');
const dir=__dirname;
const read=f=>JSON.parse(fs.readFileSync(path.join(dir,f),'utf8').replace(/^\uFEFF/,''));
const report=fs.readFileSync(path.join(dir,'../qa-automation-poc/REPORT.html'),'utf8');
const parts=[...report.matchAll(/<h2>(.*?)<\/h2>([\s\S]*?)(?=<h2>|$)/g)];
const section=n=>parts.find(x=>x[1].startsWith(n+'.'))[2];
const titles={1:'QA Automation Tools and Why Playwright',2:'Codex versus Claude Code - Automation Results',3:'Recommended Tools - Strengths, Weaknesses and POC Proof',4:'Completed Automation - Coverage and Remaining Scope',5:'Partial Automation, Blockers and Manual Scenarios',6:'Pipeline Integration Plan and POC Evidence'};
const ids={1:'6895960137'};
for(let n=2;n<=6;n++){const f=path.join(dir,`series-${n}-page.json`);if(fs.existsSync(f))ids[n]=read(`series-${n}-page.json`).data.content.id;}
const url=id=>'https://internationalsos.atlassian.net/wiki/spaces/AD/pages/'+id;
const nav='<h2>Six-question report</h2><ol>'+Object.keys(titles).map(n=>`<li>${ids[n]?`<a href="${url(ids[n])}">${titles[n]}</a>`:titles[n]}</li>`).join('')+'</ol>';
const intro='<p><strong>Evidence snapshot: 8 October 2026.</strong> Measured means a saved artifact was inspected; reported means an internal source describes results; proposed means not yet executed. Cases, tests, setup and assertions are counted separately.</p>';
const provenance='<h2>Evidence and workshop references</h2><p><a href="'+url('6896156677')+'">Combined POC report, screenshots and attachments</a> | <a href="'+url('6772031506')+'">Reported RSA / Claude source</a> | <a href="'+url('6896091147')+'">Web workshop and slides</a> | <a href="'+url('6894092390')+'">Mobile workshop and slides</a></p>';
let four=section(4);
const start=four.indexOf('<p>The 14 reported RSA skips');
const five=four.slice(start);
four=four.slice(0,start)+'<p>See question 5 for the individual blocking categories and full/partial/manual classification. Unstarted cases must not be labelled impossible to automate.</p>';
const bodies={2:section(2),3:section(3),4:four,5:five,6:section(5)};
for(let n=2;n<=6;n++)fs.writeFileSync(path.join(dir,`SERIES-${n}.html`),intro+bodies[n]+provenance+nav);
// Page 1 retains its full, separately researched cost and licensing comparison.
const tools=fs.readFileSync(path.join(dir,'QA-TOOLS.html'),'utf8');
fs.writeFileSync(path.join(dir,'SERIES-1.html'),tools+nav);
fs.writeFileSync(path.join(dir,'series-manifest.json'),JSON.stringify({titles,ids},null,2));
console.log('Built six-page series; linked '+Object.keys(ids).length+' published pages.');
