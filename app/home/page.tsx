"use client"

import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import IndiaFeatures from './components/IndiaFeatures';
import Pricing from './components/Pricing';
import Testimonials from './components/Testimonials';
import TrustSection from './components/TrustSection';
import CTASection from './components/CTASection';
import PainPoints from './components/PainPoints';
import Integrations from './components/Integrations';
import FAQ from './components/FAQ';
import OfflineMode from './components/OfflineMode';
// import './index.css';

function App() {

  return (
    <div className="min-h-screen bg-[#030712] text-slate-200 overflow-x-hidden dark">
      <div className="fixed inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
      <Header />
      <main>
        <Hero />
        <TrustSection />
        <PainPoints />

        {/* Neural Connection Line */}
        <div className="relative h-24 w-full overflow-hidden pointer-events-none">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-[#3B82F6]/50 to-transparent">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-float" />
          </div>
        </div>

        <Features />
        <OfflineMode />
        <Integrations />
        <IndiaFeatures />
        <Pricing />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>

      <footer className="bg-black text-slate-400 py-12 border-t border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-[#3B82F6] transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-white/10">
            <p>&copy; {new Date().getFullYear()} Synapse Health Technologies Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
