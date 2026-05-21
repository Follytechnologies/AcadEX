// ============================================
// ACADEX — Shared Navigation & Icons System
// nav.js — Include on every page
// ============================================

// ============ SVG ICON LIBRARY ============
const Icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>`,
  scale: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="21"/><path d="M3 6l9-3 9 3"/><path d="M3 18l9-3 9 3"/><path d="M3 6c0 3.314 2.686 6 6 6S15 9.314 15 6"/><path d="M9 18c0 3.314 2.686 6 6 6s6-2.686 6-6"/></svg>`,
  compass: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88 16.24,7.76"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10,9 9,9 8,9"/></svg>`,
  logout: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/></svg>`,
  trend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  users: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  award: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>`,
  eye: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  send: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
};

// Make icons globally accessible
window.Icons = Icons;

// ============ ICON HELPER ============
function icon(name, size = 18, color = 'currentColor') {
  const svg = Icons[name];
  if (!svg) return '';
  return svg.replace('<svg', `<svg width="${size}" height="${size}" style="color:${color}"`);
}
window.icon = icon;

// ============ INJECT SIDEBAR OVERLAY ============
function injectSidebarOverlay() {
  if (document.querySelector('.sidebar-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  overlay.id = 'sidebarOverlay';
  overlay.addEventListener('click', closeSidebar);
  document.body.appendChild(overlay);
}

// ============ INJECT HAMBURGER INTO NAV ============
function injectHamburger() {
  const nav = document.querySelector('.nav');
  if (!nav || document.querySelector('.hamburger')) return;

  const hamburger = document.createElement('button');
  hamburger.className = 'hamburger';
  hamburger.id = 'hamburger';
  hamburger.setAttribute('aria-label', 'Toggle menu');
  hamburger.innerHTML = `<span></span><span></span><span></span>`;
  hamburger.addEventListener('click', toggleSidebar);

  // Insert as first child of nav
  nav.insertBefore(hamburger, nav.firstChild);
}

// ============ INJECT MOBILE NAV ============
function injectMobileNav(type = 'student100') {
  if (document.querySelector('.mobile-nav')) return;

  const navConfigs = {
    student100: [
      { href: 'dashboard-100.html', icon: 'home', label: 'Home' },
      { href: 'cbt.html', icon: 'clipboard', label: 'CBT' },
      { href: 'review.html', icon: 'search', label: 'Review' },
      { href: 'appeal.html', icon: 'scale', label: 'Appeal' },
      { href: 'materials.html', icon: 'book', label: 'Materials' },
    ],
    student200: [
      { href: 'dashboard-200.html', icon: 'home', label: 'Home' },
      { href: 'past-questions.html', icon: 'book', label: 'Past Qs' },
      { href: 'gpa-tracker.html', icon: 'chart', label: 'GPA' },
      { href: 'assignments.html', icon: 'file', label: 'Tasks' },
      { href: 'materials.html', icon: 'folder', label: 'Materials' },
    ],
    lecturer: [
      { href: 'lecturer-dashboard.html', icon: 'home', label: 'Home' },
      { href: 'upload-materials.html', icon: 'upload', label: 'Upload' },
      { href: 'manage-cbt.html', icon: 'clipboard', label: 'CBT' },
      { href: 'appeals-manager.html', icon: 'scale', label: 'Appeals' },
    ],
  };

  const items = navConfigs[type] || navConfigs.student100;
  const currentPage = window.location.pathname.split('/').pop();

  const mobileNav = document.createElement('div');
  mobileNav.className = 'mobile-nav';
  mobileNav.innerHTML = `
    <div class="mobile-nav-inner">
      ${items.map(item => `
        <a href="${item.href}" class="mobile-nav-item ${currentPage === item.href ? 'active' : ''}">
          ${Icons[item.icon] || ''}
          <span>${item.label}</span>
        </a>
      `).join('')}
    </div>
  `;

  document.body.appendChild(mobileNav);
}

// ============ SIDEBAR TOGGLE ============
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  if (!sidebar) return;

  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add('open');
    overlay && overlay.classList.add('open');
    hamburger && hamburger.classList.add('open');
  }
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  sidebar && sidebar.classList.remove('open');
  overlay && overlay.classList.remove('open');
  hamburger && hamburger.classList.remove('open');
}

// Close sidebar on nav link click (mobile)
document.addEventListener('click', (e) => {
  const link = e.target.closest('.sidebar-link');
  if (link && window.innerWidth <= 768) {
    closeSidebar();
  }
});

// ============ UPDATE SIDEBAR ICONS ============
function updateSidebarIcons() {
  const iconMap = {
    'home': 'home', 'dashboard': 'home',
    'cbt': 'clipboard', 'test': 'clipboard',
    'review': 'search', 'results': 'search',
    'appeal': 'scale',
    'materials': 'book',
    'guide': 'compass', 'onboarding': 'compass',
    'past': 'folder', 'questions': 'folder',
    'gpa': 'chart', 'tracker': 'chart',
    'assignment': 'file',
    'upload': 'upload',
    'manage': 'settings',
    'appeals-manager': 'scale',
    'lecturer': 'users',
    'sign out': 'logout', 'logout': 'logout',
  };

  document.querySelectorAll('.sidebar-link').forEach(link => {
    const iconEl = link.querySelector('.icon');
    if (!iconEl) return;

    const text = link.textContent.toLowerCase();
    let iconName = 'file';

    for (const [key, val] of Object.entries(iconMap)) {
      if (text.includes(key)) { iconName = val; break; }
    }

    iconEl.innerHTML = Icons[iconName] || Icons.file;
    iconEl.style.cssText = 'width:18px;height:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;';
    iconEl.querySelector('svg') && (iconEl.querySelector('svg').style.cssText = 'width:18px;height:18px;');
  });
}

// ============ UPDATE NAV LINK ICONS ============
function updateNavIcons() {
  document.querySelectorAll('.nav-link').forEach(link => {
    // Strip existing emoji and replace with clean text
    link.textContent = link.textContent
      .replace(/[🏠📋🔍⚖️📚🧭📖📊📝📤]/g, '')
      .trim();
  });
}

// ============ INIT ============
document.addEventListener('DOMContentLoaded', () => {
  injectSidebarOverlay();
  injectHamburger();
  updateSidebarIcons();
  updateNavIcons();

  // Detect user type and inject correct mobile nav
  const user = AcadEx.getSession();
  if (user) {
    if (user.role === 'lecturer') {
      injectMobileNav('lecturer');
    } else if (user.level === 100) {
      injectMobileNav('student100');
    } else {
      injectMobileNav('student200');
    }
  }
});
