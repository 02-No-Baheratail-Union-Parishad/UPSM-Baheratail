export interface SimpleFieldConfig {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'number' | 'date';
  required?: boolean;
}

export interface TableConfig {
  key: string;
  title: string;
  headers: string[];
}

export interface CertificateTypeConfig {
  key: string;
  label: string;
  category: string;
  iconName?: string;
  simpleFields?: SimpleFieldConfig[];
  tables?: TableConfig[];
  promptInstruction?: string;
}

export interface CitizenData {
  nid?: string;
  birthNo?: string;
  name: string;
  father: string;
  spouseName?: string;
  mother: string;
  gender: 'পুরুষ' | 'মহিলা' | 'হিজরা';
  mobile?: string;
  village: string;
  postOffice: string;
  postCode?: string;
  wardNo: string;
  upName?: string;
  district?: string;
  upazila?: string;
}

export interface TableRowData {
  [colIndex: number]: string;
}

export interface CertificateExtraData {
  simpleFields: Record<string, string>;
  tables: Record<string, string[][]>;
}

export interface CertificateRecord {
  id: string;
  memoNo: string;
  issueDate: string;
  issueDateEn: string;
  typeKey: string;
  typeLabel: string;
  category: string;
  citizen: CitizenData;
  extra: CertificateExtraData;
  bodyText: string;
  qrCodeUrl?: string;
  verificationUrl: string;
  status: 'pending_approval' | 'approved' | 'issued' | 'revoked' | 'cancelled' | 'draft';
  issuedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  rejectionReason?: string;
  createdAt: string;
  feeAmount?: number;
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'Cash' | 'Upay';
  trxId?: string;
  paymentStatus?: 'paid' | 'unpaid' | 'waived';
}

export interface UnionParishadConfig {
  upName: string;
  upNameEn: string;
  upazila: string;
  district: string;
  address: string;
  phone?: string;
  email?: string;
  chairmanName: string;
  chairmanTitle: string;
  chairmanPhone?: string;
  secretaryName: string;
  secretaryTitle: string;
  secretaryPhone?: string;
  logoUrl: string;
  sealText: string;
  defaultPromptPrefix: string;
  enableHeaderInPrint: boolean;
  watermarkOpacity: number;
  certificateFeeDefault?: number;
  categoryFees?: Record<string, number>;
  typeFeeOverrides?: Record<string, number>;
  // MFS Payment Details
  paymentBkashNumber?: string;
  paymentNagadNumber?: string;
  paymentRocketNumber?: string;
  paymentInstructions?: string;
  // Template Customizer Options
  templateHeaderStyle?: 'tri-column' | 'classic' | 'centered';
  bodyFontSize?: number;
  borderStyle?: 'double-green-red' | 'double-green' | 'single-green' | 'none';
  blankSealSize?: number; // Circle diameter in px (0 to hide)
  qrCodePosition?: 'left-bottom' | 'right-bottom';
  templateDocId: string;
  targetFolderId: string;
  sheetId: string;
  appsScriptUrl?: string;
  r2AccountId?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2Endpoint?: string;
  r2BucketName?: string;
  geminiApiKey?: string;
  // Developer & Backup URLs
  developerName?: string;
  developerTitle?: string;
  developerPhotoUrl?: string;
  developerBio?: string;
  developerEmail?: string;
  developerPhone?: string;
  developerWhatsappNumber?: string;
  developerFacebookUrl?: string;
  developerLinkedinUrl?: string;
  githubRepoUrl?: string;
  githubBranch?: string;
  googleDriveBackupUrl?: string;
  archiveFolderId?: string;
  mcpEndpointUrl?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  lastBackupDate?: string;
  pluginsConfig?: {
    smsNotification?: boolean;
    gdriveAutoSync?: boolean;
    geminiOcrVision?: boolean;
    auditTrailLog?: boolean;
    webhookIntegration?: boolean;
    mcpProtocolAgent?: boolean;
  };
}

export interface ApiKeyRecord {
  id: string;
  name: string;
  key: string;
  permissions: 'read' | 'write' | 'admin';
  createdAt: string;
  lastUsedAt?: string;
  status: 'active' | 'revoked';
}

export interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  secret?: string;
  events: ('certificate.created' | 'certificate.approved' | 'certificate.cancelled' | 'citizen.registered')[];
  enabled: boolean;
  createdAt: string;
}

export interface WebhookLogRecord {
  id: string;
  webhookName: string;
  url: string;
  event: string;
  payloadSummary: string;
  status: 'success' | 'failed';
  httpStatus: number;
  timestamp: string;
  error?: string;
}

export interface CitizenAccountRecord {
  id: string;
  nid?: string;
  birthNo?: string;
  name: string;
  father: string;
  mother: string;
  spouseName?: string;
  gender: 'পুরুষ' | 'মহিলা' | 'হিজরা';
  mobile?: string;
  village: string;
  wardNo: string;
  postOffice: string;
  postCode?: string;
  totalCertificates: number;
  lastCertificateType?: string;
  lastCertificateDate?: string;
  registeredAt: string;
}

export interface NidScanResult {
  nidNo?: string;
  name?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  dob?: string;
  addressText?: string;
  village?: string;
  wardNo?: string;
  rawText?: string;
  error?: string;
}

export interface VerificationResult {
  found: boolean;
  certificate?: CertificateRecord;
  verifiedAt: string;
  message?: string;
}

export interface BackupSnapshot {
  id: string;
  filename: string;
  timestamp: string;
  archiveFolderId: string;
  sheetId: string;
  recordsCount: number;
  sizeKb?: number;
  status: 'completed' | 'in_progress' | 'failed';
  downloadUrl?: string;
  driveFileId?: string;
  notes?: string;
}

