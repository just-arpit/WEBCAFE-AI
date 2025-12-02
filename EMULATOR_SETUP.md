# ⚠️ EMULATOR SETUP NOTES

## Current Status

✅ **Auth Emulator**: Running on http://127.0.0.1:9099  
✅ **Functions Emulator**: Running on http://127.0.0.1:5001  
✅ **Emulator UI**: Running on http://127.0.0.1:4000  
❌ **Firestore Emulator**: Requires Java Runtime  

## Quick Fix for Firestore Emulator

The Firestore emulator requires Java to run. You have two options:

### Option 1: Install Java (Recommended for Local Development)

```bash
# Install Java using Homebrew
brew install openjdk@17

# Add Java to PATH (add to ~/.zshrc for permanent)
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"

# Verify installation
java -version

# Then restart all emulators
firebase emulators:start
```

### Option 2: Use Production Firestore for Testing

If you don't want to install Java, you can test with production Firestore:

1. **Update `.firebaserc`** with your real Firebase project ID
2. **Update `src/firebase.js`** - comment out emulator connection for Firestore:

```javascript
if (window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true});
    // connectFirestoreEmulator(db, 'localhost', 8080); // Comment this out
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase Emulators (Auth + Functions only)');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}
```

3. **Create Firestore database** in Firebase Console
4. **Deploy security rules** first: `firebase deploy --only firestore:rules`

### Option 3: Skip Emulators, Deploy Directly

For quick testing, you can:

1. Configure your real Firebase project
2. Deploy to production: `npm run deploy`
3. Test the live app

## Current Working Setup

Right now you can test:
- ✅ Authentication (Email/Password works in emulator)
- ✅ Cloud Functions (can be triggered)
- ❌ Firestore (needs Java or production setup)

## To Continue Development Now

### Terminal 1 (Already Running):
```bash
# Emulators are running ✅
# Keep this terminal open
```

### Terminal 2 (Start Dev Server):
```bash
cd /Users/arpitrajput/Project/Webcafe-AI
npm run dev
```

Then visit: **http://localhost:5173**

## Important Notes

1. **Replace OpenAI Key**: The current key is a placeholder. Set your real key:
   ```bash
   export OPENAI_API_KEY="sk-YOUR-REAL-OPENAI-KEY"
   # Then restart emulators
   ```

2. **Without Firestore Emulator**: 
   - Messages won't save/load locally
   - You'll see Firestore connection errors in console
   - Authentication will work fine

3. **Best Solution**: Install Java with the command above, then restart emulators

## Quick Commands

```bash
# Stop emulators (if needed)
# Press Ctrl+C in the emulator terminal

# Restart with all services (after installing Java)
firebase emulators:start

# Or just Auth + Functions (current setup)
firebase emulators:start --only auth,functions

# Start Vite dev server
npm run dev
```

## Next Steps

Choose one:

1. **Install Java** → Full local development with all emulators
2. **Use production Firestore** → Hybrid approach (local Auth/Functions, remote Firestore)
3. **Deploy to production** → Test everything live

---

**Current Emulator UI**: http://127.0.0.1:4000  
**Your App**: http://localhost:5173 (after running `npm run dev`)
