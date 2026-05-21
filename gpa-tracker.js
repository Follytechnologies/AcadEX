// ACADEX — GPA Tracker Logic

const gradePoints = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };

let courses = [
  { id: 1, name: 'MTH 201', units: 3, grade: 'A' },
  { id: 2, name: 'STA 201', units: 2, grade: 'B' },
  { id: 3, name: 'CSC 201', units: 3, grade: 'A' },
  { id: 4, name: 'PHY 201', units: 2, grade: 'C' },
];

let semesterHistory = JSON.parse(localStorage.getItem('acadex_semesters') || '[]');
if (semesterHistory.length === 0) {
  semesterHistory = [
    { label: '100L First Semester', gpa: 3.92, units: 24 },
    { label: '100L Second Semester', gpa: 3.78, units: 22 },
  ];
}

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  renderCourses();
  renderHistory();
  updateCGPA();
});

function addCourse() {
  const id = Date.now();
  courses.push({ id, name: '', units: 2, grade: 'B' });
  renderCourses();
}

function removeCourse(id) {
  courses = courses.filter(c => c.id !== id);
  renderCourses();
  calculateGPA();
}

function renderCourses() {
  const tbody = document.getElementById('coursesBody');
  tbody.innerHTML = courses.map(c => `
    <tr id="row-${c.id}">
      <td><input class="course-input" value="${c.name}" placeholder="e.g. MTH 201" onchange="updateCourse(${c.id},'name',this.value)"></td>
      <td>
        <select class="course-select" onchange="updateCourse(${c.id},'units',parseInt(this.value))">
          ${[1,2,3,4,6].map(u => `<option value="${u}" ${c.units===u?'selected':''}>${u}</option>`).join('')}
        </select>
      </td>
      <td>
        <select class="course-select" onchange="updateCourse(${c.id},'grade',this.value)">
          ${Object.keys(gradePoints).map(g => `<option value="${g}" ${c.grade===g?'selected':''}>${g}</option>`).join('')}
        </select>
      </td>
      <td><div class="grade-points-display">${gradePoints[c.grade].toFixed(1)}</div></td>
      <td><button class="btn btn-ghost btn-sm" onclick="removeCourse(${c.id})" style="color:var(--danger)">✕</button></td>
    </tr>
  `).join('');
  calculateGPA();
}

function updateCourse(id, field, value) {
  const course = courses.find(c => c.id === id);
  if (course) {
    course[field] = value;
    renderCourses();
  }
}

function calculateGPA() {
  if (courses.length === 0) {
    document.getElementById('totalUnits').textContent = '0';
    document.getElementById('semGPA').textContent = '0.00';
    return;
  }
  const totalUnits = courses.reduce((sum, c) => sum + c.units, 0);
  const totalPoints = courses.reduce((sum, c) => sum + (c.units * gradePoints[c.grade]), 0);
  const gpa = totalPoints / totalUnits;
  document.getElementById('totalUnits').textContent = totalUnits;
  document.getElementById('semGPA').textContent = gpa.toFixed(2);
}

function saveSemester() {
  const gpaEl = document.getElementById('semGPA');
  const unitsEl = document.getElementById('totalUnits');
  const gpa = parseFloat(gpaEl.textContent);
  const units = parseInt(unitsEl.textContent);
  if (units === 0) { AcadEx.showToast('Add at least one course first', 'error'); return; }

  const labels = ['100L 1st Sem','100L 2nd Sem','200L 1st Sem','200L 2nd Sem','300L 1st Sem','300L 2nd Sem','400L 1st Sem','400L 2nd Sem'];
  const label = labels[semesterHistory.length] || `Semester ${semesterHistory.length + 1}`;
  semesterHistory.push({ label, gpa, units });
  localStorage.setItem('acadex_semesters', JSON.stringify(semesterHistory));
  updateCGPA();
  renderHistory();
  AcadEx.showToast(`${label} saved! CGPA updated.`, 'success');
}

function updateCGPA() {
  if (semesterHistory.length === 0) return;
  const totalUnits = semesterHistory.reduce((s, sem) => s + sem.units, 0);
  const totalPoints = semesterHistory.reduce((s, sem) => s + (sem.gpa * sem.units), 0);
  const cgpa = totalPoints / totalUnits;
  const grade = getCGPAGrade(cgpa);
  document.getElementById('cgpaVal').textContent = cgpa.toFixed(2);
  document.getElementById('cgpaGrade').textContent = grade;
  localStorage.setItem('acadex_cgpa', cgpa.toFixed(2));
}

function getCGPAGrade(cgpa) {
  if (cgpa >= 4.5) return 'First Class';
  if (cgpa >= 3.5) return '2nd Class Upper';
  if (cgpa >= 2.4) return '2nd Class Lower';
  if (cgpa >= 1.5) return 'Third Class';
  return 'Pass';
}

function renderHistory() {
  const container = document.getElementById('semesterHistory');
  if (semesterHistory.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-faint);font-size:13px;">No semesters saved yet.</div>';
    return;
  }
  container.innerHTML = semesterHistory.map((sem, i) => `
    <div class="sem-history-item">
      <div>
        <div class="sem-history-label">${sem.label}</div>
        <div class="sem-history-meta">${sem.units} credit units</div>
      </div>
      <div class="sem-history-gpa">${sem.gpa.toFixed(2)}</div>
    </div>
  `).join('');
}
