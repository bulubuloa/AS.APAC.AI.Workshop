const fs=require('fs'),path=require('path');
const PptxGenJS=require('../../presentations/node_modules/pptxgenjs');
const p=new PptxGenJS();p.layout='LAYOUT_WIDE';p.author='APAC Aspire Digital';p.company='International SOS';p.title='Web QA Automation — Management Briefing';p.subject='Tool selection, POC evidence, coverage and pipeline plan';p.lang='en-GB';p.theme={headFontFace:'Segoe UI',bodyFontFace:'Segoe UI',lang:'en-GB'};
const C={ink:'142B42',blue:'0B5FA5',muted:'627488',line:'D4DEE8'};
const base='https://internationalsos.atlassian.net/wiki/spaces/AD/pages/';
const sources=[6895960137,6896910361,6896287838,6895534237,6896681063,6896681090];
const topics=['Why Playwright','Codex versus Claude Code','Recommendation and proof','Completed automation','Automation boundaries','Pipeline plan'];
const slides=[];
function add(q,title,head,rows,note,explain){slides.push({q,title,head,rows,note,explain});}
slides.push({cover:true,title:'Web QA Automation',subtitle:'A management decision backed by POC evidence',explain:'Playwright for execution. Claude Code for broader suite authoring. Codex for focused vendor and CMS checks. Evidence limitations and pipeline next steps are explicit.'});
add(1,'Playwright fits our complete web workflows',['Decision point','Playwright','Selenium','Cypress'],[
 ['Workflow coverage','Forms, tabs and service checks','Broad coverage; more setup','Strong frontend focus'],
 ['Failure evidence','Reports and step replay','Additional reporting tools','Interactive debugging'],
 ['Maintenance','Automatic waits for controls','More explicit waiting rules','Built-in retry behaviour'],
 ['Framework licence','Apache 2.0 · $0','Apache 2.0 · $0','MIT · $0 core']
],'Recommendation: Playwright balances workflow coverage, evidence and setup.','All three are viable. Playwright best matches RSA and Benefit workflows spanning forms, popups and connected data. Framework licence cost excludes hosting, labour and optional services. Cypress Cloud is optional and paid.');
add(1,'The fit comes from our project needs',['Our workflow','Why Playwright fits'],[
 ['RSA agent journeys','Follow a journey across pages and popups'],
 ['Benefit vendor creation','Select dependencies, fill fields and verify Save'],
 ['Data consistency','Compare rendered values with service or CMS data'],
 ['QA investigation','Replay failed steps with screenshots and traces']
],'Choose for these capabilities and the work we need to test.','This is a capability-based selection. We do not use existing implementation or avoiding a restart as the reason to choose Playwright. Database and CMS comparisons require a defined expected result and access.');
add(1,'Repeatable checks and clearer failures',['Strong point','Business benefit','Cost boundary'],[
 ['Repeatable journeys','Run the same checks after changes','Maintain test data and expectations'],
 ['Clear failure evidence','QA can see where the journey failed','Store reports securely'],
 ['Automatic waiting','Reduce timing-related false failures','Review unstable tests'],
 ['Free framework','No framework licence fee','Runner, AI and team time still cost']
],'The benefit is reliable release evidence; savings have not been measured.','No ROI or time-saving percentage has been established in this POC. Tool capability supports the recommendation; teams must still review business assertions, account access and data cleanup.');
add(2,'Recommend Claude Code for the broader web suite',['Job','Recommended role','Evidence supporting it'],[
 ['Build the broader RSA pack','Claude Code as primary author','Broader documented delivery'],
 ['Focused vendor / CMS checks','Codex as a capable option','Saved vendor and 19 value checks'],
 ['Accept the result','QA reviews either tool’s work','Business rules still need review']
],'This is a job-specific recommendation based on available POC evidence.','Claude Code has the broader documented delivery for this job. This is not proof of universal superiority, lower cost or greater accuracy. Codex demonstrated a narrower but detailed vendor creation and CMS validation workflow.');
add(2,'The results support different strengths',['Evidence','Claude Code / RSA','Codex / Benefit'],[
 ['Scope','61 cases → 71 executable tests','Vendor flow + login setup'],
 ['Recorded outcome','57 passed · 14 skipped','2 passed'],
 ['Detailed data check','Equivalent vendor proof unavailable','19 rendered values matched CMS'],
 ['Evidence status','Reported in the RSA POC','Saved local test evidence']
],'Different tasks and scope: these numbers are not an equal-task competition.','The RSA results are reported from the source POC, not rerun here. Benefit’s two passing executable tests are one vendor business check and one login setup. Nineteen value comparisons are field checks, not nineteen business cases. Full corrected BenefitDB/CMS comparison remains pending.');
add(2,'Confirm the AI choice with the same assignment',['Measure','Fair comparison'],[
 ['Delivery time','Same journeys, access and acceptance rules'],
 ['Review effort','Record corrections needed before QA accepts'],
 ['Defect detection','Use the same known failures and expected results'],
 ['Operating cost','Compare actual usage plus reviewer time']
],'Proposed next step: a matched-task trial before claiming speed or cost superiority.','This benchmark is a plan and has not been completed. Both tools should receive identical project access, test cases, environment, data and review criteria. Compare accepted outcomes rather than the number of generated tests.');
add(3,'Use each tool for a clear responsibility',['Tool','Strength','Limit to manage'],[
 ['Playwright: execution','Complete journeys + clear failure evidence','Needs correct assertions and stable data'],
 ['Claude Code: broad authoring','Broader documented RSA case delivery','Skipped cases and QA review remain'],
 ['Codex: focused checks','Detailed vendor and CMS verification','Setup assumptions needed correction']
],'Recommended combination: Playwright executes; AI helps author; QA owns acceptance.','Evidence: reported Claude RSA suite 61 cases, 57 passes and 14 skips; saved local RSA subset six passes; saved Codex Benefit vendor flow plus login two passes and nineteen CMS checks. Authoring and execution have different responsibilities.');
slides.push({q:3,title:'Benefit POC: saved vendor and visible details',evidence:true,note:'Synthetic vendor 20415 · 19 rendered values matched CMS · full DB comparison pending.',explain:'Saved evidence from 8 October 2026. The left image captures the successful creation toast. The right image shows the upper portion of vendor details. Vendor ID 20415 and CMS item d4b1c8e8-d8ac-415d-86eb-856391f9a531. This demonstrates save, detail display and nineteen CMS-rendered value comparisons. It does not prove every optional field persisted or full database parity.'});
add(3,'The POC shows progress and specific next actions',['Observed gap','Action','Why it matters'],[
 ['RSA account / identity skips','Provide approved test accounts','Run role and sign-in journeys'],
 ['Missing job fixtures','Create controlled test records','Repeat the same expected journey'],
 ['Full DB / CMS comparison pending','Restore access and finish the check','Prove persistence as well as display'],
 ['AI-generated assumptions','QA reviews expected outcomes','Avoid accepting a misleading pass']
],'Resolve prerequisites, then expand the accepted test pack.','A successful UI/CMS comparison is narrower than full end-to-end integration proof. Some earlier Benefit assumptions about disabled fields were corrected by selecting Thailand at the top right, English and reloading. Access expiry prevented completion of the corrected full DB comparison.');
slides.push({q:4,title:'Coverage needs a confirmed baseline',coverage:true,note:'“300 of 400” is unverified. Confirm that case pack before reporting 75%.',explain:'The canonical RSA POC reports a catalogue of 449 cases across 22 sheets, 61 implemented cases and 388 not started. 61/449 is 13.6% implemented coverage of that reported catalogue. This is not passing coverage. No verified 300/400 inventory has been supplied.'});
add(4,'Separate cases, executable tests and results',['Measure','Recorded value','What it means'],[
 ['RSA business cases','61 implemented / 449 catalogue','Reported business scope'],
 ['RSA executable tests','71: 57 passed + 14 skipped','Reported run; not rerun here'],
 ['Local RSA workshop run','6 passed; 13 tests listed','Saved subset, not full-pack proof'],
 ['Benefit focused run','2 passed; 19 value checks','Vendor check + login setup']
],'Report completed business scope and passing execution separately.','A business case may produce multiple executable tests. Setup tests should not be presented as additional business coverage. The local RSA six-test saved result includes five functional tests and setup; the thirteen-test inventory includes twelve functional tests and setup.');
add(4,'The 14 reported skips have concrete prerequisites',['Reason','Tests','What enables execution'],[
 ['Role accounts','9','Approved accounts with the required roles'],
 ['Identity sign-in','2','Test identities for the sign-in service'],
 ['Signed authentication','1','Valid signed authentication fixture'],
 ['Job records','2','Controlled job data for the scenarios']
],'A missing prerequisite does not establish that a scenario cannot be automated.','These counts explain the fourteen reported RSA skips. They do not explain a supposed remaining one hundred cases. The 388 not-started catalogue cases need individual assessment; they are not all impossible. Source POC dated 8 October 2026.');
add(5,'Fully automate the digital checks we can observe',['Scenario','Automation scope','Prerequisite'],[
 ['Web forms and rules','Input, validation, save and details','Agreed expected outcomes'],
 ['Role-based journeys','Sign in and verify permitted actions','Approved role accounts'],
 ['Assigned jobs','Verify digital assignment and status','Controlled job records'],
 ['DB / CMS consistency','Compare defined persisted / shown values','Access and agreed field mapping']
],'Full automation is possible within a defined digital scope and available access.','Full means all assertions of a defined digital scenario can be checked. It does not imply every integration has been proven. Benefit’s corrected complete DB/CMS comparison remains pending.');
add(5,'Some journeys need automated and human evidence',['Journey','Automated part','Remaining proof'],[
 ['Notifications','Request, callback or controlled inbox','Actual external delivery when uncontrolled'],
 ['Third-party fulfilment','Request and returned status','External service completion'],
 ['Roadside assistance','Assignment and digital status updates','Physical arrival and towing']
],'Label these journeys as partial when the external outcome is not verified.','A digital status update does not independently prove physical roadside service completion. Controlled integration checks can be automated; real external outcomes may require provider evidence or a human check.');
add(5,'Keep human judgement explicit',['Human check','Why it remains','How to report it'],[
 ['Usability and clarity','Requires judgement about the experience','Manual acceptance alongside digital tests'],
 ['Human approval / protected MFA','Depends on a person or protected challenge','Approved test path, otherwise manual step'],
 ['Physical service acceptance','Outside the observable web workflow','Attach operational confirmation'],
 ['Unassessed cases','Scope has not yet been reviewed','Classify before declaring impossible']
],'Classify each remaining case: full, partial, prerequisite-blocked or manual.','MFA and CAPTCHA should not be bypassed. Approved test identities or test-environment paths may enable digital automation. These are scenario categories, not a verified breakdown of one hundred remaining cases.');
add(6,'Move from local proof to an unattended pilot',['Phase','Deliverable','Acceptance evidence'],[
 ['1. Agree the pack','Case list, required count and owner','Approved expected coverage'],
 ['2. Run after test deployment','Cloud runner with controlled access','Actual hosted run and report link'],
 ['3. Stabilise the pilot','Repeat runs and failure recovery','Proposed target: 10 unattended runs'],
 ['4. Expand triggers','Nightly and release checks','Reliable evidence and agreed release gate']
],'Proposed plan: prove one hosted pilot before expanding release controls.','The POC contains a draft CodeBuild setup and local gate checks. No cloud QA run or deployed QA pipeline has been demonstrated. Ten unattended runs is a proposed acceptance target, not a completed result.');
add(6,'The local gate rejects incomplete success',['Local check','Result','Management meaning'],[
 ['Gate policy self-check','5 checks passed','Pass / fail / skip / empty / incomplete handled'],
 ['RSA: 6 passed, 13 expected','Rejected','A green subset cannot stand for the full pack'],
 ['Benefit: 2 passed, 2 expected','Accepted','Saved focused pack met its required count'],
 ['Hosted cloud pipeline','Not demonstrated','Infrastructure proof still needed']
],'Local gate proof is complete; hosted execution is the next evidence milestone.','Local validator rerun 9 October 2026 against saved results: complete passing run accepted; failed, skipped, empty and incomplete runs rejected. No browser rerun or cloud pipeline deployment was performed for this presentation.');
add(6,'The pilot needs an owner and evidence of recovery',['Need','Owner / proof to agree'],[
 ['Accounts, data and network','Approved test access; predictable data and cleanup'],
 ['Secure evidence storage','Restricted reports, screenshots, traces and videos'],
 ['Hosted success','Run ID and accessible results for the complete pack'],
 ['Hosted failure and recovery','Deliberate failure blocks the gate; corrected rerun passes']
],'Use these checks to decide when the pipeline is ready for release use.','Runner image, environment configuration, secrets, network access and cleanup need ownership. Evidence should avoid credentials and customer data. A hosted run ID, report link and demonstrated failure/recovery are needed before claiming pipeline readiness.');
add(0,'The management decision and next steps',['Decision','Next action'],[
 ['Web execution: Playwright','Use complete workflows and reportable evidence'],
 ['Claude Code: primary author','Confirm with a matched-task trial; Codex for focused checks'],
 ['Coverage','Approve one inventory; resolve the 300 / 400 discrepancy'],
 ['Pipeline investment','Assign a pilot owner and prove unattended execution']
],'Proceed with a controlled web pilot and publish only evidenced results.','Supporting project: https://github.com/bulubuloa/AS.APAC.AI.Workshop . Roadside-web is the published example. Benefit focused project is local and has not been published to that repository. The approved Confluence pages contain the supporting detail.');
function txt(s,t,x,y,w,h,size=22,opts={}){s.addText(t,{x,y,w,h,fontFace:'Segoe UI',fontSize:size,color:C.ink,margin:0,valign:'top',...opts});}
function wrap(t,w){const limit=Math.floor(w*8.5);let lines=[],line='';for(const word of t.split(' ')){if(line.length+word.length+1>limit){lines.push(line);line=word;}else line+=(line?' ':'')+word;}lines.push(line);return lines.join('\n');}
slides.forEach((d,i)=>{
 const s=p.addSlide();s.background={color:d.cover?C.ink:'FFFFFF'};
 if(d.cover){txt(s,'APAC ASPIRE DIGITAL',.7,1.1,11.8,.5,18,{color:'8CBDE5'});txt(s,d.title,.7,2,11.8,1.1,46,{bold:true,color:'FFFFFF'});txt(s,d.subtitle,.7,3.45,11.8,1.1,29,{color:'FFFFFF'});txt(s,'RSA and Benefit · Web testing\nManagement briefing · 9 October 2026',.7,5.35,11.8,1,21,{color:'CCDBEA'});}
 else{
  txt(s,d.q?topics[d.q-1]:'Decision and next steps',.65,.26,12,.35,15,{color:C.blue});txt(s,d.title,.65,.86,12,1,32,{bold:true});
  if(d.head){const widths=d.head.length===4?[2.6,3.14,3.13,3.13]:d.head.length===3?[3.15,4.2,4.65]:[3.75,8.25];const rows=[d.head.map((t,j)=>({text:wrap(t,widths[j]),options:{bold:true,color:'FFFFFF',fill:C.blue}})),...d.rows.map(r=>r.map((t,j)=>({text:wrap(t,widths[j]),options:{color:C.ink}})))];s.addTable(rows,{x:.65,y:2,w:12,colW:widths,rowH:.78,fontFace:'Segoe UI',fontSize:18,margin:[.12,.16,.12,.16],border:{type:'solid',pt:.6,color:C.line},fill:'FFFFFF',valign:'mid',autoPage:false,paraSpaceAfterPt:0});}
  if(d.evidence){const e=path.join(__dirname,'../qa-automation-poc/evidence');txt(s,'Creation confirmation',.65,1.92,6.2,.35,18,{bold:true,color:C.blue});txt(s,'Vendor details (upper section)',7.2,1.92,5.45,.35,18,{bold:true,color:C.blue});s.addImage({path:path.join(e,'benefit-save-success.png'),x:.65,y:2.4,w:6.25,h:3.515625});s.addImage({path:path.join(e,'benefit-vendor-detail.png'),x:7.2,y:2.4,w:5.45,h:5.45*2252/1280,sizing:{type:'crop',w:5.45,h:3.65,x:0,y:0}});}
  if(d.coverage){txt(s,'Reported RSA catalogue: 449 business cases',.65,1.98,12,.6,25,{bold:true});s.addChart(p.ChartType.bar,[{name:'Implemented',labels:['RSA cases'],values:[61]},{name:'Not started',labels:['RSA cases'],values:[388]}],{x:.75,y:2.85,w:11.8,h:2.45,barDir:'bar',barGrouping:'stacked',chartColors:[C.blue,'D4DEE8'],showLegend:true,legendPos:'b',legendFontSize:18,showValue:true,dataLabelPosition:'ctr',dataLabelColor:C.ink,dataLabelFormatCode:'0',dataLabelBkgrdColor:'FFFFFF',dataLabelColor:C.ink,showCatName:false,showTitle:false,showCatName:false,catAxisLabelFontSize:18,valAxisLabelFontSize:14,valAxisMinVal:0,valAxisMaxVal:449,valAxisMajorUnit:100,showBorder:false,showCatName:false});txt(s,'61 implemented (13.6%)    •    388 not started',.65,5.55,12,.6,25,{bold:true,color:C.blue});}
  txt(s,d.note,.65,6.48,12,.62,19,{color:C.blue,bold:true});txt(s,String(i+1).padStart(2,'0'),12.15,7.17,.5,.2,11,{color:C.muted,align:'right'});
 }
 s.addNotes(d.explain+'\nSources: '+(d.q?base+sources[d.q-1]:sources.map(id=>base+id).join('\n'))+(d.q===2||d.q===4?'\nCanonical RSA POC: '+base+'6772031506':'')+'\nPOC supporting evidence: '+base+'6896156677');
});
fs.mkdirSync(path.join(__dirname,'private'),{recursive:true});fs.writeFileSync(path.join(__dirname,'management-deck-content.json'),JSON.stringify(slides,null,2));p.writeFile({fileName:path.join(__dirname,'private/QA-Automation-Management-Draft.pptx')}).then(()=>console.log('Created '+slides.length+' slides'));

