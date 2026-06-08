// ============================================
// ACADEX — Dark Mode System
// darkmode.js — Include on every page
// ============================================

const DarkMode = {

  // ---- STATE ----
  isDark: false,

  // ---- INIT ----
  init() {
    this.loadState();
    this.injectButton();
    this.applyState(false);
  },

  // ---- LOAD & SAVE ----
  loadState() {
    const saved = localStorage.getItem('acadex_darkmode');
    if (saved !== null) {
      this.isDark = saved === 'true';
    } else {
      // Respect system preference on first visit
      this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  },

  saveState() {
    localStorage.setItem('acadex_darkmode', this.isDark);
  },

  // ---- APPLY ----
  applyState(animate = true) {
    if (animate) {
      document.body.style.transition = 'background 0.3s, color 0.3s';
      setTimeout(() => { document.body.style.transition = ''; }, 400);
    }

    document.body.classList.toggle('dark', this.isDark);
    this.updateButton();
  },

  // ---- TOGGLE ----
  toggle() {
    this.isDark = !this.isDark;
    this.saveState();
    this.applyState(true);
  },

  // ---- INJECT BUTTON ----
  injectButton() {
    if (document.getElementById('darkModeBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'darkModeBtn';
    btn.className = 'dark-mode-btn';
    btn.setAttribute('aria-label', 'Toggle dark mode');
    btn.setAttribute('title', 'Toggle dark mode');
    btn.onclick = () => DarkMode.toggle();
    btn.innerHTML = this.getIcon();
    document.body.appendChild(btn);
  },

  // ---- UPDATE BUTTON ICON ----
  updateButton() {
    const btn = document.getElementById('darkModeBtn');
    if (btn) btn.innerHTML = this.getIcon();
  },

  // ---- ICON ----
  getIcon() {
    if (this.isDark) {
      // Sun icon — click to go light
      return `<svg viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/>
        <line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/>
        <line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>`;
    } else {
      // Moon icon — click to go dark
      return `<svg viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
      </svg>`;
    }
  },
};

// ---- AUTO INIT ----
document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
});

// Listen for system preference changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (localStorage.getItem('acadex_darkmode') === null) {
    DarkMode.isDark = e.matches;
    DarkMode.applyState(true);
  }
});
