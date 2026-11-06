import Link from "next/link";
import PhotonStream from "@/components/PhotonStream";
import "./landing.css";

const STATS = [
  { value: "2030", label: "NIST deprecates RSA and elliptic-curve key exchange" },
  { value: "2035", label: "NIST disallows them completely" },
  { value: "28–49%", label: "Experts' chance of a quantum computer breaking RSA-2048 within 10 years" },
  { value: "$2.63B", label: "Expected global QKD market by 2030" },
];

const STEPS = [
  {
    title: "Send photons",
    text: "Site A encodes random bits in single photons. Each photon is polarized in one of two bases chosen at random: straight (+) or diagonal (×).",
    angles: [0, 90, 45, -45],
  },
  {
    title: "Compare bases",
    text: "Site B measures each photon in a random basis. The sites then say publicly which basis they used, never the bit, and keep only the matches.",
    angles: [0, 0, 45, 45],
  },
  {
    title: "Catch the spy",
    text: "Measuring a photon disturbs it. The sites compare a small sample: if more than 11% of bits differ, someone listened and the key is thrown away.",
    angles: [0, 45, 90, -45],
  },
  {
    title: "Lock the data",
    text: "The clean bits are compressed into a 256-bit key that the existing TLS or IPsec connection uses with AES-256 encryption.",
    angles: [90, 90, 90, 90],
  },
];

const COMPARE = [
  ["Security is based on", "Maths problems that are hard today", "The laws of physics"],
  ["A quantum computer", "Breaks it with Shor's algorithm", "Does not help the attacker"],
  ["Eavesdropping", "Invisible", "Detected automatically"],
  ["Traffic recorded today", "Can be decrypted later", "Stays secret"],
  ["Fits existing networks", "Yes", "Yes, keys plug into TLS and IPsec"],
];

const FEATURES = [
  { title: "Key creation engine", text: "Creates shared secret keys between two sites with the BB84 protocol." },
  { title: "Spy detection", text: "Measures the error rate of every session and rejects keys above the safety limit." },
  { title: "Key clean-up", text: "Corrects errors and removes any partial information a listener could have gained." },
  { title: "Identity protection", text: "Authenticates every public message, which blocks man-in-the-middle attacks." },
  { title: "Network connectors", text: "Deliver keys to the TLS and IPsec connections an organization already runs." },
  { title: "Simulator", text: "Lets customers test the full workflow before installing any optical hardware." },
];

const SEGMENTS = [
  { title: "Banks", text: "Transactions and client data that must stay confidential for decades." },
  { title: "Government", text: "State secrets and citizen records with the strictest security rules." },
  { title: "Telecom operators", text: "Fibre owners who can sell quantum-safe links to business clients." },
  { title: "Critical infrastructure", text: "Energy and healthcare systems targeted by state-level attackers." },
];

// Proof of concept: mean error rate over 10 simulated sessions of 100,000 photons each
const RESULTS = [
  { label: "Clean line", rate: 0.0, outcome: "Key accepted", ok: true },
  { label: "Cable errors (2%)", rate: 0.02, outcome: "Key accepted", ok: true },
  { label: "Spy on 1 in 4 photons", rate: 0.0619, outcome: "Accepted, key shortened", ok: true },
  { label: "Spy on 1 in 2 photons", rate: 0.1271, outcome: "Rejected 10 of 10", ok: false },
  { label: "Spy on every photon", rate: 0.2522, outcome: "Rejected 10 of 10", ok: false },
];
const SCALE = 0.3;

