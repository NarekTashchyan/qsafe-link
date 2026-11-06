// BB84 quantum key distribution, simulated.
// The photon channel is simulated; the protocol steps (sifting, spy check,
// privacy amplification sizing) follow the real BB84 protocol.

export type Bit = 0 | 1;

export const SAFETY_LIMIT = 0.11; // abort above this error rate (Shor-Preskill bound)
export const SAMPLE_SHARE = 0.2; // share of kept bits disclosed for the spy check
export const EC_EFFICIENCY = 1.16; // leakage factor of error correction
export const TAPE_COLUMNS = 16; // photons shown in the step-by-step table
export const KEY_BITS = 256; // one AES-256 key

export interface TapeCell {
  aliceBit: Bit;
  aliceBasis: Bit; // 0 = straight (+), 1 = diagonal (x)
  spied: boolean;
  bobBasis: Bit;
  bobBit: Bit;
  kept: boolean;
  randomRead: boolean; // Bob measured in a basis different from the arriving photon's
}

export type Decision = "accepted" | "spy" | "short";

export interface SimResult {
  photons: number;
  spyShare: number;
  noise: number;
  tape: TapeCell[];
  kept: number;
  sample: number;
  sampleErrors: number;
  errorRate: number;
  remaining: number;
  remainingErrors: number;
  secureBits: number;
  decision: Decision;
  shortened: boolean;
  keyMaterial: Bit[]; // Alice's remaining bits = Bob's bits after error correction
}

/** Fast PRNG seeded from the browser's secure random generator. */
export function makeRng(): () => number {
  const seed = new Uint32Array(1);
  crypto.getRandomValues(seed);
  let a = seed[0];
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function binaryEntropy(p: number): number {
  if (p <= 0 || p >= 1) return 0;
  return -p * Math.log2(p) - (1 - p) * Math.log2(1 - p);
}

/**
 * Run one BB84 session.
 * @param photons number of photons Alice sends
 * @param spyShare share of photons the spy intercepts (0..1)
 * @param noise share of bits flipped by the cable (0..1)
 */
export function simulate(photons: number, spyShare: number, noise: number, rng: () => number = makeRng()): SimResult {
  const bit = (): Bit => (rng() < 0.5 ? 1 : 0);
  const tape: TapeCell[] = [];
  const keyMaterial: Bit[] = [];
  let kept = 0, sample = 0, sampleErrors = 0, remaining = 0, remainingErrors = 0;

  for (let i = 0; i < photons; i++) {
    // 1. Alice picks a random bit and a random basis
    const aliceBit = bit();
    const aliceBasis = bit();
    let photonBit: Bit = aliceBit;
    let photonBasis: Bit = aliceBasis;

    // 2. The spy measures some photons in a random basis and resends them
    let spied = false;
    if (rng() < spyShare) {
      spied = true;
      const spyBasis = bit();
      if (spyBasis !== aliceBasis) photonBit = bit(); // wrong basis: random outcome
      photonBasis = spyBasis;
    }

    // 3. Bob measures in a random basis; the cable may flip the bit
    const bobBasis = bit();
    const randomRead = bobBasis !== photonBasis;
    let bobBit: Bit = randomRead ? bit() : photonBit;
    if (rng() < noise) bobBit = (bobBit ^ 1) as Bit;

    // 4. Sifting: keep only matching bases
    const isKept = aliceBasis === bobBasis;
    if (i < TAPE_COLUMNS) tape.push({ aliceBit, aliceBasis, spied, bobBasis, bobBit, kept: isKept, randomRead });

    if (isKept) {
      kept++;
      // 5. A random sample is disclosed for the spy check and discarded
      if (rng() < SAMPLE_SHARE) {
        sample++;
        if (aliceBit !== bobBit) sampleErrors++;
      } else {
        remaining++;
        if (aliceBit !== bobBit) remainingErrors++;
        keyMaterial.push(aliceBit);
      }
    }
  }

  const errorRate = sample ? sampleErrors / sample : 0;
  // 6. Error correction + privacy amplification: secure share of the remaining bits
  const h = binaryEntropy(errorRate);
  const secureShare = Math.max(0, 1 - EC_EFFICIENCY * h - h);
  const secureBits = Math.floor(remaining * secureShare);

  let decision: Decision = "accepted";
  if (errorRate > SAFETY_LIMIT) decision = "spy";
  else if (secureBits < KEY_BITS) decision = "short";

  return {
    photons, spyShare, noise, tape, kept, sample, sampleErrors, errorRate,
    remaining, remainingErrors, secureBits, decision,
    shortened: decision === "accepted" && spyShare > 0,
    keyMaterial,
  };
}
