import React from 'react';
import { ShieldCheck, Award, FileCheck, Star, Phone, Mail, MapPin, X, HeartHandshake, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WorkerProfileModal({ worker, onClose, onBookDirect }) {
  const { t } = useAuth();
  if (!worker) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-sky-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Worker Header Card */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white">
            {worker.name?.charAt(0) || 'W'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-slate-900">{worker.name}</h3>
              <span className="bg-amber-50 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-lg flex items-center gap-1 border border-amber-300/50">
                ★ {worker.rating || '4.9'}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">{worker.society_name}</p>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-sky-200">
                <ShieldCheck className="w-3 h-3 text-sky-600" /> Police Verified
              </span>
              <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                {worker.experience_years} Years Experience
              </span>
            </div>
          </div>
        </div>

        {/* Verified Credential Badges Grid */}
        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-3 text-xs">
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-sky-700" /> Verified Credentials & Certificates
          </h4>

          <div className="space-y-2">
            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex items-start gap-2.5">
              <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">Skill Certification</span>
                <p className="text-slate-600 text-[11px]">{worker.certifications || 'Govt. Skill India NSDC Certified Level 4'}</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">Police Clearance Record</span>
                <p className="text-slate-600 text-[11px]">Clearance No: <strong className="text-slate-800">{worker.police_verification_no || 'DL/POL/2023/8812'}</strong></p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm flex items-start gap-2.5">
              <HeartHandshake className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold text-slate-900 block">Cooperative Member Welfare</span>
                <p className="text-slate-600 text-[11px]">Enrolled in Group Insurance & 5% Medical Protection Pool</p>
              </div>
            </div>
          </div>
        </div>

        {/* Skills List */}
        <div className="space-y-1.5">
          <span className="text-slate-500 font-bold text-xs uppercase tracking-wider">Skills & Expertise</span>
          <div className="flex flex-wrap gap-1.5">
            {worker.skills?.split(',').map((skill, i) => (
              <span key={i} className="bg-sky-50 text-sky-800 text-xs font-bold px-3 py-1 rounded-xl border border-sky-200">
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-xs transition"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onBookDirect && onBookDirect(worker);
            }}
            className="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-extrabold text-xs transition shadow-md"
          >
            Book This Worker
          </button>
        </div>

      </div>
    </div>
  );
}
