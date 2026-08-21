# Phase 1: Integration Center & API Manager

## 🎯 Overview

This phase establishes the "Lego-block" modular architecture for the Union Parishad Digital Platform. The system connects centrally to external services (APIs, Firebase, Webhooks, AI Providers) while maintaining a secure bridge between cloud and local processing.

## 📂 Directory Structure

```
src/
├── core/
│   ├── router.js           # Main API/AI Router
│   └── logger.js           # Centralized logging (No fake success!)
├── integrations/
│   ├── adapter-manager.js  # Central hub for all adapters
│   ├── firebase/
│   │   └── adapter.js      # Firebase Realtime DB & Firestore
│   └── external-api/
│       └── joke-generator.js # Example: Random Joke Generator API
├── middleware/
│   ├── rbac.js             # Role-Based Access Control
│   └── human-approval.js   # Sensitive operation approval
├── webhooks/
│   └── webhook-manager.js  # Incoming/Outgoing webhook handling
├── examples/
│   └── integration-example.js # Usage examples
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Test External API Integration

```javascript
const jokeAdapter = require('./integrations/external-api/joke-generator');

// Generate a single joke
const joke = await jokeAdapter.generateJoke();
console.log(joke.setup + ' - ' + joke.punchline);

// Generate multiple jokes
const jokes = await jokeAdapter.generateMultipleJokes(5);
```

### 2. Check Integration Status

```javascript
const manager = require('./integrations/adapter-manager');
const status = await manager.getIntegrationStatus();
console.log(status);
```

### 3. Route AI Tasks

```javascript
const result = await manager.routeAITask('generate_joke', {});
console.log(result);
```

## ✨ Key Features

### ✅ Modular Adapter Pattern
- **Connect Once**: Each adapter is self-contained
- **Reuse Anywhere**: Import and use any adapter in your code
- **Easy to Extend**: Add new adapters without modifying core logic

### ✅ Centralized Logging
- **Real Errors**: No fake success messages
- **Audit Trail**: Every action logged with timestamp and user info
- **Debug Mode**: Enable DEBUG=true for detailed logs
- **Log Files**: Persisted logs in `logs/` directory

### ✅ Security & RBAC
- **Role-Based Access**: SuperAdmin, Admin, Officer, Operator, Viewer
- **Granular Permissions**: View, Create, Approve, Reject, Generate, Manage APIs, Security, Deployment
- **Human-in-the-Loop**: Sensitive operations require approval
- **Audit Logging**: All actions tracked with user, role, and result

### ✅ Error Handling
- **Graceful Fallbacks**: Use local jokes if API is unavailable
- **Transparent Failures**: Always report real errors with diagnostics
- **Recovery Info**: Suggest fixes (e.g., "Check Firebase API quota")

## 📊 Logging

All logs are stored in `logs/` directory:

```
logs/
├── info-2024-01-15.log      # General information
├── warn-2024-01-15.log      # Warnings
├── error-2024-01-15.log     # Errors
├── success-2024-01-15.log   # Successful operations
├── debug-2024-01-15.log     # Debug info (DEBUG=true only)
└── audit-2024-01-15.log     # User actions & changes
```

### Example Log Entry

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "SUCCESS",
  "message": "Joke generated from API",
  "data": {
    "type": "general"
  },
  "environment": "development"
}
```

### Example Audit Log Entry

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "userId": "admin@example.com",
  "role": "SuperAdmin",
  "action": "DATABASE_UPDATE",
  "resource": "certificates",
  "result": "SUCCESS",
  "error": null
}
```

## 🌍 External API Integration: Joke Generator

This example demonstrates how to integrate with an external API:

### Provider: Official Joke API
- **URL**: `https://official-joke-api.appspot.com/random_joke`
- **Method**: GET
- **Response**: JSON with setup and punchline

### Features
- ✅ Connection testing
- ✅ Automatic fallback to local jokes if API is unavailable
- ✅ Rate limiting protection (500ms delay between requests)
- ✅ Error reporting with diagnostics
- ✅ Batch joke generation with error resilience

### Example Response

```json
{
  "status": "success",
  "source": "Official Joke API",
  "setup": "Why did the scarecrow win an award?",
  "punchline": "Because he was outstanding in his field!",
  "type": "general",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## 🔐 Human-in-the-Loop Approval

Sensitive operations require human approval:

```javascript
const approvalSystem = require('./middleware/human-approval');

// Request approval
const approval = await approvalSystem.requestApproval(
  userId,
  'database_delete',
  { table: 'users', id: 123 },
  'Admin'
);

// Later: Admin approves
await approvalSystem.approveRequest(approval.approvalId, approverId, 'SuperAdmin');

// Or: Admin rejects
await approvalSystem.rejectRequest(approval.approvalId, approverId, 'SuperAdmin', 'Not verified');
```

## 📡 Webhook Management

Handle incoming and outgoing webhooks:

```javascript
const webhookManager = require('./webhooks/webhook-manager');

// Register a webhook
webhookManager.registerWebhook('wh-001', {
  event: 'certificate.approved',
  url: 'https://n8n.example.com/webhook/certificate-approved'
});

// Trigger webhook
await webhookManager.triggerWebhook('wh-001', { certificateId: 'cert-123' });

// Handle incoming webhook
await webhookManager.handleIncomingWebhook('application.submitted', { appId: 'app-456' });
```

## 🌐 Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
DEBUG=true
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_API_KEY=your-firebase-api-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

## 📝 Next Steps (Phase 2)

- [ ] Implement Firebase Admin SDK integration
- [ ] Add Supabase PostgreSQL adapter
- [ ] Create N8N webhook listener
- [ ] Build API Manager UI
- [ ] Implement rate limiting
- [ ] Add request retry logic
- [ ] Create dashboard monitoring

## 🤝 Contributing

When adding new adapters:

1. Create a new folder under `src/integrations/`
2. Implement `testConnection()` method
3. Add error handling with real diagnostics
4. Update `adapter-manager.js` to register
5. Add unit tests
6. Document in README

## 📚 References

- [Official Joke API](https://official-joke-api.appspot.com/)
- [Firebase Admin SDK](https://firebase.google.com/docs/database/admin/start)
- [Express.js](https://expressjs.com/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

---

**Built with ❤️ for Baheratail Union Parishad Digital Platform**

স্বপ্ন যখন বড়, তখন কোডিংও হবে ম্যাজিকের মতো! ✨
