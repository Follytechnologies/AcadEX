// ============================================
// ACADEX — GPA Tracker (UPGRADED with Chart.js + AI Predictor)
// gpa-tracker.js
// ============================================

const GRADE_POINTS = { 'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'E': 1.0, 'F': 0.0 };

let courses = [];
let semesterHistory = [];
let cgpaChart = null;

window.addEventListener('load', async () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  if (user.role !== 'student') { AcadEx.redirectByRole(user); return; }

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  document.getElementById('navMatric').textContent = user.matricNumber;

  // Load data
  if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
    const dbSemesters = await DB.getSemesters(user.matricNumber).catch(() => null);
    if (dbSemesters) semesterHistory = dbSemesters;
    else loadLocal();
  } else {
    loadLocal();
  }

  renderCoursesTable();
  renderSemesterHistory();
  renderCGPAChart();
  calculateGPA();

  if (typeof Notifications !== 'undefined') Notifications.init(user);
  if (typeof AcadExAI !== 'undefined') AcadExAI.injectChatWidget(`Student tracking GPA at UNILAG, ${user.faculty}, ${user.department}`);
});

function loadLocal() {
  courses = JSON.parse(localStorage.getItem('acadex_courses') || '[]');
  if (courses.length === 0) courses = [
    { id: 1, name: 'MTH 101', units: 3, grade: 'A' },
    { id: 2, name: 'CHM 101', units: 3, grade: 'B' },
    { id: 3, name: 'PHY 101', units: 3, grade: 'C' },
    { id: 4, name: 'GST 101', units: 2, grade: 'A' },
    { id: 5, name: 'BIO 101', units: 2, grade: 'B' },
  ];
  semesterHistory = JSON.parse(localStorage.getItem('acadex_semesters') || '[]');
}

function saveLocal() {
  localStorage.setItem('acadex_courses', JSON.stringify(courses));
  localStorage.setItem('acadex_semesters', JSON.stringify(semesterHistory));
}

// ---- GRADE CALCULATION ----
function calculateGPA() {
  if (courses.length === 0) return 0;
  let totalWeighted = 0, totalUnits = 0;
  courses.forEach(c => {
    const gp = GRADE_POINTS[c.grade] ?? 0;
    totalWeighted += gp * c.units;
    totalUnits += c.units;
  });
  const gpa = totalUnits > 0 ? totalWeighted / totalUnits : 0;

  document.getElementById('currentGPA').textContent = gpa.toFixed(2);
  document.getElementById('totalUnits').textContent = totalUnits;
  document.getElementById('gradeClass').textContent = classifyGPA(gpa);
  document.getElementById('cgpaDisplay').textContent = gpa.toFixed(2);

  const bar = document.getElementById('gpaBar');
  if (bar) { bar.style.width = `${(gpa / 5) * 100}%`; bar.style.background = gpa >= 4.5 ? '#00C9A7' : gpa >= 3.5 ? '#1A3C6E' : gpa >= 2.4 ? '#FFB800' : '#FF4D4F'; }

  return gpa;
}

function classifyGPA(gpa) {
  if (gpa >= 4.5) return 'First Class';
  if (gpa >= 3.5) return 'Second Class Upper';
  if (gpa >= 2.4) return 'Second Class Lower';
  if (gpa >= 1.5) return 'Third Class';
  return 'Below Minimum';
}

// ---- COURSES TABLE ----
function renderCoursesTable() {
  const tbody = document.getElementById('coursesTableBody');
  if (!tbody) return;
  tbody.innerHTML = courses.map((c, i) => `
    <tr>
      <td><input type="text" value="${c.name}" onchange="updateCourse(${i},'name',this.value)" class="table-input" placeholder="Course code"></td>
      <td><input type="number" value="${c.units}" min="1" max="6" onchange="updateCourse(${i},'units',parseInt(this.value))" class="table-input" style="width:60px" placeholder="Units"></td>
      <td>
        <select onchange="updateCourse(${i},'grade',this.value)" class="table-input" style="width:70px">
          ${Object.keys(GRADE_POINTS).map(g => `<option value="${g}" ${c.grade===g?'selected':''}>${g} (${GRADE_POINTS[g].toFixed(1)})</option>`).join('')}
        </select>
      </td>
      <td style="font-weight:600;color:${(GRADE_POINTS[c.grade]||0)>=4?'var(--accent)':'var(--ink)'}">${(GRADE_POINTS[c.grade] * c.units).toFixed(1)}</td>
      <td><button onclick="deleteCourse(${i})" class="btn btn-ghost btn-sm" style="color:var(--danger);font-size:11px">✕</button></td>
    </tr>
  `).join('');
  calculateGPA();
}

function updateCourse(index, field, value) {
  courses[index][field] = value;
  saveLocal();
  calculateGPA();
}

function deleteCourse(index) {
  courses.splice(index, 1);
  saveLocal();
  renderCoursesTable();
}

function addCourse() {
  const name = document.getElementById('newCourseName').value.trim();
  const units = parseInt(document.getElementById('newCourseUnits').value) || 3;
  const grade = document.getElementById('newCourseGrade').value;
  if (!name) { AcadEx.showToast('Enter a course name', 'error'); return; }
  courses.push({ id: Date.now(), name, units, grade });
  document.getElementById('newCourseName').value = '';
  saveLocal();
  renderCoursesTable();
  AcadEx.showToast(`${name} added`, 'success');
}

