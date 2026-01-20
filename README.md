# Vercel Deployment for ChatKit

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
cd vercel
npm install
vercel
```

### Option 2: GitHub Integration

1. Push this `vercel` folder to a GitHub repo
2. Import in Vercel Dashboard: https://vercel.com/new
3. Select the repo and deploy

## Environment Variables

Add these in **Vercel Dashboard > Project Settings > Environment Variables**:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | `sk-your-openai-api-key` |
| `WORKFLOW_ID` | `wf_6967437713108190abe1f0cc9223741b058bf240b0fb241e` |

## Add Domain to OpenAI Allowlist

After deployment, you'll get a URL like `your-project.vercel.app`.

1. Go to https://platform.openai.com/settings/organization/general
2. Find "Allowed domains" / "ChatKit domains"
3. Add your Vercel domain: `your-project.vercel.app`

## Test

1. Visit your Vercel URL
2. The ChatKit widget should load
3. Try asking: "What org structure should I use for a 50-person company?"
