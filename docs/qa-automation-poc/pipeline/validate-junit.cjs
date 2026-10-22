const fs=require('node:fs');
function inspect(xml,expectedTests){
 const root=xml.match(/<testsuites\b([^>]*)>/);if(!root)throw Error('JUnit testsuites summary missing');
 const n=key=>{const m=root[1].match(new RegExp('\\b'+key+'="(\\d+)"'));if(!m)throw Error('JUnit '+key+' summary missing');return Number(m[1]);};
 const result={tests:n('tests'),failures:n('failures'),errors:n('errors'),skipped:n('skipped')};
 const cases=(xml.match(/<testcase\b/g)||[]).length;if(cases!==result.tests)throw Error('Test count does not match recorded cases');
 result.accepted=result.tests>0&&result.failures===0&&result.errors===0&&result.skipped===0&&(expectedTests===undefined||result.tests===expectedTests);if(expectedTests!==undefined)result.expectedTests=expectedTests;return result;
}
if(process.argv.includes('--self-check')){
 for(const [name,counts,expected,expectedTests]of [['green',[1,0,0,0],true],['failure',[1,1,0,0],false],['skip',[1,0,0,1],false],['empty',[0,0,0,0],false],['incomplete-pack',[1,0,0,0],false,13]]){
  const [tests,failures,errors,skipped]=counts;const xml=`<testsuites tests="${tests}" failures="${failures}" errors="${errors}" skipped="${skipped}">${tests?'<testcase name="synthetic-policy-check"/>':''}</testsuites>`;
  if(inspect(xml,expectedTests).accepted!==expected)throw Error('Gate policy check failed: '+name);
 }
 console.log('Five gate policy checks passed: green accepted; failure, skip, empty and incomplete pack rejected.');
}else{const result=inspect(fs.readFileSync(process.argv[2],'utf8'),process.argv[3]?Number(process.argv[3]):undefined);console.log(JSON.stringify(result,null,2));process.exitCode=result.accepted?0:1;}

