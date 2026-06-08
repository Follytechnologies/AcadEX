// ============================================
// ACADEX — Login Page Logic (FIXED — Firebase)
// ============================================

let activeTab = 'student';

window.addEventListener('load', () => {
  const user = AcadEx.getSession();
  if (user) AcadEx.redirectByRole(user);
  hideError();
});

function toggleDemo() {
  const box = document.getElementById('demoAccounts');
  const label = document.getElementById('demoToggleLabel');
  const isVisible = box.style.display !== 'none';
  box.style.display = isVisible ? 'none' : 'block';
  if (label) label.textContent = isVisible ? 'Try a demo account' : 'Hide demo accounts';
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active',
      (i === 0 && tab === 'student') || (i === 1 && tab === 'lecturer')
    );
  });
  document.getElementById('studentForm').style.display = tab === 'student' ? 'flex' : 'none';
  document.getElementById('lecturerForm').style.display = tab === 'lecturer' ? 'flex' : 'none';
  document.getElementById('studentForm').style.flexDirection = 'column';
  hideError();
}

function onMatricInput(value) {
  const preview = document.getElementById('levelPreview');
  const levelText = document.getElementById('levelText');
  if (!preview || !levelText) return;
  if (value.length >= 2) {
    const level = AcadEx.detectLevel(value);
    if (level) {
      levelText.textContent = `Detected: ${AcadEx.getLevelLabel(level)} Student`;
      preview.style.display = 'flex';
    } else {
      preview.style.display = 'none';
    }
  } else {
    preview.style.display = 'none';
  }
}

async function login() {
  hideError();

  let identifier, password, btn, defaultText;

  if (activeTab === 'student') {
    identifier = document.getElementById('matricInput').value.trim();
    password = document.getElementById('studentPassword').value;
    btn = document.getElementById('loginBtn');
    defaultText = 'Sign In to AcadEx';
  } else {
    identifier = document.getElementById('staffInput').value.trim();
    password = document.getElementById('lecturerPassword').value;
    btn = document.getElementById('loginBtn2');
    defaultText = 'Sign In as Lecturer';
  }

  if (!identifier || !password) { showError('Please fill in all fields.'); return; }

  AcadEx.setLoading(btn, true, 'Signing in...');

  try {
    const result = await AcadEx.login(identifier, password);
    AcadEx.setLoading(btn, false, defaultText);

    if (result.success) {
      AcadEx.showToast('Welcome, ' + result.user.name.split(' ')[0] + '!', 'success');
      setTimeout(() => AcadEx.redirectByRole(result.user), 800);
    } else {
      showError(result.message || 'Login failed. Please try again.');
    }
  } catch (e) {
    AcadEx.setLoading(btn, false, defaultText);
    showError('Something went wrong. Please try again.');
    console.error('Login error:', e);
  }
}

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

function showError(msg) {
  const el = document.getElementById('errorMsg');
  const textEl = document.getElementById('errorText');
  if (!el) return;
  if (textEl) textEl.textContent = msg;
  el.style.display = 'flex';
  el.classList.add('show');
}

function hideError() {
  const el = document.getElementById('errorMsg');
  if (el) { el.style.display = 'none'; el.classList.remove('show'); }
}

document.addEventListener('keydown', (e) => { if (e.key === 'Enter') login(); });