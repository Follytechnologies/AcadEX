// ============================================
// ACADEX — Review Results Page Logic
// ============================================

const letters = ['A', 'B', 'C', 'D', 'E'];
let testResult = null;
let currentFilter = 'all';

// ---- INIT ----
window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];

  loadResults();
});

// ---- LOAD RESULTS ----
function loadResults() {
  const saved = localStorage.getItem('acadex_latest_result');

  if (saved) {
    testResult = JSON.parse(saved);
  } else {
    // Generate mock result if no test was taken
    testResult = generateMockResult();
  }

  renderScoreHero();
  renderPerformanceSummary();
  renderQuestions();
}

// ---- MOCK RESULT (fallback) ----
function generateMockResult() {
  const questions = AcadEx.mockCBTQuestions;
  const mockAnswers = [0, 2, 2, 1, 2]; // Simulate some correct, some wrong

  const results = questions.map((q, i) => ({
    questionIndex: i,
    question: q.question,
    options: q.options,
    selectedAnswer: mockAnswers[i],
    correctAnswer: q.correct,
    isCorrect: mockAnswers[i] === q.correct,
    explanation: q.explanation,
    marks: mockAnswers[i] === q.correct ? 20 : 0
  }));

  const correct = results.filter(r => r.isCorrect).length;
  return {
    id: 1,
    testName: 'MTH 101 — Introduction to Pure Mathematics',
    course: 'MTH 101',
    date: new Date().toISOString(),
    score: correct * 20,
    percentage: correct * 20,
    totalQuestions: questions.length,
    correct: correct,
    wrong: questions.length - correct,
    timeTaken: 487,
    results: results
  };
}

// ---- RENDER SCORE HERO ----
function renderScoreHero() {
  const { testName, date, score, percentage, correct, wrong, timeTaken } = testResult;

  document.getElementById('scoreTitle').textContent = testName;
  document.getElementById('scoreDate').textContent = `Submitted on ${AcadEx.formatDate(date)}`;
  document.getElementById('correctCount').textContent = correct;
  document.getElementById('wrongCount').textContent = wrong;
  document.getElementById('totalScore').textContent = `${score}/100`;

  const mins = Math.floor(timeTaken / 60);
  const secs = timeTaken % 60;
  document.getElementById('timeTaken').textContent = `${mins}m ${secs}s`;

  // Ring animation
  const circumference = 327;
  const offset = circumference - (percentage / 100) * circumference;
  const ringFill = document.getElementById('ringFill');

  ringFill.classList.remove('low', 'mid', 'high');
  if (percentage >= 70) ringFill.classList.add('high');
  else if (percentage >= 50) ringFill.classList.add('mid');
  else ringFill.classList.add('low');

  setTimeout(() => {
    ringFill.style.strokeDashoffset = offset;
    animateCounter('ringPercent', 0, percentage, '%', 1500);
  }, 300);

  // Grade
  const { grade, tag } = getGrade(percentage);
  document.getElementById('scoreGrade').textContent = grade;
  document.getElementById('scoreTag').textContent = tag;
}

// ---- GRADE HELPER ----
function getGrade(pct) {
  if (pct >= 70) return { grade: 'A — Distinction', tag: '🎉 Excellent Result' };
  if (pct >= 60) return { grade: 'B — Credit', tag: '👍 Good Result' };
  if (pct >= 50) return { grade: 'C — Pass', tag: '✅ You Passed' };
  if (pct >= 45) return { grade: 'D — Pass', tag: '⚠️ Borderline Pass' };
  return { grade: 'F — Fail', tag: '❌ Below Pass Mark' };
}

