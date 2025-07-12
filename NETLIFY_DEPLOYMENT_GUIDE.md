# Netlify Deployment Guide for BJJ Workout App

## Overview
This guide provides step-by-step instructions to deploy the Modern BJJ Workout App to Netlify. The app is a Vite-based Progressive Web App (PWA) built with vanilla JavaScript, TailwindCSS, and modern web technologies.

## Prerequisites
- A Netlify account (free tier available)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ for local development

## Project Structure
```
workoutapp/
├── index.html              # Main entry point
├── src/
│   ├── js/
│   │   ├── app.js          # Main application logic
│   │   ├── config/
│   │   │   └── tts-config.js # TTS configuration
│   │   └── utils/
│   │       ├── animations.js
│   │       ├── helpers.js
│   │       └── tts-service.js
│   └── styles/
│       ├── design-tokens.css
│       └── components.css
├── manifest.json           # PWA manifest
├── package.json            # Dependencies and build scripts
├── vite.config.js          # Vite configuration
└── netlify.toml            # Netlify configuration (to be created)
```

## Deployment Methods

### Method 1: Automatic Git Deployment (Recommended)

#### Step 1: Prepare Your Repository
1. Ensure your code is in a Git repository (GitHub, GitLab, or Bitbucket)
2. Push your latest changes to the main branch

#### Step 2: Connect to Netlify
1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose your Git provider and authorize Netlify
4. Select your workoutapp repository

#### Step 3: Configure Build Settings
```
Build command: npm run build
Publish directory: dist
```

#### Step 4: Advanced Build Settings
Set the following environment variables if using Google Cloud TTS (optional):
- `VITE_GOOGLE_CLOUD_API_KEY`: Your Google Cloud API key

#### Step 5: Deploy
1. Click "Deploy site"
2. Wait for the build to complete
3. Your app will be available at a unique Netlify URL

### Method 2: Manual Deployment

#### Step 1: Build Locally
```bash
# Navigate to your project directory
cd workoutapp

# Install dependencies (if build fails, see troubleshooting)
npm install

# Build for production
npm run build
```

#### Step 2: Upload to Netlify
1. In Netlify dashboard, click "Add new site" → "Deploy manually"
2. Drag and drop the `dist` folder to the deployment area
3. Your site will be deployed instantly

## Required Configuration Files

### 1. Create `netlify.toml` (recommended)
Create this file in your project root:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/manifest.json"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "public, max-age=0, must-revalidate"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Update `vite.config.js` for Production
Ensure your vite.config.js has proper base URL configuration:

```javascript
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    base: '/', // Important for Netlify deployment
    root: '.',
    build: {
      outDir: 'dist',
      sourcemap: false, // Disable sourcemaps for production
      rollupOptions: {
        input: {
          main: 'index.html'
        }
      }
    },
    // ... rest of your config
  };
});
```

## Environment Variables Setup

### For Google Cloud TTS (Optional)
If you're using the Google Cloud Text-to-Speech feature:

1. In Netlify dashboard, go to Site settings → Environment variables
2. Add: `VITE_GOOGLE_CLOUD_API_KEY` with your Google Cloud API key
3. Redeploy your site

### Alternative TTS Configuration
Users can also configure TTS directly in the app:
- Use the settings panel in the app
- Enter API key manually
- Uses browser localStorage for persistence

## Troubleshooting

### Build Issues
If you encounter build errors related to Rollup:

```bash
# Remove node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# Try building again
npm run build
```

### Common Issues and Solutions

1. **404 Errors on Refresh**
   - Ensure the redirect rule in `netlify.toml` is present
   - This enables SPA routing

2. **TailwindCSS Not Loading**
   - The app uses TailwindCSS via CDN for simplicity
   - No additional configuration needed

3. **PWA Features Not Working**
   - Ensure HTTPS is enabled (automatic on Netlify)
   - Check that manifest.json is accessible

4. **Environment Variables Not Working**
   - Verify variable names start with `VITE_`
   - Redeploy after adding environment variables

## Performance Optimization

### Build Optimizations
The current configuration includes:
- ✅ Vite build optimization
- ✅ PWA caching strategies
- ✅ CDN for external resources
- ✅ Compression and minification

### Netlify Optimizations
Enable these features in Netlify:
- Asset optimization (auto-minification)
- Form detection (if using forms)
- Large Media (if using large assets)

## Custom Domain Setup

### Add Custom Domain
1. In Netlify dashboard, go to Domain settings
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. SSL certificate will be auto-provisioned

### DNS Configuration
Point your domain to Netlify:
- A record: `75.2.60.5`
- Or CNAME: `your-site-name.netlify.app`

## Monitoring and Analytics

### Built-in Analytics
- Netlify provides basic analytics in the dashboard
- View page views, unique visitors, and bandwidth usage

### Performance Monitoring
- Use Lighthouse to test PWA performance
- Netlify automatically provides performance insights

## Maintenance

### Automatic Deployments
- Connected Git repositories auto-deploy on push
- Configure branch-specific deployments if needed

### Manual Updates
- For manual deployments, repeat the upload process
- Always test locally before deploying

## Security Considerations

### HTTPS
- Automatically enabled on Netlify
- Required for PWA features

### API Keys
- Store sensitive keys in environment variables
- Never commit API keys to version control
- Users can configure keys through the app interface

### Content Security Policy
Consider adding CSP headers in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.tailwindcss.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://texttospeech.googleapis.com;"
```

## Support Resources

### Documentation
- [Netlify Docs](https://docs.netlify.com)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#netlify)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)

### App-Specific Features
- The app works completely offline after first load
- TTS features require internet connection
- All workout data is stored locally

## Estimated Deployment Time
- Initial setup: 10-15 minutes
- Build time: 1-2 minutes
- Subsequent deployments: 1-3 minutes

Your BJJ Workout App will be live and accessible worldwide with PWA capabilities, offline functionality, and modern performance optimizations!