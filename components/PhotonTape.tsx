import type { Bit, TapeCell } from "@/lib/bb84";

// Polarization angle of a photon: straight basis 0 deg / 90 deg, diagonal basis 45 deg / -45 deg
const angle = (basis: Bit, bit: Bit) => (basis === 0 ? (bit ? 90 : 0) : bit ? -45 : 45);
const basisSign = (b: Bit) => (b ? "×" : "+");

function Polarization({ basis, bit }: { basis: Bit; bit: Bit }) {
  return (
    <span className="pol" style={{ ["--r" as string]: `${angle(basis, bit)}deg` }}
      aria-label={`${basis ? "diagonal" : "straight"} ${bit}`} role="img" />
  );
}

export default function PhotonTape({ tape }: { tape: TapeCell[] }) {
  const kept = (c: TapeCell) => (c.kept ? "kept" : undefined);
  return (
    <>
      <div className="tape-box">
        <table className="tape">
          <thead>
            <tr>
              <th scope="col">Photon</th>
              {tape.map((_, i) => <th scope="col" key={i}>{i + 1}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Alice&apos;s bit</th>
              {tape.map((c, i) => <td key={i} className={kept(c)}>{c.aliceBit}</td>)}
            </tr>
            <tr>
              <th scope="row">Alice&apos;s basis</th>
              {tape.map((c, i) => <td key={i} className={kept(c)}>{basisSign(c.aliceBasis)}</td>)}
            </tr>
            <tr>
              <th scope="row">Photon sent</th>
              {tape.map((c, i) => <td key={i} className={kept(c)}><Polarization basis={c.aliceBasis} bit={c.aliceBit} /></td>)}
            </tr>
            <tr>
              <th scope="row">Spy</th>
              {tape.map((c, i) => (
                <td key={i} className={kept(c)}>
                  {c.spied ? <span className="spy-mark" title="Spy measured this photon">&#9679;</span> : <span className="muted">&ndash;</span>}
                </td>
              ))}
            </tr>
            <tr>
              <th scope="row">Bob&apos;s basis</th>
              {tape.map((c, i) => <td key={i} className={kept(c)}>{basisSign(c.bobBasis)}</td>)}
            </tr>
            <tr>
              <th scope="row">Bob&apos;s reading</th>
              {tape.map((c, i) => {
                if (c.kept && c.bobBit !== c.aliceBit) return <td key={i} className="err">{c.bobBit}</td>;
                const cls = c.kept ? "kept" : c.randomRead ? "rand" : undefined;
                return <td key={i} className={cls}>{c.bobBit}</td>;
              })}
            </tr>
            <tr>
              <th scope="row">Kept?</th>
              {tape.map((c, i) => <td key={i} className={kept(c)}>{c.kept ? "yes" : <span className="muted">no</span>}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="legend">
        <span><i className="sw" style={{ background: "var(--photon-soft)" }} />Kept: same basis</span>
        <span><i className="sw" style={{ background: "var(--spy-soft)" }} />Kept, but the bit differs</span>
        <span><b className="spy-mark">&#9679;</b> Spy measured this photon</span>
        <span>Grey bit: wrong basis, random result</span>
      </div>
    </>
  );
}
