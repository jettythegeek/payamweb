import { storageConfigured } from '../../../lib/csv-storage';
import { rateLimit } from '../../../lib/rate-limit';
import { getClientIp, hashPrivateValue } from '../../../lib/request-security';
import { join } from '../../../lib/waitlist-store';
import { type JoinBody, validateJoin } from '../../../lib/waitlist-validation';

export const runtime = 'nodejs';
const noStore={ 'Cache-Control':'no-store' };
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:noStore});

async function verifyTurnstile(token:string,ip:string):Promise<boolean>{
  const secret=process.env.TURNSTILE_SECRET_KEY;if(!secret){if(process.env.NODE_ENV!=='production')return true;throw new Error('Turnstile is not configured.');}
  const form=new URLSearchParams({secret,response:token});if(ip!=='unknown')form.set('remoteip',ip);
  const response=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form,signal:AbortSignal.timeout(10_000)});
  if(!response.ok)return false; const result=await response.json() as {success?:boolean};return result.success===true;
}

export async function POST(request:Request){
  let body:JoinBody;try{body=await request.json()}catch{return json({error:'invalid'},400)}
  const city=typeof body.city==='string'?body.city.trim():'';
  if(typeof body.company_website==='string'&&body.company_website.trim())return json({status:'joined',referral_code:'',referrals_count:0,city},201);
  if(process.env.NODE_ENV!=='test'&&(!storageConfigured()||!process.env.IP_HASH_SALT))return json({error:'not_configured'},503);
  const validated=validateJoin(body);if(!validated.ok)return json({error:'invalid',fields:validated.fields},422);const value=validated.value;
  if(Date.now()-value.formRenderedAt<2000)return json({error:'too_fast'},422);
  const ip=getClientIp(request.headers);let ipHash:string|null=null;let phoneHash:string;
  try{ipHash=hashPrivateValue(ip);phoneHash=hashPrivateValue(value.phoneE164)}catch{return json({error:'busy'},503)}
  try{const [ipAllowed,phoneAllowed]=await Promise.all([rateLimit(`join:ip:${ipHash}`,60,5),rateLimit(`join:phone:${phoneHash}`,3600,3)]);if(!ipAllowed||!phoneAllowed)return json({error:'rate_limited'},429)}catch(error){console.error('Waitlist rate limiter unavailable.',error instanceof Error?error.message:'unknown')}
  try{if(!await verifyTurnstile(value.token,ip))return json({error:'verification_failed'},422)}catch{return json({error:'busy'},503)}
  try{
    const {data,error}=await join({phoneE164:value.phoneE164,phoneHash,city:value.city,cityIsOther:value.cityIsOther,roles:value.roles,email:value.email,emailOptIn:value.emailOptIn,ref:value.ref,utmSource:value.utmSource,utmMedium:value.utmMedium,utmCampaign:value.utmCampaign,ipHash,userAgent:(request.headers.get('user-agent')||'').slice(0,255)});
    if(error){if(error.code==='23505')return json({status:'already_joined'},409);if(error.code==='23514')return json({error:'invalid'},422);console.error('Waitlist join failed.',error.code||'unknown');return json({error:'server'},502)}
    const result=(Array.isArray(data)?data[0]:data) as {status?:string;referral_code?:string;city?:string}|null;
    if(result?.status==='joined')return json({status:'joined',referral_code:result.referral_code||'',referrals_count:0,city:result.city||value.city},201);
    if(result?.status==='duplicate')return json({status:'already_joined'},409);if(result?.status==='error')return json({error:'busy'},503);return json({error:'server'},502);
  }catch(error){if(error instanceof Error&&(error.name==='AbortError'||error.name==='TimeoutError'))return json({error:'busy'},503);console.error('Waitlist join request failed.');return json({error:'busy'},503)}
}
