// ============================================
// ACADEX — Onboarding / Student Guide Logic
// ============================================

let currentModalId = null;
let currentFilter = 'all';
let completedItems = {};

// ---- GUIDE DATA ----
const guideItems = [
  {
    id: 'g1',
    category: 'registration',
    icon: '📝',
    iconBg: 'rgba(26,60,110,0.08)',
    color: '#1A3C6E',
    title: 'Course Registration',
    desc: 'Learn how to register your courses for the semester using the UNILAG student portal.',
    steps: [
      { title: 'Access the Portal', body: 'Visit <strong>studentportal.unilag.edu.ng</strong> and log in with your matric number and default password (usually your date of birth in DDMMYYYY format).' },
      { title: 'Navigate to Registration', body: 'Click on "Course Registration" in the left sidebar menu. Make sure you are registering for the correct semester.' },
      { title: 'Select Your Courses', body: 'Choose courses assigned to your department and level. Pay attention to credit units — 100 Level students typically carry 24–30 units per semester.' },
      { title: 'Add Electives', body: 'Some departments allow electives. Check with your department\'s academic adviser for approved electives for your programme.' },
      { title: 'Submit and Print', body: 'Click Submit, then print or screenshot your registration form. You will need this for exams and school fee payment.' },
    ],
    tip: '💡 Register early. The portal can be slow during peak periods. Try logging in early mornings.'
  },
  {
    id: 'g2',
    category: 'registration',
    icon: '💰',
    iconBg: 'rgba(255,184,0,0.1)',
    color: '#FFB800',
    title: 'School Fees Payment',
    desc: 'How to pay your UNILAG school fees and get your payment receipt for clearance.',
    steps: [
      { title: 'Generate Invoice', body: 'Log in to the student portal and navigate to "Finance" → "Generate Invoice". Select the correct session and semester.' },
      { title: 'Pay via Remita', body: 'UNILAG uses the Remita payment platform. Copy your RRR (Remita Retrieval Reference) number and pay at any bank or via internet banking.' },
      { title: 'Confirm Payment', body: 'Return to the portal after 24 hours and confirm your payment. The status should change to "Paid".' },
      { title: 'Print Receipt', body: 'Download and print your payment receipt. Keep multiple copies — you will need this for exams, clearance, and departmental records.' },
    ],
    tip: '💡 Pay before the deadline to avoid late fees. Check the Academic Calendar for payment deadlines each semester.'
  },
  {
    id: 'g3',
    category: 'academic',
    icon: '🎓',
    iconBg: 'rgba(0,201,167,0.08)',
    color: '#00C9A7',
    title: 'Understanding Credit Units',
    desc: 'What credit units are, how they affect your GPA, and how many you need to graduate.',
    steps: [
      { title: 'What is a Credit Unit?', body: 'A credit unit (CU) represents the weight of a course. A 3-unit course means 3 hours of lecture per week. Most UNILAG courses are 2 or 3 units.' },
      { title: 'Minimum Units Per Semester', body: 'You must carry a minimum of 15 credit units per semester to be considered a full-time student. Maximum is usually 24–30 units.' },
      { title: 'How GPA is Calculated', body: 'GPA = Sum of (Grade Points × Credit Units) ÷ Total Credit Units. A grade of A = 5 points, B = 4, C = 3, D = 2, E = 1, F = 0.' },
      { title: 'Minimum CGPA to Graduate', body: 'You need a minimum CGPA of 1.0 to remain in school and a CGPA of 1.5 or above to graduate. First Class requires 4.50+.' },
    ],
    tip: '💡 Never carry more courses than you can handle. A lower grade in a high-credit-unit course significantly pulls down your GPA.'
  },
  {
    id: 'g4',
    category: 'academic',
    icon: '📅',
    iconBg: 'rgba(26,60,110,0.06)',
    color: '#2557A7',
    title: 'Academic Calendar',
    desc: 'Understanding the UNILAG academic year, semester dates, and important deadlines.',
    steps: [
      { title: 'Two Semesters Per Year', body: 'UNILAG runs two semesters: First Semester (September–February) and Second Semester (March–July), with holidays in between.' },
      { title: 'Key Dates to Know', body: 'Mark these: resumption date, registration deadline, mid-semester exams, payment deadline, exam timetable release, and final exams period.' },
      { title: 'Carry-Over Policy', body: 'If you fail a course (score below 45%), you carry it over to the next time it is offered. Too many carry-overs can delay your graduation.' },
      { title: 'Deferment and Leave', body: 'If you need to take time off, apply for deferment through your department. You must have a valid reason supported by documentation.' },
    ],
    tip: '💡 Save the academic calendar PDF at the start of every session. Set reminders for deadlines — missed deadlines can cost you a full semester.'
  },
  {
    id: 'g5',
    category: 'academic',
    icon: '📊',
    iconBg: 'rgba(0,201,167,0.08)',
    color: '#00C9A7',
    title: 'How CBT Exams Work',
    desc: 'Everything about Computer-Based Tests at UNILAG — how to prepare and what to expect.',
    steps: [
      { title: 'What is CBT?', body: 'Computer-Based Testing (CBT) is used for 100 Level courses. You take the exam on a computer in the CBT centre. Questions are usually multiple choice.' },
      { title: 'Before the Exam', body: 'Arrive at the CBT centre 30 minutes early with your exam card and student ID. Late arrivals may not be allowed in.' },
      { title: 'During the Exam', body: 'You will be logged in with your matric number. Read each question carefully. You can navigate freely — answer easy questions first.' },
      { title: 'After Submission', body: 'On AcadEx, you can review your answers after grading. If you believe a question was wrongly marked, submit an appeal immediately.' },
    ],
    tip: '💡 Practice using AcadEx CBT before your real exam. Familiarity with the interface reduces exam anxiety.'
  },
  {
    id: 'g6',
    category: 'campus',
    icon: '🏛',
    iconBg: 'rgba(255,184,0,0.1)',
    color: '#FFB800',
    title: 'Navigating the Campus',
    desc: 'Key locations on UNILAG campus every fresher needs to know.',
    steps: [
      { title: 'Main Gate & Entrance', body: 'The main gate is on University Road, Akoka. Always carry your student ID — security may ask for it. There are also gates at Abule-Oja and the medical side.' },
      { title: 'Faculty Locations', body: 'Sciences, Engineering, and Education are in the main campus. Law and Social Sciences are near the Senate Building. The Library is centrally located.' },
      { title: 'The Library (Nimbe Adedipe)', body: 'UNILAG\'s main library has print and digital resources. Bring your student ID to access materials. There is also a 24-hour reading room.' },
      { title: 'Health Centre', body: 'The UNILAG Health Centre (Clinic) provides basic medical care. Register with them early — they handle referrals for NHIS and other health needs.' },
    ],
    tip: '💡 Download Google Maps and search "University of Lagos" to explore the campus layout before resumption.'
  },
  {
    id: 'g7',
    category: 'campus',
    icon: '🤝',
    iconBg: 'rgba(255,77,79,0.06)',
    color: '#FF4D4F',
    title: 'Student Associations & Clubs',
    desc: 'How to find your people and get involved in campus life beyond academics.',
    steps: [
      { title: 'Faculty Associations', body: 'Every faculty has a student association (e.g. SAULASS for Social Sciences, NUSS for Sciences). Join yours early — they organize tutorials, socials, and advocacy.' },
      { title: 'Religious Groups', body: 'MSSN (Muslim Students Society of Nigeria), SU (Student Union), and others are very active at UNILAG. They provide community, support, and events.' },
      { title: 'Tech & Professional Clubs', body: 'Google Developer Student Clubs, GDSC, IEEE, and others host hackathons, bootcamps, and networking events. Great for career development.' },
      { title: 'Sports & Culture', body: 'The Sports Complex hosts football, basketball, and swimming. There are also drama groups, cultural associations, and debate clubs.' },
    ],
    tip: '💡 Being active in one or two clubs is enough. Don\'t spread yourself too thin — your academics come first.'
  },
  {
    id: 'g8',
    category: 'tips',
    icon: '💡',
    iconBg: 'rgba(0,201,167,0.06)',
    color: '#00C9A7',
    title: 'Top 10 Survival Tips',
    desc: 'Hard-earned wisdom for thriving in your first year at UNILAG.',
    steps: [
      { title: 'Attend lectures consistently', body: 'Attendance can affect your continuous assessment score. More importantly, lecturers often give exam hints in class.' },
      { title: 'Form a serious study group', body: 'Study groups where everyone contributes are one of the most effective ways to cover material and fill knowledge gaps.' },
      { title: 'Get past questions early', body: 'UNILAG past questions follow patterns. Download them on AcadEx or from your department\'s WhatsApp group as early as possible.' },
      { title: 'Don\'t ignore GST courses', body: 'General Studies courses (GST 101, GST 111) are compulsory and often underestimated. Many students fail them and face carry-overs.' },
      { title: 'Build a relationship with your HOD', body: 'Your Head of Department can be very helpful during academic crises. Be respectful and professional in all interactions.' },
    ],
    tip: '💡 First year is about building habits, not just passing exams. The habits you form in 100 Level will define your entire degree.'
  },
];

