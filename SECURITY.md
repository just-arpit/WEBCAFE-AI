# 🔒 Security Implementation Guide

## Implemented Security Features

### ✅ Authentication Security
- **Multi-provider auth**: Google OAuth + Email/Password
- **Auth state verification**: All protected routes check authentication
- **Emulator support**: Safe local development without production credentials

### ✅ Firestore Security Rules
Located in: `firestore.rules`

**Key protections:**
1. **Authentication required**: All operations require valid auth token
2. **Ownership verification**: Users can only access their own conversations
3. **Role-based access**: User messages must have matching senderUid
4. **Admin bypass**: Cloud Functions with Admin SDK can update assistant messages
5. **Data validation**: Required fields enforced at rule level

### ✅ Cloud Functions Security

**Authentication checks:**
```javascript
if (!context.auth) {
  throw new functions.https.HttpsError('unauthenticated', 'User must be signed in');
}
```

**Authorization checks:**
```javascript
if (convDoc.data().ownerUid !== userId) {
  throw new functions.https.HttpsError('permission-denied', 'Not authorized');
}
```

**Input validation:**
```javascript
if (!conversationId || !assistantId) {
  throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
}
```

### ✅ API Key Protection
- OpenAI key stored in Firebase Functions config (server-side only)
- Never exposed to client code
- Environment variable fallback for local development
- Set via: `firebase functions:config:set openai.key="YOUR_KEY"`

### ✅ Rate Limiting & Cost Controls
- **Message context limited**: Max 20 messages to prevent token overflow
- **Response length capped**: 800 tokens per response
- **Debounced writes**: 500ms intervals reduce Firestore writes by ~80%
- **System prompts**: Guides AI to provide concise responses

### ✅ Error Handling
- Graceful degradation on errors
- User-friendly error messages (no sensitive data leaked)
- Detailed server logs for debugging
- Status tracking: `pending` → `streaming` → `done` / `error`

### ✅ Data Privacy
- Conversations are private by default
- No data shared between users
- User-specific conversation queries
- No analytics tracking in current implementation

## 🚨 Additional Recommendations

### For Production Deployment

#### 1. Enable App Check (Highly Recommended)
Prevents bots and abuse:

```bash
# Enable in Firebase Console:
# Build → App Check → Register your app
```

#### 2. Set Up Billing Alerts
In Google Cloud Console:
- Go to Billing → Budgets & alerts
- Set budget: e.g., $50/month
- Configure alerts at 50%, 80%, 100%

#### 3. Implement Rate Limiting
Add to Cloud Functions:

```javascript
// Example: limit to 20 messages per user per hour
const userMessageCount = await getUserMessageCount(userId, lastHour);
if (userMessageCount > 20) {
  throw new functions.https.HttpsError('resource-exhausted', 'Rate limit exceeded');
}
```

#### 4. Content Moderation
Before sending to OpenAI:

```javascript
// Use OpenAI Moderation API
const moderation = await openai.moderations.create({input: userMessage});
if (moderation.results[0].flagged) {
  throw new functions.https.HttpsError('invalid-argument', 'Message violates content policy');
}
```

#### 5. PII Detection
If handling sensitive data:

```javascript
// Implement PII detection/masking before sending to LLM
function maskPII(text) {
  return text
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]') // SSN
    .replace(/\b\d{16}\b/g, '[CARD]'); // Credit cards
}
```

#### 6. Logging & Monitoring
Enable structured logging:

```javascript
const {logger} = require('firebase-functions');

logger.info('Processing message', {
  userId: context.auth.uid,
  conversationId,
  timestamp: Date.now()
});
```

#### 7. Secret Management
For production, use Google Secret Manager instead of functions config:

```bash
# Create secret
echo "sk-YOUR_KEY" | gcloud secrets create openai-api-key --data-file=-

# Grant access to function
gcloud secrets add-iam-policy-binding openai-api-key \
  --member=serviceAccount:YOUR_PROJECT@appspot.gserviceaccount.com \
  --role=roles/secretmanager.secretAccessor
```

Update `functions/index.js`:
```javascript
const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function getOpenAIKey() {
  const [version] = await client.accessSecretVersion({
    name: 'projects/YOUR_PROJECT_ID/secrets/openai-api-key/versions/latest'
  });
  return version.payload.data.toString();
}
```

#### 8. CORS Configuration
Already handled by Firebase Hosting, but for custom domains:

```javascript
// In firebase.json hosting config
"headers": [{
  "source": "**",
  "headers": [{
    "key": "X-Content-Type-Options",
    "value": "nosniff"
  }, {
    "key": "X-Frame-Options",
    "value": "DENY"
  }, {
    "key": "X-XSS-Protection",
    "value": "1; mode=block"
  }]
}]
```

## 🧪 Security Testing Checklist

Before production:

- [ ] Test unauthenticated access (should be denied)
- [ ] Try accessing another user's conversation (should fail)
- [ ] Test with expired auth tokens
- [ ] Verify OpenAI key is not in client bundle (`npm run build` → check dist/)
- [ ] Test rate limiting (send many messages quickly)
- [ ] Review Cloud Functions logs for sensitive data leaks
- [ ] Test error messages don't expose internal details
- [ ] Verify Firestore rules in production mode
- [ ] Check billing alerts are configured
- [ ] Review IAM permissions in GCP Console

## 🔍 Audit Commands

```bash
# Check for hardcoded secrets
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git

# Verify .env files are in .gitignore
git check-ignore .env

# Check Firestore rules are deployed
firebase firestore:rules get

# Review function permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID

# Check function environment config
firebase functions:config:get
```

## 📞 Incident Response

If API key is compromised:

1. **Immediately rotate key**:
   ```bash
   # OpenAI Dashboard → API Keys → Revoke old key → Create new
   firebase functions:config:set openai.key="NEW_KEY"
   firebase deploy --only functions
   ```

2. **Review usage logs** in OpenAI Dashboard for suspicious activity

3. **Check Firebase Auth logs** for unauthorized access attempts

4. **Update security rules** if breach occurred via Firestore

## 🎯 Compliance Considerations

If handling regulated data (HIPAA, GDPR, etc.):

- **Data residency**: Choose appropriate Firestore region
- **Encryption**: Firebase encrypts data at rest and in transit by default
- **Audit logs**: Enable Cloud Audit Logs in GCP Console
- **Data deletion**: Implement user data export and deletion endpoints
- **Terms of service**: Ensure users consent to AI processing
- **Third-party processors**: Review OpenAI's data processing agreement

## 📚 References

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Cloud Functions Security Best Practices](https://firebase.google.com/docs/functions/security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OpenAI Safety Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

---

**Last Updated**: 2025-12-02  
**Review Frequency**: Quarterly or after any security incident
