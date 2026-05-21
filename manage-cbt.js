// ACADEX — Manage CBT Logic
let tests = JSON.parse(localStorage.getItem('acadex_lec_tests') || 'null') || [
  { id: 1, title: 'MTH 101 — Week 3 Test', course: 'MTH 101', duration: 10, questions: 5, students: 124, avgScore: 68, status: 'completed', date: '2026-05-10' },
  { id: 2, title: 'MTH 101 — Mid-Semester', course: 'MTH 101', duration: 60, questions: 30, students: 120, avgScore: 71, status: 'completed', date: '2026-04-20' },
  { id: 3, title: 'MTH 201 — Quiz 1', course: 'MTH 201', duration: 20, questions: 10, students: 89, avgScore: 74, status: 'active', date: '2026-05-15' },
];

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user || user.role !== 'lecturer') { AcadEx.redirectByRole(user); return; }
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name;
  renderTests();
});

function showCreateForm() { document.getElementById('createForm').style.display = 'block'; }
function hideCreateForm() { document.getElementById('createForm').style.display = 'none'; }

function createTest() {
  const title = document.getElementById('testTitle').value.trim();
  const course = document.getElementById('testCourse').value;
  const duration = parseInt(document.getElementById('testDuration').value);
  const questions = parseInt(document.getElementById('testQuestions').value);
  if (!title) { AcadEx.showToast('Please enter a test title', 'error'); return; }
  const newTest = { id: Date.now(), title, course, duration, questions, students: 0, avgScore: 0, status: 'active', date: new Date().toISOString().split('T')[0] };
  tests.unshift(newTest);
  localStorage.setItem('acadex_lec_tests', JSON.stringify(tests));
  hideCreateForm();
  renderTests();
  AcadEx.showToast(`"${title}" created successfully!`, 'success');
}

function renderTests() {
  document.getElementById('testsList').innerHTML = tests.map(t => `
    <div class="test-item">
      <div class="test-item-top">
        <div>
          <div class="test-item-title">${t.title}</div>
          <div class="test-item-meta">${t.course} · ${t.questions} questions · ${t.duration} mins · ${AcadEx.formatDate(t.date)}</div>
        </div>
        <span class="badge ${t.status === 'active' ? 'badge-accent' : 'badge-primary'}">${t.status === 'active' ? '🟢 Active' : '✓ Completed'}</span>
      </div>
      ${t.students > 0 ? `
      <div class="test-item-stats">
        <div class="test-stat"><div class="test-stat-val">${t.students}</div><div class="test-stat-label">Students</div></div>
        <div class="test-stat"><div class="test-stat-val">${t.avgScore}%</div><div class="test-stat-label">Avg Score</div></div>
        <div class="test-stat"><div class="test-stat-val">${Math.round(t.avgScore * 0.8)}%</div><div class="test-stat-label">Pass Rate</div></div>
      </div>` : '<div style="padding:10px 0;font-size:13px;color:var(--ink-faint)">No submissions yet</div>'}
      <div class="test-item-actions">
        <button class="btn btn-sm btn-outline" onclick="AcadEx.showToast('Viewing results for ${t.title}','info')">📊 View Results</button>
        <button class="btn btn-sm btn-outline" onclick="AcadEx.showToast('Editing ${t.title}','info')">✏️ Edit</button>
        ${t.status === 'active' ? `<button class="btn btn-sm btn-danger" onclick="AcadEx.showToast('${t.title} closed','success')">⏹ Close Test</button>` : ''}
      </div>
    </div>
  `).join('');
}
