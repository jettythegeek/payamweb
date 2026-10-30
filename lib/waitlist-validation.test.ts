import { describe, expect, it } from 'vitest';
import { validateJoin } from './waitlist-validation';

const valid = { phone:'0803 123 4567',city:'Aba',city_is_other:false,roles:['use'],email:'',email_opt_in:false,consent_whatsapp:true,turnstile_token:'token',ref:'',utm_source:'',utm_medium:'',utm_campaign:'',company_website:'',form_rendered_at:1 };
describe('waitlist validation',()=>{
  it.each(['08031234567','8031234567','2348031234567','+2348031234567','+234 803 123 4567'])('normalises %s',phone=>{const result=validateJoin({...valid,phone});expect(result.ok&&result.value.phoneE164).toBe('+2348031234567')});
  it.each([['phone','123'],['city','X'],['roles',[]],['email','not-an-email'],['consent_whatsapp',false],['turnstile_token',''],['ref','ABC1234'],['utm_source','x'.repeat(101)]])('rejects invalid %s',(key,value)=>{const result=validateJoin({...valid,[key]:value});expect(result.ok).toBe(false);if(!result.ok)expect(result.fields).toHaveProperty(key)});
  it('accepts a 2–60 character other city',()=>{const result=validateJoin({...valid,city:'Ekpoma',city_is_other:true});expect(result.ok).toBe(true)});
  it('rejects an unknown listed city',()=>{const result=validateJoin({...valid,city:'Ekpoma'});expect(result.ok).toBe(false)});
  it('removes email opt-in when email is empty',()=>{const result=validateJoin({...valid,email_opt_in:true});expect(result.ok&&result.value.emailOptIn).toBe(false)});
});