// ---- INIT ----
window.addEventListener('load', () => {
  const user = AcadEx.requireAuth();
  if (!user) return;

  document.getElementById('navAvatar').textContent = AcadEx.getInitials(user.name);
  document.getElementById('navUserName').textContent = user.name.split(' ')[0];

  loadProgress();
  renderGuideGrid();
  updateHeroProgress();
});

// ---- LOAD PROGRESS ----
function loadProgress() {
  const saved = localStorage.getItem('acadex_onboarding');
  completedItems = saved ? JSON.parse(saved) : {};
}

// ---- SAVE PROGRESS ----
function saveProgress() {
  localStorage.setItem('acadex_onboarding', JSON.stringify(completedItems));
}

// ---- UPDATE HERO PROGRESS ----
function updateHeroProgress() {
  const total = guideItems.length;
  const completed = Object.values(completedItems).filter(Boolean).length;
  const pct = Math.round((completed / total) * 100);

  document.getElementById('progressLabel').textContent = `${completed} / ${total} completed`;
  document.getElementById('heroProgress').style.width = pct + '%';
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('remainingCount').textContent = total - completed;
}

// ---- RENDER GUIDE GRID ----
function renderGuideGrid(filter = 'all') {
  currentFilter = filter;
  const container = document.getElementById('guideGrid');

  const filtered = filter === 'all' ? guideItems : guideItems.filter(g => g.category === filter);

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--ink-faint);">No guides in this category yet.</div>`;
    return;
  }

  container.innerHTML = filtered.map(g => {
    const done = completedItems[g.id];
    return `
      <div class="guide-card ${done ? 'done' : ''}" onclick="openGuideModal('${g.id}')"
           style="--card-color: ${g.color}">
        <div class="guide-card-top">
          <div class="guide-card-icon" style="background: ${g.iconBg}">${g.icon}</div>
          <div class="guide-card-check">${done ? '✓' : ''}</div>
        </div>
        <div class="guide-card-title">${g.title}</div>
        <div class="guide-card-desc">${g.desc}</div>
        <div class="guide-card-footer">
          <span class="guide-cat-badge cat-${g.category}">${g.category}</span>
          <span class="guide-read-btn">${done ? 'Review →' : 'Read →'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ---- FILTER CATEGORY ----
function filterCategory(filter, btn) {
  document.querySelectorAll('.cat-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderGuideGrid(filter);
}

// ---- OPEN GUIDE MODAL ----
function openGuideModal(id) {
  currentModalId = id;
  const guide = guideItems.find(g => g.id === id);
  if (!guide) return;

  document.getElementById('modalIcon').textContent = guide.icon;
  document.getElementById('modalTitle').textContent = guide.title;
  document.getElementById('modalCategory').textContent = guide.category;

  const isDone = completedItems[id];
  const markBtn = document.getElementById('modalMarkBtn');
  markBtn.textContent = isDone ? '✓ Marked as Done' : '✓ Mark as Done';
  markBtn.className = `btn btn-sm ${isDone ? 'btn-ghost' : 'btn-accent'}`;

  document.getElementById('modalBody').innerHTML = `
    ${guide.steps.map((step, i) => `
      <div class="guide-step">
        <div class="guide-step-num">${i + 1}</div>
        <div class="guide-step-content">
          <strong>${step.title}</strong>
          <p>${step.body}</p>
        </div>
      </div>
    `).join('')}
    <div class="guide-tip-box">
      <strong>Pro Tip</strong>
      ${guide.tip}
    </div>
  `;

  document.getElementById('guideModal').classList.add('open');
}

// ---- MARK AS DONE ----
function markCurrentDone() {
  if (!currentModalId) return;
  completedItems[currentModalId] = true;
  saveProgress();
  updateHeroProgress();
  renderGuideGrid(currentFilter);

  const markBtn = document.getElementById('modalMarkBtn');
  markBtn.textContent = '✓ Marked as Done';
  markBtn.className = 'btn btn-sm btn-ghost';

  AcadEx.showToast('Great job! Guide marked as done 🎉', 'success');
}

// ---- CLOSE MODAL ----
function closeGuideModal() {
  document.getElementById('guideModal').classList.remove('open');
  currentModalId = null;
}

// Close on overlay click
document.getElementById('guideModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('guideModal')) closeGuideModal();
});
