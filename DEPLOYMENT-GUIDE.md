# Deployment Guide for BJJ Workout App

## 🚀 Public Deployment Options

### Option 1: Vercel (Recommended for React/Vite apps)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project dashboard
   - Navigate to Settings → Environment Variables
   - Add: `VITE_GOOGLE_CLOUD_API_KEY` = your actual API key
   - Redeploy: `vercel --prod`

### Option 2: Netlify

1. **Build the app:**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify:**
   - Drag `dist/` folder to Netlify
   - Or use Netlify CLI: `netlify deploy`

3. **Set Environment Variables:**
   - Go to Site Settings → Environment Variables
   - Add: `VITE_GOOGLE_CLOUD_API_KEY` = your actual API key
   - Redeploy

### Option 3: GitHub Pages

1. **Update vite.config.js for GitHub Pages:**
   ```javascript
   export default {
     base: '/your-repo-name/',
     // ... rest of config
   }
   ```

2. **Set GitHub Secrets:**
   - Go to Settings → Secrets and variables → Actions
   - Add: `VITE_GOOGLE_CLOUD_API_KEY` = your actual API key

3. **Create GitHub Action:**
   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [ main ]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
           with:
             node-version: '18'
         - run: npm ci
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

### Option 4: Firebase Hosting

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase:**
   ```bash
   firebase init hosting
   ```

3. **Build and Deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

4. **Set Environment Variables:**
   - Use Firebase Functions for server-side environment variables
   - Or use Firebase Remote Config for client-side

## 🔒 Security Best Practices

### 1. Environment Variables
- ✅ **DO:** Use `VITE_GOOGLE_CLOUD_API_KEY` in deployment platforms
- ❌ **DON'T:** Commit API keys to Git
- ❌ **DON'T:** Hardcode keys in source code

### 2. API Key Restrictions
Set up Google Cloud Console restrictions:
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click on your API key
3. Set restrictions:
   - **Application restrictions:** HTTP referrers (your domain)
   - **API restrictions:** Cloud Text-to-Speech API only

### 3. CORS Configuration
If using a backend proxy:
```javascript
// Example CORS headers
{
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
}
```

## 📁 File Structure for Deployment

```
workoutapp/
├── .env                    # Local development (gitignored)
├── .env.example           # Template for other developers
├── .gitignore             # Excludes .env and dist/
├── vite.config.js         # Build configuration
├── package.json           # Dependencies and scripts
├── src/                   # Source code
└── dist/                  # Built files (generated)
```

## 🔧 Environment Variable Setup

### Local Development (.env)
```bash
VITE_GOOGLE_CLOUD_API_KEY=your_actual_api_key_here
```

### Production (Platform-specific)
- **Vercel:** Dashboard → Environment Variables
- **Netlify:** Site Settings → Environment Variables  
- **GitHub Pages:** Repository Secrets
- **Firebase:** Functions environment or Remote Config

## 🚨 Important Notes

1. **Client-Side Exposure:** Since this is a frontend app, the API key will be visible in the browser. This is normal for client-side apps, but:
   - Always set up API key restrictions in Google Cloud Console
   - Use domain restrictions to prevent abuse
   - Monitor usage in Google Cloud Console

2. **Alternative Approach:** For better security, consider:
   - Using a backend proxy server
   - Implementing server-side TTS generation
   - Using Firebase Functions as a proxy

3. **Free Tier Limits:** 
   - 4 million characters per month
   - Monitor usage in Google Cloud Console
   - Implement usage tracking in your app

## 🧪 Testing Deployment

1. **Local Build Test:**
   ```bash
   npm run build
   npm run preview
   ```

2. **Environment Variable Test:**
   ```javascript
   console.log('API Key available:', !!import.meta.env.VITE_GOOGLE_CLOUD_API_KEY);
   ```

3. **TTS Functionality Test:**
   - Test voice synthesis in deployed app
   - Check browser console for errors
   - Verify API key restrictions work

## 📊 Monitoring

1. **Google Cloud Console:**
   - Monitor API usage
   - Check for unauthorized access
   - Review billing

2. **App Analytics:**
   - Track TTS usage
   - Monitor error rates
   - User engagement metrics

## 🔄 Continuous Deployment

### GitHub Actions Example
```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🆘 Troubleshooting

### Common Issues:
1. **Environment variables not loading:**
   - Ensure `VITE_` prefix for Vite apps
   - Check deployment platform settings
   - Verify variable names match exactly

2. **CORS errors:**
   - Check API key restrictions
   - Verify domain is whitelisted
   - Use backend proxy if needed

3. **Build failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Review build logs for specific errors

### Support:
- Check browser console for errors
- Review deployment platform logs
- Test locally with `npm run build && npm run preview` 