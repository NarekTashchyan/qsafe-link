import { formatNumber, formatPercent } from "@/lib/format";

export interface LogRow {
  id: number;
  scenario: string;
  photons: number;
  errorRate: number;
  decision: string;
  accepted: boolean;
  secureBits: number;
}

export default function SessionLog({ rows }: { rows: LogRow[] }) {
  return (
    <section className="history card" aria-labelledby="log-title">
      <h2 id="log-title">Session log</h2>
      <p className="step-lead">Every session you run is recorded here, so you can compare scenarios side by side.</p>
      <div className="hist-box">
        <table className="hist">
          <thead>
            <tr>
              <th>#</th><th>Scenario</th><th className="num-c">Photons</th><th className="num-c">Error rate</th>
              <th>Decision</th><th className="num-c">Key material</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={6} className="muted">No sessions yet. Choose a scenario or press Send photons.</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="mono">{r.id}</td>
                <td>{r.scenario}</td>
                <td className="num-c">{formatNumber(r.photons)}</td>
                <td className="num-c">{formatPercent(r.errorRate)}</td>
                <td className={r.accepted ? "dec ok" : "dec bad"}>{r.decision}</td>
                <td className="num-c">{r.accepted ? `${formatNumber(r.secureBits)} bits` : "0"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
