# Quick Start Guide

## Prerequisites

- **Node.js** version 14 or higher
- **npm** version 6 or higher

Check your versions:
```bash
node --version
npm --version
```

## Installation

### Option 1: Install Everything at Once

From the project root directory:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Option 2: Use Convenience Script

From the project root:

```bash
npm run install-all
```

## Running the Application

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
Health check: http://localhost:5000/api/health
```

**For development with auto-reload:**
```bash
npm run dev
```

### Step 2: Start the Frontend Application

Open a **new terminal** and run:

```bash
cd frontend
npm start
```

The React app will:
- Start on `http://localhost:3000`
- Automatically open in your browser
- Auto reload on code changes

## Verify Installation

1. **Backend Health Check**
   - Open `http://localhost:5000/api/health` in your browser
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**
   - Should automatically open at `http://localhost:3000`
   - You should see the dashboard with some sample data

## First Steps

1. **View Dashboard**
   - See overview of incidents, schedules, and current on-call status

2. **Explore Schedules**
   - Click "Schedules" tab
   - View the sample schedule "Primary On-Call Rotation"
   - See who is currently on-call

3. **Trigger an Incident**
   - Click "Incidents" tab
   - Click "Trigger Incident"
   - Fill in the form and submit
   - Check backend console for notification logs

4. **Manage Users**
   - Click "Users" tab
   - View existing users or add new ones

## Sample Data

The system comes pre-loaded with:

- **3 Users**: Arun Kumar, Samarth Agrawal, Pranjal jain
- **1 Service**: Payment API
- **1 Schedule**: Primary On-Call Rotation (with weekly rotation)


## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [workflows.md](workflows.md) for usage examples
- Review [EXPERIENCE.md](EXPERIENCE.md) for development insights


## Stopping the Application

- Press `Ctrl+C` in both terminal windows to stop the servers
- Data is stored in memory, so it will be reset on restart

