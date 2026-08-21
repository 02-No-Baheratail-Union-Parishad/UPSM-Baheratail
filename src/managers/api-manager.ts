/**
 * API Manager
 * Create, manage, and route all external APIs
 * Supports: REST, OAuth, API Keys, Webhooks
 */

import { Logger } from '../core/logger';
import { RBAC } from '../middleware/rbac';

interface APIConfig {
  id: string;
  name: string;
  provider: string;
  type: 'REST' | 'OAuth' | 'GraphQL' | 'Webhook';
  baseUrl: string;
  authentication: {
    type: 'API_KEY' | 'BEARER' | 'BASIC' | 'OAUTH2';
    credentials: Record<string, string>; // Never expose in logs
  };
  rateLimit: {
    requests: number;
    window: number; // ms
  };
  timeout: number; // ms
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  status: 'active' | 'inactive' | 'error';
  createdAt: string;
  updatedAt: string;
  lastError?: string;
  lastSync?: string;
}

interface APIRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
  queryParams?: Record<string, string>;
}

interface APIResponse {
  status: number;
  data: any;
  headers: Record<string, string>;
  timestamp: string;
  duration: number; // ms
}

export class APIManager {
  private apis: Map<string, APIConfig> = new Map();
  private requestLogs: Map<string, any[]> = new Map();
  private rateLimiters: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private logger: Logger, private rbac: RBAC) {}

  /**
   * Create a new API connection
   */
  async createAPI(userId: string, config: Partial<APIConfig>): Promise<APIConfig> {
    // Check permission
    if (!this.rbac.checkPermission(userId, 'manage_apis')) {
      this.logger.warn('Permission denied: manage_apis', { userId });
      throw new Error('Permission denied: manage_apis');
    }

    const apiId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const apiConfig: APIConfig = {
      id: apiId,
      name: config.name || 'Unnamed API',
      provider: config.provider || 'custom',
      type: config.type || 'REST',
      baseUrl: config.baseUrl || '',
      authentication: config.authentication || { type: 'API_KEY', credentials: {} },
      rateLimit: config.rateLimit || { requests: 100, window: 60000 },
      timeout: config.timeout || 30000,
      retryPolicy: config.retryPolicy || { maxRetries: 3, backoffMultiplier: 2 },
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.apis.set(apiId, apiConfig);
    this.logger.auditLog(userId, 'Admin', 'API_CREATE', apiId, 'SUCCESS');
    this.logger.info('API created', { apiId, provider: config.provider });

    // Return config without sensitive credentials
    return this.sanitizeAPIConfig(apiConfig);
  }

  /**
   * Test API connection
   */
  async testConnection(userId: string, apiId: string): Promise<{ connected: boolean; error?: string }> {
    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`API ${apiId} not found`);
    }

    try {
      this.logger.info('Testing API connection', { apiId, provider: api.provider });

      const response = await fetch(`${api.baseUrl}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(api),
        timeout: api.timeout,
      });

      const connected = response.ok;
      api.status = connected ? 'active' : 'error';
      api.lastSync = new Date().toISOString();

      if (!connected) {
        api.lastError = `HTTP ${response.status}: ${response.statusText}`;
      }

      this.logger.success(`API connection test ${connected ? 'passed' : 'failed'}`, { apiId });
      return { connected, error: api.lastError };
    } catch (error: any) {
      api.status = 'error';
      api.lastError = error.message;
      this.logger.error('API connection test failed', { apiId, error: error.message });
      return { connected: false, error: error.message };
    }
  }

  /**
   * Execute API request with rate limiting and retry logic
   */
  async executeRequest(userId: string, apiId: string, request: APIRequest): Promise<APIResponse> {
    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`API ${apiId} not found`);
    }

    // Check rate limit
    if (!this.checkRateLimit(apiId)) {
      throw new Error(`Rate limit exceeded for API ${apiId}`);
    }

    let lastError: any;
    for (let attempt = 0; attempt <= api.retryPolicy.maxRetries; attempt++) {
      try {
        const startTime = Date.now();
        const response = await this.makeRequest(api, request);
        const duration = Date.now() - startTime;

        // Log request
        this.logRequest(apiId, {
          userId,
          endpoint: request.endpoint,
          method: request.method,
          status: response.status,
          duration,
          timestamp: new Date().toISOString(),
        });

        this.logger.info('API request succeeded', { apiId, endpoint: request.endpoint, status: response.status });
        return response;
      } catch (error: any) {
        lastError = error;
        if (attempt < api.retryPolicy.maxRetries) {
          const delay = Math.pow(api.retryPolicy.backoffMultiplier, attempt) * 1000;
          this.logger.warn(`API request failed, retrying (attempt ${attempt + 1})`, { apiId, delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    this.logger.error('API request failed after retries', { apiId, error: lastError.message });
    throw lastError;
  }

  /**
   * Get API configuration (sanitized)
   */
  getAPI(apiId: string): APIConfig | undefined {
    const api = this.apis.get(apiId);
    return api ? this.sanitizeAPIConfig(api) : undefined;
  }

  /**
   * List all APIs (sanitized)
   */
  listAPIs(): APIConfig[] {
    return Array.from(this.apis.values()).map(api => this.sanitizeAPIConfig(api));
  }

  /**
   * Update API configuration
   */
  async updateAPI(userId: string, apiId: string, updates: Partial<APIConfig>): Promise<APIConfig> {
    if (!this.rbac.checkPermission(userId, 'manage_apis')) {
      throw new Error('Permission denied: manage_apis');
    }

    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`API ${apiId} not found`);
    }

    const before = { ...api };
    Object.assign(api, updates, { updatedAt: new Date().toISOString() });

    this.logger.auditLog(userId, 'Admin', 'API_UPDATE', apiId, 'SUCCESS');
    this.logger.info('API updated', { apiId, changes: Object.keys(updates) });

    return this.sanitizeAPIConfig(api);
  }

  /**
   * Delete API
   */
  async deleteAPI(userId: string, apiId: string): Promise<{ success: boolean }> {
    if (!this.rbac.checkPermission(userId, 'manage_apis')) {
      throw new Error('Permission denied: manage_apis');
    }

    const api = this.apis.get(apiId);
    if (!api) {
      throw new Error(`API ${apiId} not found`);
    }

    this.apis.delete(apiId);
    this.requestLogs.delete(apiId);
    this.rateLimiters.delete(apiId);

    this.logger.auditLog(userId, 'Admin', 'API_DELETE', apiId, 'SUCCESS');
    this.logger.info('API deleted', { apiId });

    return { success: true };
  }

  /**
   * Get request logs for an API
   */
  getRequestLogs(apiId: string, limit: number = 50): any[] {
    const logs = this.requestLogs.get(apiId) || [];
    return logs.slice(-limit);
  }

  // Private helper methods

  private getAuthHeaders(api: APIConfig): Record<string, string> {
    const headers: Record<string, string> = {};

    switch (api.authentication.type) {
      case 'API_KEY':
        headers['X-API-Key'] = api.authentication.credentials['apiKey'] || '';
        break;
      case 'BEARER':
        headers['Authorization'] = `Bearer ${api.authentication.credentials['token'] || ''}`;
        break;
      case 'BASIC':
        const credentials = `${api.authentication.credentials['username']}:${api.authentication.credentials['password']}`;
        headers['Authorization'] = `Basic ${Buffer.from(credentials).toString('base64')}`;
        break;
    }

    return headers;
  }

  private async makeRequest(api: APIConfig, request: APIRequest): Promise<APIResponse> {
    const url = new URL(`${api.baseUrl}${request.endpoint}`);

    if (request.queryParams) {
      Object.entries(request.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(api),
        ...request.headers,
      },
      body: request.body ? JSON.stringify(request.body) : undefined,
      timeout: api.timeout,
    });

    const data = await response.json();

    return {
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers),
      timestamp: new Date().toISOString(),
      duration: 0, // Set by caller
    };
  }

  private checkRateLimit(apiId: string): boolean {
    const api = this.apis.get(apiId);
    if (!api) return false;

    const now = Date.now();
    const limiter = this.rateLimiters.get(apiId);

    if (!limiter || now > limiter.resetTime) {
      this.rateLimiters.set(apiId, { count: 1, resetTime: now + api.rateLimit.window });
      return true;
    }

    if (limiter.count < api.rateLimit.requests) {
      limiter.count++;
      return true;
    }

    return false;
  }

  private logRequest(apiId: string, data: any): void {
    if (!this.requestLogs.has(apiId)) {
      this.requestLogs.set(apiId, []);
    }
    this.requestLogs.get(apiId)!.push(data);
  }

  private sanitizeAPIConfig(api: APIConfig): APIConfig {
    const sanitized = { ...api };
    // Remove sensitive credentials
    sanitized.authentication.credentials = {};
    return sanitized;
  }
}

export default APIManager;
