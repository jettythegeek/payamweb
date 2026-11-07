import { isWaitlistCityName } from '../app/waitlist/cities';
import { normalizeNigerianPhone } from '../app/waitlist/phone';
import { WAITLIST_ROLES, type WaitlistRole } from '../app/waitlist/types';

export type JoinBody = {
  phone?: unknown; city?: unknown; city_is_other?: unknown; roles?: unknown; email?: unknown;
  email_opt_in?: unknown; consent_whatsapp?: unknown; turnstile_token?: unknown; ref?: unknown;
  utm_source?: unknown; utm_medium?: unknown; utm_campaign?: unknown; company_website?: unknown;
  form_rendered_at?: unknown;
};
export type ValidatedJoin = { phoneE164:string;city:string;cityIsOther:boolean;roles:WaitlistRole[];email:string|null;emailOptIn:boolean;token:string;ref:string|null;utmSource:string|null;utmMedium:string|null;utmCampaign:string|null;companyWebsite:string;formRenderedAt:number };
const REF=/^[23456789ABCDEFGHJKMNPQRSTVWXYZ]{6}$/;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text=(value:unknown)=>typeof value==='string'?value.trim():'';
const optional=(value:unknown,max:number)=>{const v=text(value);return v&&v.length<=max?v:null};

export function validateJoin(body: JoinBody, requireToken = true): { ok:true; value:ValidatedJoin } | { ok:false; fields:Record<string,string> } {
  const fields:Record<string,string>={}; const phoneE164=normalizeNigerianPhone(text(body.phone)); if(!phoneE164)fields.phone='invalid';
  const city=text(body.city); const cityIsOther=body.city_is_other===true;
  if(city.length<2||city.length>60||(!cityIsOther&&!isWaitlistCityName(city)))fields.city='invalid';
  const roles=Array.isArray(body.roles)?[...new Set(body.roles.filter((v):v is WaitlistRole=>typeof v==='string'&&(WAITLIST_ROLES as readonly string[]).includes(v)))]:[];
  if(!Array.isArray(body.roles)||roles.length===0||roles.length!==body.roles.length)fields.roles='invalid';
  const email=text(body.email);if(email&&(email.length>120||!EMAIL.test(email)))fields.email='invalid';
  if(body.consent_whatsapp!==true)fields.consent_whatsapp='required'; const token=text(body.turnstile_token);if(requireToken&&!token)fields.turnstile_token='required';
  const rawRef=text(body.ref).toUpperCase();if(rawRef&&!REF.test(rawRef))fields.ref='invalid';
  for(const key of ['utm_source','utm_medium','utm_campaign'] as const){if(text(body[key]).length>100)fields[key]='invalid'}
  const formRenderedAt=Number(body.form_rendered_at);if(!Number.isFinite(formRenderedAt)||formRenderedAt<=0)fields.form_rendered_at='invalid';
  if(Object.keys(fields).length)return {ok:false,fields};
  return {ok:true,value:{phoneE164:phoneE164!,city,cityIsOther,roles,email:email||null,emailOptIn:body.email_opt_in===true&&Boolean(email),token,ref:rawRef||null,utmSource:optional(body.utm_source,100),utmMedium:optional(body.utm_medium,100),utmCampaign:optional(body.utm_campaign,100),companyWebsite:text(body.company_website),formRenderedAt}};
}
