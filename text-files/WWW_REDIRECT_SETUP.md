# Setting Up www to non-www Redirect

Firebase Hosting redirects in `firebase.json` only support path-based redirects, not hostname-based redirects. To redirect `www.sandiegohomeless.info` to `sandiegohomeless.info`, you have a few options:

## Option 1: Configure at DNS/CDN Level (Recommended)

If you're using a CDN or DNS provider (like Cloudflare, Google Domains, etc.), configure the redirect there:

### Cloudflare:
1. Go to your domain's DNS settings
2. Add a Page Rule: `www.sandiegohomeless.info/*` → Forwarding URL (301) → `https://sandiegohomeless.info/$1`

### Google Domains:
1. Go to DNS settings
2. Set up a subdomain forward for `www` → `https://sandiegohomeless.info`

## Option 2: Use Firebase Cloud Function (More Control)

Create a Cloud Function to handle the redirect:

1. Create `functions/index.js`:
```javascript
const functions = require('firebase-functions');

exports.redirectWww = functions.https.onRequest((req, res) => {
  if (req.headers.host && req.headers.host.startsWith('www.')) {
    const newHost = req.headers.host.replace('www.', '');
    return res.redirect(301, `https://${newHost}${req.url}`);
  }
  // If not www, serve normally (this shouldn't happen if configured correctly)
  res.status(404).send('Not found');
});
```

2. Update `firebase.json`:
```json
{
  "hosting": {
    "public": "build",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "functions": {
    "source": "functions"
  }
}
```

3. Add redirect rule in Firebase Console:
   - Go to Firebase Console → Hosting → Add custom domain
   - Add both `sandiegohomeless.info` and `www.sandiegohomeless.info`
   - Configure `www.sandiegohomeless.info` to use the Cloud Function

## Option 3: Configure Both Domains in Firebase

1. In Firebase Console → Hosting:
   - Add `sandiegohomeless.info` as primary domain
   - Add `www.sandiegohomeless.info` as additional domain
   - Configure `www.sandiegohomeless.info` to redirect (if this option is available)

## Current Configuration

Your `firebase.json` now only has the SPA rewrite rule, which is correct. The www redirect should be handled at the DNS/CDN level or via Cloud Function.

