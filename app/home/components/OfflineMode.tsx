import React, { useState } from 'react';
import { WifiOff, RefreshCw, Database, Cloud, Shield, Server, Lock } from 'lucide-react';

const OfflineMode = () => {
    const [activeTab, setActiveTab] = useState('hybrid');

    return (
        <section className="py-32 bg-white text-black relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">

                {/* Tabs */}
                <div className="flex justify-center mb-16">
                    <div className="bg-slate-100 p-1.5 rounded-full inline-flex">
                        <button
                            onClick={() => setActiveTab('hybrid')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'hybrid' ? 'bg-white shadow-md text-black' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Hybrid Cloud
                        </button>
                        <button
                            onClick={() => setActiveTab('offline')}
                            className={`px-6 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'offline' ? 'bg-white shadow-md text-black' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Complete Offline
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row items-center gap-20">

                    <div className="lg:w-1/2">
                        <div className="flex flex-wrap gap-3 mb-8">
                            {activeTab === 'hybrid' ? (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 border border-green-200 text-green-700 font-bold text-sm">
                                    <WifiOff className="w-4 h-4" />
                                    <span>Hybrid Architecture</span>
                                </div>
                            ) : (
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-sm">
                                    <Database className="w-4 h-4" />
                                    <span>Complete Offline Architecture</span>
                                </div>
                            )}
                        </div>

                        {activeTab === 'hybrid' ? (
                            <>
                                <h2 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
                                    Internet Down? 😭 <br />
                                    <span className="text-slate-400">Business as Usual. 😎</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                    Don&apos;t let a bad connection stop your hospital. Synapse works perfectly offline and syncs automatically when you&apos;re back online.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-black text-white rounded-xl">
                                            <Database className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Local-First Database</h3>
                                            <p className="text-slate-500">Data is saved instantly to your local server. Zero latency, zero data loss.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-black text-white rounded-xl">
                                            <Cloud className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Auto-Cloud Sync</h3>
                                            <p className="text-slate-500">The moment internet is back, we push everything to the cloud securely.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-5xl lg:text-7xl font-bold mb-8 tracking-tight leading-tight">
                                    100% Local. <br />
                                    <span className="text-slate-400">Zero Internet Needed.</span>
                                </h2>
                                <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                                    For high-security environments or remote locations. Run Synapse entirely on your local server without any cloud connection.
                                </p>
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-600 text-white rounded-xl">
                                            <Server className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">On-Premise Server</h3>
                                            <p className="text-slate-500">Full control over your data. Hosted physically within your hospital premises.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-600 text-white rounded-xl">
                                            <Shield className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">Air-Gapped Security</h3>
                                            <p className="text-slate-500">Maximum security. No external access possible. Immune to online threats.</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="lg:w-1/2 relative">
                        {activeTab === 'hybrid' ? (
                            /* Hybrid Visual */
                            <div className="relative bg-slate-100 rounded-3xl p-8 border border-slate-200 shadow-2xl">
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-full font-bold text-sm animate-pulse">
                                    <WifiOff className="w-4 h-4" /> OFFLINE MODE
                                </div>
                                <div className="space-y-4 mt-12 opacity-50 grayscale transition-all duration-500 hover:grayscale-0 hover:opacity-100">
                                    <div className="h-4 w-3/4 bg-slate-300 rounded animate-pulse" />
                                    <div className="h-4 w-1/2 bg-slate-300 rounded animate-pulse" />
                                    <div className="h-32 w-full bg-slate-200 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
                                        <div className="text-slate-400 font-mono text-sm">Saving to LocalDB...</div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="h-12 w-1/3 bg-black rounded-lg" />
                                        <div className="h-12 w-1/3 bg-slate-300 rounded-lg" />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 right-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4">
                                    <div className="relative">
                                        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Sync Status</div>
                                        <div className="text-sm font-bold text-black">Queued: 42 Records</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Complete Offline Visual */
                            <div className="relative bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl overflow-hidden">
                                <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />
                                <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full font-bold text-sm border border-blue-500/30">
                                    <Lock className="w-4 h-4" /> SECURE LOCAL
                                </div>

                                <div className="relative z-10 mt-12 space-y-6">
                                    <div className="flex items-center justify-center">
                                        <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
                                            <Server className="w-16 h-16 text-blue-500" />
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-mono text-sm mb-2">LAN: 192.168.1.100</div>
                                        <div className="text-green-400 font-mono text-xs">● System Active</div>
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
