"use client";

export interface CipherView { text: string; bytes: number; tampered: boolean }
export interface PlainView { text: string; ok: boolean }

interface MessagePanelProps {
  message: string;
  onMessage: (m: string) => void;
  canEncrypt: boolean;
  canTamper: boolean;
  cipher: CipherView | null;
  plain: PlainView | null;
  onEncrypt: () => void;
  onTamper: () => void;
}

export default function MessagePanel(p: MessagePanelProps) {
  const cipherText = p.cipher
    ? `${p.cipher.text.length > 180 ? p.cipher.text.slice(0, 180) + "…" : p.cipher.text}  (${p.cipher.bytes} bytes${p.cipher.tampered ? ", one bit changed by an attacker" : ""})`
    : "Nothing sent yet.";
  return (
    <>
      <label htmlFor="msg" className="muted small">Message from Site A</label>
      <textarea id="msg" value={p.message} onChange={(e) => p.onMessage(e.target.value)} />
      <div className="msg-actions">
        <button className="btn" type="button" onClick={p.onEncrypt} disabled={!p.canEncrypt}>Encrypt and send</button>
        <button className="btn danger" type="button" onClick={p.onTamper} disabled={!p.canTamper}>Tamper with the message in transit</button>
      </div>
      <div className={p.cipher?.tampered ? "out bad" : "out"}>
        <span className="l">What travels over the internet (anyone can see this)</span>
        <span className="v">{cipherText}</span>
      </div>
      <div className={p.plain ? (p.plain.ok ? "out ok" : "out bad") : "out"}>
        <span className="l">What Site B reads after decrypting</span>
        <span className="v">{p.plain ? p.plain.text : "Nothing received yet."}</span>
      </div>
    </>
  );
}
