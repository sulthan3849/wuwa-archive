# Wuwa Archive — Deployment Guide

## Prerequisites

1. Node.js 18+ installed
2. PNPM package manager installed (`npm install -g pnpm`)
3. Vercel CLI installed (`npm install -g vercel`)

## Deployment Steps

### Option 1: Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Navigate to project directory
cd "C:\Mek Project\Wuwa Archive"

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
3. Click "Import Project"
4. Select your repository: `sulthan3849/wuwa-archive`
5. Click "Deploy"

### Option 3: One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/sulthan3849/wuwa-archive)

## Environment Variables

No environment variables are required for MVP deployment.

All secrets are handled client-side:
- Kuro API URLs are hardcoded (public endpoints)
- No database credentials needed
- No auth tokens needed

## Post-Deployment Checklist

- [ ] Verify site loads at `.vercel.app`
- [ ] Test URL import flow
- [ ] Test JSON export/import
- [ ] Verify i18n (EN/ID) switching works
- [ ] Test dark/light mode toggle
- [ ] Check browser console for errors

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `wuwa-archive.vercel.app`)
3. Configure DNS records as instructed by Vercel

## Troubleshooting

### Build Failed
```bash
# Clear cache and rebuild
rm -rf .next node_modules/.cache
pnpm build
```

### API Routes Not Working
- Check Vercel serverless function logs
- Verify rate limiting not triggered (5 req/30min)

### Missing Assets
- Ensure `public/` folder is included in deployment
- Check `vercel.json` outputDirectory setting
