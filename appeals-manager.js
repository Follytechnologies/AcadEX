// ACADEX — Appeals Manager Logic

let appeals = JSON.parse(localStorage.getItem('acadex_lec_appeals') || 'null') || [
  { id: 'AX-2026-001', student: 'Abdulhakeem Jimoh', matric: '252604033', test: 'MTH 101 — Week 3 Test', question: 'Q3', reasonType: 'wrong_answer', reason: 'The answer key states C but based on the definition of a limit, option A is also mathematically valid in this context. I referenced Calculus by Stewart, Page 89.', status: 'pending', date: '2026-05-10', response: null },
  { id: 'AX-2026-002', student: 'Emeka Obi', matric: '252604055', test: 'MTH 101 — Week 3 Test', question: 'Q5', reasonType: 'ambiguous', reason: 'The question wording was unclear — it asked for "the set of rational numbers" but the notation options included both ℚ and ℝ without specifying the context.', status: 'pending', date: '2026-05-12', response: null },
  { id: 'AX-2026-003', student: 'Fatima Bello', matric: '242503021', test: 'MTH 201 — Quiz 1', question: 'Q2', reasonType: 'marking_error', reason: 'I selected option B which is the correct answer (3x² - 6x + 2) but it was marked wrong. I believe there was a system error during grading.', status: 'approved', date: '2026-05-08', response: 'Upon review, you are correct. Option B is indeed the right answer. Your score has been updated from 60 to 80.' },
];

let currentAppealId = null;
let currentFilter = 'all';

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user || user.role !== 'lecturer') { AcadEx.redirectByRole(user); return; }
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name;
  renderStats();
  renderAppeals();
});

function renderStats() {
  const pending = appeals.filter(a => a.status === 'pending').length;
  const approved = appeals.filter(a => a.status === 'approved').length;
  const rejected = appeals.filter(a => a.status === 'rejected').length;
  document.getElementById('appealMgrStats').innerHTML = `
    <div class="amstat"><span class="amstat-val" style="color:var(--gold)">${pending}</span><span class="amstat-label">Pending</span></div>
    <div class="amstat"><span class="amstat-val" style="color:var(--accent)">${approved}</span><span class="amstat-label">Approved</span></div>
    <div class="amstat"><span class="amstat-val" style="color:var(--danger)">${rejected}</span><span class="amstat-label">Rejected</span></div>
  `;
}

function filterAppeals(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.appeals-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAppeals();
}

function renderAppeals() {
  const list = currentFilter === 'all' ? appeals : appeals.filter(a => a.status === currentFilter);
  const container = document.getElementById('appealsList');

  if (list.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:40px;color:var(--ink-faint)"><div style="font-size:40px;margin-bottom:12px">⚖️</div><p>No ${currentFilter} appeals.</p></div>`;
    return;
  }

  container.innerHTML = list.map(a => `
    <div class="appeal-mgr-card ${a.status}">
      <div class="appeal-mgr-top">
        <div>
          <div class="appeal-mgr-student">${a.student}</div>
          <div class="appeal-mgr-meta">${a.matric} · ${a.test} · ${a.question} · ${AcadEx.formatDate(a.date)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          <span class="badge" style="font-size:11px;padding:3px 10px;background:${a.reasonType==='wrong_answer'?'rgba(255,77,79,.1)':'rgba(255,184,0,.12)'};color:${a.reasonType==='wrong_answer'?'var(--danger)':'#8C6400'}">${a.reasonType.replace('_',' ')}</span>
          <span class="badge ${a.status==='pending'?'badge-gold':a.status==='approved'?'badge-accent':'badge-danger'}">${a.status}</span>
        </div>
      </div>
      <div class="appeal-mgr-reason">"${a.reason}"</div>
      ${a.response ? `<div class="appeal-response">📝 Your response: ${a.response}</div>` : ''}
      <div class="appeal-mgr-actions">
        ${a.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="openResponseModal('${a.id}')">⚖️ Respond</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="AcadEx.showToast('Viewing full appeal details','info')">👁 View Details</button>
      </div>
    </div>
  `).join('');
}

function openResponseModal(id) {
  currentAppealId = id;
  const a = appeals.find(x => x.id === id);
  document.getElementById('appealDetailBox').innerHTML = `
    <strong>${a.student} — ${a.test} · ${a.question}</strong>
    ${a.reason}
  `;
  document.getElementById('responseText').value = '';
  document.getElementById('responseModal').classList.add('open');
}

function closeResponseModal() {
  document.getElementById('responseModal').classList.remove('open');
  currentAppealId = null;
}

function respondToAppeal(decision) {
  const response = document.getElementById('responseText').value.trim();
  if (response.length < 10) { AcadEx.showToast('Please provide a detailed response', 'error'); return; }
  const appeal = appeals.find(a => a.id === currentAppealId);
  if (appeal) { appeal.status = decision; appeal.response = response; }
  localStorage.setItem('acadex_lec_appeals', JSON.stringify(appeals));
  closeResponseModal();
  renderStats();
  renderAppeals();
  AcadEx.showToast(`Appeal ${decision}. Student has been notified.`, decision === 'approved' ? 'success' : 'info');
}
