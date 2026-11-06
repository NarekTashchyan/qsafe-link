import type { Metadata } from "next";
import Link from "next/link";
import QsafeApp from "@/components/QsafeApp";

export const metadata: Metadata = { title: "Simulation" };

export default function SimulationPage() {
  return (
    <main className="wrap">
      <header className="top">
        <Link href="/" className="brand brand-link" aria-label="QSafe Link home">
          <span className="brand-name">QSafe Link</span>
          <span className="tag">MVP</span>
        </Link>
        <Link href="/" className="back-link">&larr; Back to overview</Link>
      </header>

      <section className="hero">
        <h1>Create an encryption key with light. Catch anyone who listens.</h1>
        <p>
          This MVP runs our product&apos;s full workflow between two offices of a bank: send photons, check for spies,
          create a shared secret key, and use that key to protect a real message.
        </p>
      </section>

      <QsafeApp />

      <p className="scope">
        <b>MVP scope.</b> The photon channel is simulated in software, because the optical hardware is not part of the
        MVP. Everything after it runs as in the real product: the spy check, removing errors and anything a spy could
        know, creating a 256-bit key, and AES-256-GCM encryption. Error correction is modelled; both sites then hold the
        corrected key.
      </p>
    </main>
  );
}
