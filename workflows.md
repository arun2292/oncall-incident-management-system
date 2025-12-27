# Workflows 

This document provides step-by-step examples of common workflows in the On-Call Incident Management System.

## Workflow 1: Setting First On-Call Schedule

### Step 1: Create a Service
1. Navigate to the **Schedules** tab
2. The system comes with a sample service "Payment API"
3. To create a new service, you would need to use the API directly:
   ```bash
   curl -X POST http://localhost:5000/api/services \
     -H "Content-Type: application/json" \
     -d '{"name": "User Authentication Service", "description": "Handles user login and authentication"}'
   ```

### Step 2: Create Users
1. Navigate to the **Users** tab
2. Click **Add User**
3. Fill in:
   - Name: "Arun Kumar"
   - Email: "arun@gmail.com"
   - Phone: "+917482995753"
4. Click **Create User**

### Step 3: Create a Schedule
1. Navigate to the **Schedules** tab
2. Click **Create Schedule**
3. Fill in the form:
   - **Schedule Name**: "Weekend On-Call Rotation"
   - **Service**: Select "Payment API"
   - **Rotation**: Add entries for each rotation period
     - User: Select "Arun Kumar"
     - Start Time: `2024-12-16T00:00` (this Monday)
     - End Time: `2024-12-23T00:00` (next Monday)
     - Click **Add Rotation Entry** to add more
4. Click **Create Schedule**

### Expected Result
- Schedule appears in the list
- Current on-call user is displayed (if current time falls within a rotation period)

## Workflow 2: Triggering and Managing an Incident

### Step 1: Trigger an Incident
1. Navigate to the **Incidents** tab
2. Click **Trigger Incident**
3. Fill in the form:
   - **Title**: "Payment API Response Time Degraded"
   - **Description**: "API response times have increased to 2+ seconds. Affecting 15% of requests."
   - **Schedule**: Select "Primary On-Call Rotation"
   - **Severity**: Select "High"
4. Click **Trigger Incident**

### What Happens Automatically
- System finds the current on-call user for the selected schedule
- Incident is created with state `triggered`
- On-call user is notified (check backend console for notification log)
- Incident appears in the incidents list

### Step 2: Acknowledge the Incident
1. Find the incident you just created
2. Click **Acknowledge** button
3. Incident state changes to `acknowledged`
4. `acknowledgedAt` timestamp is recorded

### Step 3: Resolve the Incident
1. After investigating and fixing the issue
2. Click **Resolve** button on the incident
3. Incident state changes to `resolved`
4. `resolvedAt` timestamp is recorded

### Expected Result
- Incident lifecycle: `triggered` → `acknowledged` → `resolved`
- All timestamps are recorded
- Incident appears in resolved incidents

## Workflow 3: Escalation Flow

### Step 1: Trigger an Incident
1. Create an incident as described in Workflow 2
2. **Do not** acknowledge it immediately

### Step 2: Wait for Automatic Escalation
- The system checks for escalations every minute
- If an incident remains in `triggered` state for the configured timeout (default: 5 minutes), it escalates
- Check the backend console for escalation notifications
- The incident's `escalationLevel` increases
- Escalation history is updated

### Step 3: Manual Escalation
1. Navigate to an active incident
2. Click **Escalate** button
3. Incident immediately escalates to the next level
4. New on-call user is notified

### Expected Result
- Escalation history shows all escalation events
- Each escalation includes:
  - Level number
  - Timestamp
  - Reason (Timeout or Manual)

## Workflow 4: Viewing Dashboard Metrics

### Step 1: Access Dashboard
1. Navigate to the **Dashboard** tab (default view)
2. View the statistics cards:
   - Total Incidents
   - Active Incidents
   - Resolved Incidents
   - Number of Schedules

### Step 2: View Current On-Call
- Dashboard shows all schedules with their current on-call users
- On-call indicator badge is displayed next to the user's name

### Step 3: View Recent Incidents
- Dashboard shows the 5 most recent incidents
- Each incident shows:
  - Title and description
  - Current state
  - Triggered timestamp
  - Resolved timestamp (if applicable)

## Workflow 5: API-Based Incident Creation (Automated)

For automated systems, incidents can be triggered via API:

```bash
# Trigger an incident via API
curl -X POST http://localhost:5000/api/incidents \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Database Connection Pool Exhausted",
    "description": "Connection pool at 95% capacity. May cause timeouts.",
    "scheduleId": "schedule-1",
    "severity": "high"
  }'
```

### Response
```json
{
  "id": "incident-uuid",
  "title": "Database Connection Pool Exhausted",
  "state": "triggered",
  "assignedTo": "user-1",
  "triggeredAt": "2024-12-15T10:30:00.000Z",
  ...
}
```

## Workflow 6: Checking Current On-Call via API

```bash
# Get current on-call for a schedule
curl http://localhost:5000/api/schedules/schedule-1/oncall
```

### Response
```json
{
  "id": "user-1",
  "name": "Arun Kumar",
  "email": "arun@gmaul.com",
  "phone": "+917482995753"
}
```

## Workflow 7: Managing Incident State via API

### Acknowledge
```bash
curl -X PATCH http://localhost:5000/api/incidents/incident-id/acknowledge
```

### Resolve
```bash
curl -X PATCH http://localhost:5000/api/incidents/incident-id/resolve
```

### Escalate
```bash
curl -X POST http://localhost:5000/api/incidents/incident-id/escalate
```

## Testing Escalation Timing

To test escalation without waiting 5 minutes:

1. **Modify the escalation timeout** in the backend code (temporarily):
   - Edit `backend/server.js`
   - Change `initialTimeout: 300000` to `initialTimeout: 30000` (30 seconds)
   - Restart the backend server

2. **Trigger an incident** and don't acknowledge it

3. **Wait 30 seconds** and check the backend console for escalation notifications

4. **Check the incident** in the frontend - escalation level should have increased

## Common Scenarios

### Scenario 1: No One On-Call
- If you try to trigger an incident for a schedule with no active rotation, you'll get an error
- Solution: Ensure the schedule has rotation entries that cover the current time

### Scenario 2: Multiple Schedules
- You can create multiple schedules for different services
- Each schedule operates independently
- Dashboard shows all schedules and their current on-call users

### Scenario 3: Overlapping Rotations
- The system doesn't prevent overlapping rotations
- The first matching rotation (in order) is used
- For production, add validation to prevent overlaps

## Tips

1. **Use UTC times** when creating schedules via API to avoid timezone confusion
2. **Check backend console** for notification logs to see when alerts are sent
3. **Refresh the incidents page** periodically to see automatic escalations
4. **Use the Dashboard** to get a quick overview of system status

## Troubleshooting

### Incidents not escalating?
- Check that the escalation policy is configured in the schedule
- Verify the timeout hasn't been set too high
- Check backend console for errors

### Can't find current on-call?
- Ensure rotation periods include the current date/time
- Check that rotation entries have valid user IDs
- Verify dates are in ISO format

### Notifications not appearing?
- Check backend console (notifications are logged there)
- Verify the user exists and has contact information
- Check that the incident was created successfully
