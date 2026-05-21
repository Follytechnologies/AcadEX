// ACADEX — Past Questions Logic
const allPQ = [
  ...AcadEx.mockPastQuestions,
  { id: 6, course: 'MTH 201', title: '2022/2023 Second Semester', year: '2022/2023', semester: 'Second', questions: 40 },
  { id: 7, course: 'STA 201', title: '2023/2024 Second Semester', year: '2023/2024', semester: 'Second', questions: 45 },
  { id: 8, course: 'CSC 201', title: '2023/2024 Second Semester', year: '2023/2024', semester: 'Second', questions: 50 },
];

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  renderPQ(allPQ);
});

function renderPQ(list) {
  document.getElementById('pqGrid').innerHTML = list.map(pq => `
    <div class="pq-card">
      <div class="pq-card-top">
        <div class="pq-course-badge">${pq.course}</div>
        <span class="badge badge-accent">${pq.semester} Sem</span>
      </div>
      <div class="pq-title">${pq.title}</div>
      <div class="pq-meta">${pq.year} · ${pq.questions} questions</div>
      <div class="pq-footer">
        <span class="pq-questions">📋 ${pq.questions} Questions</span>
        <button class="btn btn-primary btn-sm" onclick="AcadEx.showToast('Downloading ${pq.course} ${pq.year}...','success')">⬇ Download</button>
      </div>
    </div>`).join('');
}

function filterPQ() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const semester = document.getElementById('semesterFilter').value;
  renderPQ(allPQ.filter(pq =>
    (pq.course.toLowerCase().includes(search) || pq.title.toLowerCase().includes(search)) &&
    (semester === '' || pq.semester === semester)
  ));
}
