// server.js - Finance Goal Planner Backend
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'database.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize database
async function initDatabase() {
  try {
    await fs.access(DB_FILE);
  } catch {
    const initialData = {
      users: [],
      goals: [],
      activities: []
    };
    await fs.writeFile(DB_FILE, JSON.stringify(initialData, null, 2));
    console.log('✅ Database initialized');
  }
}

// Read database
async function readDB() {
  const data = await fs.readFile(DB_FILE, 'utf8');
  return JSON.parse(data);
}

// Write database
async function writeDB(data) {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// Generate ID
function generateId(array) {
  return array.length > 0 ? Math.max(...array.map(item => item.id)) + 1 : 1;
}

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.json({
    message: 'Finance Goal Planner API is running! 🚀',
    version: '1.0.0',
    status: 'OK',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      goals: {
        getUserGoals: 'GET /api/goals/:userId',
        createGoal: 'POST /api/goals',
        updateGoal: 'PUT /api/goals/:id',
        addMoney: 'POST /api/goals/:id/add-money',
        deleteGoal: 'DELETE /api/goals/:id'
      },
      activities: {
        getUserActivities: 'GET /api/activities/:userId'
      },
      database: {
        getDatabase: 'GET /api/database',
        getStats: 'GET /api/database/stats'
      }
    }
  });
});

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const db = await readDB();

    // Check if user exists
    if (db.users.find(u => u.email === email.toLowerCase())) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: generateId(db.users),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    db.users.push(newUser);
    await writeDB(db);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await readDB();
    const user = db.users.find(u => u.email === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    await writeDB(db);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      message: 'Login successful',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== GOALS ROUTES ====================

// Get all goals for a user
app.get('/api/goals/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const db = await readDB();
    const userGoals = db.goals.filter(g => g.userId === userId);
    res.json(userGoals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create goal
app.post('/api/goals', async (req, res) => {
  try {
    const { userId, name, target, current } = req.body;

    if (!userId || !name || target === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await readDB();

    const newGoal = {
      id: generateId(db.goals),
      userId: parseInt(userId),
      name,
      target: parseFloat(target),
      current: parseFloat(current) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.goals.push(newGoal);

    // Add activity
    const activity = {
      id: generateId(db.activities),
      userId: parseInt(userId),
      type: 'create_goal',
      description: `Created goal: ${name}`,
      timestamp: new Date().toISOString()
    };
    db.activities.push(activity);

    await writeDB(db);
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update goal
app.put('/api/goals/:id', async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { name, target, current } = req.body;

    const db = await readDB();
    const goalIndex = db.goals.findIndex(g => g.id === goalId);

    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    const goal = db.goals[goalIndex];
    
    if (name !== undefined) goal.name = name;
    if (target !== undefined) goal.target = parseFloat(target);
    if (current !== undefined) goal.current = parseFloat(current);
    goal.updatedAt = new Date().toISOString();

    // Add activity
    const activity = {
      id: generateId(db.activities),
      userId: goal.userId,
      type: 'update_goal',
      description: `Updated goal: ${goal.name}`,
      timestamp: new Date().toISOString()
    };
    db.activities.push(activity);

    await writeDB(db);
    res.json(goal);
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add money to goal
app.post('/api/goals/:id/add-money', async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const db = await readDB();
    const goal = db.goals.find(g => g.id === goalId);

    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    goal.current = Math.min(goal.current + parseFloat(amount), goal.target);
    goal.updatedAt = new Date().toISOString();

    // Add activity
    const activity = {
      id: generateId(db.activities),
      userId: goal.userId,
      type: 'add_money',
      description: `Added ₹${amount.toLocaleString()} to ${goal.name}`,
      timestamp: new Date().toISOString()
    };
    db.activities.push(activity);

    await writeDB(db);
    res.json(goal);
  } catch (error) {
    console.error('Add money error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete goal
app.delete('/api/goals/:id', async (req, res) => {
  try {
    const goalId = parseInt(req.params.id);
    const db = await readDB();
    
    const goal = db.goals.find(g => g.id === goalId);
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    db.goals = db.goals.filter(g => g.id !== goalId);

    // Add activity
    const activity = {
      id: generateId(db.activities),
      userId: goal.userId,
      type: 'delete_goal',
      description: `Deleted goal: ${goal.name}`,
      timestamp: new Date().toISOString()
    };
    db.activities.push(activity);

    await writeDB(db);
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Delete goal error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== ACTIVITIES ROUTES ====================

// Get activities for a user
app.get('/api/activities/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const db = await readDB();
    const userActivities = db.activities
      .filter(a => a.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10); // Last 10 activities
    res.json(userActivities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== DATABASE ROUTES ====================

// Get entire database (for database viewer)
app.get('/api/database', async (req, res) => {
  try {
    const db = await readDB();
    // Remove passwords from users
    const sanitizedDB = {
      ...db,
      users: db.users.map(({ password, ...user }) => user)
    };
    res.json(sanitizedDB);
  } catch (error) {
    console.error('Get database error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get database stats
app.get('/api/database/stats', async (req, res) => {
  try {
    const db = await readDB();
    const stats = {
      totalUsers: db.users.length,
      totalGoals: db.goals.length,
      totalActivities: db.activities.length,
      databaseSize: JSON.stringify(db).length
    };
    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================== SERVER START ====================

async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Finance Goal Planner API Server     ║
║   Running on http://localhost:${PORT}   ║
╚════════════════════════════════════════╝
    `);
    console.log('📚 Available endpoints:');
    console.log('   GET    /');
    console.log('   POST   /api/auth/register');
    console.log('   POST   /api/auth/login');
    console.log('   GET    /api/goals/:userId');
    console.log('   POST   /api/goals');
    console.log('   PUT    /api/goals/:id');
    console.log('   POST   /api/goals/:id/add-money');
    console.log('   DELETE /api/goals/:id');
    console.log('   GET    /api/activities/:userId');
    console.log('   GET    /api/database');
    console.log('   GET    /api/database/stats');
    console.log('');
  });
}

startServer();