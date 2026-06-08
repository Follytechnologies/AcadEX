// ============================================
// ACADEX — Firebase Configuration
// firebase-config.js — Include FIRST on every page
// ============================================
// 
// HOW TO SET UP:
// 1. Go to https://console.firebase.google.com
// 2. Click "Add Project" → name it "acadex-unilag"
// 3. Go to Project Settings → "Your apps" → click </> (Web)
// 4. Register app, copy the firebaseConfig object below
// 5. Replace the placeholder values below with your real values
// 6. Enable Authentication: Firebase Console → Build → Authentication → Sign-in method → Email/Password
// 7. Enable Firestore: Firebase Console → Build → Firestore Database → Create database (Start in test mode)
// 8. Enable Storage: Firebase Console → Build → Storage → Get started
//
// ============================================

// ---- YOUR FIREBASE CONFIG (replace with real values from Firebase Console) ----
const firebaseConfig = {
  apiKey: "AIzaSyDN43nc6YaD9OMQ11gup54dGMYvXdJxfmk",
  authDomain: "acadex-8cfa6.firebaseapp.com",
  projectId: "acadex-8cfa6",
  storageBucket: "acadex-8cfa6.firebasestorage.app",
  messagingSenderId: "953765461666",
  appId: "1:953765461666:web:cea8e53b31aaabd374e1fb"
};


// ---- DETECT IF FIREBASE IS CONFIGURED ----
const FIREBASE_CONFIGURED = true;

// ---- FIREBASE MODULES ----
let db = null;
let auth = null;
let storage = null;

// ---- INITIALIZE ----
function initFirebase() {
  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    auth = firebase.auth();
    window.ACADEX_MODE = 'live';
    console.log("AcadEx: Firebase initialized. Running in LIVE mode.");
  } catch (e) {
    console.error("Firebase init failed:", e);
    window.ACADEX_MODE = 'demo';
  }
}

// Run immediately
initFirebase();