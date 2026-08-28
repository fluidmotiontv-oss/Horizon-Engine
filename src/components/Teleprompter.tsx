import React, { useState } from 'react';
import { Mic, Play, Pause, RotateCcw, MessageSquare, Sparkles, UserCheck, Video } from 'lucide-react';
import { TeleprompterCue } from '../types';

const INITIAL_SCRIPT: TeleprompterCue[] = [
  {
    id: '1',
    timestamp: '00:00 - 00:10',
    speaker: 'Fluid Motion',
    line: "Welcome back to Fluid Motion TV. What you're seeing on screen right now isn't a pre-rendered video — it's live WebGL, live telemetry, and sovereign code.",
    actionHint: 'Slow scroll past the Horizon Plasma Hero section',
  },
  {
    id: '2',
    timestamp: '00:10 - 00:25',
    speaker: 'Kimi',
    line: "The old world runs on 60-minute hours. Dragon Nine runs on 54. Watch the D9 clock sync live with New Zealand harmonic time.",
    actionHint: 'Scroll to Dragon Nine Clock Section & highlight 54m hour metric',
  },
  {
    id: '3',
    timestamp: '00:25 - 00:45',
    speaker: 'Timi',
    line: "Look at the Tide Oracle. The plasma engine palette literally morphs as the tidal depth changes at the river mouth bar.",
    actionHint: 'Click location preset "River Mouth Bar" to show live depth morphing',
  },
  {
    id: '4',
    timestamp: '00:45 - 01:05',
    speaker: 'Kimi',
    line: "Sovereign infrastructure means zero gatekeepers. Everything built here is running directly on Google Cloud Run with Gemini AI studio tools.",
    actionHint: 'Show Sovereign Mesh nodes & Telemetry bars',
  },
  {
    id: '5',
    timestamp: '01:05 - 01:20',
    speaker: 'Fluid Motion',
    line: "This is a Kimi & Timi Masterstroke. Hit Broadcast Mode, turn on the 54Hz drone, and let's shape the future.",
    actionHint: 'Click Broadcast Mode auto-scroll & subscribe CTA',
  },
];

export const TeleprompterSection: React.FC = () => {
  const [cues, setCues] = useState<TeleprompterCue[]>(INITIAL_SCRIPT);
  const [activeCueId, setActiveCueId] = useState<string>('1');
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [customLine, setCustomLine] = useState('');
  const [speaker, setSpeaker] = useState<'Kimi' | 'Timi' | 'Fluid Motion'>('Kimi');

  const activeCue = cues.find((c) => c.id === activeCueId) || cues[0];

  const addCue = () => {
    if (!customLine.trim()) return;
    const newCue: TeleprompterCue = {
      id: Date.now().toString(),
      timestamp: 'Custom',
      speaker,
      line: customLine.trim(),
      actionHint: 'Custom narration cue',
    };
    setCues([...cues, newCue]);
    setCustomLine('');
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 z-10">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-cyan-300 text-xs font-mono">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>Kimi & Timi Voiceover Teleprompter</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Screen Recording Narration Script
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Use this live teleprompter while recording your screen for YouTube.
          </p>
        </div>

        {/* Teleprompter Display Box */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-cyan-500/40 backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.15)] relative space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-lg text-xs font-bold font-mono uppercase ${
                activeCue.speaker === 'Kimi'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : activeCue.speaker === 'Timi'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                {activeCue.speaker}
              </span>
              <span className="text-xs font-mono text-slate-500">{activeCue.timestamp}</span>
            </div>

            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span className="text-xs font-mono text-cyan-400">REC READY</span>
            </div>
          </div>

          {/* Active Line */}
          <div className="py-4">
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white leading-relaxed tracking-tight">
              "{activeCue.line}"
            </p>
          </div>

          {/* Action Hint */}
          {activeCue.actionHint && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono text-cyan-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Camera Action: {activeCue.actionHint}</span>
            </div>
          )}
        </div>

        {/* Cue Navigator Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {cues.map((cue, idx) => (
            <button
              key={cue.id}
              onClick={() => setActiveCueId(cue.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono transition-all flex items-center gap-2 ${
                cue.id === activeCueId
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <span>Cue #{idx + 1}</span>
              <span className="text-[10px] opacity-75">({cue.speaker})</span>
            </button>
          ))}
        </div>

        {/* Add Custom Cue Line */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center gap-3">
          <select
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value as 'Kimi' | 'Timi' | 'Fluid Motion')}
            className="bg-slate-900 border border-slate-800 text-white text-xs font-mono rounded-xl px-3 py-2.5 outline-none focus:border-cyan-500"
          >
            <option value="Kimi">Speaker: Kimi</option>
            <option value="Timi">Speaker: Timi</option>
            <option value="Fluid Motion">Speaker: Fluid Motion</option>
          </select>

          <input
            type="text"
            placeholder="Add custom narration line..."
            value={customLine}
            onChange={(e) => setCustomLine(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCue()}
            className="flex-1 w-full bg-slate-900 border border-slate-800 text-white text-xs font-mono rounded-xl px-4 py-2.5 outline-none focus:border-cyan-500 placeholder-slate-500"
          />

          <button
            onClick={addCue}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono uppercase transition-colors shrink-0"
          >
            Add Cue
          </button>
        </div>
      </div>
    </section>
  );
};
