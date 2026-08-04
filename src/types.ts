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
  status: 'issued' | 'revoked' | 'draft';
  issuedBy: string;
  createdAt: string;
}

export interface UnionParishadConfig {
  upName: string;
  upNameEn: string;
  upazila: string;
  district: string;
  address: string;
  chairmanName: string;
  chairmanTitle: string;
  secretaryName: string;
  secretaryTitle: string;
  logoUrl: string;
  sealText: string;
  defaultPromptPrefix: string;
  enableHeaderInPrint: boolean;
  watermarkOpacity: number;
  templateDocId: string;
  targetFolderId: string;
  sheetId: string;
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
