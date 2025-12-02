# 🎯 Quick Reference Card

## Essential Commands

```bash
# Setup
npm install && cd functions && npm install && cd ..
firebase login

# Local Development
npm run emulators          # Start Firebase emulators (Terminal 1)
npm run dev               # Start Vite dev server (Terminal 2)

# Configuration
firebase functions:config:set openai.key="sk-YOUR_KEY"
firebase functions:config:get

# Build & Deploy
npm run build             # Build for production
npm run deploy            # Build + deploy all
firebase deploy --only functions
firebase deploy --only hosting
firebase deploy --only firestore:rules

# Logs & Monitoring
firebase functions:log
firebase functions:log --only generateResponse
```

## URLs (Development)

- **Frontend**: http://localhost:5173
- **Emulator UI**: http://localhost:4000
- **Auth Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8080
- **Functions Emulator**: http://localhost:5001

## Critical Files to Configure

1. **`.env`** (or `src/firebase.js`)
   ```env
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

2. **`.firebaserc`**
   ```json
   {"projects": {"default": "your-project-id"}}
   ```

3. **Functions Config**
   ```bash
   firebase functions:config:set openai.key="sk-..."
   ```

## Security Rules Quick Check

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Test rules locally
firebase emulators:start --only firestore
```

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| "Module not found" | `npm install` in root and functions/ |
| "Permission denied" | Deploy Firestore rules |
| "Function not found" | `firebase deploy --only functions` |
| "Invalid API key" | Check functions config |
| Port already in use | Kill process: `lsof -ti:PORT \| xargs kill -9` |

## File Imports Reference

### React Components
```javascript
import {useState, useEffect} from 'react';
import {useAuthState} from 'react-firebase-hooks/auth';
```

### Firebase Client
```javascript
import {auth, db, functions, serverTimestamp, httpsCallable} from './firebase';
import {collection, addDoc, doc, setDoc, onSnapshot, query, orderBy} from 'firebase/firestore';
```

### Firebase Functions
```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');
```

## Data Model

```typescript
// Conversation
{
  title: string,
  ownerUid: string,
  visibility: 'private' | 'shared',
  createdAt: Timestamp,
  lastUpdatedAt: Timestamp
}

// Message
{
  text: string,
  senderUid: string,
  role: 'user' | 'assistant' | 'system',
  status: 'pending' | 'streaming' | 'done' | 'error',
  createdAt: Timestamp,
  displayName?: string,
  photoURL?: string
}
```

## Environment Variables

### Development (.env)
```env
VITE_FIREBASE_*=...
```

### Functions (Firebase Config)
```bash
firebase functions:config:set openai.key="sk-..."
```

### Functions (Environment Variable - for emulator)
```bash
export OPENAI_API_KEY="sk-..."
```

## Performance Tuning

```javascript
// functions/index.js
const MAX_CONTEXT_MESSAGES = 20;  // Context window
const MAX_TOKENS = 800;           // Response length
const DEBOUNCE_MS = 500;          // Write frequency
```

## Cost Control Checklist

- [ ] Debouncing enabled (500ms)
- [ ] Context limited (20 messages)
- [ ] Response capped (800 tokens)
- [ ] Billing alerts configured
- [ ] Firestore indexes optimized

## Firebase Console Quick Links

- **Project**: console.firebase.google.com/project/YOUR_PROJECT
- **Auth**: .../authentication/users
- **Firestore**: .../firestore/data
- **Functions**: .../functions/list
- **Hosting**: .../hosting/sites
- **Billing**: console.cloud.google.com/billing

## Support Checklist

Before asking for help:
- [ ] Checked browser console for errors
- [ ] Checked function logs: `firebase functions:log`
- [ ] Verified config: `firebase functions:config:get`
- [ ] Tried in incognito/private window
- [ ] Cleared browser cache
- [ ] Restarted emulators/dev server

## Quick Deployment

```bash
# One-liner full deployment
npm run build && firebase deploy

# Check deployment status
firebase projects:list
firebase hosting:sites:list
firebase functions:list
```

## Rollback

```bash
# Hosting: redeploy previous version
git checkout PREVIOUS_COMMIT
npm run deploy

# Functions: delete and redeploy
firebase functions:delete generateResponse
firebase deploy --only functions
```

---

**💡 Pro Tips:**
- Use `Cmd+K` in VSCode to search files
- Check `.gitignore` before committing
- Test locally before deploying
- Monitor costs daily after launch
- Keep OpenAI key secure
