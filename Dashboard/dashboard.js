// In-memory storage
let goals = [];
let activities = [];
let currentUser = { name: 'John Doe', email: 'user@example.com' };
let editingGoalId = null;

// DOM Elements
const userNameEl = document.getElementById('user-name');
const goalsList = document.getElementById('goals-list');
const activityList = document.getElementById('activity-list');
const goalModal = document.getElementById('goal-modal');
const goalForm = document.getElementById('goal-form');
const addGoalBtn = document.getElementById('add-goal-btn');
const cancelBtn = document.getElementById('cancel-btn');
const logoutBtn = document.getElementById('logout-btn');
const modalTitle = document.getElementById('modal-title');

// Initialize
function init() {
  userNameEl.textContent = currentUser.name;
  loadSampleData();
  renderGoals();
  renderActivities();
  updateStats();
}

// Load sample data
function loadSampleData() {
  goals = [
    { id: 1, name: 'Emergency Fund', target: 50000, current: 15000, createdAt: Date.now() - 86400000 * 5 },
    { id: 2, name: 'Vacation to Goa', target: 30000, current: 8000, createdAt: Date.now() - 86400000 * 3 },
    { id: 3, name: 'New Laptop', target: 60000, current: 45000, createdAt: Date.now() - 86400000 * 1 }
  ];
  activities = [
    { text: 'Added ₹5,000 to Emergency Fund', date: Date.now() - 3600000 },
    { text: 'Created goal: New Laptop', date: Date.now() - 86400000 },
    { text: 'Added ₹2,000 to Vacation to Goa', date: Date.now() - 86400000 * 2 }
  ];
}

// Render goals
function renderGoals() {
  if (goals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-state">
        <p>📊 No goals yet!</p>
        <button class="btn-add" onclick="document.getElementById('add-goal-btn').click()">Create Your First Goal</button>
      </div>`;
    return;
  }

  goalsList.innerHTML = goals.map(goal => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    return `
      <div class="goal-item">
        <div class="goal-header">
          <div class="goal-title">${escapeHtml(goal.name)}</div>
          <div class="goal-amount">₹${goal.current.toLocaleString()} / ₹${goal.target.toLocaleString()}</div>
        </div>
        <div class="goal-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-text">${progress.toFixed(1)}% completed</div>
        </div>
        <div class="goal-actions">
          <button class="btn-small" onclick="addMoney(${goal.id})">+ Add Money</button>
          <button class="btn-small" onclick="editGoal(${goal.id})">Edit</button>
          <button class="btn-small btn-delete" onclick="deleteGoal(${goal.id})">Delete</button>
        </div>
      </div>
    `;
  }).join('');
}

// Render activities
function renderActivities() {
  if (activities.length === 0) {
    activityList.innerHTML = '<div class="empty-state"><p>No activity yet</p></div>';
    return;
  }

  activityList.innerHTML = activities.slice(0, 5).map(activity => `
    <div class="activity-item">
      ${escapeHtml(activity.text)}
      <div class="activity-date">${formatDate(activity.date)}</div>
    </div>
  `).join('');
}

// Update stats
function updateStats() {
  const totalGoals = goals.length;
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const completion = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  document.getElementById('total-goals').textContent = totalGoals;
  document.getElementById('total-target').textContent = '₹' + totalTarget.toLocaleString();
  document.getElementById('total-saved').textContent = '₹' + totalSaved.toLocaleString();
  document.getElementById('completion-rate').textContent = completion.toFixed(1) + '%';
}

// Open modal for new goal
addGoalBtn.addEventListener('click', () => {
  editingGoalId = null;
  modalTitle.textContent = 'Add New Goal';
  goalForm.reset();
  goalModal.classList.add('active');
});

// Close modal
cancelBtn.addEventListener('click', () => {
  goalModal.classList.remove('active');
});

// Close modal on outside click
goalModal.addEventListener('click', (e) => {
  if (e.target === goalModal) {
    goalModal.classList.remove('active');
  }
});

// Save goal
goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('goal-name').value.trim();
  const target = parseInt(document.getElementById('goal-target').value);
  const current = parseInt(document.getElementById('goal-current').value);

  if (editingGoalId) {
    // Edit existing goal
    const goal = goals.find(g => g.id === editingGoalId);
    goal.name = name;
    goal.target = target;
    goal.current = current;
    addActivity(`Updated goal: ${name}`);
  } else {
    // Add new goal
    const newGoal = {
      id: Date.now(),
      name,
      target,
      current,
      createdAt: Date.now()
    };
    goals.push(newGoal);
    addActivity(`Created goal: ${name}`);
  }

  renderGoals();
  renderActivities();
  updateStats();
  goalModal.classList.remove('active');
});

// Edit goal
function editGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  editingGoalId = id;
  modalTitle.textContent = 'Edit Goal';
  document.getElementById('goal-name').value = goal.name;
  document.getElementById('goal-target').value = goal.target;
  document.getElementById('goal-current').value = goal.current;
  goalModal.classList.add('active');
}

// Add money to goal
function addMoney(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  const amount = prompt(`How much would you like to add to "${goal.name}"?`, '1000');
  if (amount && !isNaN(amount) && parseInt(amount) > 0) {
    const addedAmount = parseInt(amount);
    goal.current = Math.min(goal.current + addedAmount, goal.target);
    addActivity(`Added ₹${addedAmount.toLocaleString()} to ${goal.name}`);
    renderGoals();
    renderActivities();
    updateStats();
  }
}

// Delete goal
function deleteGoal(id) {
  const goal = goals.find(g => g.id === id);
  if (!goal) return;

  if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
    goals = goals.filter(g => g.id !== id);
    addActivity(`Deleted goal: ${goal.name}`);
    renderGoals();
    renderActivities();
    updateStats();
  }
}

// Add activity
function addActivity(text) {
  activities.unshift({ text, date: Date.now() });
  if (activities.length > 10) activities.pop();
}

// Logout
logoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    alert('Logged out! Redirecting to login page...');
    // In real app: window.location.href = 'index.html';
  }
});

// Helper functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
  return date.toLocaleDateString();
}

// Initialize app
init();