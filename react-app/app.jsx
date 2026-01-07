import React, { useState, useEffect } from 'react';

export default function FinanceGoalPlanner() {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [goals, setGoals] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const sampleUsers = {
      'john@example.com': {
        name: 'John Doe',
        email: 'john@example.com',
        password: btoa('password123'),
        createdAt: Date.now()
      }
    };
    setUsers(sampleUsers);
  }, []);

  const handleLogin = (email, password) => {
    const user = users[email.toLowerCase()];
    if (user && user.password === btoa(password)) {
      setCurrentUser(user);
      loadUserData(user.email);
      setCurrentPage('dashboard');
      return { success: true };
    }
    return { success: false, error: 'Invalid credentials' };
  };

  const handleRegister = (name, email, password) => {
    const emailLower = email.toLowerCase();
    if (users[emailLower]) {
      return { success: false, error: 'User already exists' };
    }
    const newUser = {
      name,
      email: emailLower,
      password: btoa(password),
      createdAt: Date.now()
    };
    setUsers(prev => ({ ...prev, [emailLower]: newUser }));
    return { success: true };
  };

  const loadUserData = (email) => {
    const sampleGoals = [
      { id: 1, name: 'Emergency Fund', target: 50000, current: 15000, createdAt: Date.now() - 86400000 * 5 },
      { id: 2, name: 'Vacation to Goa', target: 30000, current: 8000, createdAt: Date.now() - 86400000 * 3 },
      { id: 3, name: 'New Laptop', target: 60000, current: 45000, createdAt: Date.now() - 86400000 * 1 }
    ];
    setGoals(sampleGoals);
    const sampleActivities = [
      { text: 'Added Rs 5000 to Emergency Fund', date: Date.now() - 3600000 },
      { text: 'Created goal New Laptop', date: Date.now() - 86400000 },
      { text: 'Added Rs 2000 to Vacation to Goa', date: Date.now() - 86400000 * 2 }
    ];
    setActivities(sampleActivities);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setGoals([]);
    setActivities([]);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {currentPage === 'login' && (
        <LoginRegisterPage 
          onLogin={handleLogin} 
          onRegister={handleRegister}
          onSuccess={() => setCurrentPage('dashboard')}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={currentUser}
          goals={goals}
          setGoals={setGoals}
          activities={activities}
          setActivities={setActivities}
          onLogout={handleLogout}
          onViewDatabase={() => setCurrentPage('database')}
        />
      )}
      {currentPage === 'database' && (
        <DatabaseViewer 
          users={users}
          goals={goals}
          activities={activities}
          onBack={() => setCurrentPage('dashboard')}
        />
      )}
    </div>
  );
}

