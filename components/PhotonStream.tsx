// Decorative hero visual: photons in four polarizations travel from Site A to Site B.
const PHOTONS = [0, 90, 45, -45, 90, 0, -45, 45, 0, 90];

export default function PhotonStream() {
  return (
    <div className="ps" aria-hidden="true">
      <div className="ps-node">
        <span className="ps-k">Site A</span>
        <span className="ps-n">Head office</span>
      </div>
      <div className="ps-line">
        {PHOTONS.map((deg, i) => (
          <span key={i} className="ps-photon" style={{ ["--r" as string]: `${deg}deg`, animationDelay: `${i * 0.42}s` }} />
        ))}
      </div>
      <div className="ps-node ps-b">
        <span className="ps-k">Site B</span>
        <span className="ps-n">Data centre</span>
      </div>
      <div className="ps-status">
        <span className="ps-dot" />
        Spy check passed &middot; error rate 1.1% &middot; 256-bit key ready
      </div>
    </div>
  );
}
