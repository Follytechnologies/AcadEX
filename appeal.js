// ============================================
// ACADEX — Appeal Page Logic
// ============================================

const letters = ['A', 'B', 'C', 'D', 'E'];

let selectedTest = null;
let selectedQuestion = null;
let selectedReasonType = null;
let myAppeals = [];

// Mock test history
const myTests = [
  { id: 1, name: 'MTH 101 — Week 3 Test', course: 'MTH 101', score: 85, date: '2026-05-10' },
  { id: 2, name: 'CHM 101 — Mid-Semester Test', course: 'CHM 101', score: 62, date: '2026-05-05' },
  { id: 3, name: 'PHY 101 — Quiz 1', course: 'PHY 101', score: 48, date: '2026-04-28' },
];

// Mock questions per test (using global CBT questions for demo)
const testQuestions = {
  1: AcadEx.mockCBTQuestions,
  2: AcadEx.mockCBTQuestions,
  3: AcadEx.mockCBTQuestions,
};

// Mock student answers per test
const testAnswers = {
  1: [0, 0, 2, 1, 2],
  2: [1, 2, 2, 0, 1],
  3: [2, 1, 0, 3, 0],
};

// ---- INIT ----
window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;

  if (user.role !== 'student') {
    AcadEx.redirectByRole(user);
    return;
  }

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];

  loadAppeals();
  renderAppealStats();
  renderTestList();
  renderAppealsHistory();
});

// ---- LOAD SAVED APPEALS ----
function loadAppeals() {
  const saved = localStorage.getItem('acadex_appeals');
  myAppeals = saved ? JSON.parse(saved) : [
    {
      id: 'AX-2026-001',
      testName: 'PHY 101 — Quiz 1',
      questionNum: 3,
      reasonType: 'wrong_answer',
      reason: 'The answer key states C but based on Newton\'s First Law, B is also valid in this context.',
      status: 'pending',
      date: '2026-04-30'
    }
  ];
}

// ---- SAVE APPEALS ----
function saveAppeals() {
  localStorage.setItem('acadex_appeals', JSON.stringify(myAppeals));
}

// ---- RENDER STATS ----
function renderAppealStats() {
  const pending = myAppeals.filter(a => a.status === 'pending').length;
  const approved = myAppeals.filter(a => a.status === 'approved').length;
  const total = myAppeals.length;

  document.getElementById('appealStats').innerHTML = `
    <div class="appeal-stat">
      <span class="appeal-stat-val">${total}</span>
      <span class="appeal-stat-label">Total</span>
    </div>
    <div class="appeal-stat">
      <span class="appeal-stat-val" style="color:var(--gold)">${pending}</span>
      <span class="appeal-stat-label">Pending</span>
    </div>
    <div class="appeal-stat">
      <span class="appeal-stat-val" style="color:var(--accent)">${approved}</span>
      <span class="appeal-stat-label">Approved</span>
    </div>
  `;

  document.getElementById('appealCount').textContent = total;
}

// ---- RENDER TEST LIST ----
function renderTestList() {
  const container = document.getElementById('testSelectList');

  container.innerHTML = myTests.map(test => {
    const scoreClass = test.score >= 70 ? 'score-high' : test.score >= 50 ? 'score-mid' : 'score-low';
    return `
      <div class="test-select-item ${selectedTest?.id === test.id ? 'selected' : ''}"
           onclick="selectTest(${test.id})">
        <div class="test-select-score ${scoreClass}">${test.score}%</div>
        <div class="test-select-info">
          <div class="test-select-name">${test.name}</div>
          <div class="test-select-meta">${AcadEx.formatDate(test.date)} · ${test.course}</div>
        </div>
        <div class="test-select-check">
          ${selectedTest?.id === test.id ? '✓' : ''}
        </div>
      </div>
    `;
  }).join('');
}

// ---- SELECT TEST ----
function selectTest(testId) {
  selectedTest = myTests.find(t => t.id === testId);
  selectedQuestion = null;

  document.getElementById('step1').classList.add('completed');
  document.getElementById('step1Status').textContent = selectedTest.course;
  document.getElementById('questionPreview').innerHTML = '<div class="step-placeholder">← Select a question first</div>';

  renderTestList();
  renderQuestionList();

  AcadEx.showToast(`${selectedTest.name} selected`, 'info');
}

// ---- RENDER QUESTION LIST ----
function renderQuestionList() {
  const container = document.getElementById('questionSelectList');
  if (!selectedTest) {
    container.innerHTML = '<div class="step-placeholder">← Select a test first</div>';
    return;
  }

  const questions = testQuestions[selectedTest.id] || [];
  const answers = testAnswers[selectedTest.id] || [];

  document.getElementById('step2').classList.add('active');

  container.innerHTML = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct;
    const isSelected = selectedQuestion?.index === i;

    return `
      <div class="question-select-item ${isSelected ? 'selected' : ''} ${isCorrect ? 'correct-q' : ''}"
           onclick="${isCorrect ? `AcadEx.showToast('You got this question correct — no need to appeal', 'info')` : `selectQuestion(${i})`}">
        <div class="q-select-num">${i + 1}</div>
        <div class="q-select-text">${q.question}</div>
        <div class="q-select-result ${isCorrect ? 'correct' : 'wrong'}">
          ${isCorrect ? '✅ Correct' : '❌ Wrong'}
        </div>
      </div>
    `;
  }).join('');
}

