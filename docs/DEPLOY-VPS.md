# Deploying Payam on a Webuzo VPS

1. Install Node.js 22 in Webuzo's Node.js or Application Manager and enable SSH access.
2. Clone this repository into the application directory on `main`, or pull the current checkout.
3. Put all variables listed in `.env.example` in `.env.production.local` and run `chmod 600 .env.production.local`, or configure them in Webuzo. Set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` before building because public variables are compiled into the build.
4. Build the standalone application:

   ```sh
   npm ci && npm run build && npm run check:bundle
   cp -r public .next/standalone/
   cp -r .next/static .next/standalone/.next/
   ```

5. Start it with `pm2 start ecosystem.config.cjs`, then run `pm2 save` and `pm2 startup`.
6. Point the Webuzo domain to `http://127.0.0.1:3005`. Forward `Host`, `X-Forwarded-For`, and `X-Forwarded-Proto`; rate limiting, Turnstile, and secure cookies depend on them.
7. Issue a Let's Encrypt certificate and force HTTPS.
8. Confirm the home page and `/robots.txt` respond. Submit a test signup, check it in `/waitlist-admin`, delete it there, and confirm a hash was added to `waitlist_deletions`.
9. For updates, pull, run `npm ci && npm run build && npm run check:bundle`, repeat both copy commands, then `pm2 restart payam-website --update-env`. Any environment change needs a restart; a `NEXT_PUBLIC_*` change also needs a rebuild.
10. Before DNS cutover, add the final domain to Cloudflare Turnstile, update `NEXT_PUBLIC_SITE_URL`, and rebuild. Keep Vercel online until DNS has switched. Both hosts can safely share the same Supabase project.
