// ============================================
// ACADEX — Global App Logic (UPGRADED v2)
// app.js — Supports Firebase LIVE + DEMO fallback
// ============================================

const AcadEx = {

  detectLevel(matricNumber) {
    if (!matricNumber || matricNumber.length < 2) return null;
    const prefix = parseInt(matricNumber.substring(0, 2));
    const currentYear = new Date().getFullYear() % 100;
    const yearDiff = currentYear - prefix;
    if (yearDiff <= 0) return null;
    if (yearDiff === 1) return 100;
    if (yearDiff === 2) return 200;
    if (yearDiff === 3) return 300;
    if (yearDiff === 4) return 400;
    if (yearDiff >= 5) return 500;
    return null;
  },

  getLevelLabel(level) {
    const labels = { 100: '100 Level', 200: '200 Level', 300: '300 Level', 400: '400 Level', 500: '500 Level' };
    return labels[level] || 'Unknown Level';
  },

  saveSession(user) { localStorage.setItem('acadex_user', JSON.stringify(user)); },
  getSession() { const d = localStorage.getItem('acadex_user'); return d ? JSON.parse(d) : null; },
  clearSession() { localStorage.removeItem('acadex_user'); },

  requireAuth() {
    const user = this.getSession();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
  },

  requireLecturer() {
    const user = this.getSession();
    if (!user || user.role !== 'lecturer') { window.location.href = 'login.html'; return null; }
    return user;
  },

  mockUsers: [
    { matricNumber: '252604033', name: 'Abdulhakeem Ahmad Folorunso', password: 'student123', role: 'student', faculty: 'Sciences', department: 'Mathematics', email: 'abdulhakeem@unilag.edu.ng' },
    { matricNumber: '242503021', name: 'Fatima Bello', password: 'student123', role: 'student', faculty: 'Law', department: 'Law', email: 'fatima@unilag.edu.ng' },
    { matricNumber: '232402010', name: 'Chukwuemeka Obi', password: 'student123', role: 'student', faculty: 'Engineering', department: 'Electrical Engineering', email: 'emeka@unilag.edu.ng' },
    { matricNumber: '222301005', name: 'Amina Yusuf', password: 'student123', role: 'student', faculty: 'Sciences', department: 'Physics', email: 'amina@unilag.edu.ng' },
    { matricNumber: '212200018', name: 'Tunde Afolabi', password: 'student123', role: 'student', faculty: 'Business Administration', department: 'Accounting', email: 'tunde@unilag.edu.ng' },
    { id: 'LEC001', name: 'Dr. Rasheed Adeyemi', password: 'lecturer123', role: 'lecturer', faculty: 'Sciences', department: 'Mathematics', email: 'r.adeyemi@unilag.edu.ng', staffId: 'LEC/2024/001' }
  ],

  async login(identifier, password) {
    if (window.ACADEX_MODE === 'live' && typeof auth !== 'undefined' && auth) {
      try {
        let email = identifier;
        if (!identifier.includes('@')) {
          const userDoc = await DB.getUserByMatric(identifier);
          if (!userDoc) return { success: false, message: 'No account found with this matric number.' };
          email = userDoc.email;
        }
        const cred = await auth.signInWithEmailAndPassword(email, password);
        const userData = await DB.getUser(cred.user.uid);
        if (!userData) return { success: false, message: 'Account data not found. Contact support.' };
        if (userData.role === 'student') {
          userData.level = this.detectLevel(userData.matricNumber);
          userData.levelLabel = this.getLevelLabel(userData.level);
        }
        this.saveSession({ ...userData, uid: cred.user.uid });
        return { success: true, user: userData };
      } catch (e) {
        const msgs = { 'auth/user-not-found': 'No account found.', 'auth/wrong-password': 'Incorrect password.', 'auth/too-many-requests': 'Too many attempts. Try later.' };
        return { success: false, message: msgs[e.code] || 'Login failed. Please try again.' };
      }
    }
    // DEMO MODE
    const localUsers = JSON.parse(localStorage.getItem('acadex_registered_users') || '[]');
    const allUsers = [...this.mockUsers, ...localUsers];
    const user = allUsers.find(u => (u.matricNumber === identifier || u.staffId === identifier || u.email === identifier) && u.password === password);
    if (!user) return { success: false, message: 'Invalid credentials. Check your matric number and password.' };
    if (user.role === 'student') { user.level = this.detectLevel(user.matricNumber); user.levelLabel = this.getLevelLabel(user.level); }
    const sessionUser = { ...user }; delete sessionUser.password;
    this.saveSession(sessionUser);
    return { success: true, user: sessionUser };
  },

  async signup(userData) {
    const { matricNumber, name, faculty, department, password, email } = userData;
    if (window.ACADEX_MODE === 'live' && typeof auth !== 'undefined' && auth) {
      try {
        const cred = await auth.createUserWithEmailAndPassword(email, password);
        const level = this.detectLevel(matricNumber);
        await DB.createUser(cred.user.uid, { matricNumber, name, faculty, department, email, role: 'student', level, levelLabel: this.getLevelLabel(level) });
        return { success: true };
      } catch (e) {
        const msgs = { 'auth/email-already-in-use': 'Email already in use.', 'auth/weak-password': 'Password too weak.' };
        return { success: false, message: msgs[e.code] || 'Signup failed.' };
      }
    }
    // DEMO MODE
    const localUsers = JSON.parse(localStorage.getItem('acadex_registered_users') || '[]');
    if ([...this.mockUsers, ...localUsers].find(u => u.matricNumber === matricNumber)) return { success: false, message: 'Account with this matric already exists.' };
    const level = this.detectLevel(matricNumber);
    localUsers.push({ matricNumber, name, password, faculty, department, email: email || `${matricNumber}@unilag.edu.ng`, role: 'student', level, levelLabel: this.getLevelLabel(level) });
    localStorage.setItem('acadex_registered_users', JSON.stringify(localUsers));
    return { success: true };
  },

  logout() {
    if (window.ACADEX_MODE === 'live' && typeof auth !== 'undefined') auth.signOut().catch(() => {});
    this.clearSession();
    window.location.href = 'login.html';
  },

  redirectByRole(user) {
    if (user.role === 'lecturer') { window.location.href = 'lecturer-dashboard.html'; return; }
    const dashboards = { 100: 'dashboard-100.html', 200: 'dashboard-200.html', 300: 'dashboard-300.html', 400: 'dashboard-400.html', 500: 'dashboard-500.html' };
    window.location.href = dashboards[user.level] || 'dashboard-200.html';
  },

  showToast(message, type = 'info') {
    const existing = document.querySelector('.acadex-toast');
    if (existing) existing.remove();
    const colors = { info: '#1A3C6E', success: '#00C9A7', error: '#FF4D4F', warning: '#FFB800' };
    const toast = document.createElement('div');
    toast.className = 'acadex-toast';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${colors[type]};color:white;padding:14px 20px;border-radius:12px;font-family:'Satoshi',sans-serif;font-size:14px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,.15);z-index:9999;animation:slideInToast .3s ease both;max-width:320px;`;
    toast.textContent = message;
    document.head.insertAdjacentHTML('beforeend', `<style>@keyframes slideInToast{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}</style>`);
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity .3s'; setTimeout(() => toast.remove(), 300); }, 3500);
  },

  setLoading(btn, loading, text = 'Loading...') {
    if (loading) { btn.disabled = true; btn.dataset.originalText = btn.innerHTML; btn.innerHTML = `<span class="spinner"></span> ${text}`; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.originalText || text; }
  },

  populateNav(user) {
    const nameEl = document.getElementById('navUserName');
    const avatarEl = document.getElementById('navAvatar');
    const levelEl = document.getElementById('navLevel');
    if (nameEl) nameEl.textContent = user.name.split(' ')[0];
    if (avatarEl) avatarEl.textContent = this.getInitials(user.name);
    if (levelEl) levelEl.textContent = user.levelLabel || user.role;
  },

  mockCBTQuestions: [
    { id: 1, question: "Which of the following is NOT a property of real numbers?", options: ["Commutativity", "Associativity", "Distributivity", "Reflexivity of multiplication"], correct: 3, explanation: "Reflexivity is a property of relations (like equality), not a fundamental property of real number operations." },
    { id: 2, question: "What is the derivative of f(x) = x³ - 3x² + 2x - 1?", options: ["3x² - 6x + 2", "3x² - 3x + 2", "x² - 6x + 2", "3x³ - 6x + 2"], correct: 0, explanation: "Using the power rule: d/dx(x³)=3x², d/dx(-3x²)=-6x, d/dx(2x)=2, d/dx(-1)=0. Result: 3x² - 6x + 2." },
    { id: 3, question: "The set of all rational numbers is denoted by:", options: ["ℕ", "ℤ", "ℚ", "ℝ"], correct: 2, explanation: "ℚ represents rational numbers (fractions p/q). ℕ=naturals, ℤ=integers, ℝ=reals." },
    { id: 4, question: "If A and B are two sets such that A ⊆ B, then A ∪ B equals:", options: ["A", "B", "A ∩ B", "∅"], correct: 1, explanation: "If A ⊆ B, every element of A is in B. So A ∪ B = B." },
    { id: 5, question: "What is the value of lim(x→0) [sin(x)/x]?", options: ["0", "∞", "1", "undefined"], correct: 2, explanation: "As x→0, sin(x)/x→1. Proven via squeeze theorem or L'Hôpital's rule." }
  ],

  mockMaterials: [
    { id: 1, title: 'MTH 101 - Course Outline', course: 'MTH 101', type: 'PDF', size: '1.2 MB', date: '2026-01-15', lecturer: 'Dr. Adeyemi' },
    { id: 2, title: 'CHM 101 - Lecture Notes Week 1-4', course: 'CHM 101', type: 'PDF', size: '3.4 MB', date: '2026-01-20', lecturer: 'Dr. Okafor' },
    { id: 3, title: 'PHY 101 - Introduction to Mechanics', course: 'PHY 101', type: 'PDF', size: '2.1 MB', date: '2026-01-22', lecturer: 'Dr. Balogun' },
    { id: 4, title: 'GST 101 - Use of English Notes', course: 'GST 101', type: 'PDF', size: '0.8 MB', date: '2026-01-25', lecturer: 'Dr. Eze' },
    { id: 5, title: 'BIO 101 - Cell Biology Slides', course: 'BIO 101', type: 'PPT', size: '5.6 MB', date: '2026-02-01', lecturer: 'Dr. Nwosu' },
  ],

  mockPastQuestions: [
    { id: 1, course: 'MTH 201', title: '2024/2025 First Semester', year: '2024/2025', semester: 'First', questions: 40 },
    { id: 2, course: 'STA 201', title: '2024/2025 First Semester', year: '2024/2025', semester: 'First', questions: 50 },
    { id: 3, course: 'CSC 201', title: '2024/2025 First Semester', year: '2024/2025', semester: 'First', questions: 45 },
  ],

  formatDate(dateStr) { return new Date(dateStr).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }); },
  getInitials(name) { return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(); }
};

window.AcadEx = AcadEx;