// ---- SAVE SEMESTER ----
async function saveSemester() {
  const label = document.getElementById('semesterLabel').value.trim();
  if (!label) { AcadEx.showToast('Enter a semester label (e.g. 100L First Sem)', 'error'); return; }
  if (courses.length === 0) { AcadEx.showToast('Add courses first', 'error'); return; }

  const gpa = calculateGPA();
  const semData = { label, gpa: parseFloat(gpa.toFixed(2)), courses: [...courses], date: new Date().toISOString() };

  if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
    const user = AcadEx.getSession();
    await DB.saveSemester(user.matricNumber, semData).catch(() => {});
  }

  semesterHistory.push(semData);
  saveLocal();
  renderSemesterHistory();
  renderCGPAChart();
  AcadEx.showToast(`Semester "${label}" saved! GPA: ${gpa.toFixed(2)}`, 'success');
}

function renderSemesterHistory() {
  const container = document.getElementById('semesterHistory');
  if (!container) return;
  if (semesterHistory.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-faint);font-size:13px">No semesters saved yet. Add courses and click "Save Semester".</div>';
    return;
  }
  const cgpa = semesterHistory.length > 0 ? semesterHistory[semesterHistory.length - 1].gpa : 0;
  container.innerHTML = semesterHistory.map((s, i) => `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
      <div>
        <div style="font-weight:600;font-size:13px">${s.label}</div>
        <div style="font-size:11px;color:var(--ink-faint)">${s.courses?.length || 0} courses · ${AcadEx.formatDate(s.date)}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:800;font-size:18px;color:${s.gpa>=4.5?'var(--accent)':s.gpa>=3.5?'var(--primary)':'var(--ink)'}">${s.gpa.toFixed(2)}</div>
        <div style="font-size:11px;color:var(--ink-faint)">${classifyGPA(s.gpa)}</div>
      </div>
    </div>
  `).join('') + `
    <div style="margin-top:12px;padding:12px;background:rgba(26,60,110,.06);border-radius:10px;display:flex;justify-content:space-between;align-items:center">
      <span style="font-size:13px;font-weight:600">Cumulative GPA</span>
      <span style="font-size:20px;font-weight:800;color:var(--primary)">${cgpa.toFixed(2)}</span>
    </div>
  `;
}

// ---- CHART.JS CGPA TREND ----
function renderCGPAChart() {
  const canvas = document.getElementById('cgpaTrendChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (cgpaChart) cgpaChart.destroy();

  if (semesterHistory.length === 0) {
    document.getElementById('chartPlaceholder').style.display = 'flex';
    canvas.style.display = 'none';
    return;
  }
  document.getElementById('chartPlaceholder') && (document.getElementById('chartPlaceholder').style.display = 'none');
  canvas.style.display = 'block';

  cgpaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: semesterHistory.map(s => s.label),
      datasets: [
        {
          label: 'GPA',
          data: semesterHistory.map(s => s.gpa),
          borderColor: '#1A3C6E',
          backgroundColor: 'rgba(26,60,110,.08)',
          borderWidth: 3,
          pointBackgroundColor: '#1A3C6E',
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          tension: 0.4
        },
        // First class threshold line
        {
          label: 'First Class (4.50)',
          data: semesterHistory.map(() => 4.5),
          borderColor: 'rgba(0,201,167,.5)',
          borderWidth: 1.5,
          borderDash: [6, 4],
          pointRadius: 0,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { min: 0, max: 5.0, ticks: { stepSize: 0.5, font: { size: 11 } }, grid: { color: 'rgba(0,0,0,.05)' }, title: { display: true, text: 'GPA', font: { size: 11 } } },
        x: { grid: { display: false }, ticks: { font: { size: 10 } } }
      },
      plugins: {
        legend: { display: true, labels: { font: { size: 11 }, boxWidth: 12 } },
        tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} (${classifyGPA(ctx.raw)})` } }
      }
    }
  });
}

// ---- AI GPA PREDICTION ----
async function getAIPrediction() {
  if (courses.length === 0) { AcadEx.showToast('Add your courses first', 'error'); return; }
  const btn = document.getElementById('aiPredictBtn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> AI Analysing...';

  const gpa = calculateGPA();
  const prediction = await AcadExAI.predictGPA({ currentCourses: courses, semesterHistory, currentGPA: gpa });

  btn.disabled = false;
  btn.innerHTML = orig;

  const resultEl = document.getElementById('aiPredictionResult');
  if (resultEl && prediction) {
    resultEl.style.display = 'block';
    resultEl.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:10px">
        <div style="font-size:24px">🤖</div>
        <div>
          <div style="font-weight:700;font-size:13px;color:var(--primary);margin-bottom:6px">AI Academic Advisor</div>
          <div style="font-size:13px;color:var(--ink);line-height:1.7;white-space:pre-wrap">${prediction}</div>
        </div>
      </div>`;
    AcadEx.showToast('AI prediction ready!', 'success');
  } else {
    AcadEx.showToast('Could not get prediction. Try again.', 'warning');
  }
}
