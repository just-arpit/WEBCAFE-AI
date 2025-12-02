# 🔑 Firebase Configuration Setup

## Your Project Details (From Screenshots)

- **Project ID**: `webcafe-ai-14913`
- **Project Number**: `453845256080`
- **Project Name**: `WEBCAFE-AI`
- **Environment**: Production

## ✅ Step 1: Get Your Firebase Web App Configuration

You need to get your Firebase config values. Here's how:

### Option A: From Firebase Console (Recommended)

1. Go to: https://console.firebase.google.com/project/webcafe-ai-14913/settings/general
2. Scroll down to "Your apps" section
3. If you don't have a web app, click "Add app" → Select Web (</>) icon
4. Register your app with nickname "Webcafe AI Web"
5. Copy the `firebaseConfig` object

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "webcafe-ai-14913.firebaseapp.com",
  projectId: "webcafe-ai-14913",
  storageBucket: "webcafe-ai-14913.firebasestorage.app",
  messagingSenderId: "453845256080",
  appId: "1:453845256080:web:..."
};
```

### Option B: Use Firebase CLI

```bash
cd /Users/arpitrajput/Project/Webcafe-AI
firebase apps:sdkconfig web
```

## ✅ Step 2: Update Your Configuration

### Method 1: Using .env file (Recommended)

Create `.env` file in the project root:

```bash
# Copy the template
cp .env.example .env

# Edit with your values
nano .env
```

Fill in your values:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=webcafe-ai-14913.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=webcafe-ai-14913
VITE_FIREBASE_STORAGE_BUCKET=webcafe-ai-14913.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=453845256080
VITE_FIREBASE_APP_ID=1:453845256080:web:...
```

### Method 2: Edit firebase.js directly

Edit `src/firebase.js` and replace the firebaseConfig object.

## ✅ Step 3: Set OpenAI API Key

```bash
# For Firebase Functions config (production)
firebase functions:config:set openai.key="sk-YOUR-ACTUAL-OPENAI-KEY"

# For local emulator testing
export OPENAI_API_KEY="sk-YOUR-ACTUAL-OPENAI-KEY"
```

## ✅ Step 4: Enable Required Services

### 1. Enable Authentication

```bash
# Go to: https://console.firebase.google.com/project/webcafe-ai-14913/authentication
# Click "Get Started"
# Enable Google Sign-in
# Enable Email/Password
```

Or use CLI:
```bash
# This will open the console
firebase open auth
```

### 2. Create Firestore Database

```bash
# Go to: https://console.firebase.google.com/project/webcafe-ai-14913/firestore
# Click "Create database"
# Choose production mode
# Select region (us-central or your preferred)
```

Or use CLI:
```bash
firebase open firestore
```

### 3. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 4. Upgrade to Blaze Plan (Required for Cloud Functions)

```bash
# Go to: https://console.firebase.google.com/project/webcafe-ai-14913/usage
# Click "Modify plan"
# Select "Blaze - Pay as you go"
# Add payment method
```

## 🚀 Quick Start Commands (Once Configured)

```bash
# Terminal 1: Start emulators
firebase emulators:start

# Terminal 2: Start dev server
npm run dev

# Visit: http://localhost:5173
```

## 📋 Configuration Checklist

Before running the app:

- [ ] Got Firebase config from console
- [ ] Updated `.env` or `src/firebase.js` with config
- [ ] Set OpenAI API key (functions config + export)
- [ ] Enabled Google Authentication
- [ ] Enabled Email/Password Authentication
- [ ] Created Firestore Database
- [ ] Deployed Firestore rules
- [ ] Upgraded to Blaze plan
- [ ] Authorized domains configured (localhost, your domain)

## 🔧 Next Steps

1. **Get Firebase Config**:
   ```bash
   firebase apps:sdkconfig web
   ```

2. **Update .env**:
   ```bash
   nano .env
   # Paste your config values
   ```

3. **Set OpenAI Key**:
   ```bash
   firebase functions:config:set openai.key="sk-..."
   export OPENAI_API_KEY="sk-..."
   ```

4. **Enable Services** (use links above)

5. **Deploy Rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

6. **Test**:
   ```bash
   firebase emulators:start    # Terminal 1
   npm run dev                 # Terminal 2
   ```

## 🆘 Need Help?

Run this command to get your web app config:
```bash
firebase apps:sdkconfig web
```

Then copy the output into `.env` or `src/firebase.js`.

---

**Your Project**: webcafe-ai-14913  
**Console**: https://console.firebase.google.com/project/webcafe-ai-14913
