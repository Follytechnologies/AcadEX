// ACADEX — Upload Materials Logic
let uploads = JSON.parse(localStorage.getItem('acadex_lec_uploads') || '[]');
if (uploads.length === 0) uploads = [...AcadEx.mockMaterials.slice(0,3).map(m => ({...m, type: 'Lecture Notes'}))];

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user || user.role !== 'lecturer') { AcadEx.redirectByRole(user); return; }
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name;
  renderUploads();
});

function renderUploads() {
  document.getElementById('uploadCount').textContent = uploads.length;
  const container = document.getElementById('uploadedList');
  if (uploads.length === 0) { container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--ink-faint);font-size:13px">No materials uploaded yet.</div>'; return; }
  container.innerHTML = uploads.map(u => `
    <div class="upload-item">
      <div class="upload-item-icon">📄</div>
      <div class="upload-item-info">
        <div class="upload-item-title">${u.title}</div>
        <div class="upload-item-meta">${u.course} · ${AcadEx.formatDate(u.date)}</div>
      </div>
      <span class="badge badge-accent">${u.type || 'PDF'}</span>
    </div>
  `).join('');
}

function uploadMaterial() {
  const title = document.getElementById('matTitle').value.trim();
  const course = document.getElementById('matCourse').value;
  const type = document.getElementById('matType').value;
  if (!title || !course) { AcadEx.showToast('Please fill in the title and course', 'error'); return; }
  const newMat = { id: Date.now(), title, course, type, size: '1.0 MB', date: new Date().toISOString().split('T')[0], lecturer: 'Dr. Adeyemi' };
  uploads.unshift(newMat);
  localStorage.setItem('acadex_lec_uploads', JSON.stringify(uploads));
  document.getElementById('matTitle').value = '';
  document.getElementById('matCourse').value = '';
  renderUploads();
  AcadEx.showToast(`"${title}" uploaded successfully!`, 'success');
}
