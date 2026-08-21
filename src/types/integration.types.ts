/**
 * TypeScript Type Definitions for Integration System
 * Ensures type safety across all modules
 */

// API Types
export interface APIConfig {
  id: string;
  name: string;
  provider: string;
  type: 'REST' | 'OAuth' | 'GraphQL' | 'Webhook';
  baseUrl: string;
  authentication: APIAuth;
  rateLimit: RateLimit;
  timeout: number;
  retryPolicy: RetryPolicy;
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  lastSync?: string;
}

export interface APIAuth {
  type: 'API_KEY' | 'BEARER' | 'BASIC' | 'OAUTH2';
  credentials: Record<string, string>;
}

export interface RateLimit {
  requests: number;
  window: number;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMultiplier: number;
}

export interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  queryParams?: Record<string, string>;
}

export interface APIResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timestamp: string;
  duration: number;
}

// Database Types
export type DBProvider = 'firebase' | 'supabase' | 'postgresql' | 'mysql' | 'custom';

export interface DBConnection {
  id: string;
  name: string;
  provider: DBProvider;
  status: 'connected' | 'disconnected' | 'error';
  credentials: Record<string, string>;
  lastSync: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueryResult {
  rows: any[];
  count: number;
  timestamp: string;
  duration: number;
}

// RBAC Types
export type UserRole = 'SuperAdmin' | 'Admin' | 'Officer' | 'Operator' | 'Viewer';

export interface UserPermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  generate: boolean;
  approve: boolean;
  reject: boolean;
  database_read: boolean;
  database_write: boolean;
  manage_apis: boolean;
  manage_webhooks: boolean;
  manage_mcp: boolean;
  manage_ai: boolean;
  security: boolean;
  deployment: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: UserPermissions;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  role: UserRole;
  action: string;
  resource: string;
  result: 'SUCCESS' | 'FAILED' | 'PENDING';
  error?: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
}

// Integration Status Types
export interface IntegrationStatus {
  [key: string]: {
    connected: boolean;
    provider: string;
    lastSync?: string;
    error?: string;
  };
}

export default {};
