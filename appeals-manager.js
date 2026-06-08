// ============================================
// ACADEX — Appeals Manager (UPGRADED with real-time + AI)
// appeals-manager.js
// ============================================

let appeals = [];
let currentAppealId = null;
let currentFilter = 'all';
let unsubscribeAppeals = null;

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user || user.role !== 'lecturer') { AcadEx.redirectByRole(user); return; }
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name;

  // Real-time listener if Firebase live
  if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
    unsubscribeAppeals = DB.listenAppeals((liveAppeals) => {
      appeals = liveAppeals;
      renderStats();
      renderAppeals();
    });
  } else {
    // Demo mode: load from localStorage with seed data
    const saved = localStorage.getItem('acadex_lec_appeals');
    appeals = saved ? JSON.parse(saved) : [
      { id: 'AX-2026-001', student: 'Abdulhakeem Jimoh', matric: '252604033', test: 'MTH 101 — Week 3 Test', question: 'Q3', reasonType: 'wrong_answer', reason: 'The answer key states C but based on the definition of a limit, option A is also mathematically valid. I referenced Calculus by Stewart, Page 89.', status: 'pending', date: '2026-05-10', response: null },
      { id: 'AX-2026-002', student: 'Emeka Obi', matric: '252604055', test: 'MTH 101 — Week 3 Test', question: 'Q5', reasonType: 'ambiguous', reason: 'The question wording was unclear — it asked for "the set of rational numbers" but the notation options included both ℚ and ℝ without specifying the context.', status: 'pending', date: '2026-05-12', response: null },
      { id: 'AX-2026-003', student: 'Fatima Bello', matric: '242503021', test: 'MTH 201 — Quiz 1', question: 'Q2', reasonType: 'marking_error', reason: 'I selected option B which is the correct answer (3x² - 6x + 2) but it was marked wrong. I believe there was a system error during grading.', status: 'approved', date: '2026-05-08', response: 'Upon review, you are correct. Option B is indeed the right answer. Your score has been updated from 60 to 80.' },
    ];
    renderStats();
    renderAppeals();
  }

  if (typeof Notifications !== 'undefined') Notifications.init(user);
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
          <div class="appeal-mgr-student">${a.student || a.studentName || 'Student'}</div>
          <div class="appeal-mgr-meta">${a.matric || a.matricNumber || '—'} · ${a.test || a.testName || '—'} · ${a.question || `Q${a.questionNum}`} · ${AcadEx.formatDate(a.date || a.createdAt)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-shrink:0">
          <span class="badge" style="font-size:11px;padding:3px 10px;background:${a.reasonType==='wrong_answer'?'rgba(255,77,79,.1)':'rgba(255,184,0,.12)'};color:${a.reasonType==='wrong_answer'?'var(--danger)':'#8C6400'}">${(a.reasonType||'').replace('_',' ')}</span>
          <span class="badge ${a.status==='pending'?'badge-gold':a.status==='approved'?'badge-accent':'badge-danger'}">${a.status}</span>
        </div>
      </div>
      <div class="appeal-mgr-reason">"${a.reason}"</div>
      ${a.response ? `<div class="appeal-response">📝 Your response: ${a.response}</div>` : ''}
      <div class="appeal-mgr-actions">
        ${a.status === 'pending' ? `<button class="btn btn-primary btn-sm" onclick="openResponseModal('${a.id}')">⚖️ Respond</button>` : ''}
        ${a.status === 'pending' ? `<button class="btn btn-outline btn-sm" onclick="generateAISuggestion('${a.id}')" style="background:rgba(26,60,110,.06)">🤖 AI Suggestion</button>` : ''}
        <button class="btn btn-outline btn-sm" onclick="AcadEx.showToast('Full details view coming soon','info')">👁 View Details</button>
      </div>
    </div>
  `).join('');
}

// ---- AI: SUGGEST RESPONSE FOR LECTURER ----
async function generateAISuggestion(id) {
  const appeal = appeals.find(a => a.id === id);
  if (!appeal) return;

  AcadEx.showToast('🤖 AI analysing appeal...', 'info');

  const systemPrompt = `You are assisting a university lecturer at UNILAG to respond to student CBT appeals.
Write a professional, fair, and respectful response. If the appeal seems valid, acknowledge it and approve. If not, explain clearly why.
Keep the response under 80 words.`;

  const userMessage = `Student appeal: "${appeal.reason}"
Test: ${appeal.test || appeal.testName}
Question: ${appeal.question || `Q${appeal.questionNum}`}
Reason type: ${appeal.reasonType}

Write a brief, professional lecturer response.`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 300, system: systemPrompt, messages: [{ role: "user", content: userMessage }] })
    });
    const data = await res.json();
    const suggestion = data.content?.[0]?.text || '';
    if (suggestion) {
      openResponseModal(id);
      setTimeout(() => {
        document.getElementById('responseText').value = suggestion;
      }, 100);
      AcadEx.showToast('✨ AI suggestion loaded. Edit before sending.', 'success');
    }
  } catch (e) {
    AcadEx.showToast('Could not generate AI suggestion.', 'error');
  }
}

function openResponseModal(id) {
  currentAppealId = id;
  const a = appeals.find(x => x.id === id);
  document.getElementById('appealDetailBox').innerHTML = `
    <strong>${a.student || a.studentName} — ${a.test || a.testName} · ${a.question || `Q${a.questionNum}`}</strong><br>
    <em>${a.reason}</em>
  `;
  document.getElementById('responseText').value = '';
  document.getElementById('responseModal').classList.add('open');
}

function closeResponseModal() {
  document.getElementById('responseModal').classList.remove('open');
  currentAppealId = null;
}

async function respondToAppeal(decision) {
  const response = document.getElementById('responseText').value.trim();
  if (response.length < 10) { AcadEx.showToast('Please provide a detailed response', 'error'); return; }

  const appeal = appeals.find(a => a.id === currentAppealId);
  if (appeal) { appeal.status = decision; appeal.response = response; }

  // Update in Firestore if live
  if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
    await DB.updateAppeal(currentAppealId, { status: decision, response }).catch(() => {});
  } else {
    localStorage.setItem('acadex_lec_appeals', JSON.stringify(appeals));
    // Also update student's local appeal copy
    const studentAppeals = JSON.parse(localStorage.getItem('acadex_appeals') || '[]');
    const studentAppeal = studentAppeals.find(a => a.id === currentAppealId);
    if (studentAppeal) { studentAppeal.status = decision; studentAppeal.response = response; localStorage.setItem('acadex_appeals', JSON.stringify(studentAppeals)); }
  }

  closeResponseModal();
  renderStats();
  renderAppeals();
  AcadEx.showToast(`Appeal ${decision}. Student has been notified.`, decision === 'approved' ? 'success' : 'info');
}