// ---- COUNTER ANIMATION ----
function animateCounter(id, from, to, suffix, duration) {
  const el = document.getElementById(id);
  const start = performance.now();
  const update = (time) => {
    const progress = Math.min((time - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + (to - from) * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

// ---- PERFORMANCE SUMMARY ----
function renderPerformanceSummary() {
  const { percentage, correct, wrong, results } = testResult;
  const weakTopics = results.filter(r => !r.isCorrect).map((_, i) => `Question ${_ .questionIndex + 1}`);

  let summary = '';

  if (percentage >= 70) {
    summary = `<strong>Outstanding performance! 🎉</strong> You scored ${percentage}% — well above the pass mark. You answered ${correct} out of ${testResult.totalQuestions} questions correctly. Keep up this standard in your upcoming exams.`;
  } else if (percentage >= 50) {
    summary = `<strong>You passed! ✅</strong> You scored ${percentage}% and answered ${correct} of ${testResult.totalQuestions} questions correctly. However, you got ${wrong} question${wrong > 1 ? 's' : ''} wrong. Review the explanations below carefully — they'll help you improve for your next test.`;
  } else {
    summary = `<strong>Below pass mark. ⚠️</strong> You scored ${percentage}% — you need at least 50% to pass. You got ${wrong} out of ${testResult.totalQuestions} questions wrong. Don't be discouraged — review the AI explanations below for every wrong answer and retake the practice test.`;
  }

  if (weakTopics.length > 0 && percentage < 100) {
    summary += ` Focus on reviewing <strong>${weakTopics.join(', ')}</strong> before your next test.`;
  }

  document.getElementById('perfText').innerHTML = summary;
}

// ---- RENDER QUESTIONS ----
function renderQuestions(filter = 'all') {
  currentFilter = filter;
  const container = document.getElementById('questionsReview');

  let toRender = testResult.results;
  if (filter === 'correct') toRender = testResult.results.filter(r => r.isCorrect);
  if (filter === 'wrong') toRender = testResult.results.filter(r => !r.isCorrect);

  if (toRender.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--ink-faint);">
        <div style="font-size:32px; margin-bottom:8px;">${filter === 'correct' ? '😮' : '🎉'}</div>
        <p>${filter === 'correct' ? 'No correct answers to show.' : 'No wrong answers — perfect score!'}</p>
      </div>`;
    return;
  }

  container.innerHTML = toRender.map(r => renderReviewCard(r)).join('');
}

// ---- RENDER SINGLE REVIEW CARD ----
function renderReviewCard(r) {
  const yourAnswerText = r.selectedAnswer !== null ? r.options[r.selectedAnswer] : 'Not answered';
  const correctAnswerText = r.options[r.correctAnswer];
  const yourLetter = r.selectedAnswer !== null ? letters[r.selectedAnswer] : '—';
  const correctLetter = letters[r.correctAnswer];

  return `
    <div class="review-card ${r.isCorrect ? 'correct-card' : 'wrong-card'}" id="rcard-${r.questionIndex}">
      <div class="review-card-header" onclick="toggleCard(${r.questionIndex})">
        <div class="review-card-left">
          <div class="review-q-number">Q${r.questionIndex + 1}</div>
          <div class="review-q-text">${r.question}</div>
        </div>
        <div class="review-card-right">
          <div class="result-badge ${r.isCorrect ? 'correct' : 'wrong'}">
            ${r.isCorrect ? '✅ Correct' : '❌ Wrong'}
          </div>
          <div class="marks-badge">${r.marks}/20</div>
          <div class="expand-btn">▼</div>
        </div>
      </div>

      <div class="review-card-body">
        <div class="answers-comparison">
          <div class="answer-box your-answer ${r.isCorrect ? 'was-correct' : ''}">
            <div class="answer-box-label">Your Answer</div>
            <div class="answer-box-text">${yourLetter}. ${yourAnswerText}</div>
          </div>
          <div class="answer-box correct-answer">
            <div class="answer-box-label">Correct Answer</div>
            <div class="answer-box-text">${correctLetter}. ${correctAnswerText}</div>
          </div>
        </div>

        <div class="ai-exp-section">
          <div class="ai-exp-header">
            <div class="ai-exp-title">
              🤖 AI Explanation
            </div>
            <button class="btn btn-sm btn-outline"
              onclick="openAiModal(${r.questionIndex})">
              Expand →
            </button>
          </div>
          <div class="ai-exp-body">${r.explanation}</div>
        </div>

        ${!r.isCorrect ? `
          <div style="margin-top:16px; text-align:right;">
            <a href="appeal.html" class="btn btn-sm btn-outline">⚖️ Appeal This Question</a>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// ---- TOGGLE CARD ----
function toggleCard(index) {
  const card = document.getElementById(`rcard-${index}`);
  card.classList.toggle('expanded');
}

// ---- FILTER ----
function filterQuestions(filter, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderQuestions(filter);
}

// ---- AI MODAL ----
function openAiModal(index) {
  const r = testResult.results[index];
  const yourAnswerText = r.selectedAnswer !== null ? r.options[r.selectedAnswer] : 'Not answered';
  const correctAnswerText = r.options[r.correctAnswer];

  document.getElementById('aiQuestion').textContent = r.question;
  document.getElementById('aiYourAnswer').textContent = `${r.selectedAnswer !== null ? letters[r.selectedAnswer] + '. ' : ''}${yourAnswerText}`;
  document.getElementById('aiCorrectAnswer').textContent = `${letters[r.correctAnswer]}. ${correctAnswerText}`;
  document.getElementById('aiExpText').textContent = r.explanation;

  document.getElementById('aiModal').classList.add('open');
}

function closeAiModal() {
  document.getElementById('aiModal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('aiModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('aiModal')) closeAiModal();
});
