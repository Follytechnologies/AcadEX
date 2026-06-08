// ============================================
// ACADEX — Appeal Page Logic (UPGRADED with AI)
// ============================================

const letters = ['A', 'B', 'C', 'D', 'E'];
let selectedTest = null;
let selectedQuestion = null;
let selectedReasonType = null;
let myAppeals = [];

const myTests = [
  { id: 1, name: 'MTH 101 — Week 3 Test', course: 'MTH 101', score: 85, date: '2026-05-10' },
  { id: 2, name: 'CHM 101 — Mid-Semester Test', course: 'CHM 101', score: 62, date: '2026-05-05' },
  { id: 3, name: 'PHY 101 — Quiz 1', course: 'PHY 101', score: 48, date: '2026-04-28' },
];
const testQuestions = { 1: AcadEx.mockCBTQuestions, 2: AcadEx.mockCBTQuestions, 3: AcadEx.mockCBTQuestions };
const testAnswers = { 1: [0, 0, 2, 1, 2], 2: [1, 2, 2, 0, 1], 3: [2, 1, 0, 3, 0] };

window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;
  if (user.role !== 'student') { AcadEx.redirectByRole(user); return; }
  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];
  loadAppeals();
  renderAppealStats();
  renderTestList();
  renderAppealsHistory();
  if (typeof AcadExAI !== 'undefined') AcadExAI.injectChatWidget('Student filing a CBT mark appeal at UNILAG');
  if (typeof Notifications !== 'undefined') Notifications.init(user);

  // Set up real-time appeal listener if Firebase live
  if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
    DB.listenStudentAppeals(user.matricNumber, (liveAppeals) => {
      myAppeals = liveAppeals;
      renderAppealStats();
      renderAppealsHistory();
    });
  }
});

function loadAppeals() {
  const saved = localStorage.getItem('acadex_appeals');
  myAppeals = saved ? JSON.parse(saved) : [
    { id: 'AX-2026-001', testName: 'PHY 101 — Quiz 1', questionNum: 3, reasonType: 'wrong_answer', reason: "The answer key states C but based on Newton's First Law, B is also valid in this context.", status: 'pending', date: '2026-04-30' }
  ];
}

function saveAppeals() { localStorage.setItem('acadex_appeals', JSON.stringify(myAppeals)); }

function renderAppealStats() {
  const pending = myAppeals.filter(a => a.status === 'pending').length;
  const approved = myAppeals.filter(a => a.status === 'approved').length;
  document.getElementById('appealStats').innerHTML = `
    <div class="appeal-stat"><div class="appeal-stat-val" style="color:var(--gold)">${pending}</div><div class="appeal-stat-label">Pending</div></div>
    <div class="appeal-stat"><div class="appeal-stat-val" style="color:var(--accent)">${approved}</div><div class="appeal-stat-label">Approved</div></div>
    <div class="appeal-stat"><div class="appeal-stat-val">${myAppeals.length}</div><div class="appeal-stat-label">Total</div></div>
  `;
}

function renderTestList() {
  document.getElementById('testSelectList').innerHTML = myTests.map(t => `
    <div class="test-select-card ${selectedTest?.id === t.id ? 'selected' : ''}" onclick="selectTest(${t.id})">
      <div class="test-select-name">${t.name}</div>
      <div class="test-select-meta">Score: ${t.score}/100 · ${AcadEx.formatDate(t.date)}</div>
    </div>
  `).join('');
}

function selectTest(id) {
  selectedTest = myTests.find(t => t.id === id);
  selectedQuestion = null;
  document.getElementById('step1Status').textContent = '✓';
  document.querySelectorAll('.step-card')[0].classList.add('completed');
  document.querySelectorAll('.step-card')[1].classList.add('active');
  renderTestList();
  renderQuestionList();
}

function renderQuestionList() {
  const container = document.getElementById('questionSelectList');
  if (!selectedTest) { container.innerHTML = '<div class="step-placeholder">← Select a test first</div>'; return; }
  const questions = testQuestions[selectedTest.id] || [];
  const answers = testAnswers[selectedTest.id] || [];
  container.innerHTML = questions.map((q, i) => {
    const sa = answers[i];
    const isWrong = sa !== q.correct;
    return `<div class="question-select-item ${selectedQuestion?.index === i ? 'selected' : ''} ${isWrong ? 'wrong' : 'correct'}" onclick="selectQuestion(${i})">
      <div class="question-select-num">Q${i+1} <span class="${isWrong ? 'badge badge-danger' : 'badge badge-accent'}" style="font-size:10px">${isWrong ? '✗ Wrong' : '✓ Correct'}</span></div>
      <div class="question-select-text">${q.question.substring(0, 60)}...</div>
      <div class="question-select-answer">Your answer: ${letters[sa]}) ${q.options[sa] || '—'}</div>
    </div>`;
  }).join('');
}

function selectQuestion(index) {
  const q = testQuestions[selectedTest.id][index];
  const sa = testAnswers[selectedTest.id][index];
  selectedQuestion = { index, question: q, studentAnswer: sa, correctAnswer: q.correct };
  document.getElementById('step2Status').textContent = '✓';
  document.querySelectorAll('.step-card')[1].classList.add('completed');
  document.querySelectorAll('.step-card')[2].classList.add('active');
  document.querySelectorAll('.step-card')[3].classList.add('active');
  renderQuestionList();
  renderQuestionPreview(q, sa);
}

