import React from 'react';
import { Check } from 'lucide-react';

const plans = [
    {
        name: 'Starter',
        price: '₹2,999',
        period: '/month',
        description: 'Essential features for small clinics and nursing homes.',
        features: [
            'OPD Management',
            'Patient Registration',
            'Basic Billing',
            '5 Staff Accounts',
            'Email Support',
        ],
        cta: 'Start Free Trial',
        popular: false,
    },
    {
        name: 'Professional',
        price: '₹7,999',
        period: '/month',
        description: 'Advanced tools for growing hospitals and multi-specialty centers.',
        features: [
            'Everything in Starter',
            'IPD & Ward Management',
            'Pharmacy & Inventory',
            'Laboratory Integration',
            '20 Staff Accounts',
            'Priority Support',
            'WhatsApp Integration',
        ],
        cta: 'Get Started',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Full-scale solution for large hospital chains and medical colleges.',
        features: [
            'Everything in Professional',
            'Multi-branch Management',
            'Advanced Analytics & BI',
            'Dedicated Account Manager',
            'Unlimited Staff Accounts',
            'Custom API Integrations',
            'On-premise Deployment Option',
        ],
        cta: 'Contact Sales',
        popular: false,
    },
];

const Pricing = () => {
    return (
        <section id="pricing" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
                        Simple, Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-secondary-glow">Pricing</span>
                    </h2>
                    <p className="text-lg text-slate-400">
                        Choose the plan that fits your facility&apos;s size and needs. No hidden fees.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans?.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative rounded-2xl p-8 border transition-all duration-300 hover:-translate-y-2 ${plan.popular
                                ? 'bg-white/10 border-[#3B82F6]/50 shadow-[0_0_30px_rgba(59,130,246,0.15)]'
                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#3B82F6] to-secondary rounded-full text-xs font-bold text-white uppercase tracking-wider shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                                <p className="text-slate-400 text-sm h-10">{plan.description}</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features?.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Check className="w-5 h-5 text-secondary-glow shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                className={`w-full py-4 rounded-xl font-semibold transition-all ${plan.popular
                                    ? 'bg-[#3B82F6] hover:bg-[#60A5FA] text-white shadow-lg shadow-[#3B82F6]/25'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                {plan.cta}
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
