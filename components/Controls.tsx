"use client";

export interface Settings {
  spyPercent: number; // 0..100
  noisePercent: number; // 0..5
  photons: number;
}

export interface Preset {
  id: string;
  label: string;
  logName: string;
  spyPercent: number;
  noisePercent: number;
}

export const PRESETS: Preset[] = [
  { id: "clean", label: "Clean line", logName: "Clean line", spyPercent: 0, noisePercent: 1 },
  { id: "light", label: "Spy listens to 1 in 4 photons", logName: "Spy, 1 in 4 photons", spyPercent: 25, noisePercent: 1 },
  { id: "half", label: "Spy listens to 1 in 2 photons", logName: "Spy, 1 in 2 photons", spyPercent: 50, noisePercent: 1 },
  { id: "full", label: "Spy listens to every photon", logName: "Spy, every photon", spyPercent: 100, noisePercent: 1 },
];

export function scenarioName(s: Settings): string {
  const match = PRESETS.find((p) => p.spyPercent === s.spyPercent && p.noisePercent === s.noisePercent);
  if (match) return match.logName;
  return s.spyPercent ? `Spy, ${s.spyPercent}% of photons` : "Clean line";
}

interface ControlsProps {
  settings: Settings;
  running: boolean;
  onChange: (s: Settings) => void;
  onPreset: (p: Preset) => void;
  onRun: () => void;
}

export default function Controls({ settings, running, onChange, onPreset, onRun }: ControlsProps) {
  return (
    <section className="controls card" aria-label="Session settings">
      <div className="presets" role="group" aria-label="Scenarios">
        <span className="lbl">Scenario:</span>
        {PRESETS.map((p) => {
          const active = p.spyPercent === settings.spyPercent && p.noisePercent === settings.noisePercent;
          return (
            <button key={p.id} className="chip" type="button" aria-pressed={active} onClick={() => onPreset(p)} disabled={running}>
              {p.label}
            </button>
          );
        })}
      </div>

      <div className="fields">
        <div className="field">
          <label htmlFor="spy">
            Spy intercepts <output htmlFor="spy">{settings.spyPercent}%</output>
          </label>
          <input id="spy" type="range" min={0} max={100} step={5} value={settings.spyPercent}
            onChange={(e) => onChange({ ...settings, spyPercent: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="noise">
            Cable errors <output htmlFor="noise">{settings.noisePercent.toFixed(1)}%</output>
          </label>
          <input id="noise" type="range" min={0} max={5} step={0.5} value={settings.noisePercent}
            onChange={(e) => onChange({ ...settings, noisePercent: Number(e.target.value) })} />
        </div>
        <div className="field">
          <label htmlFor="photons">Photons per session</label>
          <select id="photons" value={settings.photons} onChange={(e) => onChange({ ...settings, photons: Number(e.target.value) })}>
            <option value={5000}>5,000</option>
            <option value={20000}>20,000</option>
            <option value={100000}>100,000</option>
          </select>
        </div>
      </div>

      <div className="run-row">
        <button className="btn" type="button" onClick={onRun} disabled={running}>Send photons</button>
        <span className="hint">Each session uses fresh random photons, so results vary slightly from run to run.</span>
      </div>
    </section>
  );
}
