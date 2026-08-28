import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, Sliders, Music } from 'lucide-react';

interface AudioSynthProps {
  tideHeight: number;
  scrollProgress: number;
}

export const AudioSynth: React.FC<AudioSynthProps> = ({ tideHeight, scrollProgress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.25);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);

  const startAudio = useCallback(() => {
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      setIsPlaying(true);
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const master = ctx.createGain();
      master.gain.setValueAtTime(volume, ctx.currentTime);
      master.connect(ctx.destination);
      masterGainRef.current = master;

      // Sub-bass drone oscillator (Dragon Nine 54Hz harmonic)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(54, ctx.currentTime); // D9 54Hz resonance

      // Swell oscillator
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(108, ctx.currentTime);

      // Filter for sea motion swell
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, ctx.currentTime);
      filterRef.current = filter;

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(master);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;

      setIsPlaying(true);
    } catch (e) {
      console.warn('WebAudio failed to start:', e);
    }
  }, [volume]);

  const stopAudio = useCallback(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      masterGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
      setTimeout(() => {
        setIsPlaying(false);
      }, 250);
    }
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      startAudio();
    }
  };

  // React to tide height & scroll progress
  useEffect(() => {
    if (!isPlaying || !audioCtxRef.current || !filterRef.current || !masterGainRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;

    // Filter frequency swells with tide and scroll
    const targetFreq = 120 + tideHeight * 120 + scrollProgress * 250;
    filterRef.current.frequency.setTargetAtTime(targetFreq, now, 0.3);

    masterGainRef.current.gain.setTargetAtTime(volume, now, 0.1);
  }, [tideHeight, scrollProgress, volume, isPlaying]);

  return (
    <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl text-xs font-mono">
      <button
        onClick={togglePlay}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold transition-all ${
          isPlaying
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
        }`}

      >
        {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
        <span>{isPlaying ? '54Hz Drone ON' : 'Ambient Audio'}</span>
      </button>

      {isPlaying && (
        <div className="flex items-center gap-2 text-slate-400 pl-1 border-l border-slate-800">
          <Sliders className="w-3 h-3 text-slate-500" />
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-[10px] text-cyan-400 font-mono w-6">{Math.round(volume * 200)}%</span>
        </div>
      )}
    </div>
  );
};
