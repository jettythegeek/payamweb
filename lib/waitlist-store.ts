import 'server-only';
import { randomInt } from 'node:crypto';
import { withFiles, recordAudit, type Signup, type FileState } from './csv-storage';
export type JoinInput = {
 phoneE164:string;phoneHash:string;city:string;cityIsOther:boolean;roles:string[];email:string|null;emailOptIn:boolean;
 ref:string|null;utmSource:string|null;utmMedium:string|null;utmCampaign:string|null;ipHash:string|null;userAgent:string;
};
type Filters={q?:string;city?:string;role?:string;status?:string;includeUnsubscribed?:boolean;limit?:number;offset?:number};
async function result<T>(work:()=>Promise<T>):Promise<{data:T|null;error:{code:string}|null}> {
 try{return {data:await work(),error:null};}catch{return {data:null,error:{code:'storage_unavailable'}};}
}
export function join(input:JoinInput) {
 return result(()=>withFiles(state=>{
  if(state.rows.some(row=>row.phone_e164===input.phoneE164))return {status:'duplicate'};
  const alphabet='23456789ABCDEFGHJKMNPQRSTVWXYZ';let code='';
  do{code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');}while(state.rows.some(row=>row.referral_code===code));
  const now=new Date().toISOString();
  state.rows.push({id:state.meta.nextId++,phone_e164:input.phoneE164,phone_hash:input.phoneHash,city:input.city,city_is_other:input.cityIsOther,roles:input.roles,email:input.email,email_opt_in:input.emailOptIn&&Boolean(input.email),wa_consent:true,consent_text_version:'wa-2026-11-v1',consented_at:now,referral_code:code,referred_by_id:state.rows.find(row=>row.referral_code===input.ref?.toUpperCase())?.id??null,utm_source:input.utmSource,utm_medium:input.utmMedium,utm_campaign:input.utmCampaign,ip_hash:input.ipHash,user_agent:input.userAgent.slice(0,255),status:'joined',whatsapp_confirmed_at:null,unsubscribed_at:null,created_at:now,updated_at:now});
  return {status:'joined',referral_code:code,city:input.city};
 }));
}
export function referralCount(code:string) {
 return result(()=>withFiles(state=>{
  const id=state.rows.find(row=>row.referral_code===code.toUpperCase())?.id;
  return id?state.rows.filter(row=>row.referred_by_id===id).length:0;
 },false));
}
export function summary() {
 return result(()=>withFiles(({rows})=>{
  const cities=new Map<string,number>(),by_role:Record<string,number>={use:0,sell:0,serve:0,drive:0};
  for(const row of rows){cities.set(row.city,(cities.get(row.city)||0)+1);for(const role of row.roles)by_role[role]=(by_role[role]||0)+1;}
  return {totals:{total:rows.length,confirmed:rows.filter(r=>r.status==='confirmed').length,not_confirmed:rows.filter(r=>r.status==='joined').length,unsubscribed:rows.filter(r=>r.status==='unsubscribed').length,businesses:rows.filter(r=>r.roles.some(role=>['sell','serve','drive'].includes(role))).length},by_city:Array.from(cities,([city,count])=>({city,count})).sort((a,b)=>b.count-a.count||a.city.localeCompare(b.city)),by_role,top_referrers:rows.map(row=>({code:row.referral_code,count:rows.filter(child=>child.referred_by_id===row.id).length})).filter(row=>row.count).sort((a,b)=>b.count-a.count||a.code.localeCompare(b.code)).slice(0,10)};
 },false));
}
function filtered(state:FileState,filters:Filters) {
 const q=filters.q?.trim().toLowerCase()||'',digits=q.replace(/\D/g,'');
 return state.rows.filter(row=>(!filters.city||row.city===filters.city)&&(!filters.role||row.roles.includes(filters.role))&&(filters.status?row.status===filters.status:filters.includeUnsubscribed||row.status!=='unsubscribed')&&(!q||(row.email||'').toLowerCase().includes(q)||row.referral_code.toLowerCase()===q||(digits.length>=3&&row.phone_e164.includes(digits)))).sort((a,b)=>b.created_at.localeCompare(a.created_at)||b.id-a.id);
}
export function list(filters:Filters) {
 return result(()=>withFiles(state=>{
  const rows=filtered(state,filters),offset=Math.max(0,filters.offset||0);
  return {total:rows.length,rows:rows.slice(offset,offset+Math.min(100,Math.max(1,filters.limit||50))).map(row=>{
   const {phone_e164,phone_hash,ip_hash,user_agent,...safe}=row;
   return {...safe,phone_masked:`${phone_e164.slice(0,4)} ${phone_e164.slice(4,7)} ••• ${phone_e164.slice(-4)}`,referred_by_code:state.rows.find(ref=>ref.id===row.referred_by_id)?.referral_code||null};
  })};
 },false));
}
export function exportRows(filters:Filters) {
 return result(()=>withFiles(state=>{
  const offset=Math.max(0,filters.offset||0);
  return filtered(state,filters).slice(offset,offset+1000).map(row=>({...row,referred_by_code:state.rows.find(ref=>ref.id===row.referred_by_id)?.referral_code||null}));
 },false));
}
export function reveal(id:number,ipHash:string) {
 return result(()=>withFiles(state=>{
  const row=state.rows.find(row=>row.id===id);if(!row)return null;
  recordAudit(state,'reveal_phone',`id=${id}`,ipHash);return row.phone_e164;
 }));
}
export function setStatus(id:number,status:string,ipHash:string) {
 return result(()=>withFiles(state=>{
  if(!['joined','confirmed','unsubscribed'].includes(status))throw new Error('Invalid status');
  const row=state.rows.find(row=>row.id===id);if(!row)return false;
  row.status=status;row.updated_at=new Date().toISOString();
  if(status==='confirmed')row.whatsapp_confirmed_at ||= row.updated_at;
  row.unsubscribed_at=status==='unsubscribed'?row.updated_at:null;
  recordAudit(state,'set_status',`id=${id} status=${status}`,ipHash);return true;
 }));
}
export function remove(id:number,reason:string,ipHash:string) {
 return result(()=>withFiles(state=>{
  const row=state.rows.find(row=>row.id===id);if(!row)return false;
  state.meta.deletions.push({phone_hash:row.phone_hash,reason,deleted_at:new Date().toISOString()});
  state.rows=state.rows.filter(row=>row.id!==id);
  state.rows.forEach(row=>{if(row.referred_by_id===id)row.referred_by_id=null;});
  recordAudit(state,'delete_signup',`id=${id}`,ipHash);return true;
 }));
}
export function audit(action:string,detail:string|null,ipHash:string|null) {
 return withFiles(state=>recordAudit(state,action,detail,ipHash));
}
