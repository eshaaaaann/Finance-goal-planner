# Finance Goal Planner - Backend API

A Node.js/Express backend server for the Finance Goal Planner application.

## 🚀 Features

- **Authentication**: User registration and login with password hashing
- **Goals Management**: Create, read, update, delete financial goals
- **Activity Tracking**: Automatic logging of user activities
- **Database Viewer**: API endpoints to view database contents
- **File-based Storage**: Uses JSON file for simple data persistence

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## 🛠️ Installation

1. **Create a project folder:**
   ```bash
   mkdir finance-planner-backend
   cd finance-planner-backend
   ```

2. **Create the files:**
   - `server.js` (main server file)
   - `package.json` (dependencies file)

3. **Install dependencies:**
   ```bash
   npm install
   ```

## ▶️ Running the Server

### Production Mode:
```bash
npm start
```

### Development Mode (with auto-reload):
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login User**
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Goals

**Get User Goals**
```
GET /api/goals/:userId
```

**Create Goal**
```
POST /api/goals
Body: {
  "userId": 1,
  "name": "Emergency Fund",
  "target": 50000,
  "current": 0
}
```

**Update Goal**
```
PUT /api/goals/:id
Body: {
  "name": "Emergency Fund Updated",
  "target": 60000,
  "current": 15000
}
```

**Add Money to Goal**
```
POST /api/goals/:id/add-money
Body: {
  "amount": 5000
}
```

**Delete Goal**
```
DELETE /api/goals/:id
```

### Activities

**Get User Activities**
```
GET /api/activities/:userId
```

### Database

**Get Entire Database**
```
GET /api/database
```

**Get Database Stats**
```
GET /api/database/stats
```

## 📁 Project Structure

```
finance-planner-backend/
├── server.js           # Main server file
├── package.json        # Dependencies and scripts
├── database.json       # Auto-generated database file
└── public/             # Static files (optional)
```

## 🗄️ Database Structure

The `database.json` file contains three tables:

### Users Table
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "password": "hashed_password",
  "createdAt": "2024-12-21T10:00:00Z",
  "lastLogin": "2024-12-21T10:00:00Z"
}
```

### Goals Table
```json
{
  "id": 1,
  "userId": 1,
  "name": "Emergency Fund",
  "target": 50000,
  "current": 15000,
  "createdAt": "2024-12-21T10:00:00Z",
  "updatedAt": "2024-12-21T10:00:00Z"
}
```

### Activities Table
```json
{
  "id": 1,
  "userId": 1,
  "type": "create_goal",
  "description": "Created goal: Emergency Fund",
  "timestamp": "2024-12-21T10:00:00Z"
}
```

## 🔒 Security Features

- Passwords are hashed using bcrypt
- CORS enabled for cross-origin requests
- Input validation on all endpoints
- Passwords never returned in API responses

## 🧪 Testing with Postman/Thunder Client

1. Register a new user
2. Login to get user ID
3. Create goals using the user ID
4. Test add money, update, and delete operations
5. View activities and database

## 📝 Notes

- Database file (`database.json`) is auto-created on first run
- All passwords are hashed and cannot be reversed
- Activities are automatically logged for all actions
- File-based storage is suitable for development/small projects

## 🔄 Connecting to Frontend

Update your frontend code to make API calls:

```javascript
// Example: Login
const response = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});
const data = await response.json();
```

## 🚀 Deployment Options

- **Heroku**: Easy Node.js deployment
- **Vercel**: Serverless functions
- **DigitalOcean**: VPS hosting
- **Railway**: Modern deployment platform

For production, consider using:
- Real database (MongoDB, PostgreSQL, MySQL)
- Environment variables for sensitive data
- JWT tokens for authentication
- Rate limiting
- Input sanitization

---

**Happy Coding! 🎉**