function LoginRegisterPage({ onLogin, onRegister, onSuccess }) {
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loginMessage, setLoginMessage] = useState({ text: '', type: '' });
  const [registerMessage, setRegisterMessage] = useState({ text: '', type: '' });
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [pwStrength, setPwStrength] = useState('—');

  const calculatePwStrength = (pw) => {
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    if (pw.length >= 10) score += 1;
    if (score <= 1) return 'weak';
    if (score <= 3) return 'ok';
    return 'strong';
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const result = onLogin(loginData.email, loginData.password);
    if (result.success) {
      setLoginMessage({ text: 'Logged in successfully! Redirecting...', type: 'success' });
      setTimeout(() => onSuccess(), 900);
    } else {
      setLoginMessage({ text: result.error, type: 'error' });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (registerData.password.length < 6) {
      setRegisterMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    const result = onRegister(registerData.name, registerData.email, registerData.password);
    if (result.success) {
      setRegisterMessage({ text: 'Account created! You can now login.', type: 'success' });
      setTimeout(() => setActiveTab('login'), 1500);
    } else {
      setRegisterMessage({ text: result.error, type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Finance Goal Planner</h1>
          <p className="text-sm text-gray-600 mt-1">Login or create an account to track your goals</p>
        </div>
        <div className="flex gap-2 mb-6 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('login')}
            className={`flex-1 py-2 text-sm font-semibold transition-all ${activeTab === 'login' ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5' : 'text-gray-500'}`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 text-sm font-semibold transition-all ${activeTab === 'register' ? 'text-purple-600 border-b-2 border-purple-600 -mb-0.5' : 'text-gray-500'}`}
          >
            Register
          </button>
        </div>
        {activeTab === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} placeholder="you@example.com" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex gap-2">
                <input type={showLoginPw ? 'text' : 'password'} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter password" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
                <button type="button" onClick={() => setShowLoginPw(!showLoginPw)} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200">{showLoginPw ? 'Hide' : 'Show'}</button>
              </div>
            </div>
            <div className="flex items-center">
              <input type="checkbox" checked={loginData.remember} onChange={(e) => setLoginData({ ...loginData, remember: e.target.checked })} className="mr-2" />
              <label className="text-sm text-gray-600">Remember me</label>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Login</button>
              <button type="button" onClick={() => setActiveTab('register')} className="flex-1 py-2 text-purple-600 border border-transparent rounded-lg hover:underline">Create account</button>
            </div>
            {loginMessage.text && (<div className={`p-3 rounded-lg text-sm ${loginMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>{loginMessage.text}</div>)}
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
              <input type="text" value={registerData.name} onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })} placeholder="Your name" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={registerData.email} onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })} placeholder="you@example.com" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="flex gap-2">
                <input type={showRegPw ? 'text' : 'password'} value={registerData.password} onChange={(e) => { setRegisterData({ ...registerData, password: e.target.value }); setPwStrength(calculatePwStrength(e.target.value)); }} placeholder="Min 6 characters" required className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
                <button type="button" onClick={() => setShowRegPw(!showRegPw)} className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200">{showRegPw ? 'Hide' : 'Show'}</button>
              </div>
              <div className="text-xs text-gray-600 mt-1">Strength: <span className={`font-semibold ${pwStrength === 'weak' ? 'text-red-600' : pwStrength === 'ok' ? 'text-yellow-600' : pwStrength === 'strong' ? 'text-green-600' : ''}`}>{pwStrength}</span></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
              <input type="password" value={registerData.confirmPassword} onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })} placeholder="Repeat password" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">Register</button>
              <button type="button" onClick={() => setActiveTab('login')} className="flex-1 py-2 text-purple-600 border border-transparent rounded-lg hover:underline">Have an account? Login</button>
            </div>
            {registerMessage.text && (<div className={`p-3 rounded-lg text-sm ${registerMessage.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>{registerMessage.text}</div>)}
          </form>
        )}
      </div>
    </div>
  );
}

function Dashboard({ user, goals, setGoals, activities, setActivities, onLogout, onViewDatabase }) {
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ name: '', target: '', current: '' });
  const totalTarget = goals.reduce((sum, g) => sum + g.target, 0);
  const totalSaved = goals.reduce((sum, g) => sum + g.current, 0);
  const completion = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const addActivity = (text) => {
    setActivities(prev => [{ text, date: Date.now() }, ...prev].slice(0, 10));
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setFormData({ name: '', target: '', current: '0' });
    setShowModal(true);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setFormData({ name: goal.name, target: goal.target.toString(), current: goal.current.toString() });
    setShowModal(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (editingGoal) {
      setGoals(goals.map(g => g.id === editingGoal.id ? { ...g, ...formData, target: parseFloat(formData.target), current: parseFloat(formData.current) } : g));
      addActivity(`Updated goal: ${formData.name}`);
    } else {
      const newGoal = { id: Date.now(), name: formData.name, target: parseFloat(formData.target), current: parseFloat(formData.current), createdAt: Date.now() };
      setGoals([...goals, newGoal]);
      addActivity(`Created goal: ${formData.name}`);
    }
    setShowModal(false);
  };

  const handleAddMoney = (goal) => {
    const amount = prompt(`How much would you like to add to "${goal.name}"?`, '1000');
    if (amount && !isNaN(amount) && parseInt(amount) > 0) {
      const addedAmount = parseInt(amount);
      setGoals(goals.map(g => g.id === goal.id ? { ...g, current: Math.min(g.current + addedAmount, g.target) } : g));
      addActivity(`Added Rs ${addedAmount.toLocaleString()} to ${goal.name}`);
    }
  };

  const handleDeleteGoal = (goal) => {
    if (confirm(`Are you sure you want to delete "${goal.name}"?`)) {
      setGoals(goals.filter(g => g.id !== goal.id));
      addActivity(`Deleted goal: ${goal.name}`);
    }
  };

  const formatDate = (timestamp) => {
    const diff = Date.now() - timestamp;
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-5 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Finance Goal Planner</h1>
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm text-gray-600">Welcome, <strong>{user?.name}</strong></span>
            <button onClick={onViewDatabase} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200">View Database</button>
            <button onClick={onLogout} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200">Logout</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Goals</h3>
            <div className="text-3xl font-bold text-purple-600">{goals.length}</div>
            <div className="text-xs text-gray-500 mt-1">Active goals</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Target</h3>
            <div className="text-3xl font-bold text-purple-600">Rs{totalTarget.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Sum of all goals</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Saved</h3>
            <div className="text-3xl font-bold text-purple-600">Rs{totalSaved.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Current savings</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Completion</h3>
            <div className="text-3xl font-bold text-purple-600">{completion.toFixed(1)}%</div>
            <div className="text-xs text-gray-500 mt-1">Average progress</div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-gray-800">My Goals</h2>
              <button onClick={handleAddGoal} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">+ Add Goal</button>
            </div>
            <div className="space-y-4">
              {goals.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <p>No goals yet!</p>
                  <button onClick={handleAddGoal} className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">Create Your First Goal</button>
                </div>
              ) : (
                goals.map(goal => {
                  const progress = Math.min((goal.current / goal.target) * 100, 100);
                  return (
                    <div key={goal.id} className="border border-gray-200 rounded-lg p-4 hover:border-purple-600 transition-all">
                      <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                        <div className="font-semibold text-gray-800">{goal.name}</div>
                        <div className="font-bold text-purple-600">Rs{goal.current.toLocaleString()} / Rs{goal.target.toLocaleString()}</div>
                      </div>
                      <div className="mb-3">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-600 to-purple-800 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{progress.toFixed(1)}% completed</div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleAddMoney(goal)} className="px-3 py-1.5 border border-gray-300 rounded-md text-xs hover:border-purple-600 hover:text-purple-600">+ Add Money</button>
                        <button onClick={() => handleEditGoal(goal)} className="px-3 py-1.5 border border-gray-300 rounded-md text-xs hover:border-purple-600 hover:text-purple-600">Edit</button>
                        <button onClick={() => handleDeleteGoal(goal)} className="px-3 py-1.5 border border-gray-300 rounded-md text-xs text-red-600 hover:border-red-600">Delete</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Recent Activity</h2>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No activity yet</div>
              ) : (
                activities.slice(0, 5).map((activity, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg text-sm">
                    {activity.text}
                    <div className="text-xs text-gray-500 mt-1">{formatDate(activity.date)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-5">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h3>
            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Emergency Fund" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (Rs)</label>
                <input type="number" value={formData.target} onChange={(e) => setFormData({ ...formData, target: e.target.value })} placeholder="50000" required min="1" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount (Rs)</label>
                <input type="number" value={formData.current} onChange={(e) => setFormData({ ...formData, current: e.target.value })} placeholder="0" required min="0" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" />
              </div>
              <div className="flex gap-3 mt-5">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Save Goal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DatabaseViewer({ users, goals, activities, onBack }) {
  const [currentTable, setCurrentTable] = useState('users');
  const usersArray = Object.values(users).map((user, idx) => ({ id: idx + 1, name: user.name, email: user.email, createdAt: new Date(user.createdAt).toLocaleString() }));
  const goalsArray = goals.map(g => ({ id: g.id, name: g.name, target: g.target, current: g.current, createdAt: new Date(g.createdAt).toLocaleString() }));
  const activitiesArray = activities.map((a, idx) => ({ id: idx + 1, description: a.text, timestamp: new Date(a.date).toLocaleString() }));
  const tables = { users: { data: usersArray }, goals: { data: goalsArray }, activities: { data: activitiesArray } };
  const currentData = tables[currentTable].data;
  const keys = currentData.length > 0 ? Object.keys(currentData[0]) : [];

  return (
    <div className="min-h-screen p-5">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Database Viewer</h1>
          <p className="text-sm text-gray-600 mb-4">View and explore the internal database structure</p>
          <button onClick={onBack} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200">Back to Dashboard</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Users</h3>
            <div className="text-3xl font-bold text-purple-600">{usersArray.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Goals</h3>
            <div className="text-3xl font-bold text-purple-600">{goalsArray.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-5">
            <h3 className="text-xs text-gray-600 mb-2">Total Activities</h3>
            <div className="text-3xl font-bold text-purple-600">{activitiesArray.length}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">Table Data</h2>
          <div className="flex gap-2 mb-5 flex-wrap">
            <button onClick={() => setCurrentTable('users')} className={`px-4 py-2 rounded-lg font-medium text-sm ${currentTable === 'users' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'}`}>Users Table</button>
            <button onClick={() => setCurrentTable('goals')} className={`px-4 py-2 rounded-lg font-medium text-sm ${currentTable === 'goals' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'}`}>Goals Table</button>
            <button onClick={() => setCurrentTable('activities')} className={`px-4 py-2 rounded-lg font-medium text-sm ${currentTable === 'activities' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-600 hover:bg-purple-50'}`}>Activities Table</button>
          </div>
          <div className="bg-gray-900 text-cyan-400 p-3 rounded-lg mb-4 font-mono text-sm">
            <span className="text-green-400">&gt;</span> SELECT * FROM {currentTable};
          </div>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b-2 border-purple-600">
                  {keys.map(key => (<th key={key} className="px-4 py-3 text-left font-semibold text-gray-800">{key.toUpperCase()}</th>))}
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr><td colSpan={keys.length} className="text-center py-10 text-gray-500">No records in this table</td></tr>
                ) : (
                  currentData.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      {keys.map(key => (
                        <td key={key} className="px-4 py-3 text-gray-600">
                          {typeof row[key] === 'number' && (key === 'target' || key === 'current') ? `Rs${row[key].toLocaleString()}` : row[key]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg flex gap-6 text-sm text-gray-600 flex-wrap">
            <div>Total Records: <span className="font-semibold text-gray-800">{currentData.length}</span></div>
            <div>Columns: <span className="font-semibold text-gray-800">{keys.length}</span></div>
            <div>Last Updated: <span className="font-semibold text-gray-800">{new Date().toLocaleTimeString()}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}