import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('server-only',()=>({}));
const mocks=vi.hoisted(()=>({rateLimit:vi.fn(),join:vi.fn(),hash:vi.fn((v:string)=>`hash:${v}`)}));
vi.mock('../../../lib/rate-limit',()=>({rateLimit:mocks.rateLimit}));
vi.mock('../../../lib/waitlist-store',()=>({join:mocks.join}));
vi.mock('../../../lib/request-security',()=>({getClientIp:()=> '203.0.113.1',hashPrivateValue:mocks.hash}));
import { POST } from './route';

const payload={phone:'08031234567',city:'Aba',city_is_other:false,roles:['use'],email:'',email_opt_in:false,consent_whatsapp:true,turnstile_token:'ok',ref:'',form_rendered_at:Date.now()-3000,company_website:''};
const request=(body:unknown)=>new Request('https://example.test/api/waitlist',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{vi.clearAllMocks();process.env.IP_HASH_SALT='s'.repeat(32);process.env.TURNSTILE_SECRET_KEY='secret';mocks.rateLimit.mockResolvedValue(true);mocks.join.mockResolvedValue({data:{status:'joined',referral_code:'ABC234',city:'Aba'},error:null});vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({success:true})}))});
describe('POST /api/waitlist',()=>{
  it('returns a fake success for the honeypot without touching storage',async()=>{const response=await POST(request({...payload,company_website:'spam'}));expect(response.status).toBe(201);expect(mocks.join).not.toHaveBeenCalled()});
  it('rejects submissions rendered less than two seconds ago',async()=>{const response=await POST(request({...payload,form_rendered_at:Date.now()}));expect(response.status).toBe(422);expect(await response.json()).toEqual({error:'too_fast'})});
  it('rate limits before verification and storage',async()=>{mocks.rateLimit.mockResolvedValueOnce(false);const response=await POST(request(payload));expect(response.status).toBe(429);expect(mocks.join).not.toHaveBeenCalled()});
  it('rejects failed Turnstile verification',async()=>{vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({success:false})}));const response=await POST(request(payload));expect(response.status).toBe(422)});
  it('maps joined and sends only hashes to storage',async()=>{const response=await POST(request(payload));expect(response.status).toBe(201);expect(mocks.join).toHaveBeenCalledWith(expect.objectContaining({phoneHash:'hash:+2348031234567',ipHash:'hash:203.0.113.1'}));expect(mocks.join.mock.calls[0][0]).not.toHaveProperty('ip')});
  it('maps duplicate and database constraints',async()=>{mocks.join.mockResolvedValueOnce({data:{status:'duplicate'},error:null});expect((await POST(request(payload))).status).toBe(409);mocks.join.mockResolvedValueOnce({data:null,error:{code:'23514'}});expect((await POST(request(payload))).status).toBe(422)});
  it('maps storage errors and timeouts',async()=>{mocks.join.mockResolvedValueOnce({data:{status:'error'},error:null});expect((await POST(request(payload))).status).toBe(503);mocks.join.mockRejectedValueOnce(Object.assign(new Error(),{name:'TimeoutError'}));expect((await POST(request(payload))).status).toBe(503)});
});
