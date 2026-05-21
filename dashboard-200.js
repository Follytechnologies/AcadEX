// ACADEX — 200 Level Dashboard Logic

const deadlines = [
  { name: 'MTH 201 Assignment 2', course: 'MTH 201', daysLeft: 2, color: 'var(--danger)' },
  { name: 'STA 201 Lab Report', course: 'STA 201', daysLeft: 5, color: 'var(--gold)' },
  { name: 'CSC 201 Project', course: 'CSC 201', daysLeft: 12, color: 'var(--accent)' },
  { name: 'PHY 201 Mid-Semester', course: 'PHY 201', daysLeft: 18, color: 'var(--accent)' },
];

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  if (user.role !== 'student') { AcadEx.redirectByRole(user); return; }
  if (user.level === 100) { window.location.href = 'dashboard-100.html'; return; }

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  document.getElementById('navMatric').textContent = user.matricNumber;
  document.getElementById('firstName').textContent = user.name.split(' ')[0];
  document.getElementById('levelChip').textContent = user.levelLabel;
  document.getElementById('welcomeTag').textContent = `${user.levelLabel} · First Semester`;

  const cgpa = parseFloat(localStorage.getItem('acadex_cgpa') || '3.85');
  document.getElementById('cgpaDisplay').textContent = cgpa.toFixed(2);
  document.getElementById('statCGPA').textContent = cgpa.toFixed(2);
  document.getElementById('cgpaGrade').textContent = getGrade(cgpa);

  const dueThisWeek = deadlines.filter(d => d.daysLeft <= 7).length;
  document.getElementById('statAssignments').textContent = dueThisWeek;

  renderDeadlines();
  renderPQTable();
});

function getGrade(cgpa) {
  if (cgpa >= 4.5) return 'First Class';
  if (cgpa >= 3.5) return 'Second Class Upper';
  if (cgpa >= 2.4) return 'Second Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  return 'Pass';
}

function renderDeadlines() {
  document.getElementById('deadlinesList').innerHTML = deadlines.map(d => {
    const cls = d.daysLeft <= 3 ? 'days-urgent' : d.daysLeft <= 7 ? 'days-soon' : 'days-ok';
    return `
      <div class="deadline-item">
        <div class="deadline-dot" style="background:${d.color}"></div>
        <div class="deadline-info">
          <div class="deadline-name">${d.name}</div>
          <div class="deadline-meta">${d.course}</div>
        </div>
        <div class="deadline-days ${cls}">${d.daysLeft}d left</div>
      </div>`;
  }).join('');
}

function renderPQTable() {
  document.getElementById('pqTableBody').innerHTML = AcadEx.mockPastQuestions.map(pq => `
    <tr>
      <td><span class="badge badge-primary">${pq.course}</span></td>
      <td style="font-weight:600;font-size:13px;">${pq.title}</td>
      <td><span class="badge badge-accent">${pq.questions} Qs</span></td>
      <td><button class="btn btn-sm btn-outline" onclick="AcadEx.showToast('Opening ${pq.course} past questions...','info')">Open →</button></td>
    </tr>`).join('');
}
