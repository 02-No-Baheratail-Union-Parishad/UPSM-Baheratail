/**
 * Supabase Adapter
 * Full PostgreSQL Database with Row-Level Security (RLS)
 * For: Citizen Registry, Tax Records, Certificate History, Audit Logs
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Logger } from '../core/logger';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string; // For server-side admin operations
}

export class SupabaseAdapter {
  private client: SupabaseClient;
  private adminClient: SupabaseClient;

  constructor(config: SupabaseConfig, private logger: Logger) {
    // Client-side (with RLS enforced)
    this.client = createClient(config.url, config.anonKey);

    // Admin client (bypasses RLS - use carefully)
    if (config.serviceRoleKey) {
      this.adminClient = createClient(config.url, config.serviceRoleKey);
    } else {
      this.adminClient = this.client;
    }
  }

  /**
   * Get citizen by ID (with RLS)
   */
  async getCitizen(citizenId: string, userId?: string) {
    try {
      const query = this.client
        .from('citizens')
        .select('*')
        .eq('id', citizenId);

      const { data, error } = await query;

      if (error) {
        this.logger.error('Failed to get citizen', { citizenId, error: error.message });
        throw error;
      }

      return data?.[0] || null;
    } catch (error: any) {
      this.logger.error('Supabase query failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get all citizens (with RLS - only own records)
   */
  async getCitizens(filters?: Record<string, any>) {
    try {
      let query = this.client.from('citizens').select('*');

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Failed to get citizens', { error: error.message });
        throw error;
      }

      return data || [];
    } catch (error: any) {
      this.logger.error('Supabase query failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create certificate record
   */
  async createCertificate(data: any) {
    try {
      const { data: result, error } = await this.client
        .from('certificates')
        .insert([data])
        .select();

      if (error) {
        this.logger.error('Failed to create certificate', { error: error.message });
        throw error;
      }

      this.logger.info('Certificate created', { certificateId: result?.[0]?.id });
      return result?.[0] || null;
    } catch (error: any) {
      this.logger.error('Supabase insert failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Update certificate status
   */
  async updateCertificateStatus(certificateId: string, status: string) {
    try {
      const { data, error } = await this.client
        .from('certificates')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', certificateId)
        .select();

      if (error) {
        this.logger.error('Failed to update certificate', { certificateId, error: error.message });
        throw error;
      }

      return data?.[0] || null;
    } catch (error: any) {
      this.logger.error('Supabase update failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Get certificate history (audit trail)
   */
  async getCertificateHistory(certificateId: string) {
    try {
      const { data, error } = await this.client
        .from('certificate_history')
        .select('*')
        .eq('certificate_id', certificateId)
        .order('created_at', { ascending: false });

      if (error) {
        this.logger.error('Failed to get certificate history', { certificateId, error: error.message });
        throw error;
      }

      return data || [];
    } catch (error: any) {
      this.logger.error('Supabase query failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Create audit log entry
   */
  async logAudit(data: any) {
    try {
      const { error } = await this.adminClient
        .from('audit_logs')
        .insert([{
          ...data,
          created_at: new Date().toISOString(),
        }]);

      if (error) {
        this.logger.error('Failed to create audit log', { error: error.message });
        throw error;
      }

      this.logger.debug('Audit log created', { action: data.action });
    } catch (error: any) {
      this.logger.error('Supabase audit insert failed', { error: error.message });
    }
  }

  /**
   * Apply Row-Level Security (RLS) Policy
   * Admin-only operation
   */
  async applyRLSPolicy(tableName: string, policy: any) {
    try {
      this.logger.info('Applying RLS policy', { tableName, policy: policy.name });

      // Execute RLS policy creation (this would be a raw SQL query)
      // In production, use Supabase admin API or direct PostgreSQL connection
      const { error } = await this.adminClient.rpc('apply_rls_policy', {
        table_name: tableName,
        policy_name: policy.name,
        policy_expression: policy.expression,
      });

      if (error) {
        this.logger.error('Failed to apply RLS policy', { tableName, error: error.message });
        throw error;
      }

      this.logger.success('RLS policy applied successfully', { tableName });
      return true;
    } catch (error: any) {
      this.logger.error('RLS policy application failed', { tableName, error: error.message });
      throw error;
    }
  }

  /**
   * Real-time subscription to certificate changes
   */
  subscribeToChanges(certificateId: string, callback: (data: any) => void) {
    const subscription = this.client
      .channel(`certificates:${certificateId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'certificates',
          filter: `id=eq.${certificateId}`,
        },
        (payload) => {
          this.logger.info('Certificate changed', { certificateId, event: payload.eventType });
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      this.logger.info('Testing Supabase connection');

      const { data, error } = await this.client
        .from('certificates')
        .select('count')
        .limit(1);

      if (error) {
        this.logger.error('Supabase connection failed', { error: error.message });
        return false;
      }

      this.logger.success('Supabase connection successful');
      return true;
    } catch (error: any) {
      this.logger.error('Supabase connection test failed', { error: error.message });
      return false;
    }
  }
}

export default SupabaseAdapter;
