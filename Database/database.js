// Simulated Database
const Database = {
  users: [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password_123',
      createdAt: '2024-12-15T10:30:00Z',
      lastLogin: '2024-12-21T08:15:00Z'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'hashed_password_456',
      createdAt: '2024-12-10T14:20:00Z',
      lastLogin: '2024-12-20T16:45:00Z'
    },
    {
      id: 3,
      name: 'Bob Johnson',
      email: 'bob@example.com',
      password: 'hashed_password_789',
      createdAt: '2024-12-05T09:15:00Z',
      lastLogin: '2024-12-19T11:30:00Z'
    }
  ],
  goals: [
    { 
      id: 1, 
      userId: 1,
      name: 'Emergency Fund', 
      target: 50000, 
      current: 15000, 
      createdAt: '2024-12-16T10:00:00Z',
      updatedAt: '2024-12-21T08:30:00Z'
    },
    { 
      id: 2, 
      userId: 1,
      name: 'Vacation to Goa', 
      target: 30000, 
      current: 8000, 
      createdAt: '2024-12-18T14:00:00Z',
      updatedAt: '2024-12-20T10:15:00Z'
    },
    { 
      id: 3, 
      userId: 1,
      name: 'New Laptop', 
      target: 60000, 
      current: 45000, 
      createdAt: '2024-12-20T09:00:00Z',
      updatedAt: '2024-12-21T07:45:00Z'
    },
    { 
      id: 4, 
      userId: 2,
      name: 'Car Down Payment', 
      target: 100000, 
      current: 35000, 
      createdAt: '2024-12-12T11:20:00Z',
      updatedAt: '2024-12-20T14:00:00Z'
    },
    { 
      id: 5, 
      userId: 3,
      name: 'Wedding Fund', 
      target: 200000, 
      current: 80000, 
      createdAt: '2024-12-08T16:30:00Z',
      updatedAt: '2024-12-19T10:20:00Z'
    }
  ],
  activities: [
    { 
      id: 1, 
      userId: 1, 
      type: 'add_money',
      description: 'Added ₹5,000 to Emergency Fund', 
      timestamp: '2024-12-21T08:30:00Z' 
    },
    { 
      id: 2, 
      userId: 1, 
      type: 'create_goal',
      description: 'Created goal: New Laptop', 
      timestamp: '2024-12-20T09:00:00Z' 
    },
    { 
      id: 3, 
      userId: 1, 
      type: 'add_money',
      description: 'Added ₹2,000 to Vacation to Goa', 
      timestamp: '2024-12-19T15:20:00Z' 
    },
    { 
      id: 4, 
      userId: 2, 
      type: 'add_money',
      description: 'Added ₹10,000 to Car Down Payment', 
      timestamp: '2024-12-20T14:00:00Z' 
    },
    { 
      id: 5, 
      userId: 2, 
      type: 'create_goal',
      description: 'Created goal: Car Down Payment', 
      timestamp: '2024-12-12T11:20:00Z' 
    },
    { 
      id: 6, 
      userId: 3, 
      type: 'update_goal',
      description: 'Updated goal: Wedding Fund', 
      timestamp: '2024-12-19T10:20:00Z' 
    },
    { 
      id: 7, 
      userId: 3, 
      type: 'add_money',
      description: 'Added ₹15,000 to Wedding Fund', 
      timestamp: '2024-12-18T13:45:00Z' 
    }
  ]
};

let currentTable = 'users';

// Initialize
function init() {
  updateStats();
  showTable('users');
}

// Update statistics
function updateStats() {
  document.getElementById('total-users').textContent = Database.users.length;
  document.getElementById('total-goals').textContent = Database.goals.length;
  document.getElementById('total-activities').textContent = Database.activities.length;
  
  const dbSize = (JSON.stringify(Database).length / 1024).toFixed(2);
  document.getElementById('db-size').textContent = dbSize + ' KB';
}

// Show table data
function showTable(tableName) {
  currentTable = tableName;
  
  // Update active button
  document.querySelectorAll('.btn-db[data-table]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.table === tableName);
  });

  // Update SQL query
  document.getElementById('sql-query').textContent = `SELECT * FROM ${tableName};`;

  const data = Database[tableName];
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');

  if (data.length === 0) {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '<tr><td colspan="100" class="empty-state">No records in this table</td></tr>';
    updateTableStats(0, 0);
    return;
  }

  // Build table headers
  const keys = Object.keys(data[0]);
  tableHead.innerHTML = '<tr>' + keys.map(key => `<th>${key.toUpperCase()}</th>`).join('') + '</tr>';

  // Build table rows
  tableBody.innerHTML = data.map(row => {
    return '<tr>' + keys.map(key => {
      let value = row[key];
      
      // Format timestamps
      if (typeof value === 'string' && value.includes('T') && value.includes('Z')) {
        value = new Date(value).toLocaleString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Format numbers
      if (key === 'target' || key === 'current') {
        value = '₹' + Number(value).toLocaleString();
      }
      
      return `<td>${escapeHtml(String(value))}</td>`;
    }).join('') + '</tr>';
  }).join('');

  // Update table stats
  updateTableStats(data.length, keys.length);
}

// Update table statistics
function updateTableStats(rows, columns) {
  const statsEl = document.getElementById('table-stats');
  statsEl.innerHTML = `
    <div>📊 Total Records: <span>${rows}</span></div>
    <div>📋 Columns: <span>${columns}</span></div>
    <div>🕒 Last Updated: <span>${new Date().toLocaleTimeString()}</span></div>
  `;
}

// Refresh data
function refreshData() {
  showTable(currentTable);
  updateStats();
  alert('✅ Data refreshed successfully!');
}

// Export database
function exportDB() {
  const dataStr = JSON.stringify(Database, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `finance_db_export_${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
  
  alert('✅ Database exported successfully as JSON file!');
}

// Helper function
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize
init();