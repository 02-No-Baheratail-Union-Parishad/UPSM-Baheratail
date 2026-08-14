import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table linked to Firebase Auth UID
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  name: text('name'),
  role: text('role').default('operator'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Union Parishad Certificates table for persistent Relational tracking
export const certificates = pgTable('certificates', {
  id: text('id').primaryKey(),
  memoNo: text('memo_no').notNull(),
  typeKey: text('type_key').notNull(),
  typeLabel: text('type_label').notNull(),
  category: text('category'),
  citizenName: text('citizen_name'),
  citizenNid: text('citizen_nid'),
  village: text('village'),
  wardNo: text('ward_no'),
  status: text('status').default('issued'),
  feeAmount: integer('fee_amount').default(0),
  paymentStatus: text('payment_status').default('unpaid'),
  issuedBy: text('issued_by'),
  issueDate: text('issue_date'),
  verificationUrl: text('verification_url'),
  bodyText: text('body_text'),
  extraJson: text('extra_json'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Trail & Logs in PostgreSQL
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: text('user_id'),
  userEmail: text('user_email'),
  action: text('action').notNull(),
  targetId: text('target_id'),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow(),
});
