# Supabase Migration Strategy

## 🎯 Overview

Migrating from Firebase to Supabase PostgreSQL for:
- ✅ Citizen Registry
- ✅ Tax Records (Holdings)
- ✅ Certificate History
- ✅ Audit Logs

## 📊 Data Structure Comparison

### Firebase (Firestore)
```
certificates/
  └─ cert-123
      ├─ applicantName: "..."
      ├─ status: "approved"
      └─ createdAt: timestamp
```

### Supabase (PostgreSQL)
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  applicant_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔄 Migration Steps

### Step 1: Create Database Schema

```sql
-- Citizens Table
CREATE TABLE citizens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nid_or_birth_no VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  village VARCHAR(255),
  post_office VARCHAR(255),
  ward_no VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Certificates Table
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  citizen_id UUID REFERENCES citizens(id),
  memo_no VARCHAR(50) NOT NULL UNIQUE,
  certificate_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  issue_date DATE,
  body_text TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by VARCHAR(255)
);

-- Certificate History (Audit Trail)
CREATE TABLE certificate_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id UUID REFERENCES certificates(id),
  action VARCHAR(50) NOT NULL,
  previous_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255),
  result VARCHAR(20),
  error_message TEXT,
  previous_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Step 2: Enable Row-Level Security (RLS)

```sql
-- Enable RLS on certificates table
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (auth.uid()::text = created_by);

CREATE POLICY "Admins can view all certificates"
  ON certificates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.email LIKE '%admin%'
    )
  );

-- Policy: Officers can approve certificates
CREATE POLICY "Officers can update certificate status"
  ON certificates FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.email LIKE '%officer%'
  ))
  WITH CHECK (
    status IN ('approved', 'rejected', 'corrected')
  );
```

### Step 3: Create Indexes for Performance

```sql
-- Index for certificate lookups
CREATE INDEX idx_certificates_citizen_id ON certificates(citizen_id);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_certificates_created_at ON certificates(created_at DESC);

-- Index for audit logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
```

### Step 4: Data Migration Script

```typescript
// migration.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';

const firebaseApp = initializeApp({
  // Firebase config
});

const firebaseDb = getFirestore(firebaseApp);
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function migrateCertificates() {
  const certificatesRef = collection(firebaseDb, 'certificates');
  const snapshot = await getDocs(certificatesRef);

  const data = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Insert into Supabase
  const { error } = await supabase
    .from('certificates')
    .insert(data);

  if (error) {
    console.error('Migration failed:', error);
  } else {
    console.log(`Migrated ${data.length} certificates`);
  }
}

await migrateCertificates();
```

## 🔐 Security Benefits

✅ **Row-Level Security (RLS)**
- Citizens can only see their own certificates
- Officers can approve only assigned applications
- Admins have full access

✅ **Database-Level Constraints**
- Foreign key relationships enforced
- Data integrity guaranteed
- No invalid states possible

✅ **Audit Trail**
- Every change logged automatically
- User who made the change tracked
- Previous and new values stored

## 📈 Performance Improvements

- **Queries**: Optimized indexes for fast lookups
- **Real-time**: Supabase subscriptions for live updates
- **Scaling**: PostgreSQL handles millions of records
- **Transactions**: ACID compliance ensures data consistency

## 🔧 Environment Setup

```bash
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## ✅ Verification Checklist

- [ ] Schema created in Supabase
- [ ] RLS policies enabled
- [ ] Indexes created
- [ ] Data migrated from Firebase
- [ ] Audit logs working
- [ ] Real-time subscriptions tested
- [ ] Backup strategy configured
- [ ] Monitoring alerts set up

---

**Benefits Over Firebase:**
✅ Full PostgreSQL database
✅ Built-in RLS
✅ Real-time subscriptions
✅ Reduced Firebase costs
✅ Structured data with schema
