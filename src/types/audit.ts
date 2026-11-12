export interface AuditRecord {
  index: number;
  timestamp: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  prevHash: string;
  currentHash: string;
}

export interface VerifyChainResult {
  valid: boolean;
  brokenIdx: number;
  totalChecked: number;
  recomputedRootHash: string;
  verificationTimestamp: string;
}
