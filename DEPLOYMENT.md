# 🚀 Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Configuration
- [ ] Updated `.firebaserc` with your Firebase project ID
- [ ] Replaced placeholder values in `src/firebase.js` (or created `.env` file)
- [ ] Set OpenAI API key: `firebase functions:config:set openai.key="YOUR_KEY"`
- [ ] Verified config: `firebase functions:config:get`

### Firebase Console Setup
- [ ] Created Firebase project at console.firebase.google.com
- [ ] Enabled Firestore Database (production mode)
- [ ] Enabled Authentication → Google provider
- [ ] Enabled Authentication → Email/Password provider
- [ ] Upgraded to Blaze (pay-as-you-go) plan for Cloud Functions
- [ ] Configured authorized domains for auth (Settings → Authorized domains)

### Code Review
- [ ] All `TODO` comments addressed
- [ ] No console.log statements with sensitive data
- [ ] Error messages don't expose internal details
- [ ] `.env` file NOT committed to git (check `.gitignore`)
- [ ] API keys not hardcoded anywhere

### Testing
- [ ] Tested locally with emulators (`npm run emulators`)
- [ ] Signed in with Google (if using production) or Email/Password
- [ ] Sent test messages and verified streaming works
- [ ] Tested error handling (invalid inputs, network failures)
- [ ] Verified real-time message updates work
- [ ] Tested on mobile viewport (responsive design)

### Security
- [ ] Reviewed `firestore.rules` and customized if needed
- [ ] Tested Firestore rules don't allow unauthorized access
- [ ] OpenAI key stored securely (Functions config or Secret Manager)
- [ ] Reviewed `SECURITY.md` recommendations
- [ ] Considered implementing rate limiting (see SECURITY.md)

## Deployment Steps

### 1. Build
```bash
npm run build
```
- [ ] Build completed without errors
- [ ] Checked `dist/` folder created
- [ ] Verified no secrets in built files: `grep -r "sk-" dist/`

### 2. Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules,firestore:indexes
```
- [ ] Rules deployed successfully
- [ ] Verified in Firebase Console → Firestore → Rules

### 3. Deploy Functions
```bash
firebase deploy --only functions
```
- [ ] Functions deployed successfully
- [ ] No errors in deployment logs
- [ ] Function appears in Firebase Console → Functions

### 4. Deploy Hosting
```bash
firebase deploy --only hosting
```
- [ ] Hosting deployed successfully
- [ ] Received hosting URL
- [ ] Site accessible at URL

### 5. Full Deployment (Alternative)
```bash
npm run deploy
# Or: firebase deploy
```
- [ ] All services deployed together

## Post-Deployment Verification

### Functional Testing
- [ ] Visited production URL
- [ ] Signed in with Google account
- [ ] Created new conversation
- [ ] Sent test message
- [ ] Received AI response with streaming
- [ ] Signed out and back in (conversation persists)
- [ ] Tested on mobile device

### Performance
- [ ] Page loads in < 3 seconds
- [ ] Messages appear in real-time
- [ ] No console errors in browser DevTools
- [ ] Lighthouse score > 80 (optional)

### Monitoring Setup
- [ ] Set up billing alerts in GCP Console
  - Go to: console.cloud.google.com/billing
  - Set budget (e.g., $50/month)
  - Configure email alerts
- [ ] Bookmarked Firebase Console logs
- [ ] Bookmarked Cloud Functions logs
- [ ] (Optional) Set up Sentry or error tracking

### Cost Management
- [ ] Reviewed pricing for Firestore, Functions, Hosting
- [ ] Confirmed debounced writes are working (check function logs)
- [ ] Set reasonable limits in function code:
  - `MAX_CONTEXT_MESSAGES = 20`
  - `MAX_TOKENS = 800`
  - `DEBOUNCE_MS = 500`

## Production Checklist (Before Public Launch)

### Advanced Security
- [ ] Enabled App Check (Build → App Check in Firebase Console)
- [ ] Implemented rate limiting for API calls
- [ ] Added content moderation if needed
- [ ] Reviewed IAM permissions in GCP
- [ ] Configured custom domain with SSL (optional)

### User Experience
- [ ] Added loading states for all async operations
- [ ] Implemented error recovery (retry logic)
- [ ] Added terms of service / privacy policy
- [ ] Implemented conversation history management (export, delete)
- [ ] Added user feedback mechanism

### Documentation
- [ ] Updated README.md with any custom changes
- [ ] Documented any environment-specific configuration
- [ ] Created runbook for common issues
- [ ] Shared access with team members (Firebase Console)

### Backup & Recovery
- [ ] Enabled Firestore daily backups (if available in your plan)
- [ ] Documented rollback procedure
- [ ] Tested recovery from backup (optional)

## Monitoring Commands

```bash
# Watch function logs in real-time
firebase functions:log --only generateResponse

# Check hosting status
firebase hosting:sites:list

# View recent deploys
firebase projects:list

# Get function details
firebase functions:list
```

## Rollback Procedure

If something goes wrong:

### Rollback Functions
```bash
# List versions
gcloud functions list --project=YOUR_PROJECT_ID

# Rollback to previous version
firebase deploy --only functions --version=PREVIOUS_VERSION
```

### Rollback Hosting
```bash
# View hosting releases
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION DESTINATION_SITE_ID

# Or redeploy previous build
git checkout PREVIOUS_COMMIT
npm run deploy
```

### Rollback Firestore Rules
```bash
# Rules are versioned in Firebase Console
# Go to: Firestore → Rules → View history → Restore previous version
```

## Common Post-Deploy Issues

### Issue: "Permission denied" errors
**Fix**: Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### Issue: Functions not updating
**Fix**: Clear cache and redeploy
```bash
firebase functions:delete generateResponse
firebase deploy --only functions
```

### Issue: Auth not working on custom domain
**Fix**: Add domain to Firebase Console
- Authentication → Settings → Authorized domains → Add domain

### Issue: High costs
**Fix**: 
1. Check function execution time and frequency
2. Review Firestore read/write volume
3. Adjust debounce timing or context window
4. Implement caching for common queries

## Success Criteria

Your deployment is successful when:
- ✅ Users can sign in and create conversations
- ✅ Messages are sent and AI responses stream correctly
- ✅ No errors in browser console or function logs
- ✅ Costs are within expected range
- ✅ Security rules prevent unauthorized access
- ✅ Performance is acceptable (< 3s load, < 2s AI response start)

## Next Steps After Launch

1. **Monitor for 24-48 hours**
   - Check function logs daily
   - Review billing dashboard
   - Watch for error spikes

2. **Gather feedback**
   - Ask beta users to test
   - Monitor user engagement
   - Track common issues

3. **Optimize based on usage**
   - Adjust context window if needed
   - Fine-tune debounce timing
   - Implement caching for FAQs

4. **Plan improvements**
   - Add conversation management features
   - Implement search
   - Add export functionality
   - Consider multi-language support

---

**Deployment Date**: _______________  
**Deployed By**: _______________  
**Production URL**: _______________  
**Notes**: _______________
