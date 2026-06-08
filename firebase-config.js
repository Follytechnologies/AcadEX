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
const FIREBASE_CONFIGURED = firebaseConfig.apiKey !== "YOUR_API_KEY";

// ---- FIREBASE MODULES (loaded via CDN in HTML) ----
// These are initialized after Firebase SDK loads
let db = null;
let auth = null;
let storage = null;

// ---- INITIALIZE ----
function initFirebase() {
  if (!FIREBASE_CONFIGURED) {
    console.warn("AcadEx: Firebase not configured. Running in DEMO mode with mock data.");
    window.ACADEX_MODE = 'demo';
    return;
  }

  try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    storage = firebase.storage();
    window.ACADEX_MODE = 'live';
    console.log("AcadEx: Firebase initialized. Running in LIVE mode.");
  } catch (e) {
    console.error("AcadEx: Firebase init failed. Falling back to demo mode.", e);
    window.ACADEX_MODE = 'demo';
  }
}

// ---- FIRESTORE HELPERS ----
const DB = {

  // ---- USERS ----
  async createUser(uid, userData) {
    if (!db) return null;
    await db.collection('users').doc(uid).set({
      ...userData,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  async getUser(uid) {
    if (!db) return null;
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? { id: doc.id, ...doc.data() } : null;
  },

  async getUserByMatric(matricNumber) {
    if (!db) return null;
    const snap = await db.collection('users')
      .where('matricNumber', '==', matricNumber)
      .limit(1).get();
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  },

  // ---- APPEALS ----
  async submitAppeal(appealData) {
    if (!db) return null;
    const ref = await db.collection('appeals').add({
      ...appealData,
      status: 'pending',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },

  async getStudentAppeals(matricNumber) {
    if (!db) return null;
    const snap = await db.collection('appeals')
      .where('matricNumber', '==', matricNumber)
      .orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getAllAppeals(status = null) {
    if (!db) return null;
    let query = db.collection('appeals').orderBy('createdAt', 'desc');
    if (status) query = query.where('status', '==', status);
    const snap = await query.get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async updateAppeal(appealId, updates) {
    if (!db) return null;
    await db.collection('appeals').doc(appealId).update({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  },

  // Real-time listener for appeals (lecturer side)
  listenAppeals(callback) {
    if (!db) return () => {};
    return db.collection('appeals')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const appeals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(appeals);
      });
  },

  // Real-time listener for student's own appeals
  listenStudentAppeals(matricNumber, callback) {
    if (!db) return () => {};
    return db.collection('appeals')
      .where('matricNumber', '==', matricNumber)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const appeals = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(appeals);
      });
  },

  // ---- CBT / TESTS ----
  async getTests(level) {
    if (!db) return null;
    const snap = await db.collection('tests')
      .where('level', '==', level)
      .where('active', '==', true).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async submitTestResult(resultData) {
    if (!db) return null;
    const ref = await db.collection('results').add({
      ...resultData,
      submittedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },

  async getStudentResults(matricNumber) {
    if (!db) return null;
    const snap = await db.collection('results')
      .where('matricNumber', '==', matricNumber)
      .orderBy('submittedAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  // ---- MATERIALS ----
  async getMaterials(level) {
    if (!db) return null;
    const snap = await db.collection('materials')
      .where('level', '==', level)
      .orderBy('uploadedAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async uploadMaterial(file, metadata) {
    if (!storage || !db) return null;
    const path = `materials/${Date.now()}_${file.name}`;
    const ref = storage.ref(path);
    await ref.put(file);
    const url = await ref.getDownloadURL();
    await db.collection('materials').add({
      ...metadata,
      url,
      path,
      uploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return url;
  },

  // ---- NOTIFICATIONS ----
  async getNotifications(matricNumber) {
    if (!db) return null;
    const snap = await db.collection('notifications')
      .where('recipientMatric', '==', matricNumber)
      .orderBy('createdAt', 'desc').limit(20).get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async markNotificationRead(notifId) {
    if (!db) return;
    await db.collection('notifications').doc(notifId).update({ read: true });
  },

  listenNotifications(matricNumber, callback) {
    if (!db) return () => {};
    return db.collection('notifications')
      .where('recipientMatric', '==', matricNumber)
      .where('read', '==', false)
      .onSnapshot(snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
  },

  // ---- GPA / SEMESTERS ----
  async saveSemester(matricNumber, semesterData) {
    if (!db) return null;
    const ref = await db.collection('semesters').add({
      matricNumber,
      ...semesterData,
      savedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return ref.id;
  },

  async getSemesters(matricNumber) {
    if (!db) return null;
    const snap = await db.collection('semesters')
      .where('matricNumber', '==', matricNumber)
      .orderBy('savedAt', 'asc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
};

window.DB = DB;

// Auto-initialize when script loads
if (typeof firebase !== 'undefined') {
  initFirebase();
} else {
  // Firebase SDK not loaded yet — wait for it
  window.addEventListener('load', () => {
    if (typeof firebase !== 'undefined') {
      initFirebase();
    } else {
      window.ACADEX_MODE = 'demo';
      console.warn("AcadEx: Firebase SDK not found. Running in DEMO mode.");
    }
  });
}
