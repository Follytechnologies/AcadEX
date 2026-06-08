// ACADEX — Signup Page Logic

window.addEventListener('load', () => {
  // If already logged in redirect
  const user = AcadEx.getSession();
  if (user) AcadEx.redirectByRole(user);

  // Password strength
  document.getElementById('password').addEventListener('input', function () {
    const val = this.value;
    const el = document.getElementById('passwordStrength');
    el.className = 'password-strength';
    if (val.length === 0) { el.style.display = 'none'; return; }
    el.style.display = 'block';
    if (val.length < 6) el.classList.add('weak');
    else if (val.length < 10) el.classList.add('medium');
    else el.classList.add('strong');
  });
});

function onMatricInput(value) {
  const preview = document.getElementById('levelPreview');
  const levelText = document.getElementById('levelText');
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

function togglePassword(id, btn) {
  const input = document.getElementById(id);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.style.opacity = isPassword ? '1' : '0.5';
}

function showError(msg) {
  const el = document.getElementById('signupError');
  document.getElementById('signupErrorText').textContent = msg;
  el.style.display = 'flex';
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  document.getElementById('signupError').style.display = 'none';
}

function handleSignup() {
  hideError();

  const fullName = document.getElementById('fullName').value.trim();
  const matricNumber = document.getElementById('matricNumber').value.trim();
  const faculty = document.getElementById('faculty').value;
  const department = document.getElementById('department').value.trim();
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsCheck = document.getElementById('termsCheck').checked;

  // Validation
  if (!fullName) { showError('Please enter your full name.'); return; }
  if (!matricNumber) { showError('Please enter your matric number.'); return; }
  if (!AcadEx.detectLevel(matricNumber)) { showError('Invalid matric number format. Please check and try again.'); return; }
  if (!faculty) { showError('Please select your faculty.'); return; }
  if (!department) { showError('Please enter your department.'); return; }
  if (password.length < 6) { showError('Password must be at least 6 characters.'); return; }
  if (password !== confirmPassword) { showError('Passwords do not match.'); return; }
  if (!termsCheck) { showError('Please agree to the terms to continue.'); return; }

  // Check if matric already exists
  const existing = AcadEx.mockUsers.find(u => u.matricNumber === matricNumber);
  if (existing) { showError('An account with this matric number already exists. Please sign in instead.'); return; }

  const btn = document.getElementById('signupBtn');
  btn.disabled = true;
  btn.textContent = 'Creating Account...';

  setTimeout(() => {
    const level = AcadEx.detectLevel(matricNumber);

    // Add to mock users
    const newUser = {
      matricNumber,
      name: fullName,
      password,
      role: 'student',
      faculty,
      department,
      email: `${matricNumber}@unilag.edu.ng`,
      level,
      levelLabel: AcadEx.getLevelLabel(level),
    };

    AcadEx.mockUsers.push(newUser);

    // Save to localStorage so it persists this session
    const saved = JSON.parse(localStorage.getItem('acadex_registered_users') || '[]');
    saved.push({ ...newUser });
    localStorage.setItem('acadex_registered_users', JSON.stringify(saved));

    // Show success
    document.getElementById('successName').textContent = fullName.split(' ')[0];
    document.getElementById('successLevel').textContent = `${AcadEx.getLevelLabel(level)} · ${faculty}`;
    const successEl = document.getElementById('signupSuccess');
    successEl.style.display = 'flex';

    btn.disabled = false;
    btn.textContent = 'Create Account';
  }, 1200);
}
