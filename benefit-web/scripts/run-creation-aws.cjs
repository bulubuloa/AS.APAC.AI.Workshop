const {spawnSync}=require('node:child_process');
const path=require('node:path');
function aws(args){
 const result=spawnSync('aws',[...args,'--region','ap-southeast-1','--output','json'],{encoding:'utf8',windowsHide:true});
 if(result.status!==0)throw Error('AWS access failed. Verify the CLI session and Secrets Manager read permission.');
 return JSON.parse(result.stdout);
}
function parseConnection(text){
 const fields={};let part='',quote='';const parts=[];
 for(let i=0;i<text.length;i++){
  const c=text[i];
  if(quote){part+=c;if(c===quote){if(text[i+1]===quote){part+=text[++i];}else quote='';}}
  else if(c==='"'||c==="'"){quote=c;part+=c;}
  else if(c===';'){parts.push(part);part='';}else part+=c;
 }
 parts.push(part);
 for(const entry of parts){const at=entry.indexOf('=');if(at<0)continue;let value=entry.slice(at+1).trim();if((value.startsWith('"')&&value.endsWith('"'))||(value.startsWith("'")&&value.endsWith("'"))){const q=value[0];value=value.slice(1,-1).split(q+q).join(q);}fields[entry.slice(0,at).trim().toLowerCase().replace(/\s/g,'')]=value;}
 return fields;
}
try{
 const identity=aws(['sts','get-caller-identity']);
 if(identity.Account!=='739075353953')throw Error('Unexpected AWS account.');
 const secret=aws(['secretsmanager','get-secret-value','--secret-id','benefit-connection-string-preprod']);
 const body=JSON.parse(secret.SecretString);
 const raw=body.connectionStringBenefitUat;
 if(typeof raw!=='string')throw Error('UAT connection entry unavailable.');
 const fields=parseConnection(raw);
 const database=fields.database??fields.initialcatalog;
 const user=fields.uid??fields.userid??fields.user??fields.username;
 const password=fields.pwd??fields.password;
 if(database!=='AspireProdBackup'||!user||!password)throw Error('Unexpected UAT database configuration.');
 const setting=aws(['ssm','get-parameter','--name','/abe/codepipeline/apac-benefit-vendor-backend-sit/APPSETTINGS_JSON','--with-decryption']);
 const settings=require('typescript').parseConfigFileTextToJson('settings.json',setting.Parameter.Value).config;
 let options=settings.ManagementOptions;
 if((options?.EnvironmentId??options?.ProjectId)!=='225b0999-fce9-02b4-c44b-ed6990faeeaa'||!options.ApiKey)throw Error('Unexpected SIT/UAT CMS management configuration.');
 const env={...process.env,BENEFIT_CMS_MANAGEMENT_KEY:options.ApiKey,BENEFIT_DB_HOST:'127.0.0.1',BENEFIT_DB_PORT:'3375',BENEFIT_DB_DATABASE:database,BENEFIT_DB_USER:user,BENEFIT_DB_PASSWORD:password};
 console.log('Verified AWS account and UAT database configuration. Credentials passed in memory only.');
 const result=spawnSync(process.execPath,[path.resolve('node_modules/@playwright/test/cli.js'),'test','--project=creation',...process.argv.slice(2)],{env,stdio:'inherit',windowsHide:true});
 process.exitCode=result.status??1;
}catch(error){console.error(error.message);process.exitCode=1;}





