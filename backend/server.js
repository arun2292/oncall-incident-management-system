const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const storage = {
  users: new Map(),
  schedules: new Map(),
  incidents: new Map(),
  services: new Map()
};

// Initialize with sample data
function initializeSampleData() {
  // Sample users
  const user1 = { id: 'user-1', name: 'Arun Kumar', email: 'arun@gmail.com', phone: '+917493795235' };
  const user2 = { id: 'user-2', name: 'Samarth Agrawal', email: 'samarth@gmail.com', phone: '+919436428647' };
  const user3 = { id: 'user-3', name: 'Pranjal Jain', email: 'pranjal@gmail.com', phone: '+918743572154' };
  
  storage.users.set(user1.id, user1);
  storage.users.set(user2.id, user2);
  storage.users.set(user3.id, user3);

  // Sample service
  const service1 = { id: 'service-1', name: 'Payment API', description: 'Main payment processing service' };
  storage.services.set(service1.id, service1);

  // Sample schedule (rotation) - using current dates
  const now = new Date();
  const week1Start = new Date(now);
  week1Start.setDate(week1Start.getDate() - (week1Start.getDay() || 7) + 1); // Start of current week
  const week1End = new Date(week1Start);
  week1End.setDate(week1End.getDate() + 7);
  const week2End = new Date(week1End);
  week2End.setDate(week2End.getDate() + 7);
  const week3End = new Date(week2End);
  week3End.setDate(week3End.getDate() + 7);
  
  const schedule1 = {
    id: 'schedule-1',
    name: 'Primary On-Call Rotation',
    serviceId: 'service-1',
    rotation: [
      { userId: 'user-1', startTime: week1Start.toISOString(), endTime: week1End.toISOString() },
      { userId: 'user-2', startTime: week1End.toISOString(), endTime: week2End.toISOString() },
      { userId: 'user-3', startTime: week2End.toISOString(), endTime: week3End.toISOString() }
    ],
    escalationPolicy: {
      initialTimeout: 300000, // 5 minutes in milliseconds
      escalationLevels: [
        { level: 1, userId: 'user-2', timeout: 300000 },
        { level: 2, userId: 'user-3', timeout: 600000 }
      ]
    }
  };
  storage.schedules.set(schedule1.id, schedule1);
}

initializeSampleData();

// Helper function to get current on-call user for a schedule
function getCurrentOnCall(scheduleId) {
  const schedule = storage.schedules.get(scheduleId);
  if (!schedule) return null;

  const now = new Date();
  for (const rotation of schedule.rotation) {
    const start = new Date(rotation.startTime);
    const end = new Date(rotation.endTime);
    if (now >= start && now < end) {
      return storage.users.get(rotation.userId);
    }
  }
  return null;
}

// Helper function to notify user (mocked)
function notifyUser(user, message, incidentId) {
  console.log(`[NOTIFICATION] To: ${user.name} (${user.email})`);
  console.log(`[NOTIFICATION] Message: ${message}`);
  console.log(`[NOTIFICATION] Incident ID: ${incidentId}`);
  // In a real system, this would send email/SMS
  return { success: true, method: 'console', timestamp: new Date().toISOString() };
}

// Helper function to check and handle escalations
function checkEscalations() {
  const now = new Date();
  for (const [incidentId, incident] of storage.incidents.entries()) {
    if (incident.state === 'triggered' && incident.escalationLevel < incident.escalationPolicy.escalationLevels.length) {
      const timeSinceTrigger = now - new Date(incident.triggeredAt);
      const currentLevel = incident.escalationPolicy.escalationLevels[incident.escalationLevel];
      
      if (timeSinceTrigger >= currentLevel.timeout) {
        // Escalate
        incident.escalationLevel++;
        const nextLevel = incident.escalationPolicy.escalationLevels[incident.escalationLevel];
        if (nextLevel) {
          const escalatedUser = storage.users.get(nextLevel.userId);
          if (escalatedUser) {
            notifyUser(escalatedUser, `ESCALATED: ${incident.title} - No response from previous on-call`, incidentId);
            incident.escalationHistory.push({
              level: incident.escalationLevel,
              userId: nextLevel.userId,
              timestamp: now.toISOString(),
              reason: 'Timeout'
            });
          }
        }
      }
    }
  }
}

// Run escalation check every minute
setInterval(checkEscalations, 60000);

// ========== USER ENDPOINTS ==========
app.get('/api/users', (req, res) => {
  res.json(Array.from(storage.users.values()));
});

app.post('/api/users', (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const user = {
    id: uuidv4(),
    name,
    email,
    phone: phone || ''
  };
  
  storage.users.set(user.id, user);
  res.status(201).json(user);
});

app.get('/api/users/:id', (req, res) => {
  const user = storage.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/users/:id', (req, res) => {
  const user = storage.users.get(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { name, email, phone } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  // Update user
  user.name = name;
  user.email = email;
  user.phone = phone || '';
  
  storage.users.set(user.id, user);
  res.json(user);
});

// ========== SERVICE ENDPOINTS ==========
app.get('/api/services', (req, res) => {
  res.json(Array.from(storage.services.values()));
});

app.post('/api/services', (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Service name is required' });
  }
  
  const service = {
    id: uuidv4(),
    name,
    description: description || ''
  };
  
  storage.services.set(service.id, service);
  res.status(201).json(service);
});

