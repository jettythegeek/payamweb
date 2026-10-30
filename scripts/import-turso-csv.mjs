import { createClient } from '@libsql/client';
import nextEnv from '@next/env';
import { mkdir, access, writeFile } from 'node:fs/promises';
import path from 'node:path';
import lockfile from 'proper-lockfile';
nextEnv.loadEnvConfig(process.cwd());
const dir=path.resolve(process.env.WAITLIST_DATA_DIR || '.data/waitlist');
if(dir===path.resolve('public')||dir.startsWith(path.resolve('public')+path.sep))throw new Error('Private directory required');
await mkdir(dir,{recursive:true,mode:0o700});
const release=await lockfile.lock(dir,{lockfilePath:path.join(dir,'.write-lock')});
const db=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
try {
 const file=path.join(dir,'waitlist.csv');
 try {await access(file);throw new Error('CSV already exists. Import refused to avoid overwriting local signups.');}catch(error){if(error.code!=='ENOENT')throw error;}
 const sets=await db.batch(['SELECT * FROM waitlist_signups ORDER BY id','SELECT action,detail,ip_hash,created_at FROM admin_audit_log','SELECT phone_hash,reason,deleted_at FROM waitlist_deletions'],'read');
 if(!sets[0].rows.length){console.log('Hosted database has no signups to migrate. No records changed.');}
 else {
  const rows=sets[0].rows.map(row=>({...row,id:Number(row.id),city_is_other:Boolean(row.city_is_other),email_opt_in:Boolean(row.email_opt_in),wa_consent:Boolean(row.wa_consent),referred_by_id:row.referred_by_id===null?null:Number(row.referred_by_id),roles:JSON.parse(row.roles)}));
  const meta={nextId:Math.max(...rows.map(row=>row.id))+1,rates:{},audit:sets[1].rows,deletions:sets[2].rows};
  // Recoverable pending commit: the server completes it under the same lock.
  await writeFile(path.join(dir,'pending.json'),JSON.stringify({rows,meta}),{flag:'wx',mode:0o600});
  console.log(`Preserved ${rows.length} hosted records in the private import journal. The next request completes the CSV import. Hosted records were not deleted.`);
 }
} finally {db.close();await release();}