function renderQuestionPreview(q, sa) {
  document.getElementById('questionPreview').innerHTML = `
    <div class="preview-question">${q.question}</div>
    <div class="preview-options">
      ${q.options.map((opt, i) => `
        <div class="preview-option ${i === q.correct ? 'correct' : ''} ${i === sa && i !== q.correct ? 'wrong' : ''}">
          <span class="option-letter">${letters[i]}</span><span>${opt}</span>
          ${i === q.correct ? '<span style="margin-left:auto;font-size:11px;color:var(--accent)">✓ Key</span>' : ''}
          ${i === sa && i !== q.correct ? '<span style="margin-left:auto;font-size:11px;color:var(--danger)">Your answer</span>' : ''}
        </div>`).join('')}
    </div>
    <div style="margin-top:12px;padding:10px 12px;background:rgba(26,60,110,.06);border-radius:8px;font-size:12px;color:var(--ink-muted)">
      <strong>Explanation:</strong> ${q.explanation}
    </div>`;
}

function selectReasonType(type, el) {
  selectedReasonType = type;
  document.querySelectorAll('.reason-type').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('step4Status').textContent = '✓';
}

// ---- AI GENERATE APPEAL ----
async function generateAIAppeal() {
  if (!selectedQuestion) { AcadEx.showToast('Please select a question first', 'error'); return; }
  const btn = document.getElementById('aiGenerateBtn');
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> AI Writing...';
  const q = selectedQuestion.question;
  const result = await AcadExAI.generateAppealArgument({
    question: q.question, options: q.options,
    studentAnswer: selectedQuestion.studentAnswer,
    correctAnswer: selectedQuestion.correctAnswer,
    reasonType: selectedReasonType || 'wrong_answer'
  });
  btn.disabled = false;
  btn.innerHTML = orig;
  if (result) {
    document.getElementById('appealReason').value = result;
    document.getElementById('charCount').textContent = `${result.length} / 500 characters`;
    AcadEx.showToast('✨ AI appeal generated! Review before submitting.', 'success');
  } else {
    AcadEx.showToast('Could not generate. Please write your own.', 'warning');
  }
}

async function submitAppeal() {
  if (!selectedTest || !selectedQuestion || !selectedReasonType) { AcadEx.showToast('Complete all steps first', 'error'); return; }
  const reason = document.getElementById('appealReason').value.trim();
  if (reason.length < 20) { AcadEx.showToast('Please provide a detailed explanation (at least 20 characters)', 'error'); return; }
  const btn = document.getElementById('submitAppealBtn');
  AcadEx.setLoading(btn, true, 'Submitting...');
  setTimeout(async () => {
    AcadEx.setLoading(btn, false, '⚖️ Submit Appeal to Lecturer');
    const refNum = `AX-2026-${String(myAppeals.length + 1).padStart(3, '0')}`;
    const newAppeal = { id: refNum, testName: selectedTest.name, questionNum: selectedQuestion.index + 1, reasonType: selectedReasonType, reason, status: 'pending', date: new Date().toISOString().split('T')[0] };
    if (window.ACADEX_MODE === 'live' && typeof DB !== 'undefined') {
      const user = AcadEx.getSession();
      await DB.submitAppeal({ ...newAppeal, matricNumber: user.matricNumber, studentName: user.name }).catch(() => {});
    }
    myAppeals.push(newAppeal);
    saveAppeals();
    document.getElementById('appealRef').textContent = `REF: ${refNum}`;
    document.getElementById('successModal').classList.add('open');
    selectedTest = null; selectedQuestion = null; selectedReasonType = null;
    document.getElementById('appealReason').value = '';
    document.getElementById('charCount').textContent = '0 / 500 characters';
    document.querySelectorAll('.reason-type').forEach(r => r.classList.remove('selected'));
    renderAppealStats(); renderTestList(); renderAppealsHistory(); renderQuestionList();
  }, 1200);
}

function renderAppealsHistory() {
  const container = document.getElementById('appealsHistory');
  if (myAppeals.length === 0) { container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--ink-faint);font-size:13px">No appeals submitted yet.</div>'; return; }
  container.innerHTML = myAppeals.map(a => `
    <div class="appeal-history-item">
      <div class="appeal-history-top">
        <div class="appeal-history-name">${a.testName} — Q${a.questionNum}</div>
        <div class="appeal-status ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</div>
      </div>
      <div class="appeal-history-meta">${a.id} · ${AcadEx.formatDate(a.date)}</div>
      ${a.response ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(0,201,167,.08);border-radius:8px;font-size:12px">📝 Lecturer: ${a.response}</div>` : ''}
    </div>`).join('');
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');
  document.querySelectorAll('.step-card').forEach(s => s.classList.remove('active', 'completed'));
  ['step1Status','step2Status','step4Status'].forEach(id => document.getElementById(id).textContent = '');
  document.getElementById('questionSelectList').innerHTML = '<div class="step-placeholder">← Select a test first</div>';
  document.getElementById('questionPreview').innerHTML = '<div class="step-placeholder">← Select a question first</div>';
}
