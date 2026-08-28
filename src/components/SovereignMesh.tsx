import React, { useState } from 'react';
import { ShieldCheck, Radio, Globe, Zap, Server, Activity, Cpu, Wifi } from 'lucide-react';

export const SovereignMeshSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'telemetry'>('nodes');

  const nodes = [
    { title: 'Horizon Plasma Engine', status: 'Optimal (60 FPS)', color: 'cyan', icon: <Radio className="w-5 h-5" />, load: '12%' },
    { title: 'Dragon Nine Clock', status: 'Synced (54m/hr)', color: 'emerald', icon: <Globe className="w-5 h-5" />, load: '0.4%' },
    { title: 'Tide Oracle Telemetry', status: 'Active Stream', color: 'amber', icon: <Zap className="w-5 h-5" />, load: '3.1%' },
    { title: 'Sovereign Mesh Node', status: 'Peer Connected', color: 'purple', icon: <Server className="w-5 h-5" />, load: '8.7%' },
  ];

  return (
    <section className="min-h-screen flex flex-col items-center justify-center relative px-6 py-20 z-10">
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sovereign Infrastructure</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-1">
              No middlemen.<br />
              <span className="text-emerald-300">No gatekeepers.</span>
            </h2>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('nodes')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'nodes'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              System Nodes
            </button>
            <button
              onClick={() => setActiveTab('telemetry')}
              className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                activeTab === 'telemetry'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Telemetry Bars
            </button>
          </div>
        </div>

        {/* Nodes Grid */}
        {activeTab === 'nodes' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {nodes.map((node) => (
              <div
                key={node.title}
                className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md hover:border-emerald-500/50 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 group-hover:scale-110 transition-transform">
                    {node.icon}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ONLINE
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{node.title}</h3>
                <div className="text-[11px] font-mono text-emerald-400">{node.status}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 pt-2 border-t border-slate-900 flex justify-between">
                  <span>Resource Load</span>
                  <span className="text-white font-bold">{node.load}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-900 pb-3">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Broadcast Processing Matrix
              </span>
              <span className="text-emerald-400 font-bold">100% Sovereign Protocol</span>
            </div>

            {[
              { label: 'WebGL Shader Pipeline', val: 98, desc: '4K Native Frame Buffer' },
              { label: 'Dragon Nine Clock Sync', val: 100, desc: '0.00ms Drift' },
              { label: 'Tide Oracle Telemetry', val: 94, desc: 'Streaming 2.0s Heartbeat' },
              { label: 'Particle Constellation', val: 99, desc: '650 Active Vector Vertices' },
            ].map((metric) => (
              <div key={metric.label} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white font-bold">{metric.label}</span>
                  <span className="text-emerald-400 font-bold">{metric.val}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-1000"
                    style={{ width: `${metric.val}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-500 font-mono">{metric.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Studio AI Architecture Banner */}
        <div className="p-6 rounded-2xl bg-slate-950/60 border border-emerald-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Fluid Motion TV × Google Gemini × Studio AI</div>
              <div className="text-xs text-slate-400 font-mono">Full stack client/server architecture running on Google Cloud Run</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-3 py-1.5 rounded-xl">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>4K Recording Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
