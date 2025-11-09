# Vercel Deployment Guide for LaunchOS

This guide will help you deploy your LaunchOS application to Vercel for production.

## Prerequisites

- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free tier works fine)
- Your code committed and pushed to the repository

## Method 1: Vercel Dashboard (Recommended - Easiest)

### Step 1: Push Your Code to Git

```bash
cd C:\Users\mathe\Shop.dev\launchos-scaffold

# Initialize git if not already done
git add .
git commit -m "Ready for Vercel deployment"
git push origin master
```

### Step 2: Deploy on Vercel

1. **Visit [vercel.com](https://vercel.com)** and sign in
2. **Click "Add New..." → "Project"**
3. **Import your repository:**
   - Click "Import Git Repository"
   - Select your GitHub/GitLab/Bitbucket account
   - Choose your repository
4. **Configure project settings:**
   - Framework Preset: **Vite** (auto-detected)
   - Root Directory: Leave as `.` or select `launchos-scaffold` if needed
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `dist` (auto-filled)
   - Install Command: `npm install` (auto-filled)
5. **Environment Variables:** None needed (Supabase credentials are in the code)
6. **Click "Deploy"**
7. **Wait 2-3 minutes** for the build to complete
8. **Your app is live!** Vercel will provide a URL like `https://your-project.vercel.app`

## Method 2: Vercel CLI (For Developers)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the prompts to authenticate.

### Step 3: Deploy

```bash
# Navigate to your project
cd C:\Users\mathe\Shop.dev\launchos-scaffold

# Deploy to preview (test deployment)
vercel

# Deploy to production
vercel --prod
```

The CLI will ask you a few questions:
- **Set up and deploy?** Yes
- **Which scope?** Your username/team
- **Link to existing project?** No (first time) or Yes (subsequent deployments)
- **What's your project's name?** launchos (or your preferred name)
- **In which directory is your code located?** ./ (just press Enter)

## Troubleshooting

### Issue: Routes not working (404 errors)

**Solution:** The `vercel.json` file is already configured with rewrites. Make sure it's committed to your repository.

### Issue: Blank page or errors in production

**Possible causes:**
1. **Check browser console (F12)** for JavaScript errors
2. **Verify Supabase is accessible** from your production domain
3. **Check Vercel deployment logs** in the Vercel dashboard

### Issue: Authentication not working

**Solution:** Ensure your Supabase project allows your Vercel domain:
1. Go to your Supabase dashboard
2. Navigate to **Authentication → URL Configuration**
3. Add your Vercel URL to **Site URL** and **Redirect URLs**:
   - `https://your-project.vercel.app`
   - `https://your-project.vercel.app/**`

### Issue: Environment variables needed

**Note:** Your current setup has Supabase credentials hardcoded in `client.ts`, so no environment variables are needed. However, if you want to use environment variables in the future:

1. Go to your Vercel project dashboard
2. Click **Settings → Environment Variables**
3. Add variables with prefix `VITE_` (e.g., `VITE_SUPABASE_URL`)
4. Redeploy your project

## Post-Deployment Checklist

- [ ] Visit your Vercel URL and verify the app loads
- [ ] Test login/signup functionality
- [ ] Verify all routes work (Products, Hosting, Builder, Settings)
- [ ] Check browser console for errors
- [ ] Configure custom domain (optional - in Vercel dashboard under Domains)

## Custom Domain (Optional)

1. Go to your Vercel project dashboard
2. Click **Settings → Domains**
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (can take up to 48 hours)

## Continuous Deployment

Once connected, Vercel will automatically:
- Deploy every push to your `master/main` branch to production
- Create preview deployments for pull requests
- Provide instant rollback capabilities

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- Check deployment logs in Vercel dashboard for errors
