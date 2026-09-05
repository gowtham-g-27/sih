import React, { useState, useEffect } from 'react';
import { 
  Zap, Droplets, Hammer, Sparkles, HeartHandshake, 
  Heart, Sparkle, Car, Wrench, ArrowRight, ShieldCheck, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categoryData = [
  {
    id: 'Electrical',
    name: 'Electrical & AC Engineering',
    category: 'Electrical',
    rate: '₹350–₹750',
    unit: 'per hour / service',
    tag: 'Govt. Skill India Level 4',
    tag2: 'Police Cleared',
    desc: 'Certified electricians for domestic wiring, short circuits, switchgear installation, AC maintenance, and inverter setup.',
    color: '#0284c7',
    icon: <Zap className="w-8 h-8 text-sky-600" />,
    features: [
      'Home Wiring, MCB & Switch Repair Diagnostics',
      'AC Servicing, Coil Cleaning & Gas Top-up',
      '100% Police & Cooperative Society Verified',
      '5% Contributed to Worker Health & Welfare Fund'
    ]
  },
  {
    id: 'Plumbing',
    name: 'Plumbing & Sanitary Systems',
    category: 'Plumbing',
    rate: '₹300–₹1200',
    unit: 'per hour / tank',
    tag: 'NSQF Master Plumbers',
    tag2: 'Emergency Ready',
    desc: 'Master plumbers for pipe leakage fixing, tap replacements, water tank deep disinfection, and sewer line maintenance.',
    color: '#2563eb',
    icon: <Droplets className="w-8 h-8 text-blue-600" />,
    features: [
      'High-Pressure Pipe Leakage, Tap & Sanitary Fixing',
      'Water Tank Deep Cleaning & Chlorine Disinfection',
      'Standardized Fair Hourly Cooperative Wage Rates',
      'Rapid Sub-15 Min Emergency SOS Dispatch'
    ]
  },
  {
    id: 'Carpentry',
    name: 'Carpentry & Custom Woodwork',
    category: 'Carpentry',
    rate: '₹400–₹800',
    unit: 'per hour',
    tag: 'Vocational Craft Certified',
    tag2: 'Equipped',
    desc: 'Artisan carpenters for furniture assembly, door hinge repair, modular kitchen woodwork, and customized fittings.',
    color: '#d97706',
    icon: <Hammer className="w-8 h-8 text-amber-600" />,
    features: [
      'Furniture Assembly, Custom Shelving & Woodwork',
      'Door Hinges, Lock Replacement & Sliding Repairs',
      'Vocational Craft Guild Certified Artisans',
      'Zero Middleman Margins — 85% Direct Worker Pay'
    ]
  },
  {
    id: 'Caregiving',
    name: 'Caregiving & Patient Support',
    category: 'Caregiving',
    rate: '₹500–₹1500',
    unit: 'per 4 hrs / shift',
    tag: 'Red Cross First Aid Trained',
    tag2: 'Background Checked',
    desc: 'Trained and compassionate caregivers for elderly assistance, post-operative nursing care, and mobility support.',
    color: '#e11d48',
    icon: <Heart className="w-8 h-8 text-rose-600" />,
    features: [
      'Elderly Assistance & Daily Patient Care Support',
      'Red Cross Certified & First Aid Trained Personnel',
      'Background-Checked & Society Enrolled Workers',
      'Flexible 4-Hour, 8-Hour & Overnight Care Shifts'
    ]
  },
  {
    id: 'Cleaning',
    name: 'Deep Cleaning & Sanitization',
    category: 'Cleaning',
    rate: '₹1200–₹2500',
    unit: 'per service',
    tag: 'Chemical Safety Certified',
    tag2: 'Full House',
    desc: 'Comprehensive deep cleaning, kitchen degreasing, bathroom descaling, and eco-friendly home sanitization.',
    color: '#0d9488',
    icon: <Sparkle className="w-8 h-8 text-teal-600" />,
    features: [
      'Deep House Cleaning & Bathroom Sanitization',
      'Eco-Friendly Chemical & Safety Certified Staff',
      'Full Industrial Equipment & Protective Gear Provided',
      'Transparent Digital Tax Invoicing & Receipting'
    ]
  },
  {
    id: 'Appliance Technician',
    name: 'Home Appliance Diagnostics',
    category: 'Appliance Technician',
    rate: '₹500–₹900',
    unit: 'per service',
    tag: 'NSDC Certified Techs',
    tag2: 'Genuine Spares',
    desc: 'Repairs and servicing for washing machines, refrigerators, microwaves, geysers, and water purifiers.',
    color: '#7c3aed',
    icon: <Wrench className="w-8 h-8 text-purple-600" />,
    features: [
      'Washing Machine, Geyser & Microwave Repair',
      'Genuine Spare Parts & Component Warranty Support',
      'NSDC Level 4 Electronics Specialization',
      'Instant UPI QR Code & NetBanking Checkout'
    ]
  }
];

export default function CategoryExplorerStage({ onSelectCategoryForBooking }) {
  const { t } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);

  const activeCategory = categoryData[activeIndex];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-white via-sky-50/60 to-blue-50/40 rounded-3xl border border-sky-200 shadow-xl shadow-sky-500/5 relative overflow-hidden text-slate-900 my-8">
      {/* Background Accent Orb */}
      <div 
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-15 transition-all duration-500"
        style={{ backgroundColor: activeCategory.color }}
      ></div>

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Section Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-sky-100 pb-6">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-sky-800 bg-sky-100 px-3.5 py-1 rounded-full border border-sky-300">
              Cooperative Service Categories
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900">
              Field or home, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">there's verified skilled work.</span>
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Hover over any trade on the right to instantly explore verified capabilities, rates, and features.
          </p>
        </div>

        {/* Explorer Layout: Stage on Left, Interactive Selector on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Stage Card (Left - 7 cols) with Key Transition */}
          <div 
            key={activeCategory.id}
            className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 relative overflow-hidden shadow-xl flex flex-col justify-between space-y-5 animate-in fade-in duration-200"
          >
            <div className="space-y-4">
              {/* Header Stage Info */}
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-slate-400 font-bold">
                  0{activeIndex + 1} / 0{categoryData.length} · Cooperative Categories
                </span>
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-3 py-1 rounded-full border border-slate-200">
                    {activeCategory.tag}
                  </span>
                  <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-3 py-1 rounded-full border border-sky-200">
                    {activeCategory.tag2}
                  </span>
                </div>
              </div>

              {/* Icon & Title */}
              <div className="flex items-center gap-4">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 transition-transform duration-300 transform scale-105"
                  style={{ backgroundColor: `${activeCategory.color}15`, borderColor: `${activeCategory.color}30`, borderWidth: 1 }}
                >
                  {activeCategory.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">{activeCategory.name}</h3>
                  <span className="text-xs font-semibold text-sky-600">Cooperative Standard Wage Standard</span>
                </div>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {activeCategory.desc}
              </p>

              {/* Dynamic Feature Highlights List */}
              <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100/80 space-y-2">
                <span className="text-[10px] uppercase tracking-wider text-sky-800 font-black block">
                  Included Trade Features & Assurances
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  {activeCategory.features?.map((ft, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight text-[11px] font-medium">{ft}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Wage & Action Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/80 border border-sky-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-2">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">Standard Rate</span>
                <span className="text-2xl font-black text-sky-800">{activeCategory.rate}</span>
                <span className="text-xs text-slate-500 ml-1.5">{activeCategory.unit}</span>
              </div>

              <button
                type="button"
                onClick={() => onSelectCategoryForBooking(activeCategory.category)}
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black px-6 py-3.5 rounded-xl transition shadow-lg shadow-sky-500/20 text-xs flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Book This Service <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Selector List (Right - 5 cols) with onMouseEnter Hover Handling */}
          <div className="lg:col-span-5 space-y-2.5 flex flex-col justify-between">
            {categoryData.map((cat, idx) => (
              <button
                key={cat.id}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onFocus={() => setActiveIndex(idx)}
                onClick={() => {
                  setActiveIndex(idx);
                  onSelectCategoryForBooking(cat.category);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between cursor-pointer ${
                  activeIndex === idx
                    ? 'bg-sky-50 border-sky-400 shadow-md scale-102 ring-2 ring-sky-400/30'
                    : 'bg-white border-sky-100 hover:bg-sky-50/70 hover:border-sky-300 text-slate-600 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shadow-xs"
                    style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <span className={`text-xs font-black block transition-colors ${activeIndex === idx ? 'text-sky-950' : 'text-slate-800'}`}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">{cat.rate} {cat.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeIndex === idx && (
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
                  )}
                  <ArrowRight className={`w-4 h-4 transition-transform ${activeIndex === idx ? 'text-sky-600 translate-x-1' : 'text-slate-400'}`} />
                </div>
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
