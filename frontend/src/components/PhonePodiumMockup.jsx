import React from 'react';
import { 
  ShieldCheck, DollarSign, HeartHandshake, MapPin, Zap, 
  Sparkles, CheckCircle2, TrendingUp, Clock, Award, ArrowRight, Droplets, Hammer, Heart, Sparkle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PhonePodiumMockup({ services, workers, onSelectCategory }) {
  const { t } = useAuth();

  const nodes = [
    {
      num: '01',
      title: 'Work & Book On Your Schedule',
      desc: 'On-demand instant dispatch or scheduled calendar booking with zero middleman cuts.',
      color: '#0284c7',
      icon: <Clock className="w-5 h-5 text-sky-600" />
    },
    {
      num: '02',
      title: '100% Police & Society Verified',
      desc: 'Every artisan holds verified police clearances and registered cooperative society IDs.',
      color: '#2563eb',
      icon: <ShieldCheck className="w-5 h-5 text-blue-600" />
    },
    {
      num: '03',
      title: 'Standardized Fair Wage Rates',
      desc: 'Transparent pricing set by Labour Cooperative Federations to ensure dignified worker earnings.',
      color: '#059669',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />
    },
    {
      num: '04',
      title: 'Instant Digital UPI Payouts',
      desc: 'Direct payment to worker bank accounts via UPI QR code with instant digital tax invoicing.',
      color: '#ea580c',
      icon: <Zap className="w-5 h-5 text-orange-600" />
    },
    {
      num: '05',
      title: '5% Health & Welfare Reserve',
      desc: 'Statutory medical protection, group accident insurance (PMJJBY/PMSBY), and emergency grants.',
      color: '#0d9488',
      icon: <HeartHandshake className="w-5 h-5 text-teal-600" />
    },
    {
      num: '06',
      title: 'SahakarAI Demand Forecasting',
      desc: 'Predictive analytics balancing local workforce supply with high-demand neighborhood surges.',
      color: '#7c3aed',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />
    }
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/40 rounded-3xl border border-sky-200 shadow-xl shadow-sky-500/5 relative overflow-hidden text-slate-900 my-8">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-400/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 relative z-10">
        <span className="text-xs font-black uppercase tracking-widest text-sky-800 bg-sky-100 px-4 py-1.5 rounded-full border border-sky-300">
          The Cooperative Ecosystem Advantage
        </span>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
          Real skilled work. Real fair pay. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">Guaranteed trust.</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Powered by Labour Cooperative Federations — connecting verified artisans with households and institutions.
        </p>
      </div>

      {/* 3-Column Grid: Left Nodes - Center Phone Podium - Right Nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10 max-w-6xl mx-auto">
        
        {/* Left Benefit Nodes (01, 03, 05) */}
        <div className="space-y-6 order-2 lg:order-1">
          {[nodes[0], nodes[2], nodes[4]].map((node, i) => (
            <div 
              key={i}
              className="p-5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition-all duration-300 shadow-sm hover:shadow-md group hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: `${node.color}15`, color: node.color, borderColor: `${node.color}30`, borderWidth: 1 }}
                >
                  {node.num}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 group-hover:text-sky-700 transition-colors">
                    {node.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Center Phone Podium Mockup */}
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="w-full max-w-[320px] bg-slate-900 rounded-[44px] p-3.5 border-4 border-slate-700 shadow-2xl shadow-sky-900/20 relative">
            
            {/* Camera Pill & Speaker */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2.5 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 mr-2"></div>
              <div className="w-2 h-2 rounded-full bg-slate-900"></div>
            </div>

            {/* Inner Phone Screen Content */}
            <div className="bg-slate-900 rounded-[32px] p-4 text-xs space-y-3.5 border border-slate-800 overflow-hidden font-sans">
              
              {/* Phone App Bar */}
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-sky-500 flex items-center justify-center font-black text-[10px] text-white">
                    S
                  </div>
                  <span className="font-black text-white text-xs">SahakarSeva</span>
                </div>
                <span className="text-[10px] text-sky-400 bg-sky-950 px-2 py-0.5 rounded-full flex items-center gap-1 border border-sky-800">
                  <MapPin className="w-2.5 h-2.5" /> Delhi NCR
                </span>
              </div>

              {/* Tasks Title with Live Beacon */}
              <div className="flex justify-between items-center">
                <span className="font-black text-white text-xs">Verified tasks near you</span>
                <span className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                  34 live
                </span>
              </div>

              {/* Live Task Cards inside Phone */}
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-white text-[11px] block">AC Repair & Wiring</span>
                      <span className="text-[9px] text-slate-400">0.8 km • Police Verified</span>
                    </div>
                  </div>
                  <span className="font-black text-sky-400 text-xs">₹750</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                      <Droplets className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-white text-[11px] block">Pipe Leakage Fix</span>
                      <span className="text-[9px] text-slate-400">1.2 km • Society ID: 881</span>
                    </div>
                  </div>
                  <span className="font-black text-sky-400 text-xs">₹300</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-black text-white text-[11px] block">Elderly Care Support</span>
                      <span className="text-[9px] text-slate-400">1.5 km • Red Cross Cert</span>
                    </div>
                  </div>
                  <span className="font-black text-sky-400 text-xs">₹500</span>
                </div>
              </div>

              {/* Monthly Welfare Accumulation Widget inside Phone */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-950 to-blue-950 border border-sky-800/60 text-[10px] space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sky-300 font-bold">This Month's Welfare Pool</span>
                  <span className="font-black text-white text-xs">₹4,250</span>
                </div>
                <div className="flex items-center gap-1 text-[9px] text-sky-400 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-sky-400 flex-shrink-0" />
                  <span>5% deposited for worker medical insurance</span>
                </div>

                {/* Mini Bar Chart */}
                <div className="flex items-end gap-1 pt-1 h-6">
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[40%]"></span>
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[60%]"></span>
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[50%]"></span>
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[80%]"></span>
                  <span className="flex-1 bg-sky-400 rounded-t h-[100%]"></span>
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[70%]"></span>
                  <span className="flex-1 bg-sky-800/60 rounded-t h-[65%]"></span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Benefit Nodes (02, 04, 06) */}
        <div className="space-y-6 order-3">
          {[nodes[1], nodes[3], nodes[5]].map((node, i) => (
            <div 
              key={i}
              className="p-5 rounded-2xl bg-white border border-sky-100 hover:border-sky-300 transition-all duration-300 shadow-sm hover:shadow-md group hover:-translate-y-1"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs flex-shrink-0 shadow-xs"
                  style={{ backgroundColor: `${node.color}15`, color: node.color, borderColor: `${node.color}30`, borderWidth: 1 }}
                >
                  {node.num}
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-800 group-hover:text-sky-700 transition-colors">
                    {node.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {node.desc}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
