import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Square,
  ChevronDown,
  Clock,
  Waves,
  ShieldCheck,
  Mic,
  Tv,
  Radio,
  Video,
  Volume2,
  Maximize2,
  Sparkles,
  Youtube,
  Share2,
  Compass
} from 'lucide-react';
import { HorizonPlasmaShader } from './components/HorizonPlasmaShader';
import { ParticleField } from './components/ParticleField';
import { D9ClockSection } from './components/D9Clock';
import { TideOracleSection } from './components/TideOracle';
import { SovereignMeshSection } from './components/SovereignMesh';
import { TeleprompterSection } from './components/Teleprompter';
import { AudioSynth } from './components/AudioSynth';

export default function App() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [tideHeight, setTideHeight] = useState(1.85);
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [broadcastSpeed, setBroadcastSpeed] = useState<number>(45); // 45s duration
  const [showWatermark, setShowWatermark] = useState(true);

  // Track scroll progress and active section
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      if (maxScroll > 0) {
        const prog = el.scrollTop / maxScroll;
        setScrollProgress(prog);
      }

      // Determine active section by scroll height
      const h = el.clientHeight;
      const top = el.scrollTop;
      if (top < h * 0.8) setActiveSection('hero');
      else if (top < h * 1.8) setActiveSection('clock');
      else if (top < h * 2.8) setActiveSection('tide');
      else if (top < h * 3.8) setActiveSection('sovereign');
      else if (top < h * 4.8) setActiveSection('teleprompter');
      else setActiveSection('cta');
    };

    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  // Broadcast Mode Auto-scroll
  useEffect(() => {
    if (!broadcastMode) {
      setRecordingTime(0);
      return;
    }

    const el = scrollContainerRef.current;
    if (!el) return;

    let startTimestamp: number | null = null;
    const durationMs = broadcastSpeed * 1000;
    const maxScroll = el.scrollHeight - el.clientHeight;

    // Recording timer
    const recInterval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    let animationFrameId: number;
    const step = (now: number) => {
      if (!startTimestamp) startTimestamp = now;
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / durationMs, 1);

      // Smooth cubic ease in-out scroll
      const easeProgress =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      el.scrollTop = easeProgress * maxScroll;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setBroadcastMode(false);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(recInterval);
    };
  }, [broadcastMode, broadcastSpeed]);

  const scrollToSection = (id: string) => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const sectionIndexMap: Record<string, number> = {
      hero: 0,
      clock: 1,
      tide: 2,
      sovereign: 3,
      teleprompter: 4,
      cta: 5,
    };

    const idx = sectionIndexMap[id] ?? 0;
    el.scrollTo({
      top: idx * el.clientHeight,
      behavior: 'smooth',
    });
  };

  const formatRecTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div id="app-root" className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-sans select-none">
      {/* Background Layer 1: WebGL Plasma Shader */}
      <HorizonPlasmaShader tideHeight={tideHeight} scrollIntensity={scrollProgress} />

      {/* Background Layer 2: 3D Particle Constellation */}
      <ParticleField tideHeight={tideHeight} />

      {/* Dark Vignette Overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 3,
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(2, 6, 23, 0.7) 100%)',
        }}
      />

      {/* Top Fixed Broadcast Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3 flex items-center justify-between bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/80">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-black tracking-wider text-white uppercase font-mono flex items-center gap-1.5">
              <span>FLUID MOTION TV</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/80 border border-cyan-500/30 px-1.5 py-0.2 rounded font-normal">
                4K
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Dragon Nine Horizon Engine</div>
          </div>
        </div>

        {/* Chapter Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'hero', label: 'Horizon' },
            { id: 'clock', label: 'D9 Clock' },
            { id: 'tide', label: 'Tide Oracle' },
            { id: 'sovereign', label: 'Sovereign' },
            { id: 'teleprompter', label: 'Teleprompter' },
            { id: 'cta', label: 'Subscribe' },
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeSection === sec.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </nav>

        {/* Right Tools: WebAudio Synth + REC status */}
        <div className="flex items-center gap-3">
          <AudioSynth tideHeight={tideHeight} scrollProgress={scrollProgress} />

          {broadcastMode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/50 text-xs font-mono animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>REC {formatRecTime(recordingTime)}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="absolute inset-0 overflow-y-auto overflow-x-hidden scroll-smooth"
        style={{ zIndex: 10 }}
      >
        {/* SECTION 1: HERO */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 text-center z-10 pt-16">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/40 bg-slate-950/80 backdrop-blur-md text-cyan-300 text-xs font-mono tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Fluid Motion TV × Kimi & Timi Masterstroke</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-none bg-gradient-to-b from-white via-cyan-100 to-cyan-900/60 bg-clip-text text-transparent drop-shadow-2xl">
              Horizon<br />
              Broadcast
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              The old world runs on 60-minute hours.
              <span className="block text-cyan-300 font-bold mt-1 text-glow-cyan">
                We run on 54.
              </span>
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={() => setBroadcastMode(!broadcastMode)}
                className="px-6 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2"
              >
                {broadcastMode ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{broadcastMode ? 'Stop Broadcast' : 'Start Broadcast Mode'}</span>
              </button>

              <a
                href="https://www.youtube.com/watch?v=mvc0B2lhi-0"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-700 transition-colors flex items-center gap-2"
              >
                <Youtube className="w-4 h-4 text-rose-500" />
                <span>Watch Episode #1</span>
              </a>
            </div>

            <div className="pt-12">
              <ChevronDown
                onClick={() => scrollToSection('clock')}
                className="w-8 h-8 text-cyan-400/80 mx-auto animate-bounce cursor-pointer hover:text-white transition-colors"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: D9 CLOCK */}
        <D9ClockSection />

        {/* SECTION 3: TIDE ORACLE */}
        <TideOracleSection onTideUpdate={(h) => setTideHeight(h)} />

        {/* SECTION 4: SOVEREIGN MESH */}
        <SovereignMeshSection />

        {/* SECTION 5: TELEPROMPTER */}
        <TeleprompterSection />

        {/* SECTION 6: CALL TO ACTION */}
        <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 text-center z-10">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-5xl sm:text-7xl font-black text-white leading-tight">
              This is<br />
              <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                the future.
              </span>
            </h2>

            <p className="text-lg text-slate-300">
              Fluid Motion of the Future.<br />
              Dragon Nine is emerging.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <a
                href="https://www.youtube.com/@fluidmotiontv"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-cyan-500 text-slate-950 font-black text-sm uppercase tracking-wider hover:bg-cyan-400 transition-colors shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
              >
                <Youtube className="w-5 h-5" />
                <span>Subscribe on YouTube</span>
              </a>

              <button
                onClick={() => scrollToSection('hero')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-700 text-white font-bold text-sm uppercase tracking-wider hover:border-cyan-500 transition-colors"
              >
                Replay Experience
              </button>
            </div>

            <div className="pt-12 flex items-center justify-center gap-4 text-xs font-mono text-slate-500">
              <span>Fluid Motion TV</span>
              <span>•</span>
              <span>Dragon Nine</span>
              <span>•</span>
              <span>Kimi & Timi Masterstroke</span>
            </div>
          </div>
        </section>
      </div>

      {/* Floating Bottom Broadcast Control Hub */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-slate-950/90 border border-slate-800 p-2 rounded-2xl backdrop-blur-xl shadow-2xl">
        <button
          onClick={() => setBroadcastMode(!broadcastMode)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all ${
            broadcastMode
              ? 'bg-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
          }`}
        >
          {broadcastMode ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{broadcastMode ? 'Stop Broadcast' : 'Broadcast Mode'}</span>
        </button>

        {/* Speed Selector */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl text-xs font-mono text-slate-400">
          <span>Speed:</span>
          {[
            { secs: 30, label: '30s' },
            { secs: 45, label: '45s' },
            { secs: 60, label: '60s' },
          ].map((spd) => (
            <button
              key={spd.secs}
              onClick={() => setBroadcastSpeed(spd.secs)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                broadcastSpeed === spd.secs ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'hover:text-white'
              }`}
            >
              {spd.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowWatermark(!showWatermark)}
          className={`p-2.5 rounded-xl border text-xs font-mono transition-colors ${
            showWatermark
              ? 'bg-slate-900 border-slate-700 text-cyan-400'
              : 'bg-slate-950 border-slate-800 text-slate-600'
          }`}
          title="Toggle 4K Broadcast Watermark Overlay"
        >
          <Tv className="w-4 h-4" />
        </button>
      </div>

      {/* Top Scroll Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-900/90 z-50">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 transition-all duration-150 shadow-[0_0_10px_rgba(6,182,212,0.8)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* On-screen 4K Watermark Overlay */}
      {showWatermark && (
        <div className="fixed bottom-6 right-6 z-40 hidden md:block pointer-events-none">
          <div className="px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-right space-y-0.5">
            <div className="text-[11px] font-black text-cyan-400 font-mono tracking-wider uppercase">
              FLUID MOTION TV
            </div>
            <div className="text-[9px] text-slate-500 font-mono">
              DRAGON NINE • 4K 60FPS
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
