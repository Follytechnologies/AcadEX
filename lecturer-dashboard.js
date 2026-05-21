// ACADEX — Lecturer Dashboard Logic

const courseData = [
  { course: 'MTH 101', students: 124, avgScore: 68, passRate: 74, appeals: 2 },
  { course: 'MTH 201', students: 89, avgScore: 72, passRate: 81, appeals: 0 },
  { course: 'MTH 301', students: 34, avgScore: 61, passRate: 65, appeals: 1 },
];

const recentAppealsData = [
  { id: 'AX-2026-001', student: 'Abdulhakeem Jimoh', test: 'MTH 101 — Quiz 1', question: 'Q3', status: 'pending', date: '2026-05-10' },
  { id: 'AX-2026-002', student: 'Fatima Bello', test: 'MTH 101 — Week 3 Test', question: 'Q5', status: 'pending', date: '2026-05-12' },
];

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  if (user.role !== 'lecturer') { AcadEx.redirectByRole(user); return; }

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name;
  document.getElementById('navDept').textContent = user.department;
  document.getElementById('lecName').textContent = user.name;
  document.getElementById('lecStaffId').textContent = user.staffId;
  document.getElementById('lecDept').textContent = user.department;
  document.getElementById('lecFaculty').textContent = user.faculty;
  document.getElementById('pendingAppeals').textContent = recentAppealsData.filter(a => a.status === 'pending').length;

  renderRecentAppeals();
  renderCoursePerformance();
});

function renderRecentAppeals() {
  const container = document.getElementById('recentAppeals');
  container.innerHTML = recentAppealsData.map(a => `
    <div class="appeal-mini">
      <div class="appeal-mini-top">
        <div class="appeal-mini-name">${a.student}</div>
        <span class="badge" style="background:rgba(255,184,0,.15);color:#8C6400;font-size:11px">Pending</span>
      </div>
      <div class="appeal-mini-meta">${a.test} · ${a.question} · ${AcadEx.formatDate(a.date)}</div>
    </div>
  `).join('');
}

function renderCoursePerformance() {
  document.getElementById('coursePerformance').innerHTML = courseData.map(c => `
    <tr>
      <td><span class="badge badge-primary">${c.course}</span></td>
      <td style="font-weight:600">${c.students}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress" style="width:80px;height:6px"><div class="progress-fill" style="width:${c.avgScore}%"></div></div>
          <span style="font-size:13px;font-weight:600">${c.avgScore}%</span>
        </div>
      </td>
      <td><span style="font-weight:600;color:${c.passRate>=75?'var(--accent)':c.passRate>=60?'var(--gold)':'var(--danger)'}">${c.passRate}%</span></td>
      <td>${c.appeals > 0 ? `<span class="badge badge-danger">${c.appeals}</span>` : '<span class="badge badge-accent">0</span>'}</td>
    </tr>
  `).join('');
}
