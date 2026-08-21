# Phase 2: API Manager & Database Control

## 🎯 Overview

Phase 2 implements comprehensive **API Management** and **Database Control** systems that work seamlessly with the Phase 1 Integration Center. This enables centralized management of all external APIs and database connections.

## 📂 New Files Added

```
src/
├── managers/
│   ├── api-manager.ts              # API creation, testing, and execution
│   └── database-manager.ts         # Database connection management
├── api/
│   └── integration-routes.ts        # RESTful endpoints
├── types/
│   └── integration.types.ts         # TypeScript type definitions
└── README.md                        # This file
```

## 🔌 API Manager

### Features

✅ **Create/Read/Update/Delete APIs**
- Support for REST, OAuth, GraphQL, Webhooks
- Multiple authentication types (API Key, Bearer, Basic, OAuth2)
- Rate limiting and retry logic
- Timeout and error handling

✅ **Test Connections**
```typescript
const result = await apiManager.testConnection(userId, apiId);
// { connected: true/false, error?: string }
```

✅ **Execute Requests with Auto-Retry**
```typescript
const response = await apiManager.executeRequest(userId, apiId, {
  method: 'GET',
  endpoint: '/users',
  queryParams: { limit: '10' }
});
```

✅ **Request Logging & Monitoring**
```typescript
const logs = apiManager.getRequestLogs(apiId, 50);
```

### Rate Limiting

```typescript
const config = {
  rateLimit: {
    requests: 100,  // Allow 100 requests
    window: 60000   // Per 60 seconds
  }
};
```

### Retry Policy

```typescript
const config = {
  retryPolicy: {
    maxRetries: 3,           // Retry up to 3 times
    backoffMultiplier: 2     // Exponential backoff (1s, 2s, 4s)
  }
};
```

## 🗄 Database Manager

### Supported Providers

- ✅ Firebase (Realtime DB & Firestore)
- ✅ Supabase (PostgreSQL)
- ✅ PostgreSQL (Direct)
- ✅ MySQL (Direct)
- ✅ Custom (via API)

### Features

✅ **Create Database Connections**
```typescript
const conn = await dbManager.createConnection(userId, {
  name: 'Production DB',
  provider: 'postgresql',
  credentials: { connectionString: '...' }
});
```

✅ **Test Connections**
```typescript
const result = await dbManager.testConnection(userId, connId);
// { connected: true/false, error?: string }
```

✅ **Execute Queries with Permissions**
```typescript
const result = await dbManager.executeQuery(userId, connId, 
  'SELECT * FROM certificates WHERE status = $1',
  ['active']
);
// Checks: database_read permission
// For INSERT/UPDATE/DELETE: checks database_write permission
```

✅ **Query Logging & Audit**
```typescript
const logs = dbManager.getQueryLogs(connId, 50);
```

## 🔐 Security Implementation

### Credential Handling

✅ **Server-Side Only**
- Credentials stored server-side in secure storage
- Never exposed in API responses
- Sanitized before logging

✅ **Automatic Sanitization**
```typescript
private sanitizeConnection(conn: DBConnection): DBConnection {
  const sanitized = { ...conn };
  sanitized.credentials = {}; // Remove credentials
  return sanitized;
}
```

### Permission Checks

✅ **RBAC Integration**
```typescript
// API Management
if (!rbac.checkPermission(userId, 'manage_apis')) {
  throw new Error('Permission denied');
}

// Database Read
if (!rbac.checkPermission(userId, 'database_read')) {
  throw new Error('Permission denied');
}

// Database Write (for INSERT/UPDATE/DELETE)
if (query.match(/^(INSERT|UPDATE|DELETE)/i)) {
  if (!rbac.checkPermission(userId, 'database_write')) {
    throw new Error('Permission denied');
  }
}
```

## 🛣 API Endpoints

### API Management

```
POST   /integrations/api              Create API
GET    /integrations/api              List APIs
GET    /integrations/api/:apiId       Get API
PUT    /integrations/api/:apiId       Update API
DELETE /integrations/api/:apiId       Delete API
POST   /integrations/api/:apiId/test  Test Connection
POST   /integrations/api/:apiId/request Execute Request
GET    /integrations/api/:apiId/logs  Get Request Logs
```

### Database Management

```
POST   /integrations/database           Create Connection
GET    /integrations/database           List Connections
POST   /integrations/database/:connId/test Test Connection
POST   /integrations/database/:connId/query Execute Query
GET    /integrations/database/:connId/logs Get Query Logs
```

## 📝 Usage Examples

### Create and Test an API

```typescript
// Create API connection to N8N
const api = await apiManager.createAPI(userId, {
  name: 'N8N Webhook',
  provider: 'n8n',
  type: 'Webhook',
  baseUrl: 'https://n8n.example.com',
  authentication: {
    type: 'BEARER',
    credentials: { token: 'your-api-key' }
  }
});

// Test connection
const testResult = await apiManager.testConnection(userId, api.id);
if (testResult.connected) {
  console.log('N8N is connected!');
}

// Execute a request
const response = await apiManager.executeRequest(userId, api.id, {
  method: 'POST',
  endpoint: '/webhook/certificate-generated',
  body: {
    certificateId: 'cert-123',
    status: 'approved'
  }
});
```

### Create and Query a Database

```typescript
// Create PostgreSQL connection
const conn = await dbManager.createConnection(userId, {
  name: 'Production Database',
  provider: 'postgresql',
  credentials: {
    connectionString: 'postgresql://user:pass@host:5432/db'
  }
});

// Test connection
const testResult = await dbManager.testConnection(userId, conn.id);
if (testResult.connected) {
  console.log('Database is connected!');
}

// Execute a query
const result = await dbManager.executeQuery(userId, conn.id,
  'SELECT * FROM certificates WHERE status = $1',
  ['active']
);

console.log(`Found ${result.count} active certificates`);
console.log(`Query took ${result.duration}ms`);
```

## 🔄 Integration with Phase 1

Phase 2 builds on Phase 1's foundation:

✅ Uses `Logger` from Phase 1 for centralized logging
✅ Uses `RBAC` from Phase 1 for permission checks
✅ Uses `AuditLog` from Phase 1 for tracking changes
✅ Follows modular adapter pattern from Phase 1
✅ Implements error handling philosophy (no fake success)

## 🚀 Next Steps (Phase 3)

- [ ] Database Security Control (Preview → Confirm → Apply → Verify)
- [ ] Firebase Security Rules Management via API
- [ ] Supabase Row-Level Security (RLS) Management
- [ ] Backup & Restore functionality
- [ ] Schema migration tools
- [ ] Database monitoring dashboard

## 📚 Type Safety

All modules include comprehensive TypeScript types:

```typescript
import { APIConfig, DBConnection, QueryResult } from '../types/integration.types';
```

## 🏆 Key Principles Applied

✅ **No Fake Success** - Real connection tests and error messages
✅ **Server-Side Security** - All credentials stored securely
✅ **RBAC Enforced** - Permission checks on every operation
✅ **Audit Trail** - All actions logged
✅ **Type Safe** - Full TypeScript coverage
✅ **Modular Design** - Easy to extend with new providers
✅ **Error Resilient** - Automatic retry with exponential backoff

---

**Phase 2: API Manager & Database Control - Complete** ✅

স্বপ্ন যখন বড়, তখন কোডিংও হবে ম্যাজিকের মতো! ✨
