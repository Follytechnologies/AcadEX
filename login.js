// ============================================
// ACADEX — Login Page Logic (index.js)
// ============================================

let activeTab = 'student';

// Check if already logged in on page load
window.addEventListener('load', () => {
  const user = AcadEx.getSession();
  if (user) AcadEx.redirectByRole(user);

  // Make sure error is hidden on load
  hideError();
});

// Toggle demo accounts visibility
function toggleDemo() {
  const box = document.getElementById('demoAccounts');
  const icon = document.getElementById('demoToggleIcon');
  const isVisible = box.style.display !== 'none';
  box.style.display = isVisible ? 'none' : 'block';
  icon.textContent = isVisible ? '▶' : '▼';
}

// Switch between Student and Lecturer tabs
function switchTab(tab) {
  activeTab = tab;

  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active',
      (i === 0 && tab === 'student') ||
      (i === 1 && tab === 'lecturer')
    );
  });

  document.getElementById('studentForm').style.display = tab === 'student' ? 'flex' : 'none';
  document.getElementById('lecturerForm').style.display = tab === 'lecturer' ? 'flex' : 'none';
  document.getElementById('studentForm').style.flexDirection = 'column';

  hideError();
}

// Detect level as user types matric number
function onMatricInput(value) {
  const preview = document.getElementById('levelPreview');
  const levelText = document.getElementById('levelText');

  if (value.length >= 2) {
    const level = AcadEx.detectLevel(value);
    if (level) {
      levelText.textContent = `Detected: ${AcadEx.getLevelLabel(level)} Student`;
      preview.classList.add('show');
    } else {
      preview.classList.remove('show');
    }
  } else {
    preview.classList.remove('show');
  }
}

// Handle login submission
function login() {
  hideError();

  let identifier, password, btn, loadingText, defaultText;

  if (activeTab === 'student') {
    identifier = document.getElementById('matricInput').value.trim();
    password = document.getElementById('studentPassword').value;
    btn = document.getElementById('loginBtn');
    loadingText = 'Signing in...';
    defaultText = 'Sign In to AcadEx';
  } else {
    identifier = document.getElementById('staffInput').value.trim();
    password = document.getElementById('lecturerPassword').value;
    btn = document.getElementById('loginBtn2');
    loadingText = 'Signing in...';
    defaultText = 'Sign In as Lecturer';
  }

  if (!identifier || !password) {
    showError('Please fill in all fields.');
    return;
  }

  AcadEx.setLoading(btn, true, loadingText);

  setTimeout(() => {
    const result = AcadEx.login(identifier, password);
    AcadEx.setLoading(btn, false, defaultText);

    if (result.success) {
      AcadEx.showToast('Welcome, ' + result.user.name.split(' ')[0] + '!', 'success');
      setTimeout(() => AcadEx.redirectByRole(result.user), 800);
    } else {
      showError(result.message);
    }
  }, 900);
}

// Fill demo credentials
function fillDemo(id, pass, role) {
  if (role === 'student') {
    switchTab('student');
    document.getElementById('matricInput').value = id;
    document.getElementById('studentPassword').value = pass;
    onMatricInput(id);
  } else {
    switchTab('lecturer');
    document.getElementById('staffInput').value = id;
    document.getElementById('lecturerPassword').value = pass;
  }
  AcadEx.showToast('Demo credentials filled. Click Sign In.', 'info');
}

// Show error message — only called after failed login
function showError(msg) {
  const el = document.getElementById('errorMsg');
  document.getElementById('errorText').textContent = msg;
  el.classList.add('show');
}

// Hide error message
function hideError() {
  const el = document.getElementById('errorMsg');
  if (el) el.classList.remove('show');
}

// Allow Enter key to submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') login();
});
