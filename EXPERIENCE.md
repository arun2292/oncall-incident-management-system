# Development Experience: On-Call Incident Management System

## Overview

This document describes my experience building the On-Call Incident Management System, including the approach taken, challenges encountered, and insights gained during development.

## Initial Planning and Approach

### Understanding the Requirements

The project required building a minimal incident management system with:
- On-call schedule management
- Incident creation and lifecycle tracking
- Alert routing and escalation
- Frontend and backend components

I started by breaking down the requirements into core components:
1. **Data Models**: Users, Services, Schedules, Incidents
2. **Backend API**: RESTful endpoints for CRUD operations
3. **Business Logic**: On-call resolution, escalation handling
4. **Frontend UI**: React components for each major feature

### Technology Choices

**Backend**: Node.js + Express
- Fast to set up and iterate
- Good for REST APIs
- Large ecosystem

**Storage**: In-memory (Maps)
- No database setup required
- Simple for demonstration
- Easy to understand data flow

**Frontend**: React
- Component-based architecture
- Good for interactive UIs
- Widely used and familiar

## Development Process

### Phase 1: Backend Foundation

I started by building the backend API, focusing on:
1. Setting up Express server with CORS
2. Creating in-memory storage structures (Maps)
3. Implementing core data models
4. Building REST endpoints

**Key Decisions**:
- Used Maps for O(1) lookups
- Structured data models to be self-contained
- Added sample data for immediate testing

**Challenges**:
- **Time-based logic**: Determining current on-call required careful date comparison logic
- **Escalation timing**: Decided on interval-based checking rather than event scheduling for simplicity

### Phase 2: Core Business Logic

**On-Call Resolution**:
```javascript
function getCurrentOnCall(scheduleId) {
  const schedule = storage.schedules.get(scheduleId);
  const now = new Date();
  // Find rotation entry where now falls between startTime and endTime
}
```

This was straightforward but required careful handling of date comparisons.

**Escalation System**:
- Implemented automatic escalation checking via `setInterval`
- Each incident tracks its escalation level
- Escalation policy is copied from schedule to incident at creation time
- Supports both automatic and manual escalation

**Challenges**:
- Ensuring escalation state is preserved correctly
- Handling edge cases (no more escalation levels, resolved incidents)

### Phase 3: Frontend Development

Built React components for each major feature:
- **Dashboard**: Overview with stats and recent incidents
- **Schedules**: Create and view on-call schedules
- **Incidents**: Trigger, view, and manage incidents
- **Users**: Manage users

**Design Approach**:
- Simple, clean UI with clear visual hierarchy
- Status badges for quick visual feedback
- Form-based creation flows
- Real-time updates via polling (30-second intervals for incidents)

**Challenges**:
- **State Management**: Started without Redux/Context, using local state. This worked but could be improved.
- **Date Handling**: Frontend date inputs required careful formatting
- **Error Handling**: Implemented basic error messages, but could be more comprehensive

### Phase 4: Integration and Testing

**Testing Approach**:
- Manual testing of all workflows
- Verified escalation timing
- Tested edge cases (no on-call, overlapping schedules)

**Issues Found and Fixed**:
1. **Date Format**: Fixed date initialization in sample data to use current dates
2. **Escalation Logic**: Corrected escalation level indexing
3. **CORS**: Ensured CORS was properly configured

## Challenges and Solutions

### Challenge 1: Time-Based On-Call Resolution

**Problem**: Need to determine who is on-call at any given moment based on rotation schedules.

**Solution**: 
- Store rotation entries with start/end times
- Compare current time against each rotation entry
- Return the user whose time window contains the current time

**Trade-offs**: 
- Simple but doesn't handle timezones
- Works well for demonstration but needs enhancement for production

### Challenge 2: Escalation Timing

**Problem**: Need to escalate incidents after a timeout period.

**Solution**: 
- Use `setInterval` to check escalations every minute
- Compare incident creation time against current time
- Escalate if timeout exceeded and incident still in `triggered` state

**Trade-offs**:
- Not real-time (up to 1-minute delay)
- Simple to implement and understand
- Production would use job queues for precision

### Challenge 3: State Management

**Problem**: Managing incident state transitions and ensuring consistency.

**Solution**:
- Simple state machine: `triggered` → `acknowledged` → `resolved`
- Validation in API endpoints to prevent invalid transitions
- Store timestamps for each state change

**Trade-offs**:
- Works for basic use cases
- Could be extended with more states (e.g., `cancelled`, `reassigned`)

### Challenge 4: Frontend-Backend Communication

**Problem**: Ensuring frontend stays in sync with backend state.

**Solution**:
- Polling for incidents (every 30 seconds)
- Immediate refresh after mutations
- Error handling with user feedback

**Trade-offs**:
- Polling is simple but not efficient
- WebSockets would be better for real-time updates

## What Went Well

1. **Clear Architecture**: Separating backend API from frontend made development straightforward
2. **Incremental Development**: Building one feature at a time allowed for focused testing
3. **Simple Data Models**: Using Maps made data access patterns clear
4. **Component Structure**: React components are well-organized and reusable

## What Could Be Improved

1. **Testing**: No automated tests. Would add unit tests for business logic and integration tests for API endpoints.

2. **Error Handling**: More comprehensive error handling and user feedback.

3. **Data Validation**: Add more validation for schedule rotations, date ranges, etc.

4. **Documentation**: More inline code comments and API documentation.

5. **Performance**: 
   - Optimize polling intervals
   - Add pagination for large datasets
   - Implement caching where appropriate

## Key Learnings

1. **Simplicity First**: Starting with in-memory storage and simple logic allowed rapid iteration. Complexity can be added later.

2. **Time Handling is Complex**: Even simple time-based logic requires careful consideration of timezones, DST, and edge cases.

3. **State Management Matters**: Even in a simple app, managing state across components can get complex. A state management solution would help as the app grows.

4. **User Experience**: Small details like status badges, loading states, and error messages significantly improve usability.

5. **API Design**: RESTful endpoints with clear naming make the API intuitive to use.

## Reflection

This project was a good exercise in building a full-stack application from scratch. The requirements were clear, and the scope was manageable. The main challenge was balancing simplicity (for demonstration) with completeness (for functionality).

The system demonstrates core concepts of incident management:
- Time-based scheduling
- State transitions
- Escalation logic
- Notification routing

While not production-ready, it provides a solid foundation that could be extended with:
- Database persistence
- Real-time notifications
- Authentication
- More sophisticated scheduling

Overall, the development process was smooth, and the final system meets the requirements while remaining understandable and maintainable.

## Time Investment

- **Planning & Design**: ~4 hour
- **Backend Development**: ~7 hours
- **Frontend Development**: ~6 hours
- **Integration & Testing**: ~3 hour
- **Documentation**: ~1 hour

**Total**: ~21 hours


