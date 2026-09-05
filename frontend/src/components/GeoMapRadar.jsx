import React, { useState } from 'react';
import { MapPin, Navigation, ShieldCheck, Sparkles, Users, Zap, Radio, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function GeoMapRadar({ workers, customerLat = 28.6139, customerLng = 77.2090, onSelectWorker }) {
  const { t } = useAuth();
  const [hoveredWorker, setHoveredWorker] = useState(null);

  // Normalize worker lat/lng relative to customer for radar projection
  // Lat range: 28.5 to 28.75 (~30km), Lng range: 77.0 to 77.4 (~40km)
  const getRadarCoords = (wLat, wLng) => {
    const latDiff = (wLat - customerLat) * 111; // km
    const lngDiff = (wLng - customerLng) * 98; // km
    
    // Scale to SVG 400x400 (center at 200, 200; 1km = 6px)
    const x = 200 + lngDiff * 5.5;
    const y = 200 - latDiff * 5.5;

    // Clamp within bounds
    const clampedX = Math.max(25, Math.min(375, x));
    const clampedY = Math.max(25, Math.min(375, y));
    return { x: clampedX, y: clampedY };
  };

  return (
    <div className="bg-gradient-to-br from-white via-sky-50/50 to-blue-50/30 p-6 rounded-3xl border border-sky-200 shadow-xl shadow-sky-500/5 text-slate-900 space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-100 text-sky-700 border border-sky-200 animate-pulse">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black tracking-tight flex items-center gap-2 text-slate-900">
              {t('mapRadarView')}
              <span className="text-[10px] bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-300">
                Live Geo-Spatial Match
              </span>
            </h3>
            <p className="text-xs text-slate-500">Delhi NCR Cooperative Dispatch Zone (Lat: {customerLat}, Lng: {customerLng})</p>
          </div>
        </div>

        <div className="text-right text-[11px] text-sky-800 font-bold bg-sky-100/80 px-3 py-1 rounded-xl border border-sky-200">
          Radius: 35 km • {workers.length} Verified Online
        </div>
      </div>

      {/* Interactive SVG Radar */}
      <div className="relative w-full aspect-square max-w-md mx-auto bg-sky-950/90 rounded-3xl border border-sky-800 overflow-hidden flex items-center justify-center p-4 shadow-xl">
        
        {/* Radar Background Grid & Concentric Rings */}
        <svg viewBox="0 0 400 400" className="w-full h-full">
          {/* Radial Gradients & Rings */}
          <circle cx="200" cy="200" r="160" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
          <circle cx="200" cy="200" r="110" fill="none" stroke="#0284c7" strokeWidth="1" opacity="0.6" />
          <circle cx="200" cy="200" r="60" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.8" />
          
          {/* Crosshairs */}
          <line x1="200" y1="20" x2="200" y2="380" stroke="#0369a1" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
          <line x1="20" y1="200" x2="380" y2="200" stroke="#0369a1" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />

          {/* Range Labels */}
          <text x="204" y="145" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.9">10 km</text>
          <text x="204" y="95" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.9">20 km</text>
          <text x="204" y="45" fill="#38bdf8" fontSize="9" fontWeight="bold" opacity="0.9">30 km</text>

          {/* Center Customer Pin */}
          <circle cx="200" cy="200" r="10" fill="#38bdf8" fillOpacity="0.4" className="animate-ping" />
          <circle cx="200" cy="200" r="6" fill="#0284c7" stroke="#ffffff" strokeWidth="2" />
          <text x="200" y="218" fill="#bae6fd" fontSize="10" fontWeight="900" textAnchor="middle">You</text>

          {/* Worker Pins */}
          {workers.map((w) => {
            const coords = getRadarCoords(w.lat || 28.6139, w.lng || 77.2090);
            const isHovered = hoveredWorker?.id === w.id;

            return (
              <g 
                key={w.id} 
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredWorker(w)}
                onMouseLeave={() => setHoveredWorker(null)}
                onClick={() => onSelectWorker && onSelectWorker(w)}
              >
                {/* Glow ring on hover / top match */}
                {w.match_score >= 90 && (
                  <circle cx={coords.x} cy={coords.y} r="12" fill="#38bdf8" fillOpacity="0.3" className="animate-pulse" />
                )}
                
                {/* Pin Circle */}
                <circle 
                  cx={coords.x} 
                  cy={coords.y} 
                  r={isHovered ? "9" : "7"} 
                  fill={w.status === 'ONLINE' ? '#0ea5e9' : '#f59e0b'} 
                  stroke="#ffffff" 
                  strokeWidth="2" 
                />

                {/* Worker Initial */}
                <text 
                  x={coords.x} 
                  y={coords.y + 3} 
                  fill="#ffffff" 
                  fontSize="7" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {w.name.charAt(0)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Hover Tooltip Card */}
        {hoveredWorker && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-sky-300 shadow-2xl space-y-1 animate-in fade-in duration-150 text-slate-900">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-xs">{hoveredWorker.name}</span>
                <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-1.5 py-0.2 rounded flex items-center gap-0.5 border border-sky-200">
                  <ShieldCheck className="w-3 h-3 text-sky-600" /> Police Verified
                </span>
              </div>
              <span className="bg-sky-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                {hoveredWorker.match_score}% Match
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              {hoveredWorker.skills} • {hoveredWorker.experience_years} yrs • {hoveredWorker.distance_km} km away
            </p>
          </div>
        )}
      </div>

      {/* Match Algorithm Formula Explainer Footer */}
      <div className="bg-sky-50/70 p-3 rounded-2xl border border-sky-100 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Match Weight: <strong>40% Skill</strong> + <strong>25% Distance</strong> + <strong>20% Avail</strong> + <strong>10% Rating</strong> + <strong>5% Exp</strong></span>
        </div>
      </div>
    </div>
  );
}