function Glyphs({ angles }: { angles: number[] }) {
  return (
    <div className="lp-glyphs" aria-hidden="true">
      {angles.map((a, i) => (
        <span key={i} className="lp-glyph" style={{ ["--r" as string]: `${a}deg` }} />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-container lp-nav-inner">
          <Link href="/" className="brand brand-link">
            <span className="brand-name">QSafe Link</span>
          </Link>
          <div className="lp-nav-links">
            <a href="#how">How it works</a>
            <a href="#why">Why now</a>
            <a href="#product">Product</a>
            <a href="#proof">Results</a>
          </div>
          <Link href="/simulation" className="lp-btn lp-btn-sm">Try the simulation</Link>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="lp-container lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-eyebrow">Quantum key distribution · BB84</span>
            <h1>Encryption keys that quantum computers can&apos;t steal.</h1>
            <p className="lp-lead">
              QSafe Link creates secret keys between two sites using single particles of light. Anyone who tries to
              listen changes the light and gets caught, so the key stays secret even against tomorrow&apos;s quantum
              computers.
            </p>
            <div className="lp-cta-row">
              <Link href="/simulation" className="lp-btn">
                Try the simulation <span aria-hidden="true">&rarr;</span>
              </Link>
              <a href="#how" className="lp-btn lp-btn-ghost">How it works</a>
            </div>
          </div>
          <PhotonStream />
        </div>
        <div className="lp-container">
          <dl className="lp-stats">
            {STATS.map((s) => (
              <div key={s.value} className="lp-stat">
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>
      </header>

      <section id="why" className="lp-section">
        <div className="lp-container lp-split">
          <div>
            <span className="lp-eyebrow">Why now</span>
            <h2>Stolen today, decrypted tomorrow.</h2>
          </div>
          <div className="lp-prose">
            <p>
              Banks and governments share their encryption keys using RSA and elliptic-curve cryptography. These rely on
              maths problems that ordinary computers cannot solve, but a large quantum computer running Shor&apos;s
              algorithm can.
            </p>
            <p>
              Attackers don&apos;t have to wait. They can record encrypted traffic today and unlock it once such a
              computer exists. For data that must stay secret for 10 to 30 years, such as financial records, medical
              files and state secrets, the risk has already started.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="lp-section lp-section-alt">
        <div className="lp-container">
          <span className="lp-eyebrow">How it works</span>
          <h2>Four steps from light to a locked message.</h2>
          <ol className="lp-steps">
            {STEPS.map((s, i) => (
              <li key={s.title} className="lp-step">
                <div className="lp-step-head">
                  <span className="lp-step-num">{i + 1}</span>
                  <Glyphs angles={s.angles} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="lp-section">
        <div className="lp-container">
          <span className="lp-eyebrow">The difference</span>
          <h2>Security that rests on physics, not on maths.</h2>
          <div className="lp-table-box">
            <table className="lp-compare">
              <thead>
                <tr><th scope="col"></th><th scope="col">Today&apos;s key exchange (RSA, ECC)</th><th scope="col">QSafe Link (QKD)</th></tr>
              </thead>
              <tbody>
                {COMPARE.map(([k, a, b]) => (
                  <tr key={k}><th scope="row">{k}</th><td>{a}</td><td className="lp-good">{b}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="product" className="lp-section lp-section-alt">
        <div className="lp-container">
          <span className="lp-eyebrow">Product</span>
          <h2>Software that turns photons into usable keys.</h2>
          <p className="lp-sub">QSafe Link runs on standard quantum optical equipment at two sites joined by fibre, and hands the keys to the security systems the customer already uses.</p>
          <div className="lp-features">
            {FEATURES.map((f) => (
              <div key={f.title} className="lp-feature">
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
          <h3 className="lp-for-title">Built for organizations whose secrets must last</h3>
          <div className="lp-segments">
            {SEGMENTS.map((s) => (
              <div key={s.title} className="lp-segment">
                <span className="lp-seg-name">{s.title}</span>
                <span className="lp-seg-text">{s.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="proof" className="lp-section">
        <div className="lp-container">
          <span className="lp-eyebrow">Proof of concept</span>
          <h2>Every serious attack was caught.</h2>
          <p className="lp-sub">Average error rate over 10 simulated sessions of 100,000 photons each. Above the 11% safety limit, the key is thrown away.</p>
          <div className="lp-results" role="table" aria-label="Error rate by scenario">
            {RESULTS.map((r) => (
              <div key={r.label} className="lp-res-row" role="row">
                <span className="lp-res-label" role="rowheader">{r.label}</span>
                <span className="lp-res-track" role="cell" aria-label={`Error rate ${(r.rate * 100).toFixed(1)}%`}>
                  <span className={r.ok ? "lp-res-bar" : "lp-res-bar lp-res-bad"} style={{ width: `${Math.max(0.6, (r.rate / SCALE) * 100)}%` }} />
                  <span className="lp-res-limit" />
                </span>
                <span className="lp-res-val" role="cell">{(r.rate * 100).toFixed(1)}%</span>
                <span className={r.ok ? "lp-res-out ok" : "lp-res-out bad"} role="cell">{r.outcome}</span>
              </div>
            ))}
            <div className="lp-res-axis" aria-hidden="true">
              <span />
              <span className="lp-res-axis-track">
                <span style={{ left: "0%" }}>0%</span>
                <span className="lp-res-axis-limit" style={{ left: `${(0.11 / SCALE) * 100}%` }}>11% limit</span>
                <span style={{ left: "100%" }}>30%</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="lp-cta">
        <div className="lp-container lp-cta-inner">
          <div>
            <h2>See it work for yourself.</h2>
            <p>Send photons, put a spy on the line, and encrypt a real message with the key you create.</p>
          </div>
          <Link href="/simulation" className="lp-btn lp-btn-light">
            Launch the simulation <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-container lp-footer-grid">
          <div>
            <span className="brand-name">QSafe Link</span>
            <p>MVP of the project &ldquo;Quantum-Safe Communication with QKD&rdquo;, Management course, French University in Armenia, 2026.</p>
            <p>Team: Narek Tashchyan, Robert Yesayan, Rita Sharafyan, Elina Melkumyan.</p>
          </div>
          <div>
            <span className="lp-foot-title">Sources</span>
            <ul>
              <li><a href="https://postquantum.com/security-pqc/nist-ir-8547-final/" target="_blank" rel="noreferrer">NIST IR 8547: transition to post-quantum cryptography</a></li>
              <li><a href="https://postquantum.com/security-pqc/quantum-threat-timeline-report-2025/" target="_blank" rel="noreferrer">Quantum Threat Timeline Report 2025</a></li>
              <li><a href="https://www.marketsandmarkets.com/PressReleases/quantum-key-distribution-qkd.asp" target="_blank" rel="noreferrer">MarketsandMarkets: QKD market forecast</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
