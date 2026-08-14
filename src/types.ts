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
  holdingNo?: string;
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
  biometricVerified?: boolean;
  biometricAuthType?: 'WebAuthn Passkey' | 'Platform Biometrics' | 'Biometric PIN' | 'Security Passkey';
  biometricTimestamp?: string;
  verifiedByBiometrics?: string;
}

export interface WebAuthnPasskeyCredential {
  id: string;
  rawId: string;
  type: string;
  deviceName: string;
  authenticatorAttachment?: 'platform' | 'cross-platform';
  registeredAt: string;
  lastUsedAt?: string;
  userEmail: string;
  transports?: string[];
}

export interface CouncilMember {
  id: string;
  category: 'chairman' | 'reserved_female' | 'general_member' | 'officer' | 'udc' | 'dafadar' | 'gram_police';
  name: string;
  designation: string;
  mobile: string;
  wardNo?: string;
  photoUrl?: string;
  isAutoSynced?: boolean;
}

export interface UnionParishadConfig {
  upName: string;
  upNameEn: string;
  upazila: string;
  district: string;
  address: string;
  phone?: string;
  hotline?: string;
  email?: string;
  chairmanName: string;
  chairmanTitle: string;
  chairmanPhone?: string;
  chairmanSignatureUrl?: string;
  secretaryName: string;
  secretaryTitle: string;
  secretaryPhone?: string;
  secretarySignatureUrl?: string;
  enableDigitalSignature?: boolean;
  showSecretarySignature?: boolean;
  logoUrl: string;
  watermarkUrl?: string;
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
  // QR Code Advanced Styling Options
  qrColorScheme?: 'classic-black' | 'govt-emerald' | 'emerald-gold' | 'govt-crimson' | 'navy-slate' | 'teal-cyan' | 'custom';
  qrCustomDarkColor?: string;
  qrCustomLightColor?: string;
  qrEmbedLogo?: boolean;
  qrLogoUrl?: string;
  qrLogoShape?: 'circle' | 'rounded';
  qrFrameStyle?: 'clean' | 'badge' | 'double' | 'minimal';
  qrSize?: number;
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
  developerTiktokUrl?: string;
  developerInstagramUrl?: string;
  developerGithubProfileUrl?: string;
  developerTwitterUrl?: string;
  developerWordpressUrl?: string;
  developerWhatsappUrl?: string;
  developerWhatsappUsername?: string;
  developerTelegramUrl?: string;
  developerTelegramUsername?: string;
  developerMessengerUrl?: string;
  developerMessengerUsername?: string;
  githubRepoUrl?: string;
  githubBranch?: string;
  googleDriveBackupUrl?: string;
  archiveFolderId?: string;
  mcpEndpointUrl?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  lastBackupDate?: string;
  councilMembers?: CouncilMember[];
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
  holdingNo?: string;
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

export interface AuditLogRecord {
  id: string;
  action: 'CERTIFICATE_ISSUED' | 'CERTIFICATE_APPROVED' | 'CERTIFICATE_REJECTED' | 'ADMIN_ADDED' | 'ADMIN_REMOVED' | 'ADMIN_ROLE_UPDATED' | 'CONFIG_UPDATED' | 'TEMPLATE_CHANGED' | 'CITIZEN_RECORD_ADDED' | 'BACKUP_RESTORED' | 'SECURITY_KEY_GENERATED' | 'ADMIN_LOGIN' | 'OTHER';
  actionTitle: string;
  details: string;
  performedByEmail: string;
  performedByName: string;
  performedByRole: string;
  timestamp: string;
  ipAddress?: string;
  docId?: string;
  checksum?: string;
}

export interface AdminPermissions {
  canApproveCertificates: boolean;
  canIssueCertificates: boolean;
  canManageAdmins: boolean;
  canEditConfig: boolean;
  canExportData: boolean;
  canDeleteLogs: boolean;
  canView?: boolean;
  canEdit?: boolean;
  canApprove?: boolean;
  canDelete?: boolean;
}

export interface AdminUserRecord {
  uid?: string;
  email: string;
  name: string;
  role: 'super_admin' | 'chairman' | 'secretary' | 'member' | 'developer';
  designation: string;
  photoUrl?: string;
  addedAt: string;
  lastLoginAt?: string;
  status: 'active' | 'suspended';
  wardNo?: string;
  permissions?: AdminPermissions;
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

export interface GoogleChatSpace {
  name: string;
  displayName?: string;
  spaceType?: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE' | string;
  singleUserBotDm?: boolean;
  threaded?: boolean;
  spaceDetails?: {
    description?: string;
    guidelines?: string;
  };
  spaceHistoryState?: string;
  createTime?: string;
}

export interface GoogleChatMessage {
  name: string;
  text?: string;
  sender?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: 'HUMAN' | 'BOT' | string;
    email?: string;
  };
  createTime?: string;
  formattedText?: string;
  thread?: {
    name?: string;
  };
}

export interface GoogleChatMembership {
  name: string;
  state?: string;
  role?: 'ROLE_MEMBER' | 'ROLE_MANAGER' | string;
  member?: {
    name?: string;
    displayName?: string;
    avatarUrl?: string;
    type?: string;
  };
}


