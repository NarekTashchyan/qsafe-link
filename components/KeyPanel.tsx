import type { SimResult } from "@/lib/bb84";
import { KEY_BITS } from "@/lib/bb84";
import { formatNumber } from "@/lib/format";
import { CheckIcon } from "./icons";

export default function KeyPanel({ result, keyHex }: { result: SimResult | null; keyHex: string | null }) {
  if (!result) return <p className="step-lead">Waiting for the first session.</p>;

  if (result.decision !== "accepted" || !keyHex) {
    return (
      <>
        <p className="step-lead">
          {result.decision === "spy"
            ? "No key was created. Because the spy check failed, every bit from this session was thrown away, so nothing the spy saw can ever be used."
            : "No key was created. Too much information was lost to errors, so the session was stopped and its bits thrown away."}
        </p>
        <div><span className="pill bad">No key: encryption is blocked until a safe session succeeds</span></div>
      </>
    );
  }

  return (
    <>
      <p className="step-lead">
        After correcting <b>{formatNumber(result.remainingErrors)}</b> bit errors and removing anything a listener could know,{" "}
        <b>{formatNumber(result.secureBits)}</b> secure bits remain. That is enough for{" "}
        <b>{formatNumber(Math.floor(result.secureBits / KEY_BITS))}</b> encryption keys of 256 bits. The first one:
      </p>
      <div className="keys">
        <div className="keybox"><div className="l">Key stored at Site A</div><div className="hex">{keyHex}</div></div>
        <div className="keybox"><div className="l">Key stored at Site B</div><div className="hex">{keyHex}</div></div>
      </div>
      <div><span className="pill ok"><CheckIcon size={14} />Both sites hold the identical key</span></div>
    </>
  );
}
