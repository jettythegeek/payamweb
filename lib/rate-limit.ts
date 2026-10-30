import 'server-only';
import { withFiles } from './csv-storage';
export function rateLimit(key:string,windowSeconds:number,max:number) {
 return withFiles(state=>{
  const now=Math.floor(Date.now()/1000);
  for(const [key,value] of Object.entries(state.meta.rates))if(value.expires<=now)delete state.meta.rates[key];
  const rate=state.meta.rates[key]||{hits:0,expires:now+windowSeconds};rate.hits++;state.meta.rates[key]=rate;
  return rate.hits<=max;
 });
}
