# On-Call Incident Management System

An on-call incident management system that allows teams to define on-call schedules, trigger incidents, and notify the appropriate responders. This system demonstrates core incident response workflow similar to tools like PagerDuty.

## Features

### On-Call Management
- Define on-call schedules with rotation periods
- Determine who is currently on-call for a given schedule
- Support for multiple schedules and services

### Incident Handling
- Create incidents from alerts 
- Track incident lifecycle states: `triggered` → `acknowledged` → `resolved`
- Assign incidents to the current on-call responder
- View incident history and details

### Alerting & Escalation
- Automatic notification of on-call responder when incident is triggered
- Escalation support with configurable timeouts
- Multiple escalation levels
- Manual escalation capability
- Automatic escalation checking (runs every minute)


## Architecture

┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │         │   Express    │         │  In-Memory  │
│  Frontend   │ ◄─────► │   Backend    │ ◄─────► │   Storage   │
│             │         │              │         │  (Maps)     │
└─────────────┘         └──────────────┘         └─────────────┘
                              │
                              │
                        ┌─────▼─────┐
                        │Escalation │
                        │  Checker  │
                        │  (Timer)  │
                        └───────────┘


### Data Models

#### User
- `id`: Unique identifier
- `name`: User's full name
- `email`: Email address
- `phone`: Phone number (optional)

#### Service
- `id`: Unique identifier
- `name`: Service name
- `description`: Service description

#### Schedule
- `id`: Unique identifier
- `name`: Schedule name
- `serviceId`: Associated service
- `rotation`: Array of rotation entries with userId, startTime, endTime
- `escalationPolicy`: Configuration for escalation behavior
  - `initialTimeout`: Time before first escalation (ms)
  - `escalationLevels`: Array of escalation levels with userId and timeout

#### Incident
- `id`: Unique identifier
- `title`: Incident title
- `description`: Incident description
- `serviceId`: Associated service
- `scheduleId`: Associated schedule
- `severity`: low | medium | high
- `state`: triggered | acknowledged | resolved
- `triggeredAt`: Timestamp when incident was created
- `acknowledgedAt`: Timestamp when incident was acknowledged
- `resolvedAt`: Timestamp when incident was resolved
- `assignedTo`: User ID of the on-call responder
- `escalationLevel`: Current escalation level (0-based)
- `escalationPolicy`: Copy of schedule's escalation policy
- `escalationHistory`: Array of escalation events
- `notifications`: Array of notification records

### API Endpoints

#### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get a specific user

#### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create a new service

#### Schedules
- `GET /api/schedules` - Get all schedules with current on-call info
- `POST /api/schedules` - Create a new schedule
- `GET /api/schedules/:id` - Get a specific schedule
- `GET /api/schedules/:id/oncall` - Get current on-call user for a schedule

#### Incidents
- `GET /api/incidents` - Get all incidents
- `POST /api/incidents` - Create/trigger a new incident
- `GET /api/incidents/:id` - Get a specific incident
- `PATCH /api/incidents/:id/acknowledge` - Acknowledge an incident
- `PATCH /api/incidents/:id/resolve` - Resolve an incident
- `POST /api/incidents/:id/escalate` - Manually escalate an incident



## Technology Stack

### Backend
- Node.js - Runtime environment
- Express - Web framework
- UUID - Unique identifier generation
- CORS - Cross-origin resource sharing
- In-Memory Storage - JavaScript Maps for data persistence

### Frontend
- React - UI library
- Axios - HTTP client
- CSS3 - Styling

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **navigate to the project directory**

   cd "ONCALL INCIDENT MANAGEMENT SYSTEM"
   
2. **Install dependencies for both backend and frontend**

   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   

3. **Start the backend server**
   
   cd backend
   npm start
   
   The backend will run on `http://localhost:5000`

4. **Start the frontend application** (in a new terminal)
   
   cd frontend
   npm start
   
   The frontend will run on `http://localhost:3000` and automatically open in your browser.

### Running the Application

1. Start the backend server first (port 5000)
2. Start the frontend application (port 3000)
3. Open `http://localhost:3000` in your browser



## Example Workflows

### 1. Creating an On-Call Schedule

1. Navigate to the **Schedules** tab
2. Click **Create Schedule**
3. Fill in:
   - Schedule name (e.g., "Payment API On-Call")
   - Select a service
   - Add rotation entries with:
     - User assignment
     - Start date/time
     - End date/time
4. Click **Create Schedule**

### 2. Triggering an Incident

1. Navigate to the **Incidents** tab
2. Click **Trigger Incident**
3. Fill in:
   - Title (e.g., "Payment API Down")
   - Description
   - Select the schedule
   - Choose severity level
4. Click **Trigger Incident**
5. The system will automatically:
   - Find the current on-call user
   - Create the incident
   - Notify the on-call user (logged to console)

### 3. Managing an Incident

