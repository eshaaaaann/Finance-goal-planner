// In-memory user store (replaces localStorage for this demo)
let users = {};
let currentSession = null;

function encodePw(pw) {
  return btoa(pw);
}

function passwordStrength(pw) {
  let score = 0;
  if(pw.length >= 6) score += 1;
  if(/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
  if(/[0-9]/.test(pw)) score += 1;
  if(/[^A-Za-z0-9]/.test(pw)) score += 1;
  if(pw.length >= 10) score += 1;
  if(score <= 1) return 'weak';
  if(score <= 3) return 'ok';
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

tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);
toRegisterBtn.addEventListener('click', showRegister);
toLoginBtn.addEventListener('click', showLogin);

function clearMessages() {
  loginMessage.textContent = '';
  loginMessage.className = 'message';
  registerMessage.textContent = '';
  registerMessage.className = 'message';
}

// Show/hide password buttons
document.querySelectorAll('.show-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const t = btn.dataset.target;
    const input = document.getElementById(t);
    if(input.type === 'password') {
      input.type = 'text';
      btn.textContent = 'Hide';
    } else {
      input.type = 'password';
      btn.textContent = 'Show';
    }
  });
});

// Register handler
registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pw = document.getElementById('reg-password').value;
  const pwc = document.getElementById('reg-password-confirm').value;

  if(!name || !email || !pw) {
    return showRegisterMessage('Please fill all required fields', 'error');
  }
  if(pw.length < 6) {
    return showRegisterMessage('Password must be at least 6 characters', 'error');
  }
  if(pw !== pwc) {
    return showRegisterMessage('Passwords do not match', 'error');
  }

  if(users[email]) {
    return showRegisterMessage('An account with that email already exists', 'error');
  }

  users[email] = {
    name,
    email,
    pw: encodePw(pw),
    createdAt: Date.now(),
    goals: []
  };

  registerForm.reset();
  pwStrengthEl.querySelector('span').textContent = '-';
  showRegisterMessage('Account created! You can now login.', 'success');
  
  setTimeout(() => {
    showLogin();
  }, 1500);
});

function showRegisterMessage(msg, type) {
  registerMessage.textContent = msg;
  registerMessage.className = 'message ' + (type === 'success' ? 'success' : 'error');
}

// Live password strength
const regPwInput = document.getElementById('reg-password');
regPwInput.addEventListener('input', () => {
  const val = regPwInput.value;
  const s = passwordStrength(val);
  const span = pwStrengthEl.querySelector('span');
  span.textContent = s;
  span.className = s;
});

// Login handler
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pw = document.getElementById('login-password').value;
  const remember = document.getElementById('remember-me').checked;

  const user = users[email];
  if(!user) {
    return showLoginMessage('No account found with that email', 'error');
  }

  if(user.pw !== encodePw(pw)) {
    return showLoginMessage('Incorrect password', 'error');
  }

  // Successful login
  showLoginMessage('Logged in successfully! Redirecting...', 'success');

  currentSession = { email, name: user.name, loggedAt: Date.now(), remember };

  setTimeout(() => {
    showWelcome(user);
  }, 900);
});

function showLoginMessage(msg, type) {
  loginMessage.textContent = msg;
  loginMessage.className = 'message ' + (type === 'success' ? 'success' : 'error');
}

function showWelcome(user) {
  const card = document.getElementById('main-card');
  card.innerHTML = `
    <div class="welcome-screen">
      <h2>Welcome, ${escapeHtml(user.name)}! 👋</h2>
      <p class="muted">This is a demo session. Your profile email: ${escapeHtml(user.email)}</p>
      <div style="margin-top:24px; display:flex; gap:10px; justify-content:center;">
        <button id="go-dashboard" class="btn primary">Go to Dashboard</button>
        <button id="logout" class="btn link">Logout</button>
      </div>
    </div>`;

  document.getElementById('logout').addEventListener('click', () => {
    currentSession = null;
    location.reload();
  });

  document.getElementById('go-dashboard').addEventListener('click', () => {
    alert('In the full project this would open the Finance Goal dashboard.');
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}