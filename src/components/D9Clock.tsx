import React, { useEffect, useState } from 'react';
import { Clock, Info, Zap, Sparkles } from 'lucide-react';
import { D9TimeState } from '../types';

export const D9ClockSection: React.FC = () => {
  const [d9Time, setD9Time] = useState<D9TimeState>({
    hour: '00',
    minute: '00',
    second: '00',
    progress: 0,
    label: '',
    cycleNumber: 1,
  });

  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // NZST UTC+12 offset
      const nzOffsetHours = 12;
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const nzTime = new Date(utcMs + nzOffsetHours * 3600000);

      const minsInDay = nzTime.getHours() * 60 + nzTime.getMinutes();
      const secsInMin = nzTime.getSeconds();

      // Dragon Nine 54-minute hours
      const d9Hour = Math.floor(minsInDay / 54);
      const d9Min = minsInDay % 54;
      const d9Sec = Math.floor((secsInMin / 60) * 54);

      const cycleMins = 1440; // 24 * 60 mins
      const progress = (minsInDay / cycleMins) * 100;
      const cycleNumber = Math.floor((now.getTime() / (86400000)) % 999) + 1;

      setD9Time({
        hour: String(d9Hour).padStart(2, '0'),
        minute: String(d9Min).padStart(2, '0'),
        second: String(d9Sec).padStart(2, '0'),
        progress,
        label: `Cycle #${cycleNumber} • ${progress.toFixed(1)}% Complete • 54m Hr`,
        cycleNumber,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 z-10">
      <div className="w-full max-w-4xl mx-auto space-y-8 text-center">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-xs font-mono tracking-widest uppercase">
          <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />
          <span>Dragon Nine Harmonic Time</span>
        </div>

        {/* Big Digit Display */}
        <div className="relative py-4">
          <div className="text-7xl sm:text-9xl md:text-[11rem] font-black font-mono text-white tracking-tighter leading-none select-none text-glow-cyan">
            {d9Time.hour}
            <span className="text-cyan-400 animate-pulse">:</span>
            {d9Time.minute}
            <span className="text-3xl sm:text-5xl font-light text-cyan-500/80 ml-2 font-mono">
              .{d9Time.second}
            </span>
          </div>

          <div className="mt-4 text-sm font-mono text-cyan-300/80 tracking-wide">
            {d9Time.label}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-xl mx-auto space-y-2">
          <div className="flex justify-between text-[11px] font-mono text-slate-400">
            <span>D9 HOUR 00</span>
            <span>26.66 HOURS / DAY</span>
            <span>D9 HOUR 26</span>
          </div>
          <div className="h-2 bg-slate-900/90 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-cyan-300 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${d9Time.progress}%` }}
            />
          </div>
        </div>

        {/* D9 Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6">
          {[
            { label: 'Hour Duration', value: '54 Mins', sub: 'vs 60m legacy' },
            { label: 'Cycle Hours', value: '26.66', sub: '26h 36m total' },
            { label: 'Resonance', value: '54.0 Hz', sub: 'Acoustic pitch' },
            { label: 'Tide Synchronization', value: '18m Offset', sub: 'Harbor harmonic' },
          ].map((item) => (
            <div
              key={item.label}
              className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md hover:border-cyan-500/40 transition-all duration-300 text-center"
            >
              <div className="text-xl sm:text-2xl font-black text-white font-mono">{item.value}</div>
              <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mt-1">{item.label}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Toggle Info Explanation */}
        <div className="pt-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-xl"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showExplanation ? 'Hide D9 Time Math' : 'Why 54-Minute Hours?'}</span>
          </button>

          {showExplanation && (
            <div className="mt-4 p-6 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-left max-w-2xl mx-auto space-y-3 text-xs sm:text-sm text-slate-300 backdrop-blur-lg">
              <div className="flex items-center gap-2 font-bold text-cyan-300 font-mono">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                The Dragon Nine Temporal Architecture
              </div>
              <p className="leading-relaxed text-slate-300">
                Traditional time divides a 24-hour day into 60-minute units. Dragon Nine restructures the temporal matrix into 26.667 units of 54 minutes.
              </p>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400 font-mono text-xs">
                <li><strong className="text-cyan-200">54 Mins = 3240 Seconds:</strong> Exactly alignable with 54Hz harmonic acoustic frequencies.</li>
                <li><strong className="text-cyan-200">Tide Lock:</strong> Matches the 18-minute tidal phase offset across river mouths.</li>
                <li><strong className="text-cyan-200">Studio Sync:</strong> Optimized for high-focus 54-minute creative sprints with instant focus-mode recovery.</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
