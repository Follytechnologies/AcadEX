// ============================================
// ACADEX — Accessibility System
// accessibility.js — Include on every page
// ============================================

const A11y = {

  // ---- STATE ----
  state: {
    highContrast: false,
    fontSize: 'medium',
    ttsEnabled: false,
    readingGuide: false,
    speaking: false,
  },

  // ---- INIT ----
  init() {
    this.loadState();
    this.injectPanel();
    this.injectReadingLine();
    this.applyState();
    this.bindKeyboard();
    this.bindMouseReadingGuide();
  },

  // ---- SAVE & LOAD STATE ----
  saveState() {
    localStorage.setItem('acadex_a11y', JSON.stringify(this.state));
  },

  loadState() {
    const saved = localStorage.getItem('acadex_a11y');
    if (saved) {
      try { this.state = { ...this.state, ...JSON.parse(saved) }; } catch(e) {}
    }
  },

  // ---- APPLY STATE TO DOM ----
  applyState() {
    const body = document.body;

    // High contrast
    body.classList.toggle('high-contrast', this.state.highContrast);

    // Font size
    body.classList.remove('font-small', 'font-medium', 'font-large');
    body.classList.add(`font-${this.state.fontSize}`);

    // Reading guide
    body.classList.toggle('reading-guide', this.state.readingGuide);

    // Update panel toggles if panel exists
    const hcToggle = document.getElementById('a11yHighContrast');
    const rgToggle = document.getElementById('a11yReadingGuide');
    if (hcToggle) hcToggle.checked = this.state.highContrast;
    if (rgToggle) rgToggle.checked = this.state.readingGuide;

    // Font buttons
    ['small', 'medium', 'large'].forEach(size => {
      const btn = document.getElementById(`a11yFont${size.charAt(0).toUpperCase() + size.slice(1)}`);
      if (btn) btn.classList.toggle('active', this.state.fontSize === size);
    });
  },

  // ---- INJECT PANEL INTO PAGE ----
  injectPanel() {
    if (document.getElementById('a11yPanel')) return;

    const panelHTML = `
      <!-- Accessibility Reading Line -->
      <div class="a11y-reading-line" id="a11yReadingLine"></div>

      <!-- Toggle Button -->
      <button class="a11y-toggle" id="a11yToggle" onclick="A11y.togglePanel()"
        aria-label="Accessibility Options" title="Accessibility Options">
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="4" r="2"/>
          <path d="M19 13a7 7 0 01-7 7 7 7 0 01-7-7"/>
          <path d="M12 13V6"/>
          <path d="M8 9l4-3 4 3"/>
        </svg>
      </button>

      <!-- Panel -->
      <div class="a11y-panel" id="a11yPanel" role="dialog" aria-label="Accessibility Settings">
        <div class="a11y-panel-header">
          <div>
            <div class="a11y-panel-title">Accessibility</div>
            <div class="a11y-panel-subtitle">Customise your experience</div>
          </div>
        </div>

        <!-- High Contrast -->
        <div class="a11y-feature">
          <div class="a11y-feature-left">
            <div class="a11y-feature-icon" style="background:rgba(26,60,110,0.08);color:var(--primary)">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 010 20V2z" fill="currentColor"/></svg>
            </div>
            <div class="a11y-feature-text">
              <strong>High Contrast</strong>
              <span>For low vision users</span>
            </div>
          </div>
          <label class="a11y-switch">
            <input type="checkbox" id="a11yHighContrast" onchange="A11y.toggleHighContrast(this.checked)">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <!-- Text to Speech -->
        <div class="a11y-feature">
          <div class="a11y-feature-left">
            <div class="a11y-feature-icon" style="background:rgba(0,201,167,0.08);color:var(--accent)">
              <svg viewBox="0 0 24 24"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
            </div>
            <div class="a11y-feature-text">
              <strong>Text to Speech</strong>
              <span>Read page content aloud</span>
              <div class="a11y-tts-status" id="a11yTtsStatus">Speaking...</div>
            </div>
          </div>
          <label class="a11y-switch">
            <input type="checkbox" id="a11yTTS" onchange="A11y.toggleTTS(this.checked)">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <!-- Reading Guide -->
        <div class="a11y-feature">
          <div class="a11y-feature-left">
            <div class="a11y-feature-icon" style="background:rgba(255,184,0,0.1);color:var(--gold)">
              <svg viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </div>
            <div class="a11y-feature-text">
              <strong>Reading Guide</strong>
              <span>Line follows your cursor</span>
            </div>
          </div>
          <label class="a11y-switch">
            <input type="checkbox" id="a11yReadingGuide" onchange="A11y.toggleReadingGuide(this.checked)">
            <span class="a11y-switch-slider"></span>
          </label>
        </div>

        <!-- Font Size -->
        <div class="a11y-feature">
          <div class="a11y-feature-left">
            <div class="a11y-feature-icon" style="background:rgba(255,77,79,0.07);color:var(--danger)">
              <svg viewBox="0 0 24 24"><polyline points="4,7 4,4 20,4 20,7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
            </div>
            <div class="a11y-feature-text">
              <strong>Font Size</strong>
              <span>Adjust text size</span>
            </div>
          </div>
          <div class="a11y-font-controls">
            <button class="a11y-font-btn small" id="a11yFontSmall" onclick="A11y.setFontSize('small')" title="Small text">A</button>
            <button class="a11y-font-btn medium active" id="a11yFontMedium" onclick="A11y.setFontSize('medium')" title="Medium text">A</button>
            <button class="a11y-font-btn large" id="a11yFontLarge" onclick="A11y.setFontSize('large')" title="Large text">A</button>
          </div>
        </div>

        <!-- Read Page Button -->
        <button onclick="A11y.readPage()" style="
          width:100%; margin-top:14px; padding:11px;
          background:var(--primary); color:white;
          border:none; border-radius:10px;
          font-family:'Satoshi',sans-serif; font-size:13px;
          font-weight:600; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:background 0.2s;
        " onmouseover="this.style.background='#2557A7'" onmouseout="this.style.background='var(--primary)'">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>
          Read This Page
        </button>

        <button onclick="A11y.stopReading()" style="
          width:100%; margin-top:8px; padding:11px;
          background:transparent; color:var(--danger);
          border:1.5px solid rgba(255,77,79,0.3); border-radius:10px;
          font-family:'Satoshi',sans-serif; font-size:13px;
          font-weight:600; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:8px;
          transition:all 0.2s;
        " onmouseover="this.style.background='rgba(255,77,79,0.05)'" onmouseout="this.style.background='transparent'">
          Stop Reading
        </button>

        <!-- Reset -->
        <div style="text-align:center; margin-top:14px;">
          <button onclick="A11y.reset()" style="font-size:12px;color:var(--ink-faint);background:none;border:none;cursor:pointer;font-family:'Satoshi',sans-serif;">
            Reset to defaults
          </button>
        </div>
      </div>
    `;

    const wrapper = document.createElement('div');
    wrapper.innerHTML = panelHTML;
    document.body.appendChild(wrapper);

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('a11yPanel');
      const toggle = document.getElementById('a11yToggle');
      if (panel && toggle && !panel.contains(e.target) && !toggle.contains(e.target)) {
        panel.classList.remove('open');
      }
    });
  },

  // ---- INJECT READING LINE ----
  injectReadingLine() {
    if (!document.getElementById('a11yReadingLine')) {
      const line = document.createElement('div');
      line.className = 'a11y-reading-line';
      line.id = 'a11yReadingLine';
      document.body.appendChild(line);
    }
  },

  // ---- TOGGLE PANEL ----
  togglePanel() {
    const panel = document.getElementById('a11yPanel');
    if (panel) panel.classList.toggle('open');
  },

  // ---- HIGH CONTRAST ----
  toggleHighContrast(enabled) {
    this.state.highContrast = enabled;
    document.body.classList.toggle('high-contrast', enabled);
    this.saveState();
    this.showToast(enabled ? 'High contrast mode on' : 'High contrast mode off');
  },

  // ---- FONT SIZE ----
  setFontSize(size) {
    this.state.fontSize = size;
    document.body.classList.remove('font-small', 'font-medium', 'font-large');
    document.body.classList.add(`font-${size}`);
    ['Small', 'Medium', 'Large'].forEach(s => {
      const btn = document.getElementById(`a11yFont${s}`);
      if (btn) btn.classList.toggle('active', s.toLowerCase() === size);
    });
    this.saveState();
    this.showToast(`Text size: ${size}`);
  },

  // ---- TEXT TO SPEECH ----
  toggleTTS(enabled) {
    this.state.ttsEnabled = enabled;
    if (!enabled) this.stopReading();
    this.saveState();
    this.showToast(enabled ? 'Text to speech on — click "Read This Page"' : 'Text to speech off');
  },

  readPage() {
    if (!('speechSynthesis' in window)) {
      this.showToast('Text to speech not supported in this browser');
      return;
    }

    // Get readable content
    const selectors = [
      '.page-title', '.page-subtitle',
      '.welcome-title', '.welcome-sub',
      '.q-text', '.option-text',
      '.card-title', '.stat-label', '.stat-value',
      '.hero-title', '.hero-subtitle',
      'h1', 'h2', 'h3', 'p'
    ];

    let textToRead = '';
    const seen = new Set();

    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const text = el.textContent.trim();
        if (text && !seen.has(text) && text.length > 3) {
          seen.add(text);
          textToRead += text + '. ';
        }
      });
    });

    if (!textToRead) {
      textToRead = document.body.innerText.substring(0, 2000);
    }

    this.speak(textToRead);
  },

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Prefer an English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en') && v.name.includes('Female'))
      || voices.find(v => v.lang.startsWith('en'))
      || voices[0];
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => {
      this.state.speaking = true;
      const status = document.getElementById('a11yTtsStatus');
      if (status) status.classList.add('speaking');
      const toggle = document.getElementById('a11yToggle');
      if (toggle) toggle.style.background = 'var(--accent)';
    };

    utterance.onend = () => {
      this.state.speaking = false;
      const status = document.getElementById('a11yTtsStatus');
      if (status) status.classList.remove('speaking');
      const toggle = document.getElementById('a11yToggle');
      if (toggle) toggle.style.background = '';
    };

    window.speechSynthesis.speak(utterance);
  },

  stopReading() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.state.speaking = false;
    const status = document.getElementById('a11yTtsStatus');
    if (status) status.classList.remove('speaking');
    const toggle = document.getElementById('a11yToggle');
    if (toggle) toggle.style.background = '';
  },

  // ---- READING GUIDE ----
  toggleReadingGuide(enabled) {
    this.state.readingGuide = enabled;
    document.body.classList.toggle('reading-guide', enabled);
    this.saveState();
    this.showToast(enabled ? 'Reading guide on — move your mouse' : 'Reading guide off');
  },

  bindMouseReadingGuide() {
    document.addEventListener('mousemove', (e) => {
      if (!this.state.readingGuide) return;
      const line = document.getElementById('a11yReadingLine');
      if (line) line.style.top = (e.clientY + window.scrollY) + 'px';
    });
  },

  // ---- KEYBOARD NAVIGATION ----
  bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      document.body.classList.add('keyboard-nav');

      // Alt + A = open accessibility panel
      if (e.altKey && e.key === 'a') {
        e.preventDefault();
        this.togglePanel();
      }

      // Alt + C = toggle high contrast
      if (e.altKey && e.key === 'c') {
        e.preventDefault();
        this.toggleHighContrast(!this.state.highContrast);
        const toggle = document.getElementById('a11yHighContrast');
        if (toggle) toggle.checked = this.state.highContrast;
      }

      // Alt + R = read page
      if (e.altKey && e.key === 'r') {
        e.preventDefault();
        this.readPage();
      }

      // Escape = stop reading / close panel
      if (e.key === 'Escape') {
        this.stopReading();
        const panel = document.getElementById('a11yPanel');
        if (panel) panel.classList.remove('open');
      }
    });

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-nav');
    });
  },

  // ---- RESET ----
  reset() {
    this.stopReading();
    this.state = { highContrast: false, fontSize: 'medium', ttsEnabled: false, readingGuide: false, speaking: false };
    this.saveState();
    this.applyState();
    // Uncheck toggles
    ['a11yHighContrast', 'a11yTTS', 'a11yReadingGuide'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.checked = false;
    });
    this.showToast('Accessibility settings reset');
  },

  // ---- TOAST ----
  showToast(msg) {
    const existing = document.querySelector('.a11y-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'a11y-toast';
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:160px; right:20px;
      background:#1A3C6E; color:white;
      padding:10px 16px; border-radius:10px;
      font-size:13px; font-weight:500;
      font-family:'Satoshi',sans-serif;
      box-shadow:0 4px 20px rgba(0,0,0,0.15);
      z-index:600; animation:fadeUp 0.3s ease both;
      max-width:240px;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
};

// ---- AUTO INIT ----
document.addEventListener('DOMContentLoaded', () => {
  A11y.init();
});