1. View incidents in the **Incidents** tab
2. For a triggered incident, you can:
   - **Acknowledge** - Mark that you're working on it
   - **Resolve** - Mark the incident as resolved
   - **Escalate** - Manually escalate to the next level

### 4. Escalation Flow

- When an incident is triggered, the on-call user is notified
- If the incident remains in `triggered` state for the configured timeout (default: 5 minutes), it automatically escalates
- Escalation continues through configured levels
- Each escalation is logged in the incident's escalation history



## Key Design 

### 1. In-Memory Storage
**Decision**: Use JavaScript Maps instead of a database.

**Rationale**: 
- Simplifies setup and deployment
- No external dependencies
- Sufficient for demonstration purposes
- Data persists for the lifetime of the server process

**Trade-off**: Data is lost on server restart. For production, this would need a persistent database.

### 2. Time-Based On-Call Resolution
**Decision**: Calculate current on-call by checking if current time falls within rotation periods.

**Rationale**:
- Simple and straightforward
- Easy to understand and debug
- Supports multiple overlapping rotations

**Trade-off**: Requires timezone handling in production. Currently uses UTC.

### 3. Escalation Timer
**Decision**: Run escalation checks every minute via `setInterval`.

**Rationale**:
- Simple implementation
- Good enough for demonstration
- Avoids complex event scheduling

**Trade-off**: Not real-time (up to 1 minute delay). Production would use job queues or event scheduling.

### 4. Notification Mocking
**Decision**: Log notifications to console instead of sending real emails/SMS.

**Rationale**:
- No external service dependencies
- Easy to test and verify
- Clear demonstration of notification flow

**Trade-off**: Not production-ready. Would need integration with email/SMS providers.

### 5. State Machine for Incidents
**Decision**: Simple state transitions: `triggered` → `acknowledged` → `resolved`.

**Rationale**:
- Clear and unambiguous
- Covers core use cases
- Easy to extend

**Trade-off**: Doesn't support more complex workflows like reassignment or cancellation.

### 6. Frontend Architecture
**Decision**: Simple React components with direct API calls, no state management library.

**Rationale**:
- Minimal complexity
- Easy to understand
- Sufficient for the scope

**Trade-off**: Could benefit from state management for larger applications.



## Known Limitations

1. **Data Persistence**: All data is lost when the server restarts. No database persistence.

2. **Timezone Handling**: All times are stored and compared in UTC. No timezone conversion for users.

3. **Escalation Timing**: Escalation checks run every minute, not in real-time. There can be up to a 1-minute delay.

4. **Notification Delivery**: Notifications are only logged to console. No actual email/SMS delivery.

5. **Concurrent Incident Handling**: No locking mechanism for incident state changes. Race conditions possible with concurrent requests.

6. **Schedule Overlaps**: No validation for overlapping rotation periods in the same schedule.

7. **User Authentication**: No authentication or authorization. Anyone can access all endpoints.

8. **Rate Limiting**: No rate limiting on API endpoints.

9. **Error Handling**: Basic error handling. No comprehensive error recovery.

10. **Incident Deduplication**: No mechanism to prevent duplicate incidents for the same issue.



## Future Improvements

### High Priority
1. **Database Integration**: Replace in-memory storage with PostgreSQL or MongoDB for persistence.

2. **Real-Time Escalation**: Use job queues (Bull, Agenda.js) or event scheduling for precise escalation timing.

3. **Notification Integration**: Integrate with email (SendGrid, AWS SES) and SMS (Twilio) providers.

4. **Authentication & Authorization**: Add user authentication (JWT) and role-based access control.

5. **Timezone Support**: Proper timezone handling for schedules and incidents.

### Medium Priority
6. **Incident Deduplication**: Implement deduplication logic to prevent duplicate incidents.

7. **Schedule Validation**: Add validation for rotation overlaps and gaps.

8. **Metrics & Analytics**: 
   - Mean Time to Acknowledge (MTTA)
   - Mean Time to Resolve (MTTR)
   - Incident frequency
   - On-call load distribution

9. **Schedule Overrides**: Allow temporary overrides for holidays or special circumstances.

10. **Webhooks**: Support webhook integrations for external systems.

### Low Priority
11. **UI/UX Enhancements**: 
    - Real-time updates via WebSockets
    - Better mobile responsiveness
    - Dark mode
    - Incident filtering and search

12. **Testing**: Comprehensive unit and integration tests.

13. **API Versioning**: Support for API versioning as the system evolves.

14. **Documentation**: OpenAPI/Swagger documentation for the API.

15. **Deployment**: Docker containerization and deployment guides.



## Project Structure

ONCALL INCIDENT MANAGEMENT SYSTEM/
├── backend/
│   ├── server.js          # Express server and API endpoints
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.js
│   │   │   ├── Schedules.js
│   │   │   ├── Incidents.js
│   │   │   └── Users.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json        # Frontend dependencies
├── README.md               # This file
├── EXPERIENCE.md           # Development experience document
└── package.json            # Root package.json with convenience scripts


