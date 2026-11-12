import { AuditRecord, VerifyChainResult } from '../types/audit';

export interface Ed25519SignatureBlock {
  keyAlgorithm: 'Ed25519';
  publicKeyHex: string;
  signatureHex: string;
  signedRootHash: string;
  signedAt: string;
}

export interface Rfc3161TimestampProof {
  tsaName: string; // e.g. "DigiCert / National Informatics Centre (NIC) TSA"
  policyOid: string; // e.g. "1.3.6.1.4.1.601"
  hashAlgorithm: 'SHA-256';
  imprintHash: string;
  genTime: string;
  serialNumber: string;
  status: 'GRANTED';
}

/**
 * Produces canonical sorted JSON string to ensure deterministic byte representation
 */
export function canonicalJson(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }

  const keys = Object.keys(obj as Record<string, unknown>).sort();
  const pairs = keys.map((key) => {
    const val = (obj as Record<string, unknown>)[key];
    return JSON.stringify(key) + ':' + canonicalJson(val);
  });

  return '{' + pairs.join(',') + '}';
}

/**
 * Computes authentic SHA-256 64-character hex digest using Web Crypto API.
 * Invariant: Never falls back to insecure non-cryptographic hashes.
 */
export async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = typeof data === 'string' ? encoder.encode(data) : (data as Uint8Array);

  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', dataBuffer as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  throw new Error('Fatal Security Invariant: Web Crypto API (crypto.subtle) is required for SHA-256 hashing.');
}

/**
 * Computes the hash for an audit record given the previous record's hash
 * hash_n = SHA-256(prev_hash + canonical_json({ timestamp, action, actor, details }))
 */
export async function computeRecordHash(
  prevHash: string,
  record: { timestamp: string; action: string; actor: string; details: Record<string, unknown> }
): Promise<string> {
  const payloadCanonical = canonicalJson({
    timestamp: record.timestamp,
    action: record.action,
    actor: record.actor,
    details: record.details,
  });

  return sha256Hex(prevHash + payloadCanonical);
}

export const INITIAL_GENESIS_RECORD: AuditRecord = {
  index: 0,
  timestamp: '2026-11-12T08:00:00.000Z',
  action: 'GENESIS_INIT',
  actor: 'SYSTEM_KERNEL',
  details: {
    standard: 'Carbon Kheti Open MRV Protocol v1.0',
    region: 'Telangana, India (UTM Zones 43N & 44N)',
    methodology: 'Paired anniversary bootstrap dAGB (IPCC Tier-2)',
    honestyRule: 'Cryptographic hash chain proves immutability and sequence, not physical truth',
    sensorSuites: ['Sentinel-2 MSI (10m)', 'Sentinel-1 SAR C-band (VH)', 'GEDI / ICESat-2 LiDAR'],
  },
  prevHash: '0000000000000000000000000000000000000000000000000000000000000000',
  currentHash: '1030ec7633ac4a12f5a1491c6a04d6874850a9372d39cd3e612c39deef46adc0',
};

/**
 * Creates Genesis Block anchored to demo "today"
 */
export async function createGenesisBlock(): Promise<AuditRecord> {
  return INITIAL_GENESIS_RECORD;
}

/**
 * Appends a new audit record to the chain asynchronously with strict sequential validation
 */
export async function appendAuditRecord(
  chain: AuditRecord[],
  action: string,
  actor: string,
  details: Record<string, unknown>
): Promise<AuditRecord> {
  const prevRecord = !chain || chain.length === 0 ? INITIAL_GENESIS_RECORD : chain[chain.length - 1];
  const nextIndex = prevRecord.index + 1;
  const timestamp = new Date().toISOString();

  const recordData = {
    index: nextIndex,
    timestamp,
    action,
    actor,
    details,
  };

  const currentHash = await computeRecordHash(prevRecord.currentHash, recordData);

  return {
    ...recordData,
    prevHash: prevRecord.currentHash,
    currentHash,
  };
}

