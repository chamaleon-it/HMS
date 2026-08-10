import React, { useState } from 'react';
import { WifiOff, RefreshCw, Database, Cloud, Shield, Server, Lock } from 'lucide-react';

const OfflineMode = () => {
    const [activeTab, setActiveTab] = useState('hybrid');

    return (
        <section className="py-32 text-slate-200 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white/5 border border-white/10 p-1.5 rounded-full inline-flex backdrop-blur-md">
                        <button
                            onClick={() => setActiveTab('hybrid')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'hybrid' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'}`}
                        >
                            Hybrid Cloud
                        </button>
                        <button
                            onClick={() => setActiveTab('offline')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'offline' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-slate-400 hover:text-white'}`}
                        >
                            Complete Offline
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-20">

                    <div className="lg:w-1/2">
                        <div className="flex flex-wrap gap-3 mb-8">
                            {activeTab === 'hybrid' ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm">
                                    <WifiOff className="w-4 h-4" />
                                    <span>Hybrid Architecture</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-sm">
                                    <Database className="w-4 h-4" />
                                    <span>Complete Offline Architecture</span>
                                </div>
                            )}
                        </div>

                        {activeTab === 'hybrid' ? (
                            <>
                                <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                                    Internet Down? 😭 <br />
                                    <span className="text-slate-500">Business as Usual. 😎</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                                    Don&apos;t let a bad connection stop your hospital. Synapse works perfectly offline and syncs automatically when you&apos;re back online.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/5 border border-white/10 text-blue-400 rounded-xl">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Local-First Database</h3>
                                            <p className="text-slate-400">Data is saved instantly to your local server. Zero latency, zero data loss.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/5 border border-white/10 text-blue-400 rounded-xl">
                                            <Cloud className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Auto-Cloud Sync</h3>
                                            <p className="text-slate-400">The moment internet is back, we push everything to the cloud securely.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
                                    100% Local. <br />
                                    <span className="text-slate-500">Zero Internet Needed.</span>
                                </h2>
                                <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">
                                    For high-security environments or remote locations. Run Synapse entirely on your local server without any cloud connection.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/5 border border-white/10 text-blue-400 rounded-xl">
                                            <Server className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">On-Premise Server</h3>
                                            <p className="text-slate-400">Full control over your data. Hosted physically within your hospital premises.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/5 border border-white/10 text-blue-400 rounded-xl">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-2">Air-Gapped Security</h3>
                                            <p className="text-slate-400">Maximum security. No external access possible. Immune to online threats.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:w-1/2 relative w-full">
                        {activeTab === 'hybrid' ? (
                            /* Hybrid Visual */
                            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-400 rounded-full font-bold text-sm border border-rose-500/20 animate-pulse">
                                    <WifiOff className="w-4 h-4" /> OFFLINE MODE
                                </div>
                                <div className="space-y-4 mt-12 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                                    <div className="h-4 w-3/4 bg-slate-700/50 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-700/50 rounded animate-pulse" />
                                    <div className="h-32 w-full bg-slate-800/40 rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center">
                                        <div className="text-slate-400 font-mono text-sm">Saving to LocalDB...</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-12 w-1/3 bg-blue-600/80 rounded-lg" />
                                        <div className="h-12 w-1/3 bg-slate-800 rounded-lg" />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 right-8 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4">
                                    <div className="relative">
                                        <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Sync Status</div>
                                        <div className="text-sm font-bold text-white">Queued: 42 Records</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Complete Offline Visual */
                            <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(to_bottom,transparent,black,transparent)]" />
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full font-bold text-sm border border-blue-500/20">
                                    <Lock className="w-4 h-4" /> SECURE LOCAL
                                </div>

                                <div className="relative z-10 mt-12 space-y-6">
                                    <div className="flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                            <Server className="w-16 h-16 text-blue-400" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-mono text-sm mb-2">LAN: 192.168.1.100</div>
                                        <div className="text-emerald-400 font-mono text-xs">● System Active</div>
                                    </div>
                                    <div className="bg-black/50 rounded-xl p-4 border border-white/5">
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Storage</span>
                                            <span>2.4TB / 4TB</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full w-[60%] bg-blue-500" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default OfflineMode;

