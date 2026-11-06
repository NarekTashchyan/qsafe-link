"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { simulate, type SimResult } from "@/lib/bb84";
import { decryptText, deriveKeyBytes, encryptText, importAesKey, toBase64, toHex, type Sealed } from "@/lib/crypto";
import { formatNumber, formatPercent } from "@/lib/format";
import Bench from "./Bench";
import Controls, { scenarioName, type Preset, type Settings } from "./Controls";
import PhotonTape from "./PhotonTape";
import SpyCheck from "./SpyCheck";
import KeyPanel from "./KeyPanel";
import MessagePanel, { type CipherView, type PlainView } from "./MessagePanel";
import SessionLog, { type LogRow } from "./SessionLog";

const INITIAL: Settings = { spyPercent: 0, noisePercent: 1, photons: 20000 };
const DEFAULT_MESSAGE =
  "Payment order 4471: transfer AMD 25,000,000 from the head office to branch Yerevan-01. Approved by the treasury.";

interface SiteKeys { encrypt: CryptoKey; decrypt: CryptoKey }

function Step({ n, title, lead, children }: { n: number; title: string; lead?: ReactNode; children: ReactNode }) {
  const id = `step-${n}`;
  return (
    <section className="step card" aria-labelledby={id}>
      <span className="num">{n}</span>
      <div className="step-body">
        <h2 id={id}>{title}</h2>
        {lead && <p className="step-lead">{lead}</p>}
        {children}
      </div>
    </section>
  );
}

export default function QsafeApp() {
  const [settings, setSettings] = useState<Settings>(INITIAL);
  const [result, setResult] = useState<SimResult | null>(null);
  const [keyHex, setKeyHex] = useState<string | null>(null);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);
  const [cipher, setCipher] = useState<CipherView | null>(null);
  const [plain, setPlain] = useState<PlainView | null>(null);
  const [log, setLog] = useState<LogRow[]>([]);
  const [running, setRunning] = useState(false);
  const [runId, setRunId] = useState(0);

  const keys = useRef<SiteKeys | null>(null);
  const lastSent = useRef<Sealed | null>(null);
  const started = useRef(false);
  const messageRef = useRef(message);
  useEffect(() => {
    messageRef.current = message;
  }, [message]);

  /** Site A encrypts, the ciphertext crosses the internet, Site B decrypts. */
  const sendMessage = useCallback(async (text: string) => {
    if (!keys.current) return;
    const sealed = await encryptText(keys.current.encrypt, text);
    lastSent.current = sealed;
    setCipher({ text: toBase64(sealed.ciphertext), bytes: sealed.ciphertext.length, tampered: false });
    const received = await decryptText(keys.current.decrypt, sealed);
    setPlain(received === null
      ? { text: "Rejected: the message was changed in transit, so Site B refuses to open it.", ok: false }
      : { text: received, ok: true });
  }, []);

  const tamper = useCallback(async () => {
    if (!keys.current || !lastSent.current) return;
    const changed = lastSent.current.ciphertext.slice();
    changed[Math.floor(changed.length / 3)] ^= 1; // an attacker flips one bit
    const sealed: Sealed = { iv: lastSent.current.iv, ciphertext: changed };
    setCipher({ text: toBase64(changed), bytes: changed.length, tampered: true });
    const received = await decryptText(keys.current.decrypt, sealed);
    setPlain(received === null
      ? { text: "Rejected: the message was changed in transit, so Site B refuses to open it.", ok: false }
      : { text: received, ok: true });
  }, []);

  const run = useCallback(async (s: Settings) => {
    setRunning(true);
    const r = simulate(s.photons, s.spyPercent / 100, s.noisePercent / 100);
    setResult(r);
    setRunId((x) => x + 1);
    setCipher(null);
    setPlain(null);
    lastSent.current = null;

    if (r.decision === "accepted") {
      // After error correction both sites hold the same bits, so each derives the same key on its own.
      const raw = await deriveKeyBytes(r.keyMaterial);
      keys.current = { encrypt: await importAesKey(raw, "encrypt"), decrypt: await importAesKey(raw.slice(), "decrypt") };
      setKeyHex(toHex(raw));
      await sendMessage(messageRef.current);
    } else {
      keys.current = null;
      setKeyHex(null);
    }

    const decision = r.decision === "accepted"
      ? (r.shortened ? "Key accepted, shortened" : "Key accepted")
      : r.decision === "spy" ? "Spy detected, key discarded" : "Stopped, too few bits";
    setLog((rows) => [{
      id: (rows[0]?.id ?? 0) + 1,
      scenario: scenarioName(s),
      photons: r.photons,
      errorRate: r.errorRate,
      decision,
      accepted: r.decision === "accepted",
      secureBits: r.secureBits,
    }, ...rows]);
    setTimeout(() => setRunning(false), 400);
  }, [sendMessage]);

  // Open in a working state: run one clean session on first load.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void run(INITIAL);
  }, [run]);

  const applyPreset = (p: Preset) => {
    const next = { ...settings, spyPercent: p.spyPercent, noisePercent: p.noisePercent };
    setSettings(next);
    void run(next);
  };

  return (
    <>
      <Bench spyPercent={settings.spyPercent} runId={runId} />
      <Controls settings={settings} running={running} onChange={setSettings} onPreset={applyPreset} onRun={() => void run(settings)} />

      <div className="steps">
        <Step n={1} title="Photons travel from Site A to Site B"
          lead="Alice encodes each random bit in a photon, using one of two bases chosen at random: straight (+) or diagonal (×). Bob measures each photon in a basis he also picks at random. The first 16 photons of this session:">
          {result ? <PhotonTape tape={result.tape} /> : <p className="muted">Preparing the first session.</p>}
        </Step>

        <Step n={2} title="Bases are compared over the normal network"
          lead="Alice and Bob tell each other only which basis they used, never the bit values. They keep the photons where the bases match. On average this is half of them.">
          <div className="stats">
            <div className="stat"><div className="v">{result ? formatNumber(result.photons) : "–"}</div><div className="l">Photons sent</div></div>
            <div className="stat"><div className="v">{result ? formatNumber(result.kept) : "–"}</div><div className="l">Kept after comparing bases</div></div>
            <div className="stat"><div className="v">{result ? formatPercent(result.kept / result.photons) : "–"}</div><div className="l">Share kept</div></div>
          </div>
        </Step>

        <Step n={3} title="Spy check"
          lead="Alice and Bob publicly compare a random 20% sample of the kept bits, then throw those bits away. Measuring a photon disturbs it, so a spy always raises the error rate. Above 11%, the session is stopped.">
          <SpyCheck result={result} />
        </Step>

        <Step n={4} title="Shared secret key">
          <KeyPanel result={result} keyHex={keyHex} />
        </Step>

        <Step n={5} title="Protect a real message"
          lead="The key now works with standard encryption (AES-256-GCM, the cipher used by TLS and IPsec). Encryption runs for real in your browser.">
          <MessagePanel
            message={message}
            onMessage={setMessage}
            canEncrypt={!!keyHex && !running}
            canTamper={!!keyHex && !!cipher && !running}
            cipher={cipher}
            plain={plain}
            onEncrypt={() => void sendMessage(message)}
            onTamper={() => void tamper()}
          />
        </Step>
      </div>

      <SessionLog rows={log} />
    </>
  );
}
