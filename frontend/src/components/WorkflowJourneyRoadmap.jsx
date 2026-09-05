import React, { useState, useEffect, useRef } from 'react';
import { 
  UserPlus, Search, CheckSquare, CreditCard, 
  ShieldCheck, Zap, ArrowRight, Sparkles, CheckCircle2, MousePointerClick
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WorkflowJourneyRoadmap() {
  const { t } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const timerRef = useRef(null);

  // Mathematically harmonized coordinates along deep 3D S-curve
  const steps = [
    {
      num: '01',
      badge: 'STEP 01',
      title: 'Sign up free',
      desc: 'Download the app or join on web with verified Aadhaar / Society ID in minutes. Zero onboarding fee.',
      color: '#0284c7',
      accentBg: '#0284c7',
      card: { x: 35, y: 180, w: 220, h: 155 },
      pinStart: { x: 145, y: 335 },
      roadPos: { x: 145, y: 505, pct: 10 },
      icon: <UserPlus className="w-4 h-4 text-white" />,
      iconBg: 'bg-gradient-to-br from-sky-500 to-blue-600'
    },
    {
      num: '02',
      badge: 'STEP 02',
      title: 'Find tasks near you',
      desc: 'Browse open tasks in your area or work-from-home tasks, see upfront fair pay, and receive auto-matches.',
      color: '#0ea5e9',
      accentBg: '#0ea5e9',
      card: { x: 280, y: 125, w: 220, h: 155 },
      pinStart: { x: 390, y: 280 },
      roadPos: { x: 390, y: 435, pct: 36 },
      icon: <Search className="w-4 h-4 text-white" />,
      iconBg: 'bg-gradient-to-br from-sky-400 to-cyan-600'
    },
    {
      num: '03',
      badge: 'STEP 03',
      title: 'Do the work',
      desc: 'Get accepted, follow simple in-app milestones (On The Way → In Progress → Completed) with full dignity.',
      color: '#10b981',
      accentBg: '#10b981',
      card: { x: 525, y: 70, w: 220, h: 155 },
      pinStart: { x: 635, y: 225 },
      roadPos: { x: 635, y: 350, pct: 64 },
      icon: <CheckSquare className="w-4 h-4 text-white" />,
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600'
    },
    {
      num: '04',
      badge: 'STEP 04',
      title: 'Get paid',
      desc: 'Submit task proof and your payment goes directly to your bank account with 5% statutory welfare.',
      color: '#14b8a6',
      accentBg: '#14b8a6',
      card: { x: 770, y: 15, w: 220, h: 155 },
      pinStart: { x: 880, y: 170 },
      roadPos: { x: 880, y: 260, pct: 90 },
      icon: <CreditCard className="w-4 h-4 text-white" />,
      iconBg: 'bg-gradient-to-br from-teal-500 to-emerald-600'
    }
  ];

  // Direct click handler: moves the boy immediately to the selected step
  const handleStepClick = (idx) => {
    setActiveStep(idx);
    setUserInteracted(true);
  };

  // Trigger gentle single hop precisely upon arrival (after the 700ms slide)
  useEffect(() => {
    setIsJumping(false);
    const arrivalTimer = setTimeout(() => {
      setIsJumping(true);
      const hopTimer = setTimeout(() => {
        setIsJumping(false);
      }, 500);
      return () => clearTimeout(hopTimer);
    }, 650);

    return () => clearTimeout(arrivalTimer);
  }, [activeStep]);

  // Auto-tour progression with graceful pause when user interacts
  useEffect(() => {
    if (userInteracted) {
      const resumeTimer = setTimeout(() => {
        setUserInteracted(false);
      }, 8000);
      return () => clearTimeout(resumeTimer);
    }

    timerRef.current = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4500);

    return () => clearInterval(timerRef.current);
  }, [userInteracted, steps.length]);

  const currentStepData = steps[activeStep];
  const charPos = currentStepData.roadPos;

  // Deeply curved 3D S-curve isometric road coordinates
  const roadPathD = "M 35 520 C 80 520, 110 505, 145 505 C 210 505, 300 460, 390 435 C 480 405, 550 375, 635 350 C 730 320, 805 285, 880 260 C 920 245, 955 220, 975 195";
  const roadDepthBaseD = "M 35 536 C 80 536, 110 521, 145 521 C 210 521, 300 476, 390 451 C 480 421, 550 391, 635 366 C 730 336, 805 301, 880 276 C 920 261, 955 236, 975 211";
  const roadSideCurbD = "M 35 528 C 80 528, 110 513, 145 513 C 210 513, 300 468, 390 443 C 480 413, 550 383, 635 358 C 730 328, 805 293, 880 268 C 920 253, 955 228, 975 203";

  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-sky-50/70 via-white to-blue-50/50 rounded-[40px] border border-sky-200/90 shadow-xl shadow-sky-500/5 relative overflow-hidden text-slate-900 my-10">
      
      {/* CSS Keyframes for subtle single jump on arrival */}
      <style>{`
        @keyframes jumpOnceKeyframe {
          0% { transform: translateY(0); }
          40% { transform: translateY(-11px); }
          75% { transform: translateY(-1px); }
          100% { transform: translateY(0); }
        }
        .animate-jump-once {
          animation: jumpOnceKeyframe 0.5s cubic-bezier(0.25, 1, 0.5, 1) 1 forwards;
        }
      `}</style>

      {/* Ambient Radial Background Glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-sky-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3 relative z-10 mb-6 sm:mb-10">
        <div className="inline-flex items-center gap-2 bg-sky-100/90 text-sky-800 px-4 py-1.5 rounded-full border border-sky-300 text-xs font-black tracking-wider uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
          The 4-Step Cooperative Journey
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
          How It Works. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">From Sign Up to Direct Payouts.</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl mx-auto flex items-center justify-center gap-1.5">
          <MousePointerClick className="w-4 h-4 text-sky-500 inline shrink-0" />
          <span>Click any step card or 3D checkpoint below to guide the worker through each milestone.</span>
        </p>
      </div>

      {/* SVG Canvas with Coordinate-Locked Cards & 3D Isometric Highway */}
      <div className="relative max-w-6xl mx-auto">
        
        {/* Desktop / Tablet Full SVG Stage */}
        <div className="w-full aspect-[1000/600] min-h-[500px] max-h-[640px] relative">
          <svg 
            viewBox="0 0 1000 600" 
            className="w-full h-full overflow-visible select-none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glowing Gradient for Road Progress */}
              <linearGradient id="roadGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#0ea5e9" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="1" />
              </linearGradient>

              {/* 3D Asphalt Surface Gradient */}
              <linearGradient id="asphaltGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0f172a" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>

              {/* 3D Extrusion Side Gradient */}
              <linearGradient id="sideCurbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Ground Ambient Drop Shadow Filter */}
              <filter id="roadGroundShadow" x="-10%" y="-10%" width="130%" height="150%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="10" />
                <feOffset dx="0" dy="16" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge> 
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Isometric Grid Background Perspective Plane */}
            <g opacity="0.35" stroke="#bae6fd" strokeWidth="1">
              <line x1="0" y1="220" x2="1000" y2="220" strokeDasharray="6 6" />
              <line x1="0" y1="300" x2="1000" y2="300" strokeDasharray="6 6" />
              <line x1="0" y1="380" x2="1000" y2="380" strokeDasharray="6 6" />
              <line x1="0" y1="460" x2="1000" y2="460" strokeDasharray="6 6" />
              <line x1="0" y1="540" x2="1000" y2="540" strokeDasharray="6 6" />
              
              <line x1="145" y1="90" x2="35" y2="600" />
              <line x1="390" y1="90" x2="280" y2="600" />
              <line x1="635" y1="90" x2="525" y2="600" />
              <line x1="880" y1="90" x2="770" y2="600" />
            </g>

            {/* Ambient Radial Ground Glows underneath Road Curves */}
            <ellipse cx="145" cy="505" rx="100" ry="35" fill="#e0f2fe" opacity="0.6" />
            <ellipse cx="390" cy="435" rx="80" ry="28" fill="#e0f2fe" opacity="0.4" />
            <ellipse cx="880" cy="260" rx="120" ry="45" fill="#f0fdf4" opacity="0.7" />

            {/* ==================== 3D ROAD EXTRUSIONS & LAYERS ==================== */}
            
            {/* Layer 1: Ground Drop Shadow */}
            <path
              d={roadDepthBaseD}
              fill="none"
              stroke="#030712"
              strokeWidth="56"
              strokeLinecap="round"
              opacity="0.25"
              filter="blur(8px)"
            />

            {/* Layer 2: 3D Concrete Base Slab (Bottom-most Extrusion Edge) */}
            <path
              d={roadDepthBaseD}
              fill="none"
              stroke="#020617"
              strokeWidth="54"
              strokeLinecap="round"
            />

            {/* Layer 3: 3D Side Curb Wall (Metallic/Dark Concrete Extruded Side) */}
            <path
              d={roadSideCurbD}
              fill="none"
              stroke="url(#sideCurbGrad)"
              strokeWidth="50"
              strokeLinecap="round"
            />

            {/* Layer 4: Concrete Guardrail & Outer Shoulder Trim */}
            <path
              d={roadPathD}
              fill="none"
              stroke="#475569"
              strokeWidth="46"
              strokeLinecap="round"
            />
            <path
              d={roadPathD}
              fill="none"
              stroke="#64748b"
              strokeWidth="42"
              strokeLinecap="round"
            />

            {/* Layer 5: Main 3D Dark Asphalt Surface Deck */}
            <path
              d={roadPathD}
              fill="none"
              stroke="url(#asphaltGrad)"
              strokeWidth="38"
              strokeLinecap="round"
            />

            {/* Layer 6: Subtle Top Specular Bevel Reflection */}
            <path
              d={roadPathD}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="34"
              strokeLinecap="round"
              opacity="0.15"
            />

            {/* Layer 7: Center High-Contrast Dashed White Lane Divider */}
            <path
              d={roadPathD}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="18 16"
              strokeLinecap="round"
              opacity="0.95"
            />

            {/* Layer 8: 3D Animated Glowing Progress Neon Stream */}
            <path
              d={roadPathD}
              fill="none"
              stroke="url(#roadGlowGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray="1100"
              strokeDashoffset={1100 - (charPos.pct / 100) * 1100}
              style={{ 
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: 'drop-shadow(0 0 6px #0ea5e9)'
              }}
              className="opacity-85"
            />

            {/* ==================== 4 3D CHECKPOINT WELLS & PINS ==================== */}
            {steps.map((s, idx) => {
              const isSelected = activeStep === idx;
              const isPast = activeStep >= idx;
              return (
                <g 
                  key={idx} 
                  className="cursor-pointer group"
                  onClick={() => handleStepClick(idx)}
                >
                  {/* Invisible broad click target for effortless interaction */}
                  <ellipse
                    cx={s.roadPos.x}
                    cy={s.roadPos.y}
                    rx="40"
                    ry="24"
                    fill="transparent"
                  />

                  {/* Vertical Connector Cable with 3D drop line */}
                  <line
                    x1={s.roadPos.x}
                    y1={s.pinStart.y}
                    x2={s.roadPos.x}
                    y2={s.roadPos.y}
                    stroke={isSelected ? s.color : "#94a3b8"}
                    strokeWidth={isSelected ? "2.5" : "1.5"}
                    strokeDasharray={isSelected ? "none" : "4 4"}
                    opacity={isSelected ? "1" : "0.55"}
                    className="transition-all duration-300 group-hover:opacity-100"
                  />
                  
                  {/* Pin Dot on Card Bottom Edge */}
                  <circle
                    cx={s.roadPos.x}
                    cy={s.pinStart.y}
                    r={isSelected ? "5" : "3.5"}
                    fill={isSelected ? s.color : "#94a3b8"}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />

                  {/* 3D Sunken Well Outer Rim (Shadow inside road) */}
                  <ellipse
                    cx={s.roadPos.x}
                    cy={s.roadPos.y + 2}
                    rx={isSelected ? "28" : "22"}
                    ry={isSelected ? "10" : "7"}
                    fill="#020617"
                    opacity="0.8"
                  />

                  {/* 3D Road Portal Checkpoint (Oval Halo on asphalt) */}
                  <ellipse
                    cx={s.roadPos.x}
                    cy={s.roadPos.y}
                    rx={isSelected ? "26" : "20"}
                    ry={isSelected ? "9" : "6"}
                    fill="#0f172a"
                    stroke={isSelected ? s.color : isPast ? "#38bdf8" : "#475569"}
                    strokeWidth={isSelected ? "3" : "2"}
                    className={`${isSelected ? "animate-pulse" : ""} group-hover:stroke-sky-400`}
                  />

                  {/* Inner Glowing 3D Jewel Core */}
                  <ellipse
                    cx={s.roadPos.x}
                    cy={s.roadPos.y}
                    rx={isSelected ? "12" : "7"}
                    ry={isSelected ? "4.5" : "2.5"}
                    fill={isSelected ? s.color : isPast ? "#38bdf8" : "#334155"}
                    className="group-hover:fill-sky-400"
                  />
                </g>
              );
            })}

            {/* ==================== WORKER CHARACTER 3D POSITIONING ==================== */}
            <g 
              style={{
                transform: `translate(${charPos.x - 22}px, ${charPos.y - 65}px)`,
                transition: 'transform 0.75s cubic-bezier(0.35, 0, 0.25, 1)'
              }}
            >
              {/* Dynamic Ripple Rings Under Worker Feet in 3D Perspective */}
              <ellipse 
                cx="22" 
                cy="65" 
                rx="24" 
                ry="8" 
                fill="none" 
                stroke={currentStepData.color} 
                strokeWidth="2" 
                className="animate-ping opacity-40" 
              />
              <ellipse 
                cx="22" 
                cy="65" 
                rx="16" 
                ry="5" 
                fill="#0284c7" 
                opacity="0.35" 
              />

              {/* Character Illustration Group with single arrival jump */}
              <g className={isJumping ? "animate-jump-once" : ""}>
                {/* Hair / Head */}
                <ellipse cx="22" cy="12" rx="9" ry="6" fill="#1e293b" />
                <circle cx="22" cy="18" r="8" fill="#fed7aa" />
                <path d="M 14 14 Q 22 8 30 14" fill="#0f172a" />
                <circle cx="19" cy="17" r="1" fill="#0f172a" />
                <circle cx="25" cy="17" r="1" fill="#0f172a" />
                <path d="M 20 22 Q 22 24 24 22" fill="none" stroke="#ea580c" strokeWidth="1" />

                {/* Body / Yellow Safety Polo Shirt */}
                <path d="M 13 26 L 31 26 L 30 50 L 14 50 Z" fill="#eab308" />
                
                {/* Cooperative ID Lanyard */}
                <path d="M 18 26 L 22 36 L 26 26" fill="none" stroke="#0284c7" strokeWidth="1.5" />
                <rect x="20" y="36" width="4" height="6" rx="1" fill="#ffffff" stroke="#0284c7" strokeWidth="0.8" />

                {/* Arms */}
                <path d="M 13 28 L 8 42" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />
                <path d="M 31 28 L 36 42" stroke="#fed7aa" strokeWidth="3" strokeLinecap="round" />

                {/* Trousers */}
                <path d="M 14 50 L 14 62 L 19 62 L 22 52 L 25 62 L 30 62 L 30 50 Z" fill="#1e293b" />
                
                {/* Shoes */}
                <ellipse cx="16" cy="63" rx="3.5" ry="2" fill="#0f172a" />
                <ellipse cx="28" cy="63" rx="3.5" ry="2" fill="#0f172a" />
              </g>
            </g>

            {/* ==================== 4 CONNECTED FLOATING CARDS ==================== */}
            {steps.map((step, idx) => {
              const isSelected = activeStep === idx;
              return (
                <foreignObject
                  key={idx}
                  x={step.card.x}
                  y={step.card.y}
                  width={step.card.w}
                  height={step.card.h}
                  className="overflow-visible cursor-pointer"
                  onClick={() => handleStepClick(idx)}
                >
                  <div
                    onClick={() => handleStepClick(idx)}
                    className={`w-full h-full p-4 rounded-3xl bg-white flex flex-col justify-between transition-all duration-300 box-border cursor-pointer select-none ${
                      isSelected
                        ? 'shadow-2xl ring-2 ring-sky-400 border-transparent -translate-y-1.5'
                        : 'shadow-md hover:shadow-xl border border-slate-100 hover:-translate-y-1 opacity-90 hover:opacity-100 hover:border-sky-200'
                    }`}
                    style={{ filter: 'drop-shadow(0 8px 16px rgba(2, 132, 199, 0.08))' }}
                  >
                    {/* Top Colored Accent Bar */}
                    <div 
                      className="h-1.5 w-12 rounded-full mb-1.5"
                      style={{ backgroundColor: step.accentBg }}
                    />

                    {/* Header: Squirclular Icon Box + STEP Badge */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${step.iconBg}`}>
                        {step.icon}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider font-mono text-slate-800">
                        {step.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-0.5 flex-1">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-[10px] text-slate-500 leading-snug line-clamp-3">
                        {step.desc}
                      </p>
                    </div>

                    {/* Active State Indicator */}
                    {isSelected ? (
                      <div className="mt-1 pt-1.5 border-t border-sky-100 flex items-center justify-between text-[9px] font-black text-sky-700">
                        <span>Active Stage</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="mt-1 pt-1.5 border-t border-slate-100/60 flex items-center justify-between text-[9px] font-bold text-slate-400 group-hover:text-sky-600">
                        <span>Click to view</span>
                        <ArrowRight className="w-2.5 h-2.5 opacity-50" />
                      </div>
                    )}
                  </div>
                </foreignObject>
              );
            })}

          </svg>
        </div>

        {/* Mobile-Friendly Grid Fallback for Small Screens (< 640px) */}
        <div className="sm:hidden grid grid-cols-1 gap-3.5 mt-6 relative z-30">
          {steps.map((step, idx) => {
            const isSelected = activeStep === idx;
            return (
              <div
                key={idx}
                onClick={() => handleStepClick(idx)}
                className={`p-4 rounded-2xl bg-white transition-all cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-sky-500 shadow-lg border-transparent bg-sky-50/50'
                    : 'border border-sky-100 shadow-sm'
                }`}
              >
                <div 
                  className="h-1 w-12 rounded-full mb-2.5"
                  style={{ backgroundColor: step.accentBg }}
                />
                
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shadow-sm ${step.iconBg}`}>
                      {step.icon}
                    </div>
                    <span className="text-xs font-black uppercase font-mono text-slate-800">
                      {step.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-black bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-extrabold text-slate-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>

      {/* Footer Trust Bar */}
      <div className="mt-10 pt-4 border-t border-sky-100 max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <span className="flex items-center gap-1.5 text-sky-800 font-bold">
          <ShieldCheck className="w-4 h-4 text-sky-600" />
          100% Police Verified Artisans
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
          <Zap className="w-4 h-4 text-amber-500" />
          Sub-15 Min Emergency SOS Dispatch
        </span>
        <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          5% Statutory Welfare Passbook Included
        </span>
      </div>

    </section>
  );
}



