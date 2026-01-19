// In-memory storage keys
const USERS_KEY = 'pfg_users_v1';
const SESSION_KEY = 'pfg_session';
const GOALS_KEY = 'pfg_goals_v1';
const ACTIVITIES_KEY = 'pfg_activities_v1';

// Get current user session
function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch (e) {
    return null;
  }
}

// Get users
function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

// Get goals
function getGoals() {
  try {
    return JSON.parse(localStorage.getItem(GOALS_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// Save goals
function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
}

// Get activities
function getActivities() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITIES_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

// Save activities
function saveActivities(activities) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
}

// Check if user is logged in
const session = getSession();
if (!session || !session.email) {
  window.location.href = 'index.html';
}

const currentUserEmail = session.email;
const users = getUsers();
const currentUser = users[currentUserEmail];

if (!currentUser) {
  window.location.href = 'index.html';
}

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

let editingGoalId = null;

// Initialize
function init() {
  userNameEl.textContent = currentUser.name;
  loadSampleDataIfNeeded();
  renderGoals();
  renderActivities();
  updateStats();
}

// Load sample data if no goals exist for this user
function loadSampleDataIfNeeded() {
  const allGoals = getGoals();
  const userGoals = allGoals.filter(g => g.userEmail === currentUserEmail);
  
  if (userGoals.length === 0) {
    const sampleGoals = [
      { 
        id: Date.now() + 1,
        userEmail: currentUserEmail,
        name: 'Emergency Fund', 
        target: 50000, 
        current: 15000, 
        createdAt: Date.now() - 86400000 * 5 
      },
      { 
        id: Date.now() + 2,
        userEmail: currentUserEmail,
        name: 'Vacation to Goa', 
        target: 30000, 
        current: 8000, 
        createdAt: Date.now() - 86400000 * 3 
      },
      { 
        id: Date.now() + 3,
        userEmail: currentUserEmail,
        name: 'New Laptop', 
        target: 60000, 
        current: 45000, 
        createdAt: Date.now() - 86400000 * 1 
      }
    ];
    
    saveGoals([...allGoals, ...sampleGoals]);
    
    // Add sample activities
    const activities = getActivities();
    const sampleActivities = [
      { userEmail: currentUserEmail, text: 'Added Rs 5,000 to Emergency Fund', date: Date.now() - 3600000 },
      { userEmail: currentUserEmail, text: 'Created goal: New Laptop', date: Date.now() - 86400000 },
      { userEmail: currentUserEmail, text: 'Added Rs 2,000 to Vacation to Goa', date: Date.now() - 86400000 * 2 }
    ];
    saveActivities([...activities, ...sampleActivities]);
  }
}

// Render goals
function renderGoals() {
  const allGoals = getGoals();
  const userGoals = allGoals.filter(g => g.userEmail === currentUserEmail);
  
  if (userGoals.length === 0) {
    goalsList.innerHTML = `
      <div class="empty-state">
        <p>📊 No goals yet!</p>
        <button class="btn-add" onclick="document.getElementById('add-goal-btn').click()">Create Your First Goal</button>
      </div>`;
    return;
  }

  goalsList.innerHTML = userGoals.map(goal => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    return `
      <div class="goal-item">
        <div class="goal-header">
          <div class="goal-title">${escapeHtml(goal.name)}</div>
          <div class="goal-amount">Rs${goal.current.toLocaleString()} / Rs${goal.target.toLocaleString()}</div>
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
  const allActivities = getActivities();
  const userActivities = allActivities.filter(a => a.userEmail === currentUserEmail);
  
  if (userActivities.length === 0) {
    activityList.innerHTML = '<div class="empty-state"><p>No activity yet</p></div>';
    return;
  }

  activityList.innerHTML = userActivities.slice(0, 5).map(activity => `
    <div class="activity-item">
      ${escapeHtml(activity.text)}
      <div class="activity-date">${formatDate(activity.date)}</div>
    </div>
  `).join('');
}

// Update stats
function updateStats() {
  const allGoals = getGoals();
  const userGoals = allGoals.filter(g => g.userEmail === currentUserEmail);
  
  const totalGoals = userGoals.length;
  const totalTarget = userGoals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = userGoals.reduce((sum, g) => sum + g.current, 0);
  const completion = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  document.getElementById('total-goals').textContent = totalGoals;
  document.getElementById('total-target').textContent = 'Rs' + totalTarget.toLocaleString();
  document.getElementById('total-saved').textContent = 'Rs' + totalSaved.toLocaleString();
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

  const allGoals = getGoals();

  if (editingGoalId) {
    // Edit existing goal
    const goalIndex = allGoals.findIndex(g => g.id === editingGoalId);
    if (goalIndex !== -1) {
      allGoals[goalIndex].name = name;
      allGoals[goalIndex].target = target;
      allGoals[goalIndex].current = current;
    }
    addActivity(`Updated goal: ${name}`);
  } else {
    // Add new goal
    const newGoal = {
      id: Date.now(),
      userEmail: currentUserEmail,
      name,
      target,
      current,
      createdAt: Date.now()
    };
    allGoals.push(newGoal);
    addActivity(`Created goal: ${name}`);
  }

  saveGoals(allGoals);
  renderGoals();
  renderActivities();
  updateStats();
  goalModal.classList.remove('active');
});

// Edit goal
function editGoal(id) {
  const allGoals = getGoals();
  const goal = allGoals.find(g => g.id === id);
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
  const allGoals = getGoals();
  const goal = allGoals.find(g => g.id === id);
  if (!goal) return;

  const amount = prompt(`How much would you like to add to "${goal.name}"?`, '1000');
  if (amount && !isNaN(amount) && parseInt(amount) > 0) {
    const addedAmount = parseInt(amount);
    goal.current = Math.min(goal.current + addedAmount, goal.target);
    saveGoals(allGoals);
    addActivity(`Added Rs${addedAmount.toLocaleString()} to ${goal.name}`);
    renderGoals();
    renderActivities();
    updateStats();
  }
}

// Delete goal
function deleteGoal(id) {
  const allGoals = getGoals();
  const goal = allGoals.find(g => g.id === id);
  if (!goal) return;

  if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
    const updatedGoals = allGoals.filter(g => g.id !== id);
    saveGoals(updatedGoals);
    addActivity(`Deleted goal: ${goal.name}`);
    renderGoals();
    renderActivities();
    updateStats();
  }
}

// Add activity
function addActivity(text) {
  const activities = getActivities();
  activities.unshift({ 
    userEmail: currentUserEmail, 
    text, 
    date: Date.now() 
  });
  if (activities.length > 50) activities.pop();
  saveActivities(activities);
}

// Logout
logoutBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
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
