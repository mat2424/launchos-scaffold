# Testing Authentication and Logging Locally

This guide will help you test the authentication and logging system locally before pushing to production.

## Prerequisites

- Node.js and npm installed
- Supabase project connected (already configured in your project)
- Terminal/Command prompt

## Step 1: Start the Development Server

```bash
npm run dev
```

The application will start on `http://localhost:8080`

## Step 2: Test User Registration

1. Open your browser to `http://localhost:8080`
2. You will be automatically redirected to `/login` (since you're not authenticated)
3. Click the **Sign Up** tab
4. Enter a test email address (e.g., `test@example.com`)
5. Enter a password (minimum 6 characters)
6. Confirm the password
7. Click **Create Account**

### Expected Behavior:
- You should see a success message: "Account created successfully! Please check your email to confirm your account, then log in."
- Check your browser console (F12 → Console) for log entries:
  - `[INFO] [AuthProvider] Sign up attempt for: test@example.com`
  - `[INFO] [AuthProvider] Sign up successful for test@example.com`

### Email Confirmation:
- By default, Supabase requires email confirmation
- Check your email inbox for a confirmation link from Supabase
- Click the confirmation link to verify your account
- **Note:** In local development, you can disable email confirmation in Supabase dashboard:
  - Go to Authentication → Settings → Email Auth
  - Toggle off "Enable email confirmations"

## Step 3: Test User Login

1. Go back to the login page
2. Click the **Login** tab
3. Enter your email and password
4. Click **Sign In**

### Expected Behavior:
- You should be redirected to the Dashboard (`/`)
- Your email address should appear in the top right corner
- Check browser console for log entries:
  - `[INFO] [AuthProvider] Sign in attempt for: test@example.com`
  - `[INFO] [AuthProvider] Sign in successful for test@example.com`
  - `[INFO] [AuthProvider] Auth state changed: SIGNED_IN`

## Step 4: Test Protected Routes

1. Try navigating to different pages:
   - Dashboard (`/`)
   - Products (`/products`)
   - Hosting (`/hosting`)
   - Builder (`/builder`)
   - Settings (`/settings`)

### Expected Behavior:
- All pages should load successfully
- You should remain logged in
- Check console for: `[DEBUG] [ProtectedRoute] User authenticated: test@example.com`

## Step 5: Test Session Persistence

1. Refresh the page (F5)
2. Close the tab and reopen `http://localhost:8080`

### Expected Behavior:
- You should remain logged in (not redirected to login)
- Check console for: `[INFO] [AuthProvider] User session restored: test@example.com`

## Step 6: View Application Logs

1. Navigate to Settings page (`/settings`)
2. Scroll down to the **Application Logs** section
3. You should see all authentication-related logs

### Log Viewer Features:
- **Filter by level:** Click tabs (All, Debug, Info, Warn, Error)
- **Refresh:** Click the Refresh button to update logs
- **Export:** Click Export to download logs as JSON
- **Clear:** Click Clear to remove all logs

### Expected Logs:
You should see entries like:
- `[INFO] [AuthProvider] Initializing auth state`
- `[INFO] [AuthProvider] User session restored`
- `[DEBUG] [ProtectedRoute] User authenticated`
- `[INFO] [Settings] Logs refreshed`

## Step 7: Test User Sign Out

1. Click the logout icon in the top right corner (next to your email)

### Expected Behavior:
- You should be redirected to `/login`
- Check console for:
  - `[INFO] [DashboardLayout] User initiated sign out`
  - `[INFO] [AuthProvider] Sign out attempt for: test@example.com`
  - `[INFO] [AuthProvider] Sign out successful for test@example.com`
  - `[INFO] [AuthProvider] Auth state changed: SIGNED_OUT`

## Step 8: Test Unauthorized Access

1. While logged out, try to access a protected route directly:
   - Type `http://localhost:8080/products` in the URL bar

### Expected Behavior:
- You should be immediately redirected to `/login`
- Check console for: `[INFO] [ProtectedRoute] User not authenticated, redirecting to login`

## Step 9: Test Invalid Credentials

1. On the login page, enter incorrect credentials
2. Try signing in

### Expected Behavior:
- You should see an error message
- Check console for: `[ERROR] [AuthProvider] Sign in failed for...`

## Step 10: Check Supabase Dashboard

1. Open your Supabase project dashboard at `https://supabase.com/dashboard`
2. Navigate to **Authentication → Users**
3. You should see your test user listed

### Verify:
- Email address matches
- Email confirmed status
- Created timestamp
- Last sign in timestamp

## Advanced Testing

### Test Password Validation
1. Try signing up with passwords less than 6 characters
2. Try signing up with non-matching passwords
3. Verify error messages appear

### Test Email Validation
1. Try invalid email formats
2. Try signing up with an existing email
3. Verify appropriate error messages

### Test Network Issues
1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Try to sign in
5. Verify appropriate error handling

### Test Log Levels
Add test logs in different parts of the application:

```typescript
import { logger } from '@/lib/logger';

logger.debug('This is a debug message', 'MyComponent');
logger.info('This is an info message', 'MyComponent');
logger.warn('This is a warning', 'MyComponent');
logger.error('This is an error', 'MyComponent', { error: 'details' });
```

Navigate to Settings and verify all log levels appear correctly.

## Production Readiness Checklist

Before pushing to production:

- [x ] Test authentication flow end-to-end
- [x ] Verify email confirmation works (if enabled)
- [x ] Test all protected routes
- [x ] Verify session persistence across page refreshes
- [x ] Test sign out functionality
- [x ] Check unauthorized access is properly blocked
- [x ] Review logs for any errors or warnings
- [x ] Verify Supabase dashboard shows users correctly
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices (responsive design)
- [ ] Ensure no sensitive data is logged
- [x ] Verify API keys are not exposed in client code

## Troubleshooting

### Issue: Redirected to login immediately after signup
**Solution:** Check if email confirmation is required. Either confirm your email or disable confirmation in Supabase settings.

### Issue: "Invalid login credentials" error
**Solution:**
1. Verify you confirmed your email
2. Check password meets minimum requirements (6 characters)
3. Try resetting password via Supabase dashboard

### Issue: Logs not appearing in Settings
**Solution:**
1. Click the Refresh button
2. Check browser console for JavaScript errors
3. Verify you're using the logger correctly: `import { logger } from '@/lib/logger'`

### Issue: Session not persisting after refresh
**Solution:**
1. Check browser's localStorage is enabled
2. Verify Supabase client is configured with `storage: localStorage`
3. Check browser console for auth errors

### Issue: Cannot access Supabase
**Solution:**
1. Verify your internet connection
2. Check Supabase project status
3. Verify API keys in `src/integrations/supabase/client.ts`

## Next Steps

Once local testing is complete:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Add authentication and logging system"
   ```

2. Push to your repository:
   ```bash
   git push origin main
   ```

3. Deploy to production (Vercel/Netlify)

4. Test authentication on production URL

5. Monitor logs in production environment

6. Set up error tracking (optional):
   - Sentry
   - LogRocket
   - Rollbar

## Support

If you encounter issues:
- Check Supabase documentation: https://supabase.com/docs/guides/auth
- Review browser console for errors
- Export logs from Settings page for debugging
- Check Supabase project logs in dashboard
