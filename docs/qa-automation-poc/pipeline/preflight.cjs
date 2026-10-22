require(require('node:path').join(process.cwd(),'node_modules/dotenv')).config();
const url=new URL(process.env.RSA_BASE_URL||'https://roadside-uat.aspireasia.net');
if(url.hostname!=='roadside-uat.aspireasia.net')throw Error('POC requires RSA UAT');
if(!process.env.RSA_USER||!process.env.RSA_PASSWORD)throw Error('UAT QA credentials must be injected securely');
console.log('UAT target and credential presence verified; credential values hidden.');