// ---- SELECT QUESTION ----
function selectQuestion(index) {
  const questions = testQuestions[selectedTest.id];
  const answers = testAnswers[selectedTest.id];
  const q = questions[index];

  selectedQuestion = {
    index,
    question: q.question,
    options: q.options,
    yourAnswer: answers[index],
    correctAnswer: q.correct,
    explanation: q.explanation
  };

  document.getElementById('step2').classList.add('completed');
  document.getElementById('step2Status').textContent = `Q${index + 1}`;
  document.getElementById('step3').classList.add('active');

  renderQuestionList();
  renderQuestionPreview();
}

// ---- RENDER QUESTION PREVIEW ----
function renderQuestionPreview() {
  const container = document.getElementById('questionPreview');
  if (!selectedQuestion) {
    container.innerHTML = '<div class="step-placeholder">← Select a question first</div>';
    return;
  }

  const { question, options, yourAnswer, correctAnswer } = selectedQuestion;
  const yourAnswerText = yourAnswer !== null ? options[yourAnswer] : 'Not answered';
  const correctAnswerText = options[correctAnswer];

  container.innerHTML = `
    <div class="question-preview-box">
      <div class="preview-q-text">${question}</div>
      <div class="preview-answers">
        <div class="preview-answer-box your">
          <div class="preview-answer-label">Your Answer</div>
          <div class="preview-answer-text">
            ${yourAnswer !== null ? letters[yourAnswer] + '. ' : ''}${yourAnswerText}
          </div>
        </div>
        <div class="preview-answer-box correct">
          <div class="preview-answer-label">Marked Correct</div>
          <div class="preview-answer-text">${letters[correctAnswer]}. ${correctAnswerText}</div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('step4').classList.add('active');
}

// ---- SELECT REASON TYPE ----
function selectReasonType(type, el) {
  selectedReasonType = type;
  document.querySelectorAll('.reason-type').forEach(r => r.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('step4Status').textContent = type.replace('_', ' ');
}

// ---- REASON INPUT ----
function onReasonInput() {
  const val = document.getElementById('appealReason').value;
  const count = val.length;
  const el = document.getElementById('charCount');
  el.textContent = `${count} / 500 characters`;
  el.className = 'char-count';
  if (count > 400) el.classList.add('warning');
  if (count >= 500) el.classList.add('limit');
}

// ---- SUBMIT APPEAL ----
function submitAppeal() {
  if (!selectedTest) {
    AcadEx.showToast('Please select a test first', 'error');
    document.getElementById('step1').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!selectedQuestion) {
    AcadEx.showToast('Please select a question to appeal', 'error');
    document.getElementById('step2').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (!selectedReasonType) {
    AcadEx.showToast('Please select a reason type', 'error');
    document.getElementById('step4').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const reason = document.getElementById('appealReason').value.trim();
  if (reason.length < 20) {
    AcadEx.showToast('Please provide a more detailed explanation (at least 20 characters)', 'error');
    return;
  }

  const btn = document.getElementById('submitAppealBtn');
  AcadEx.setLoading(btn, true, 'Submitting...');

  setTimeout(() => {
    AcadEx.setLoading(btn, false, '⚖️ Submit Appeal to Lecturer');

    const refNum = `AX-2026-${String(myAppeals.length + 1).padStart(3, '0')}`;

    const newAppeal = {
      id: refNum,
      testName: selectedTest.name,
      questionNum: selectedQuestion.index + 1,
      reasonType: selectedReasonType,
      reason: reason,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };

    myAppeals.push(newAppeal);
    saveAppeals();

    document.getElementById('appealRef').textContent = `REF: ${refNum}`;
    document.getElementById('successModal').classList.add('open');

    // Reset form
    selectedTest = null;
    selectedQuestion = null;
    selectedReasonType = null;
    document.getElementById('appealReason').value = '';
    document.getElementById('charCount').textContent = '0 / 500 characters';
    document.querySelectorAll('.reason-type').forEach(r => r.classList.remove('selected'));

    renderAppealStats();
    renderTestList();
    renderAppealsHistory();
    renderQuestionList();
  }, 1200);
}

// ---- RENDER APPEALS HISTORY ----
function renderAppealsHistory() {
  const container = document.getElementById('appealsHistory');

  if (myAppeals.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--ink-faint); font-size:13px;">No appeals submitted yet.</div>`;
    return;
  }

  container.innerHTML = myAppeals.map(a => `
    <div class="appeal-history-item">
      <div class="appeal-history-top">
        <div class="appeal-history-name">${a.testName} — Q${a.questionNum}</div>
        <div class="appeal-status ${a.status}">${a.status.charAt(0).toUpperCase() + a.status.slice(1)}</div>
      </div>
      <div class="appeal-history-meta">${a.id} · ${AcadEx.formatDate(a.date)}</div>
    </div>
  `).join('');
}

// ---- CLOSE SUCCESS MODAL ----
function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('open');

  // Reset steps
  document.querySelectorAll('.step-card').forEach(s => {
    s.classList.remove('active', 'completed');
  });
  document.getElementById('step1Status').textContent = '';
  document.getElementById('step2Status').textContent = '';
  document.getElementById('step4Status').textContent = '';
  document.getElementById('questionSelectList').innerHTML = '<div class="step-placeholder">← Select a test first</div>';
  document.getElementById('questionPreview').innerHTML = '<div class="step-placeholder">← Select a question first</div>';
}
