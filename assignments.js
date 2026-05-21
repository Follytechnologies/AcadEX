// ACADEX — Assignments Logic

let assignments = JSON.parse(localStorage.getItem('acadex_assignments') || 'null') || [
  { id: 1, title: 'Integration Problem Set', course: 'MTH 201', desc: 'Solve 10 integration problems using substitution and integration by parts methods. Show all workings.', daysLeft: 2, status: 'pending', score: null, lecturer: 'Dr. Adeyemi' },
  { id: 2, title: 'Lab Report — Titration', course: 'CHM 201', desc: 'Write a full lab report on the acid-base titration experiment conducted in week 6. Include calculations and discussion.', daysLeft: 5, status: 'pending', score: null, lecturer: 'Dr. Okafor' },
  { id: 3, title: 'Statistics Project', course: 'STA 201', desc: 'Collect data from 30 students and analyse using descriptive statistics. Present findings in a structured report.', daysLeft: 12, status: 'submitted', score: null, lecturer: 'Dr. Ibrahim' },
  { id: 4, title: 'Essay — Nigerian Constitution', course: 'GST 201', desc: 'Write a 1500-word essay on the key principles of the 1999 Nigerian Constitution and its amendments.', daysLeft: 0, status: 'graded', score: 78, lecturer: 'Dr. Eze' },
];

let currentAssignmentId = null;
let currentFilter = 'all';

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  renderStats();
  renderAssignments();
});

function renderStats() {
  const pending = assignments.filter(a => a.status === 'pending').length;
  const submitted = assignments.filter(a => a.status === 'submitted').length;
  const graded = assignments.filter(a => a.status === 'graded').length;
  document.getElementById('assignStats').innerHTML = `
    <div class="astat"><span class="astat-val" style="color:var(--danger)">${pending}</span><span class="astat-label">Pending</span></div>
    <div class="astat"><span class="astat-val" style="color:var(--gold)">${submitted}</span><span class="astat-label">Submitted</span></div>
    <div class="astat"><span class="astat-val" style="color:var(--accent)">${graded}</span><span class="astat-label">Graded</span></div>
  `;
}

function renderAssignments(filter = currentFilter) {
  currentFilter = filter;
  const list = filter === 'all' ? assignments : assignments.filter(a => a.status === filter);
  const container = document.getElementById('assignmentsList');

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--ink-faint)"><div style="font-size:40px;margin-bottom:12px">📭</div><p>No ${filter} assignments.</p></div>`;
    return;
  }

  container.innerHTML = list.map(a => {
    const urgencyClass = a.status !== 'pending' ? a.status : a.daysLeft <= 2 ? 'urgent' : a.daysLeft <= 7 ? 'soon' : 'ok';
    const deadlineClass = a.status !== 'pending' ? 'deadline-done' : a.daysLeft <= 2 ? 'deadline-urgent' : a.daysLeft <= 7 ? 'deadline-soon' : 'deadline-ok';
    const deadlineText = a.status === 'graded' ? 'Graded' : a.status === 'submitted' ? 'Submitted' : a.daysLeft === 0 ? 'Due Today!' : `${a.daysLeft} days left`;

    return `
      <div class="assignment-card ${urgencyClass}">
        <div class="assign-card-top">
          <div class="assign-card-left">
            <div class="assign-title">${a.title}</div>
            <div class="assign-course">👤 ${a.lecturer} · <span class="badge badge-primary">${a.course}</span></div>
          </div>
          <div class="assign-status">
            ${a.status === 'graded' ? `<div class="assign-score">${a.score}/100</div>` : ''}
            <span class="badge ${a.status === 'pending' ? 'badge-danger' : a.status === 'submitted' ? 'badge-gold' : 'badge-accent'}">
              ${a.status === 'pending' ? '⏳ Pending' : a.status === 'submitted' ? '📤 Submitted' : '✅ Graded'}
            </span>
          </div>
        </div>
        <div class="assign-card-body">${a.desc}</div>
        <div class="assign-card-footer">
          <div class="assign-deadline ${deadlineClass}">📅 ${deadlineText}</div>
          ${a.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="openSubmitModal(${a.id})">📤 Submit Now</button>` : ''}
          ${a.status === 'submitted' ? `<span style="font-size:13px;color:var(--ink-faint)">Awaiting lecturer review</span>` : ''}
          ${a.status === 'graded' ? `<span style="font-size:13px;color:var(--accent);font-weight:600;">✓ Score received</span>` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function filterAssignments(filter, btn) {
  document.querySelectorAll('.assign-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAssignments(filter);
}

function openSubmitModal(id) {
  currentAssignmentId = id;
  const a = assignments.find(a => a.id === id);
  document.getElementById('submitModalTitle').textContent = `Submit: ${a.title}`;
  document.getElementById('submitModalCourse').textContent = `${a.course} · ${a.lecturer}`;
  document.getElementById('submissionText').value = '';
  document.getElementById('submitModal').classList.add('open');
}

function closeSubmitModal() {
  document.getElementById('submitModal').classList.remove('open');
  currentAssignmentId = null;
}

function confirmSubmit() {
  const text = document.getElementById('submissionText').value.trim();
  if (text.length < 10) { AcadEx.showToast('Please write your submission first', 'error'); return; }
  const a = assignments.find(a => a.id === currentAssignmentId);
  if (a) {
    a.status = 'submitted';
    localStorage.setItem('acadex_assignments', JSON.stringify(assignments));
  }
  closeSubmitModal();
  renderStats();
  renderAssignments();
  AcadEx.showToast('Assignment submitted successfully! 🎉', 'success');
}
