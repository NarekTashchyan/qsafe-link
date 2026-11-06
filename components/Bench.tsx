"use client";

import { useMemo } from "react";

interface BenchProps {
  spyPercent: number;
  runId: number; // changes on every session, restarting the photon animation
}

const DOTS = 12;

export default function Bench({ spyPercent, runId }: BenchProps) {
  const spyOn = spyPercent > 0;
  // which animated photons turn red; decided once per session
  const hits = useMemo(
    () => Array.from({ length: DOTS }, () => Math.random() < spyPercent / 100),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [runId]
  );

  return (
    <section className="bench card" aria-label="Connection between the two sites">
      <div className="station a">
        <span className="k">Site A</span>
        <span className="n">Head office</span>
        <span className="r">Alice, sends photons</span>
      </div>
      <div className="fibre">
        <span className={spyOn ? "eve on" : "eve"}>{spyOn ? `Spy intercepting ${spyPercent}%` : "No spy on the line"}</span>
        {runId > 0 && (
          <div className="dots go" key={runId}>
            {hits.map((hit, i) => (
              <span key={i} className={hit ? "dot hit" : "dot"} style={{ animationDelay: `${i * 0.09}s` }} />
            ))}
          </div>
        )}
      </div>
      <div className="station b">
        <span className="k">Site B</span>
        <span className="n">Data centre</span>
        <span className="r">Bob, measures photons</span>
      </div>
    </section>
  );
}
