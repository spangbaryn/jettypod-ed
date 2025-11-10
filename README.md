# DevPod Landing Page

Static landing page for DevPod - puts Claude Code on rails for anyone with an idea.

## Tech Stack

Pure HTML/CSS/JS - no build step required.

## Project Structure

```
/
├── index.html              # Production landing page
├── vercel.json            # Deployment config
├── prototypes/            # Design exploration (archived)
├── mode-use-cases-feature-development.md  # DevPod methodology
└── CLAUDE.md              # Project instructions
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### GitHub Pages
1. Push to GitHub
2. Go to repo Settings → Pages
3. Set source to `main` branch, `/ (root)` folder

### Other Static Hosts
Upload `index.html` to any static host (Netlify, Cloudflare Pages, etc.)

## Local Development

Simply open `index.html` in a browser. No server required.

Or use a simple HTTP server:
```bash
python -m http.server 8000
# or
npx serve
```

Then visit `http://localhost:8000`

## Prototypes

The `/prototypes` directory contains the design exploration process:
- `2025-10-29-demo-first/` - Demo-first immersion approach
- `2025-10-29-narrative-buildup/` - Narrative build-up approach
- `2025-10-29-action-first/` - **Winner**: Action-first minimalism (now production)
