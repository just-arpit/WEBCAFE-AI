import {initializeApp} from 'firebase/app';
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore, serverTimestamp} from 'firebase/firestore';
import {getFunctions, httpsCallable, connectFunctionsEmulator} from 'firebase/functions';
import {connectAuthEmulator} from 'firebase/auth';
import {connectFirestoreEmulator} from 'firebase/firestore';

// Replace with your actual Firebase config from Firebase Console
// Project Settings > General > Your apps > Firebase SDK snippet
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDGWe31bKU5rBXoRR7kTlZgHCG73s-aQbI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'webcafe-ai-14913.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'webcafe-ai-14913',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'webcafe-ai-14913.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '453845256080',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:453845256080:web:6ed401247f9e2a3d061515'
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to emulators in development (localhost)
if (window.location.hostname === 'localhost') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', {disableWarnings: true});
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
    console.log('✅ Connected to Firebase Emulators');
  } catch (error) {
    console.log('Emulators already connected or not available');
  }
}

export {app, auth, provider, db, functions, serverTimestamp, httpsCallable};