// ========== SCHEDULE ENDPOINTS ==========
app.get('/api/schedules', (req, res) => {
  const schedules = Array.from(storage.schedules.values()).map(schedule => ({
    ...schedule,
    currentOnCall: getCurrentOnCall(schedule.id)
  }));
  res.json(schedules);
});

app.get('/api/schedules/:id', (req, res) => {
  const schedule = storage.schedules.get(req.params.id);
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  res.json({
    ...schedule,
    currentOnCall: getCurrentOnCall(req.params.id)
  });
});

app.post('/api/schedules', (req, res) => {
  const { name, serviceId, rotation, escalationPolicy } = req.body;
  if (!name || !serviceId || !rotation || !Array.isArray(rotation)) {
    return res.status(400).json({ error: 'Name, serviceId, and rotation array are required' });
  }
  
  const schedule = {
    id: uuidv4(),
    name,
    serviceId,
    rotation: rotation.map(r => ({
      userId: r.userId,
      startTime: r.startTime,
      endTime: r.endTime
    })),
    escalationPolicy: escalationPolicy || {
      initialTimeout: 300000,
      escalationLevels: []
    }
  };
  
  storage.schedules.set(schedule.id, schedule);
  res.status(201).json(schedule);
});

app.get('/api/schedules/:id/oncall', (req, res) => {
  const onCallUser = getCurrentOnCall(req.params.id);
  if (!onCallUser) {
    return res.status(404).json({ error: 'No one is currently on-call for this schedule' });
  }
  res.json(onCallUser);
});

// ========== INCIDENT ENDPOINTS ==========
app.get('/api/incidents', (req, res) => {
  const incidents = Array.from(storage.incidents.values());
  res.json(incidents);
});

app.get('/api/incidents/:id', (req, res) => {
  const incident = storage.incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  res.json(incident);
});

app.post('/api/incidents', async (req, res) => {
  const { title, description, serviceId, scheduleId, severity } = req.body;
  
  if (!title || !scheduleId) {
    return res.status(400).json({ error: 'Title and scheduleId are required' });
  }
  
  const schedule = storage.schedules.get(scheduleId);
  if (!schedule) {
    return res.status(404).json({ error: 'Schedule not found' });
  }
  
  const onCallUser = getCurrentOnCall(scheduleId);
  if (!onCallUser) {
    return res.status(400).json({ error: 'No one is currently on-call for this schedule' });
  }
  
  const incident = {
    id: uuidv4(),
    title,
    description: description || '',
    serviceId: serviceId || schedule.serviceId,
    scheduleId,
    severity: severity || 'medium',
    state: 'triggered',
    triggeredAt: new Date().toISOString(),
    acknowledgedAt: null,
    resolvedAt: null,
    assignedTo: onCallUser.id,
    escalationLevel: 0,
    escalationPolicy: schedule.escalationPolicy,
    escalationHistory: [],
    notifications: []
  };
  
  storage.incidents.set(incident.id, incident);
  
  // Notify on-call user
  const notification = notifyUser(
    onCallUser,
    `INCIDENT: ${title} - ${description || 'No description'}`,
    incident.id
  );
  incident.notifications.push(notification);
  
  res.status(201).json(incident);
});

app.patch('/api/incidents/:id/acknowledge', (req, res) => {
  const incident = storage.incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  
  if (incident.state === 'resolved') {
    return res.status(400).json({ error: 'Cannot acknowledge a resolved incident' });
  }
  
  incident.state = 'acknowledged';
  incident.acknowledgedAt = new Date().toISOString();
  
  res.json(incident);
});

app.patch('/api/incidents/:id/resolve', (req, res) => {
  const incident = storage.incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  
  incident.state = 'resolved';
  incident.resolvedAt = new Date().toISOString();
  
  res.json(incident);
});

// ========== ESCALATION ENDPOINT (Mock) ==========
app.post('/api/incidents/:id/escalate', (req, res) => {
  const incident = storage.incidents.get(req.params.id);
  if (!incident) {
    return res.status(404).json({ error: 'Incident not found' });
  }
  
  if (incident.state === 'resolved') {
    return res.status(400).json({ error: 'Cannot escalate a resolved incident' });
  }
  
  const escalationPolicy = incident.escalationPolicy;
  if (incident.escalationLevel >= escalationPolicy.escalationLevels.length) {
    return res.status(400).json({ error: 'No more escalation levels available' });
  }
  
  incident.escalationLevel++;
  const nextLevel = escalationPolicy.escalationLevels[incident.escalationLevel - 1];
  if (nextLevel) {
    const escalatedUser = storage.users.get(nextLevel.userId);
    if (escalatedUser) {
      notifyUser(escalatedUser, `ESCALATED: ${incident.title}`, incident.id);
      incident.escalationHistory.push({
        level: incident.escalationLevel,
        userId: nextLevel.userId,
        timestamp: new Date().toISOString(),
        reason: 'Manual escalation'
      });
    }
  }
  
  res.json(incident);
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

