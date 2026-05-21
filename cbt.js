// ============================================
// ACADEX — CBT Test Page Logic
// ============================================

const TOTAL_TIME = 10 * 60; // 10 minutes in seconds
const questions = AcadEx.mockCBTQuestions;
const TOTAL_QUESTIONS = questions.length;

let currentQuestion = 0;
let answers = {}; // { questionIndex: optionIndex }
let timeLeft = TOTAL_TIME;
let timerInterval = null;
let testStarted = false;
let testSubmitted = false;

// ---- INIT ----
window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;

  if (user.role !== 'student' || user.level !== 100) {
    AcadEx.redirectByRole(user);
    return;
  }

  populatePreScreen(user);
});

function populatePreScreen(user) {
  const container = document.getElementById('preStudentInfo');
  container.innerHTML = `
    <div class="pre-student-avatar">${AcadEx.getInitials(user.name)}</div>
    <div class="pre-student-details">
      <strong>${user.name}</strong>
      <span>${user.matricNumber} · ${user.levelLabel} · ${user.faculty}</span>
    </div>
  `;
}

// ---- START TEST ----
function startTest() {
  testStarted = true;
  showScreen('testScreen');
  renderQuestion(0);
  renderQMap();
  renderQDots();
  startTimer();
}

// ---- TIMER ----
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();

    if (timeLeft <= 120 && timeLeft > 60) {
      document.getElementById('timerWrap').classList.add('warning');
    }
    if (timeLeft <= 60) {
      document.getElementById('timerWrap').classList.remove('warning');
      document.getElementById('timerWrap').classList.add('danger');
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      showTimeUp();
    }
  }, 1000);
}

