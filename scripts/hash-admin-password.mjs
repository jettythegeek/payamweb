import bcrypt from 'bcryptjs';
import readline from 'node:readline';

function readLines() {
  return new Promise((resolve) => {
    let data = ''; process.stdin.setEncoding('utf8'); process.stdin.on('data', (chunk) => { data += chunk; }); process.stdin.on('end', () => resolve(data.split(/\r?\n/)));
  });
}

function hidden(prompt) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) throw new Error('Interactive password entry needs a terminal. Use --stdin for piped input.');
  return new Promise((resolve) => {
    process.stdout.write(prompt); process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8'); let value = '';
    const onData = (key) => { if (key === '\u0003') process.exit(130); if (key === '\r' || key === '\n') { process.stdin.setRawMode(false); process.stdin.pause(); process.stdin.off('data', onData); process.stdout.write('\n'); resolve(value); } else if (key === '\u007f' || key === '\b') value = value.slice(0, -1); else value += key; };
    process.stdin.on('data', onData);
  });
}

let first; let second;
if (process.argv.includes('--stdin')) { const lines = await readLines(); [first, second] = lines; }
else { first = await hidden('New admin password: '); second = await hidden('Confirm admin password: '); }
if (!first || first.length < 10) throw new Error('Password must be at least 10 characters.');
if (first !== second) throw new Error('Passwords do not match.');
const hash = await bcrypt.hash(first, 12);
process.stdout.write(`WAITLIST_ADMIN_PASSWORD_HASH=${Buffer.from(hash).toString('base64')}\n`);
