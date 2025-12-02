import React from 'react';
import { TrendingDown, Users, Clock } from 'lucide-react';

const PainPoints = () => {
    const pains = [
        {
            icon: TrendingDown,
            title: "Revenue Leakage",
            description: "Unbilled services, missed pharmacy charges, and rejected insurance claims cost hospitals 15-20% of their potential revenue annually.",
            color: "text-red-500"
        },
        {
            icon: Clock,
            title: "Long Wait Times",
            description: "Manual queues and inefficient scheduling lead to frustrated patients, crowded waiting areas, and poor satisfaction scores.",
            color: "text-orange-500"
        },
        {
            icon: Users,
            title: "Staff Burnout",
            description: "Overburdened nurses and doctors spend more time on paperwork than patient care, leading to high attrition rates.",
            color: "text-yellow-500"
        }
    ];

    return (
        <section className="py-24 bg-black relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Is Your Hospital Struggling with <br />
                        <span className="text-red-500">Operational Chaos?</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Running a hospital is hard. Outdated software and manual processes make it harder.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pains.map((pain, index) => (
                        <div key={index} className="bg-white/5 border border-red-500/20 p-8 rounded-2xl hover:bg-red-500/5 transition-colors group">
                            <div className="bg-red-500/10 w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <pain.icon className={`w-7 h-7 ${pain.color}`} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">{pain.title}</h3>
                            <p className="text-slate-400 leading-relaxed">
                                {pain.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PainPoints;
