// ============================================
// ACADEX — 100 Level Dashboard Logic
// ============================================

// Mock test history for 100 Level student
const recentTests = [
  { id: 1, name: 'MTH 101 — Week 3 Test', course: 'MTH 101', score: 85, total: 100, date: '2026-05-10', status: 'reviewed' },
  { id: 2, name: 'CHM 101 — Mid-Semester Test', course: 'CHM 101', score: 62, total: 100, date: '2026-05-05', status: 'reviewed' },
  { id: 3, name: 'PHY 101 — Quiz 1', course: 'PHY 101', score: 48, total: 100, date: '2026-04-28', status: 'appeal_pending' },
];

// Fresher checklist items
const checklistItems = [
  { id: 'c1', label: 'Complete course registration', done: true },
  { id: 'c2', label: 'Download your course outlines', done: true },
  { id: 'c3', label: 'Take your first CBT practice test', done: false },
  { id: 'c4', label: 'Read the Student Guide', done: false },
  { id: 'c5', label: 'Join your faculty WhatsApp group', done: false },
];

// Load checklist state from localStorage
function loadChecklistState() {
  const saved = localStorage.getItem('acadex_checklist');
  if (saved) {
    const state = JSON.parse(saved);
    checklistItems.forEach(item => {
      if (state[item.id] !== undefined) item.done = state[item.id];
    });
  }
}

// Save checklist state to localStorage
function saveChecklistState() {
  const state = {};
  checklistItems.forEach(item => { state[item.id] = item.done; });
  localStorage.setItem('acadex_checklist', JSON.stringify(state));
}

// Populate user info in nav
function populateNav(user) {
  const firstName = user.name.split(' ')[0];
  document.getElementById('navUserName').textContent = user.name;
  document.getElementById('navMatric').textContent = user.matricNumber;
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('firstName').textContent = firstName;
  document.getElementById('levelChip').textContent = user.levelLabel;
}

// Populate stats
function populateStats() {
  document.getElementById('statTests').textContent = recentTests.length;

  const avg = Math.round(recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length);
  document.getElementById('statAvg').textContent = avg + '%';

  const appeals = recentTests.filter(t => t.status === 'appeal_pending').length;
  document.getElementById('statAppeals').textContent = appeals;

  document.getElementById('statMaterials').textContent = AcadEx.mockMaterials.length;
}

// Get score class based on percentage
function getScoreClass(score) {
  if (score >= 70) return 'score-high';
  if (score >= 50) return 'score-mid';
  return 'score-low';
}

// Populate recent tests
function populateTests() {
  const container = document.getElementById('testList');

  if (recentTests.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:32px; color:var(--ink-faint);">
        <div style="font-size:32px; margin-bottom:8px;">📋</div>
        <p>No tests taken yet. <a href="cbt.html" style="color:var(--primary); font-weight:600;">Take your first test →</a></p>
      </div>`;
    return;
  }

  container.innerHTML = recentTests.map(test => `
    <div class="test-item" onclick="window.location.href='review.html?id=${test.id}'">
      <div class="test-score-ring ${getScoreClass(test.score)}">
        ${test.score}%
      </div>
      <div class="test-info">
        <div class="test-name">${test.name}</div>
        <div class="test-meta">
          ${AcadEx.formatDate(test.date)}
          ${test.status === 'appeal_pending' ? ' · <span style="color:var(--gold); font-weight:600;">Appeal Pending</span>' : ''}
        </div>
      </div>
      <div class="test-action">Review →</div>
    </div>
  `).join('');
}

// Populate materials table
function populateMaterials() {
  const tbody = document.getElementById('materialsBody');

  tbody.innerHTML = AcadEx.mockMaterials.slice(0, 4).map(mat => `
    <tr>
      <td>
        <div style="font-weight:600; color:var(--ink); font-size:13px;">${mat.title}</div>
        <div style="font-size:11px; color:var(--ink-faint);">${mat.lecturer}</div>
      </td>
      <td><span class="badge badge-primary">${mat.course}</span></td>
      <td><span class="badge badge-accent">${mat.type}</span></td>
      <td style="font-size:12px; color:var(--ink-muted);">${AcadEx.formatDate(mat.date)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="AcadEx.showToast('Downloading ${mat.title}...', 'info')">
          ⬇ Download
        </button>
      </td>
    </tr>
  `).join('');
}

// Populate checklist
function populateChecklist() {
  loadChecklistState();
  const container = document.getElementById('checklist');
  const doneCount = checklistItems.filter(i => i.done).length;

  document.getElementById('checklistProgress').textContent = `${doneCount} / ${checklistItems.length} done`;

  container.innerHTML = checklistItems.map(item => `
    <div class="check-item ${item.done ? 'done' : ''}" onclick="toggleCheck('${item.id}')">
      <div class="check-box">${item.done ? '✓' : ''}</div>
      <span class="check-label">${item.label}</span>
    </div>
  `).join('');
}

// Toggle checklist item
function toggleCheck(id) {
  const item = checklistItems.find(i => i.id === id);
  if (item) {
    item.done = !item.done;
    saveChecklistState();
    populateChecklist();
    if (item.done) {
      AcadEx.showToast('Great job! Keep going 💪', 'success');
    }
  }
}

// Initialize dashboard
function init() {
  const user = AcadEx.requireAuth();
  if (!user) return;

  // Redirect if not 100 level student
  if (user.role !== 'student' || user.level !== 100) {
    AcadEx.redirectByRole(user);
    return;
  }

  populateNav(user);
  populateStats();
  populateTests();
  populateMaterials();
  populateChecklist();
}

// Run on load
window.addEventListener('load', init);