function updateTimerDisplay() {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${mins}:${secs}`;
}

function showTimeUp() {
  document.getElementById('timeUpModal').classList.add('open');
}

// ---- RENDER QUESTION ----
function renderQuestion(index) {
  currentQuestion = index;
  const q = questions[index];
  const letters = ['A', 'B', 'C', 'D', 'E'];

  document.getElementById('qBadge').textContent = `Q${index + 1}`;
  document.getElementById('qMarks').textContent = '20 marks';
  document.getElementById('qText').textContent = q.question;
  document.getElementById('questionCounter').textContent = `Question ${index + 1} of ${TOTAL_QUESTIONS}`;

  const answeredCount = Object.keys(answers).length;
  document.getElementById('answeredCount').textContent = `${answeredCount} answered`;

  const progressPct = ((index + 1) / TOTAL_QUESTIONS) * 100;
  document.getElementById('progressFill').style.width = progressPct + '%';

  // Options
  const optionsGrid = document.getElementById('optionsGrid');
  optionsGrid.innerHTML = q.options.map((opt, i) => `
    <div class="option-item ${answers[index] === i ? 'selected' : ''}"
         onclick="selectAnswer(${index}, ${i})">
      <div class="option-letter">${letters[i]}</div>
      <div class="option-text">${opt}</div>
    </div>
  `).join('');

  // Prev/Next buttons
  document.getElementById('prevBtn').disabled = index === 0;
  document.getElementById('nextBtn').textContent = index === TOTAL_QUESTIONS - 1 ? 'Finish →' : 'Next →';

  // Update map + dots
  renderQMap();
  renderQDots();

  // Animate card
  const card = document.getElementById('questionCard');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'fadeUp 0.3s ease both';
}

// ---- SELECT ANSWER ----
function selectAnswer(questionIndex, optionIndex) {
  answers[questionIndex] = optionIndex;

  // Re-render options with selection
  const q = questions[questionIndex];
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const optionsGrid = document.getElementById('optionsGrid');
  optionsGrid.innerHTML = q.options.map((opt, i) => `
    <div class="option-item ${answers[questionIndex] === i ? 'selected' : ''}"
         onclick="selectAnswer(${questionIndex}, ${i})">
      <div class="option-letter">${letters[i]}</div>
      <div class="option-text">${opt}</div>
    </div>
  `).join('');

  // Update answered count
  const answeredCount = Object.keys(answers).length;
  document.getElementById('answeredCount').textContent = `${answeredCount} answered`;

  renderQMap();
  renderQDots();

  // Auto advance after 0.5s if not last question
  if (questionIndex < TOTAL_QUESTIONS - 1) {
    setTimeout(() => nextQuestion(), 500);
  }
}

// ---- NAVIGATION ----
function nextQuestion() {
  if (currentQuestion < TOTAL_QUESTIONS - 1) {
    renderQuestion(currentQuestion + 1);
  } else {
    confirmSubmit();
  }
}

function prevQuestion() {
  if (currentQuestion > 0) {
    renderQuestion(currentQuestion - 1);
  }
}

function goToQuestion(index) {
  renderQuestion(index);
}

// ---- QUESTION MAP ----
function renderQMap() {
  const container = document.getElementById('qMap');
  container.innerHTML = questions.map((_, i) => {
    let cls = 'q-map-btn';
    if (i === currentQuestion) cls += ' current';
    else if (answers[i] !== undefined) cls += ' answered';
    return `<button class="${cls}" onclick="goToQuestion(${i})">${i + 1}</button>`;
  }).join('');
}

// ---- Q DOTS ----
function renderQDots() {
  const container = document.getElementById('qNavDots');
  container.innerHTML = questions.map((_, i) => {
    let cls = 'q-dot';
    if (i === currentQuestion) cls += ' current';
    else if (answers[i] !== undefined) cls += ' answered';
    else cls += ' unanswered';
    return `<div class="${cls}" onclick="goToQuestion(${i})"></div>`;
  }).join('');
}

// ---- SUBMIT ----
function confirmSubmit() {
  const answeredCount = Object.keys(answers).length;
  const unanswered = TOTAL_QUESTIONS - answeredCount;
  document.getElementById('submitModalBody').textContent =
    `You have answered ${answeredCount} of ${TOTAL_QUESTIONS} questions. ${unanswered > 0 ? `${unanswered} unanswered question${unanswered > 1 ? 's' : ''} will be marked wrong.` : 'All questions answered — great job!'}`;
  document.getElementById('submitModal').classList.add('open');
}

function closeModal() {
  document.getElementById('submitModal').classList.remove('open');
}

function submitTest() {
  if (testSubmitted) return;
  testSubmitted = true;

  clearInterval(timerInterval);

  // Close modals
  document.getElementById('submitModal').classList.remove('open');
  document.getElementById('timeUpModal').classList.remove('open');

  // Calculate results
  const results = questions.map((q, i) => ({
    questionIndex: i,
    question: q.question,
    options: q.options,
    selectedAnswer: answers[i] !== undefined ? answers[i] : null,
    correctAnswer: q.correct,
    isCorrect: answers[i] === q.correct,
    explanation: q.explanation,
    marks: answers[i] === q.correct ? 20 : 0
  }));

  const totalScore = results.filter(r => r.isCorrect).length * 20;
  const percentage = Math.round((totalScore / 100) * 100);

  // Save results to localStorage for review page
  const testResult = {
    id: Date.now(),
    testName: 'MTH 101 — Introduction to Pure Mathematics',
    course: 'MTH 101',
    date: new Date().toISOString(),
    score: totalScore,
    percentage: percentage,
    totalQuestions: TOTAL_QUESTIONS,
    correct: results.filter(r => r.isCorrect).length,
    wrong: results.filter(r => !r.isCorrect).length,
    timeTaken: TOTAL_TIME - timeLeft,
    results: results
  };

  localStorage.setItem('acadex_latest_result', JSON.stringify(testResult));

  AcadEx.showToast('Test submitted! Redirecting to your results...', 'success');
  setTimeout(() => {
    window.location.href = 'review.html';
  }, 1200);
}

// ---- SCREEN SWITCHER ----
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ---- PREVENT ACCIDENTAL NAVIGATION ----
window.addEventListener('beforeunload', (e) => {
  if (testStarted && !testSubmitted) {
    e.preventDefault();
    e.returnValue = '';
  }
});
