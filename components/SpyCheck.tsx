import type { ReactNode } from "react";
import type { SimResult } from "@/lib/bb84";
import { SAFETY_LIMIT } from "@/lib/bb84";
import { formatNumber, formatPercent } from "@/lib/format";
import { CheckIcon, CrossIcon, WarningIcon } from "./icons";

const SCALE_MAX = 0.3; // gauge runs from 0% to 30%
const TICKS = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3];

export default function SpyCheck({ result }: { result: SimResult | null }) {
  const limitPos = `${(SAFETY_LIMIT / SCALE_MAX) * 100}%`;
  const needle = result ? `${Math.min(100, (result.errorRate / SCALE_MAX) * 100)}%` : "0%";

  let verdict: ReactNode =<span>Waiting for the first session.</span>;
  let tone = "verdict";
  if (result) {
    const detail = (
      <span className="sub">
        {formatNumber(result.sampleErrors)} of {formatNumber(result.sample)} sample bits differed. Error rate: <b>{formatPercent(result.errorRate)}</b>.
      </span>
    );
    if (result.decision === "spy") {
      tone = "verdict bad";
      verdict = <><CrossIcon /><span>Spy detected. Key discarded. {detail}</span></>;
    } else if (result.decision === "short") {
      tone = "verdict warn";
      verdict = <><WarningIcon /><span>Too few safe bits left for a key. Session stopped. {detail}</span></>;
    } else if (result.shortened || result.errorRate > 0.04) {
      tone = "verdict warn";
      verdict = <><WarningIcon /><span>Key accepted, then shortened to remove anything a listener could know. {detail}</span></>;
    } else {
      tone = "verdict ok";
      verdict = <><CheckIcon /><span>Line is safe. Key accepted. {detail}</span></>;
    }
  }

  return (
    <>
      <div className="gauge" aria-hidden="true">
        <span className="limit-lbl" style={{ left: limitPos }}>Safety limit {formatPercent(SAFETY_LIMIT, 0)}</span>
        <div className="track" style={{ ["--limit" as string]: limitPos }}>
          <span className="limit" style={{ left: limitPos }} />
          <span className="needle" style={{ left: needle }} />
        </div>
        <div className="ticks">
          {TICKS.map((t) => <span key={t} style={{ left: `${(t / SCALE_MAX) * 100}%` }}>{formatPercent(t, 0)}</span>)}
        </div>
      </div>
      <div className={tone} role="status">{verdict}</div>
    </>
  );
}
