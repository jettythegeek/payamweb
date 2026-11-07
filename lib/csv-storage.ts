import 'server-only';
import { mkdir, readFile, rename, open, unlink, realpath } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import lockfile from 'proper-lockfile';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

export type Signup = {
 id:number; phone_e164:string; phone_hash:string; city:string; city_is_other:boolean; roles:string[];
 email:string|null; email_opt_in:boolean; wa_consent:boolean; consent_text_version:string; consented_at:string;
 referral_code:string; referred_by_id:number|null; utm_source:string|null; utm_medium:string|null; utm_campaign:string|null;
 ip_hash:string|null; user_agent:string; status:string; whatsapp_confirmed_at:string|null; unsubscribed_at:string|null;
 created_at:string; updated_at:string;
};
type Log = { action:string; detail:string|null; ip_hash:string|null; created_at:string };
export type FileState = {
 rows:Signup[];
 meta:{ nextId:number; rates:Record<string,{hits:number;expires:number}>; audit:Log[]; deletions:Array<{phone_hash:string;reason:string;deleted_at:string}> };
};
const columns = ['id','phone_e164','phone_hash','city','city_is_other','roles','email','email_opt_in','wa_consent','consent_text_version','consented_at','referral_code','referred_by_id','utm_source','utm_medium','utm_campaign','ip_hash','user_agent','status','whatsapp_confirmed_at','unsubscribed_at','created_at','updated_at'] as const;
export const storageConfigured = () => !process.env.VERCEL;
export function dataDirectory() {
 if (!storageConfigured()) throw new Error('CSV storage needs a persistent VPS disk; Vercel is not supported.');
 return path.resolve(/* turbopackIgnore: true */ process.env.WAITLIST_DATA_DIR || path.join(process.cwd(), '.data', 'waitlist'));
}
const protect=(value:string)=>/^[=+\-@\t\r']/.test(value)?"'"+value:value;
const unprotect=(value:string)=>/^'[=+\-@\t\r']/.test(value)?value.slice(1):value;
export function serialize(rows:Signup[]) {
 return stringify(rows.map(row=>Object.fromEntries(columns.map(key=>{
  const value=row[key];return [key,protect(value===null?'':Array.isArray(value)?JSON.stringify(value):String(value))];
 }))),{header:true,columns:[...columns],record_delimiter:'\r\n'});
}
export function deserialize(source:string):Signup[] {
 if(!source.trim())throw new Error('Waitlist CSV is empty or damaged');
 const rows=parse(source,{columns:(header:string[])=>{
  if(header.length!==columns.length||header.some((value,index)=>value!==columns[index]))throw new Error('Invalid waitlist CSV header');
  return header;
 },skip_empty_lines:true,bom:true}) as Record<string,string>[];
 return rows.map(raw=>{
  for(const column of columns) if(!(column in raw)) throw new Error('Invalid waitlist CSV header');
  const row=Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,unprotect(value)]));
  const roles=JSON.parse(row.roles);
  if(!Number.isSafeInteger(Number(row.id))||Number(row.id)<1||!Array.isArray(roles)) throw new Error('Invalid waitlist CSV row');
  return {...row,id:Number(row.id),roles,city_is_other:row.city_is_other==='true',email_opt_in:row.email_opt_in==='true',wa_consent:row.wa_consent==='true',referred_by_id:row.referred_by_id?Number(row.referred_by_id):null,...Object.fromEntries(['email','utm_source','utm_medium','utm_campaign','ip_hash','whatsapp_confirmed_at','unsubscribed_at'].map(key=>[key,row[key]||null]))} as Signup;
 });
}
async function optional(file:string) {
 try{return await readFile(file,'utf8');}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return null;throw error;}
}
async function replace(file:string,contents:string) {
 const temporary=file+'.'+randomUUID()+'.tmp';
 const handle=await open(temporary,'wx',0o600);
 try{await handle.writeFile(contents);await handle.sync();}finally{await handle.close();}
 try{await rename(temporary,file);}finally{await unlink(temporary).catch(()=>{});}
}
async function save(dir:string,state:FileState) {
 await replace(path.join(dir,'waitlist.csv'),serialize(state.rows));
 await replace(path.join(dir,'operations.json'),JSON.stringify(state.meta));
}
export async function withFiles<T>(work:(state:FileState)=>T|Promise<T>,write=true):Promise<T> {
 const dir=dataDirectory(); await mkdir(dir,{recursive:true,mode:0o700});
 const actual=await realpath(/* turbopackIgnore: true */ dir);const publicDir=await realpath(path.resolve(process.cwd(),'public'));
 if(actual===publicDir||actual.startsWith(publicDir+path.sep))throw new Error('Waitlist storage cannot be public.');
 const release=await lockfile.lock(dir,{lockfilePath:path.join(dir,'.write-lock'),stale:30000,update:5000,retries:{retries:40,minTimeout:25,maxTimeout:200,factor:1.2}});
 try {
  const journal=path.join(dir,'pending.json');
  const pending=await optional(journal);
  if(pending){await save(dir,JSON.parse(pending) as FileState);await unlink(journal);}
  const source=await optional(path.join(dir,'waitlist.csv'));
  const metadata=await optional(path.join(dir,'operations.json'));
  const rows=source===null?[]:deserialize(source);
  if(source===null&&metadata!==null)throw new Error('Waitlist CSV missing; restore the private backup before writing.');
  const meta:FileState['meta']=metadata?JSON.parse(metadata):{nextId:Math.max(0,...rows.map(row=>row.id))+1,rates:{},audit:[],deletions:[]};
  const state={rows,meta}; const value=await work(state);
  if(write){
   // The private journal lets the next request finish an interrupted multi-file commit.
   await replace(journal,JSON.stringify(state));await save(dir,state);await unlink(journal);
  }
  return value;
 }finally{await release();}
}
export function recordAudit(state:FileState,action:string,detail:string|null,ip_hash:string|null) {
 state.meta.audit.push({action,detail,ip_hash,created_at:new Date().toISOString()});
}
