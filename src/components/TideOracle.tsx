import React, { useState, useEffect } from 'react';
import { Waves, Anchor, ShieldCheck, AlertTriangle, ArrowUpRight, ArrowDownRight, Compass, RefreshCw } from 'lucide-react';
import { TideData } from '../types';

interface TideOracleProps {
  onTideUpdate?: (height: number) => void;
}

const LOCATION_PRESETS = [
  { name: 'River Mouth Bar', baseDepth: 1.5, amp: 0.9, phaseOffset: 0 },
  { name: 'Beach Outer Break', baseDepth: 2.1, amp: 1.1, phaseOffset: -18 },
  { name: 'Upriver Basin', baseDepth: 1.2, amp: 0.7, phaseOffset: 35 },
];

export const TideOracleSection: React.FC<TideOracleProps> = ({ onTideUpdate }) => {
  const [selectedLocation, setSelectedLocation] = useState(LOCATION_PRESETS[0]);
  const [tide, setTide] = useState<TideData>({
    heightM: 1.82,
    meanLevelM: 1.45,
    direction: 'flooding',
    velocityKnots: 2.4,
    barCrossingSafe: true,
    locationName: LOCATION_PRESETS[0].name,
    nextHighAt: new Date(Date.now() + 2.4 * 3600000).toISOString(),
    nextLowAt: new Date(Date.now() + 8.6 * 3600000).toISOString(),
    phaseOffsetMins: 0,
  });

  useEffect(() => {
    const updateTide = () => {
      const now = Date.now() / 1000;
      // Oscillate with sine wave plus phase offset
      const phaseRad = (selectedLocation.phaseOffset * Math.PI) / 180;
      const height = selectedLocation.baseDepth + selectedLocation.amp * Math.sin(now * 0.0006 + phaseRad);
      const derivative = Math.cos(now * 0.0006 + phaseRad);
      const isFlooding = derivative > 0;
      const knots = parseFloat((Math.abs(derivative) * 3.8).toFixed(1));
      const heightFixed = parseFloat(Math.max(0.4, height).toFixed(2));
      const barSafe = heightFixed >= 1.45;

      const updatedData: TideData = {
        heightM: heightFixed,
        meanLevelM: selectedLocation.baseDepth,
        direction: isFlooding ? 'flooding' : 'ebbing',
        velocityKnots: knots,
        barCrossingSafe: barSafe,
        locationName: selectedLocation.name,
        nextHighAt: new Date(Date.now() + 2.5 * 3600000).toISOString(),
        nextLowAt: new Date(Date.now() + 8.5 * 3600000).toISOString(),
        phaseOffsetMins: selectedLocation.phaseOffset,
      };

      setTide(updatedData);
      if (onTideUpdate) {
        onTideUpdate(heightFixed);
      }
    };

    updateTide();
    const interval = setInterval(updateTide, 2000);
    return () => clearInterval(interval);
  }, [selectedLocation, onTideUpdate]);

  const formatTime = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 z-10">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-widest">
              <Waves className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Tide Oracle Telemetry</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              The tide doesn't wait.<br />
              <span className="text-cyan-300">Neither do we.</span>
            </h2>
          </div>

          {/* Location Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
            <Compass className="w-4 h-4 text-slate-500 ml-2" />
            {LOCATION_PRESETS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                  selectedLocation.name === loc.name
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                {loc.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Live Gauges & Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Depth Gauge */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-cyan-500/30 backdrop-blur-md relative overflow-hidden group">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Tidal Depth</div>
            <div className="text-4xl font-black text-cyan-300 font-mono mt-2 flex items-baseline gap-1">
              {tide.heightM.toFixed(2)}
              <span className="text-lg text-slate-400 font-normal">m</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2 flex justify-between">
              <span>Mean: {tide.meanLevelM.toFixed(2)}m</span>
              <span className="text-cyan-400">Phase: {tide.phaseOffsetMins > 0 ? `+${tide.phaseOffsetMins}m` : `${tide.phaseOffsetMins}m`}</span>
            </div>
            <div className="absolute top-0 right-0 p-4 text-cyan-500/20">
              <Waves className="w-16 h-16" />
            </div>
          </div>

          {/* Flow Vector */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md relative overflow-hidden">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Flow Direction</div>
            <div className={`text-2xl font-black font-mono mt-2 flex items-center gap-2 ${
              tide.direction === 'flooding' ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {tide.direction === 'flooding' ? (
                <>
                  <ArrowUpRight className="w-6 h-6 animate-bounce" />
                  <span>FLOODING</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-6 h-6 animate-bounce" />
                  <span>EBBING</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              Velocity: <strong className="text-white">{tide.velocityKnots} knots</strong>
            </div>
          </div>

          {/* Next High / Low */}
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-amber-500/30 backdrop-blur-md">
            <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Astro Tidal Apex</div>
            <div className="text-2xl font-black text-amber-300 font-mono mt-2">
              {formatTime(tide.nextHighAt)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2 flex justify-between">
              <span>Next High</span>
              <span className="text-amber-400 font-semibold">Low at {formatTime(tide.nextLowAt)}</span>
            </div>
          </div>

          {/* Bar Crossing Safety */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md transition-all ${
            tide.barCrossingSafe
              ? 'bg-emerald-950/30 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
              : 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.15)]'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${
                tide.barCrossingSafe ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                Bar Crossing
              </span>
              {tide.barCrossingSafe ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              )}
            </div>
            <div className={`text-2xl font-black font-mono mt-2 ${
              tide.barCrossingSafe ? 'text-emerald-300' : 'text-rose-300'
            }`}>
              {tide.barCrossingSafe ? 'CLEAR TO CROSS' : 'SHALLOW WARNING'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-2">
              {tide.barCrossingSafe ? 'Depth > 1.45m threshold' : 'Hold position until flood'}
            </div>
          </div>
        </div>

        {/* Phase Offset Map Row */}
        <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" />
              River Mouth Phase Propagation Map
            </span>
            <span className="text-xs font-mono text-cyan-400">Harmonic Lock: 18m Steps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { point: 'Beach Break', offset: '-18 min', desc: 'Ocean swell entry', state: 'Lead Phase' },
              { point: 'River Mouth Bar', offset: '0 min', desc: 'Primary navigation channel', state: 'Reference' },
              { point: 'Upriver Basin', offset: '+35 min', desc: 'Internal harbor sanctuary', state: 'Lag Phase' },
            ].map((node) => (
              <div key={node.point} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white">{node.point}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{node.desc}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-xs font-bold text-cyan-400">{node.offset}</div>
                  <div className="text-[9px] text-slate-500 uppercase">{node.state}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
