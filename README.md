# ☕ Webcafe AI - Production Setup Guide

A secure, scalable AI Chat Assistant built with React + Firebase + OpenAI. Supports Google & Email authentication, real-time streaming responses, and conversation history.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite
- **Backend**: Firebase Cloud Functions (Node 18)
- **Database**: Cloud Firestore
- **Auth**: Firebase Authentication (Google + Email/Password)
- **AI**: OpenAI GPT-4o-mini with streaming

## 📋 Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project (create at [console.firebase.google.com](https://console.firebase.google.com))
- OpenAI API key (get from [platform.openai.com](https://platform.openai.com))

## 🚀 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd ~/Project/Webcafe-AI
npm install
cd functions
npm install
cd ..
```

### 2. Configure Firebase

#### a. Update `.firebaserc`
Replace `YOUR_PROJECT_ID` with your actual Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

#### b. Update `src/firebase.js`
Replace the placeholder values with your Firebase config from:
- Firebase Console → Project Settings → General → Your apps → SDK setup and configuration

Or create a `.env` file in the root:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Enable Firebase Services

In Firebase Console:

1. **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Google and Email/Password providers

2. **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in production mode
   - Choose your region

3. **Enable Billing** (required for Cloud Functions to make external API calls):
   - Go to Project Settings → Usage and billing
   - Upgrade to Blaze (pay-as-you-go) plan

### 4. Set OpenAI API Key

```bash
firebase functions:config:set openai.key="sk-YOUR_OPENAI_API_KEY"
```

Verify it's set:
```bash
firebase functions:config:get
```

### 5. Deploy Firestore Rules & Indexes

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 6. Install Functions Dependencies

```bash
cd functions
npm install node-fetch@2
cd ..
```

## 🧪 Local Development

### Start Firebase Emulators

```bash
npm run emulators
# Or: npx firebase emulators:start
```

This starts:
- Auth Emulator: http://localhost:9099
- Firestore Emulator: http://localhost:8080
- Functions Emulator: http://localhost:5001
- Emulator UI: http://localhost:4000

### Start Vite Dev Server (in a new terminal)

```bash
npm run dev
```

Visit http://localhost:5173

### Test Locally

1. Sign in with Google (creates test user in emulator)
2. Send a message
3. Watch for streaming AI response

**Note**: For local development, you still need to set the OpenAI key for functions:
```bash
# For emulator, set env variable
export OPENAI_API_KEY="sk-YOUR_KEY"
# Then start emulators
npm run emulators
```

## 🚢 Production Deployment

### Deploy Everything

```bash
npm run build
firebase deploy
```

### Deploy Specific Services

```bash
# Functions only
firebase deploy --only functions

# Hosting only
firebase deploy --only hosting

# Firestore rules only
firebase deploy --only firestore:rules
```

### Update Functions Config (Production)

```bash
firebase functions:config:set openai.key="sk-YOUR_PRODUCTION_KEY"
firebase deploy --only functions
```

## 🔒 Security Checklist

- [x] ✅ Firestore rules restrict access to conversation owners only
- [x] ✅ Cloud Functions validate authentication before processing
- [x] ✅ OpenAI API key stored in Firebase Functions config (never in client code)
- [x] ✅ User authorization checked before reading conversations
- [x] ✅ HTTPS Callable functions provide automatic auth context
- [x] ✅ Environment variables for sensitive config
- [ ] ⚠️ **TODO**: Set up billing alerts in GCP Console
- [ ] ⚠️ **TODO**: Review and customize Firestore security rules for your use case
- [ ] ⚠️ **TODO**: Enable App Check for bot protection (optional but recommended)

## 💰 Cost Management

### Firestore Optimization
- Debounced writes (500ms) reduce document updates during streaming
- Context limited to 20 messages (configurable in `functions/index.js`)
- Response capped at 800 tokens per message

### Function Optimization
- Cold starts minimized with Node 18 runtime
- Streaming responses for better UX without increasing function time significantly

### Monitoring
```bash
# View function logs
firebase functions:log

# Check costs in GCP Console
open https://console.cloud.google.com/billing
```

## 📊 Firestore Data Model

```
conversations (collection)
  └─ {conversationId} (doc)
      ├─ title: string
      ├─ ownerUid: string
      ├─ visibility: 'private' | 'shared'
      ├─ createdAt: timestamp
      ├─ lastUpdatedAt: timestamp
      └─ messages (subcollection)
          └─ {messageId} (doc)
              ├─ text: string
              ├─ senderUid: string
              ├─ role: 'user' | 'assistant' | 'system'
              ├─ status: 'pending' | 'streaming' | 'done' | 'error'
              ├─ createdAt: timestamp
              ├─ displayName: string (optional)
              └─ photoURL: string (optional)
```

## 🐛 Troubleshooting

### "Cannot find module 'firebase-functions'"
```bash
cd functions && npm install
```

### Google Sign-in not working locally
- Use Email/Password auth in emulator
- Or create test accounts via Emulator UI at http://localhost:4000

### Functions not updating
```bash
# Clear cache and redeploy
firebase functions:delete generateResponse
firebase deploy --only functions
```

### Firestore permission denied
- Check rules are deployed: `firebase deploy --only firestore:rules`
- Verify user is authenticated
- Check conversation ownerUid matches current user

### OpenAI API errors
- Verify key is set: `firebase functions:config:get`
- Check billing is enabled on OpenAI account
- Review function logs: `firebase functions:log`

## 🔧 Customization

### Change AI Model
Edit `functions/index.js`:
```javascript
const body = {
  model: 'gpt-4', // or 'gpt-3.5-turbo'
  // ...
}
```

### Adjust Context Window
```javascript
const MAX_CONTEXT_MESSAGES = 20; // Change this value
```

### Modify Debounce Timing
```javascript
const DEBOUNCE_MS = 500; // Milliseconds between writes
```

## 📚 Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## 🤝 Support

For issues or questions:
1. Check Firebase Console logs
2. Review function logs: `firebase functions:log`
3. Check browser console for client errors
4. Verify all environment variables are set correctly

## 📝 License

MIT License - feel free to use for your projects!

---

**Production Checklist** before going live:
- [ ] Replace all placeholder config values
- [ ] Deploy Firestore security rules
- [ ] Set up billing alerts
- [ ] Test all auth flows (Google + Email)
- [ ] Test message sending and streaming
- [ ] Review function logs for errors
- [ ] Set up monitoring/alerting
- [ ] Configure custom domain (optional)
- [ ] Enable App Check (recommended)
- [ ] Review OpenAI usage limits and quotas
