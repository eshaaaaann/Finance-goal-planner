// Utility: simple in-memory user store (demo only)
const USERS_KEY = 'pfg_users_v1';
const SESSION_KEY = 'pfg_session';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function encodePw(pw) {
  return btoa(pw);
}

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  if (pw.length >= 10) score += 1;
  if (score <= 1) return 'weak';
  if (score <= 3) return 'ok';
  return 'strong';
}

// DOM refs
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toRegisterBtn = document.getElementById('to-register');
const toLoginBtn = document.getElementById('to-login');
const loginMessage = document.getElementById('login-message');
const registerMessage = document.getElementById('register-message');
const pwStrengthEl = document.getElementById('pw-strength');

// Toggle forms
function showLogin() {
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.add('active');
  registerForm.classList.remove('active');
  clearMessages();
}

function showRegister() {
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.add('active');
  loginForm.classList.remove('active');
  clearMessages();
}

if (tabLogin) tabLogin.addEventListener('click', showLogin);
if (tabRegister) tabRegister.addEventListener('click', showRegister);
if (toRegisterBtn) toRegisterBtn.addEventListener('click', showRegister);
if (toLoginBtn) toLoginBtn.addEventListener('click', showLogin);

function clearMessages() {
  if (loginMessage) {
    loginMessage.textContent = '';
    loginMessage.className = 'message';
  }
  if (registerMessage) {
    registerMessage.textContent = '';
    registerMessage.className = 'message';
  }
}

// Show/hide password buttons
Array.from(document.querySelectorAll('.show-btn')).forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.target;
    const input = document.getElementById(t);
    if (!input) return;
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Show';
    }
  });
});

// Register handler
if (registerForm) {
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const pw = document.getElementById('reg-password').value;
    const pwc = document.getElementById('reg-password-confirm').value;

    if (!name || !email || !pw) return showRegisterMessage('Please fill all required fields', 'error');
    if (pw.length < 6) return showRegisterMessage('Password must be at least 6 characters', 'error');
    if (pw !== pwc) return showRegisterMessage('Passwords do not match', 'error');

    const users = getUsers();
    if (users[email]) return showRegisterMessage('An account with that email already exists', 'error');

    users[email] = {
      name,
      email,
      pw: encodePw(pw),
      createdAt: Date.now(),
      goals: []
    };
    saveUsers(users);

    registerForm.reset();
    if (pwStrengthEl) pwStrengthEl.querySelector('span').textContent = '—';
    showRegisterMessage('Account created! You can now login.', 'success');
    setTimeout(() => showLogin(), 1500);
  });
}

function showRegisterMessage(msg, type) {
  if (!registerMessage) return;
  registerMessage.textContent = msg;
  registerMessage.className = 'message ' + (type === 'success' ? 'success' : 'error');
}

// Live password strength
const regPwInput = document.getElementById('reg-password');
if (regPwInput) {
  regPwInput.addEventListener('input', () => {
    const val = regPwInput.value;
    const s = passwordStrength(val);
    if (pwStrengthEl) {
      const span = pwStrengthEl.querySelector('span');
      span.textContent = s;
      span.className = s;
    }
  });
}

// Login handler
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const pw = document.getElementById('login-password').value;
    const remember = document.getElementById('remember-me').checked;

    const users = getUsers();
    const user = users[email];
    if (!user) return showLoginMessage('No account found with that email', 'error');

    if (user.pw !== encodePw(pw)) return showLoginMessage('Incorrect password', 'error');

    // Successful login
    showLoginMessage('Logged in successfully! Redirecting...', 'success');

    // Store session
    const session = { email, name: user.name, loggedAt: Date.now() };
    if (remember) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'dashboard.html';
    }, 900);
  });
}

function showLoginMessage(msg, type) {
  if (!loginMessage) return;
  loginMessage.textContent = msg;
  loginMessage.className = 'message ' + (type === 'success' ? 'success' : 'error');
}

// Check if already logged in
(function checkSession() {
  const s = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null');
  if (s && s.email) {
    // User is already logged in, redirect to dashboard
    window.location.href = 'dashboard.html';
  }
})();

// Initialize sample user if no users exist
(function initSampleUser() {
  const users = getUsers();
  if (Object.keys(users).length === 0) {
    users['john@example.com'] = {
      name: 'John Doe',
      email: 'john@example.com',
      pw: encodePw('password123'),
      createdAt: Date.now(),
      goals: []
    };
    saveUsers(users);
  }
})();