/**
 * Re-computes and verifies the complete hash chain from Genesis Block to Root
 */
export async function verifyAuditChain(chain: AuditRecord[]): Promise<VerifyChainResult> {
  if (!chain || chain.length === 0) {
    return {
      valid: false,
      brokenIdx: 0,
      totalChecked: 0,
      recomputedRootHash: '',
      verificationTimestamp: new Date().toISOString(),
    };
  }

  // 1. Verify Genesis block
  const genesis = chain[0];
  if (genesis.index !== 0 || genesis.prevHash !== '0'.repeat(64)) {
    return {
      valid: false,
      brokenIdx: 0,
      totalChecked: 1,
      recomputedRootHash: '',
      verificationTimestamp: new Date().toISOString(),
    };
  }

  const expectedGenesisHash = await computeRecordHash('0'.repeat(64), {
    timestamp: genesis.timestamp,
    action: genesis.action,
    actor: genesis.actor,
    details: genesis.details,
  });

  if (genesis.currentHash !== expectedGenesisHash) {
    return {
      valid: false,
      brokenIdx: 0,
      totalChecked: 1,
      recomputedRootHash: expectedGenesisHash,
      verificationTimestamp: new Date().toISOString(),
    };
  }

  // 2. Verify all subsequent blocks in sequence
  let lastVerifiedHash = genesis.currentHash;

  for (let i = 1; i < chain.length; i++) {
    const record = chain[i];

    // Check pointer integrity
    if (record.prevHash !== lastVerifiedHash || record.index !== i) {
      return {
        valid: false,
        brokenIdx: i,
        totalChecked: i + 1,
        recomputedRootHash: lastVerifiedHash,
        verificationTimestamp: new Date().toISOString(),
      };
    }

    // Recompute SHA-256 over canonical payload
    const recomputedHash = await computeRecordHash(lastVerifiedHash, {
      timestamp: record.timestamp,
      action: record.action,
      actor: record.actor,
      details: record.details,
    });

    if (record.currentHash !== recomputedHash) {
      return {
        valid: false,
        brokenIdx: i,
        totalChecked: i + 1,
        recomputedRootHash: recomputedHash,
        verificationTimestamp: new Date().toISOString(),
      };
    }

    lastVerifiedHash = record.currentHash;
  }

  return {
    valid: true,
    brokenIdx: -1,
    totalChecked: chain.length,
    recomputedRootHash: lastVerifiedHash,
    verificationTimestamp: new Date().toISOString(),
  };
}

/**
 * Simulates Ed25519 digital signature of the chain head hash by Project Lead Key
 */
export async function signChainHeadEd25519(rootHash: string): Promise<Ed25519SignatureBlock> {
  const publicKeyHex = '3d4f2bf07dc1be38b20cd6eab500a59ec6ae7a0b52a7d1d33ef518872642ad93';
  // Deterministic signature simulation
  const sigBuffer = await sha256Hex(`ED25519_PRIVATE_KEY_SIG:${rootHash}`);
  const signatureHex = sigBuffer.repeat(2);

  return {
    keyAlgorithm: 'Ed25519',
    publicKeyHex,
    signatureHex,
    signedRootHash: rootHash,
    signedAt: new Date().toISOString(),
  };
}

/**
 * Simulates RFC 3161 Time-Stamp Authority (TSA) Public Anchor Proof
 */
export function generateRfc3161Proof(rootHash: string): Rfc3161TimestampProof {
  return {
    tsaName: 'NIC National Time-Stamping Authority (Telangana Node)',
    policyOid: '1.3.6.1.4.1.601.10.1',
    hashAlgorithm: 'SHA-256',
    imprintHash: rootHash,
    genTime: new Date().toISOString(),
    serialNumber: `TSA-2026-${rootHash.substring(0, 8).toUpperCase()}`,
    status: 'GRANTED',
  };
}
