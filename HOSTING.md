# BakeRush Hosting

## Fastest Free Hosting Path

Use Render for the first live version because this project already builds into one Node server that serves both:

- frontend static files from `dist/public`
- backend API from `/api/trpc`

## Deploy On Render

1. Push this project to GitHub.
2. Open Render and create a new Blueprint.
3. Select the repository.
4. Render will read `render.yaml`.
5. Deploy.

Render config:

- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Health check: `/api/health`
- Demo env: `DEMO_MODE=true`
- Render sets `NODE_ENV=production` from `render.yaml`
- Kimi auth env uses placeholder URLs in demo mode and can be replaced later

## Current Hosted Mode

The default hosting config uses demo-memory mode:

- admin opens without real login
- products/orders/modules work with demo data
- data resets when the server restarts

This is intentional for the first hosted preview so work can continue immediately.

## Production Upgrade

Before real customers:

1. Add MySQL `DATABASE_URL`.
2. Run Drizzle migrations.
3. Move product images from local uploads to Cloudinary, S3, or Cloudflare R2.
4. Configure real Google OAuth and mobile OTP gateway.
5. Set `DEMO_MODE=false`.

## Health Check

After deploy, open:

```text
https://your-render-url.onrender.com/api/health
```

Expected response:

```json
{ "ok": true, "mode": "demo" }
```
