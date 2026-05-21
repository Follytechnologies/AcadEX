// ACADEX — Materials Page Logic

const allMaterials = [
  ...AcadEx.mockMaterials,
  { id: 6, title: 'MTH 101 - Past Questions 2023/2024', course: 'MTH 101', type: 'PDF', size: '0.9 MB', date: '2026-02-10', lecturer: 'Dr. Adeyemi' },
  { id: 7, title: 'CHM 101 - Organic Chemistry Notes', course: 'CHM 101', type: 'PDF', size: '2.8 MB', date: '2026-02-15', lecturer: 'Dr. Okafor' },
  { id: 8, title: 'PHY 101 - Wave & Optics Slides', course: 'PHY 101', type: 'PPT', size: '4.1 MB', date: '2026-02-18', lecturer: 'Dr. Balogun' },
  { id: 9, title: 'GST 101 - Communication Skills', course: 'GST 101', type: 'DOC', size: '1.1 MB', date: '2026-02-20', lecturer: 'Dr. Eze' },
  { id: 10, title: 'BIO 101 - Genetics Introduction', course: 'BIO 101', type: 'PDF', size: '3.2 MB', date: '2026-03-01', lecturer: 'Dr. Nwosu' },
];

const fileIcons = { PDF: '📄', PPT: '📊', DOC: '📝' };
const fileClasses = { PDF: 'file-pdf', PPT: 'file-ppt', DOC: 'file-doc' };
const downloaded = JSON.parse(localStorage.getItem('acadex_downloaded') || '[]');

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  renderStats();
  renderMaterials(allMaterials);
});

function renderStats() {
  document.getElementById('materialsStats').innerHTML = `
    <div class="mat-stat"><span class="mat-stat-val">${allMaterials.length}</span><span class="mat-stat-label">Total</span></div>
    <div class="mat-stat"><span class="mat-stat-val" style="color:var(--accent)">${downloaded.length}</span><span class="mat-stat-label">Downloaded</span></div>
  `;
}

function renderMaterials(list) {
  const grid = document.getElementById('materialsGrid');
  const empty = document.getElementById('emptyState');
  if (list.length === 0) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
  empty.style.display = 'none';
  grid.innerHTML = list.map(m => {
    const isDownloaded = downloaded.includes(m.id);
    return `
      <div class="material-card">
        <div class="material-card-top">
          <div class="material-file-icon ${fileClasses[m.type] || 'file-pdf'}">${fileIcons[m.type] || '📄'}</div>
          <span class="badge badge-primary">${m.course}</span>
        </div>
        <div class="material-title">${m.title}</div>
        <div class="material-meta">Uploaded ${AcadEx.formatDate(m.date)} · ${m.size}</div>
        <div class="material-lecturer">👤 ${m.lecturer}</div>
        <div class="material-card-footer">
          <span class="material-size">${m.type} · ${m.size}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            ${isDownloaded ? '<span class="offline-badge">✓ Offline</span>' : ''}
            <button class="btn btn-primary btn-sm" onclick="downloadMaterial(${m.id}, '${m.title}')">
              ⬇ ${isDownloaded ? 'Re-download' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function filterMaterials() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const course = document.getElementById('courseFilter').value;
  const type = document.getElementById('typeFilter').value;
  const filtered = allMaterials.filter(m =>
    (m.title.toLowerCase().includes(search) || m.course.toLowerCase().includes(search)) &&
    (course === '' || m.course === course) &&
    (type === '' || m.type === type)
  );
  renderMaterials(filtered);
}

function downloadMaterial(id, title) {
  if (!downloaded.includes(id)) {
    downloaded.push(id);
    localStorage.setItem('acadex_downloaded', JSON.stringify(downloaded));
  }
  AcadEx.showToast(`"${title}" saved for offline access ✓`, 'success');
  renderStats();
  filterMaterials();
}
