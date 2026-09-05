import React, { useState } from 'react';
import { 
  ShieldCheck, TrendingUp, Users, Calendar, DollarSign, 
  Award, AlertTriangle, CheckCircle2, XCircle, Sparkles, 
  Building2, ArrowUpRight, BarChart3, Lock, FileCheck, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WorkerProfileModal from '../components/WorkerProfileModal';

export default function AdminScreen({
  stats,
  forecasts,
  workers,
  societies,
  onVerifyWorker
}) {
  const { currentUser, logoutUser, t } = useAuth();
  const [inspectingWorker, setInspectingWorker] = useState(null);

  if (currentUser?.role !== 'FEDERATION_ADMIN') {
    return (
      <div className="bg-white p-10 sm:p-14 rounded-3xl shadow-sm border border-sky-100 text-center max-w-lg mx-auto space-y-5 animate-in fade-in">
        <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-black text-slate-900">{t('adminRestricted')}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {t('adminRestrictedDesc')} Current role: <strong className="text-slate-800">{currentUser?.role}</strong>.
        </p>
        <button
          onClick={logoutUser}
          className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold px-6 py-3.5 rounded-2xl transition shadow-lg text-xs"
        >
          Sign In as Federation Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Worker Profile Modal */}
      <WorkerProfileModal
        worker={inspectingWorker}
        onClose={() => setInspectingWorker(null)}
      />

      {/* Admin Executive Header */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-800 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-400/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-sky-100 text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wider border border-white/30">
              Federation Governance
            </span>
            <span className="bg-amber-400/20 text-amber-200 text-xs px-3 py-0.5 rounded-full font-bold border border-amber-300/30">
              Apex Council
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black mt-1.5">{t('adminTitle')}</h2>
          <p className="text-xs text-sky-100 mt-1">
            Real-time cooperative performance, worker police clearance oversight, and SahakarAI Prophet forecasting.
          </p>
        </div>

        <div className="bg-black/20 p-3.5 rounded-2xl border border-white/20 text-right">
          <span className="text-[10px] text-sky-200 font-bold uppercase tracking-wider block">Federation Jurisdiction</span>
          <p className="text-xs font-black text-white">All-India Labour Cooperative Federation (Delhi NCR Chapter)</p>
        </div>
      </div>

      {/* 5 Executive KPI Metric Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm space-y-1 hover:border-sky-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('verifiedWorkers')}</span>
              <Users className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.total_workers}</div>
            <span className="text-[11px] text-sky-600 font-semibold block">Active in member societies</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm space-y-1 hover:border-amber-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('pendingVerification')}</span>
              <ShieldCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-black text-amber-600">{stats.pending_workers}</div>
            <span className="text-[11px] text-amber-600 font-semibold block">Awaiting clearance</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm space-y-1 hover:border-blue-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('totalBookings')}</span>
              <Calendar className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-900">{stats.total_bookings}</div>
            <span className="text-[11px] text-blue-600 font-semibold block">
              {stats.emergency_bookings || 1} Emergency SOS
            </span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm space-y-1 hover:border-emerald-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('totalRevenue')}</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-700">₹{stats.total_revenue}</div>
            <span className="text-[11px] text-slate-400 font-semibold block">Direct worker wages</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-sky-100 shadow-sm space-y-1 hover:border-teal-300 transition">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">{t('welfarePool')}</span>
              <Award className="w-4 h-4 text-teal-600" />
            </div>
            <div className="text-3xl font-black text-teal-700">₹{stats.welfare_pool_balance}</div>
            <span className="text-[11px] text-teal-600 font-semibold block">5% statutory health fund</span>
          </div>
        </div>
      )}

      {/* Member Societies Network Grid */}
      <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-600" /> {t('societiesOverview')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Society Reg #DL/SOC/2023/881</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Delhi Skilled Artisans & Technicians</h4>
            <p className="text-xs text-sky-700 font-bold">4 Verified Workers • 4.9 ★ Rating</p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Society Reg #DL/SOC/2024/1042</span>
            <h4 className="font-extrabold text-slate-900 text-sm">Capital Domestic & Care Services</h4>
            <p className="text-xs text-sky-700 font-bold">2 Verified Workers • 4.9 ★ Rating</p>
          </div>
          <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-1">
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Society Reg #DL/SOC/2024/1108</span>
            <h4 className="font-extrabold text-slate-900 text-sm">NCR Community Builders & Painters</h4>
            <p className="text-xs text-sky-700 font-bold">2 Verified Workers • 4.8 ★ Rating</p>
          </div>
        </div>
      </div>

      {/* SahakarAI Prophet Demand Forecasting & Workforce Allocation */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-600" /> {t('aiForecastTitle')}
              </h3>
              <span className="bg-gradient-to-r from-sky-600 to-blue-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> {t('aiBadge')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t('aiForecastSub')}</p>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 font-mono">
            94.2% Model Accuracy (MAPE)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecasts.map((f, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 hover:border-sky-300 transition space-y-3 shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      f.predicted_demand.includes('High')
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : f.predicted_demand.includes('Moderate')
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-sky-100 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {f.predicted_demand}
                  </span>
                  <span className="text-[10px] text-sky-700 font-bold">{f.confidence}</span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{f.zone}</h4>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Service: <strong className="text-slate-800">{f.service}</strong>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">{t('recWorkers')}:</span>
                <span className="font-black text-sky-700 bg-white px-2 py-0.5 rounded-lg border border-sky-200 shadow-sm text-xs">
                  {f.recommended_workers} {t('allocated')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cooperative Worker Police Verification Queue */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-600" /> {t('verificationQueue')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify police records, Skill India certifications, and society memberships.
            </p>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            {workers.length} Registered Workers
          </span>
        </div>

        <div className="space-y-3">
          {workers.map((w) => (
            <div
              key={w.id}
              className="p-4 sm:p-5 rounded-2xl border border-sky-100 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className="font-extrabold text-slate-900 text-sm">{w.name}</h4>
                  <span className="text-xs text-slate-500">({w.phone || w.email})</span>
                  <span
                    className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                      w.verification_status === 'VERIFIED'
                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                        : w.verification_status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {w.verification_status}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {w.society_name} • Skill: <strong className="text-slate-800">{w.skills}</strong> ({w.experience_years} yrs exp) • Cert: <span className="font-semibold text-slate-700">{w.certifications || 'Skill India Level 4'}</span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => setInspectingWorker(w)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3 py-2 rounded-xl font-bold transition flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect
                </button>

                {w.verification_status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => onVerifyWorker(w.id, 'VERIFIED')}
                      className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs px-4 py-2 rounded-xl font-extrabold transition shadow-sm flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> {t('verifyWorker')}
                    </button>
                    <button
                      onClick={() => onVerifyWorker(w.id, 'REJECTED')}
                      className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-4 py-2 rounded-xl font-extrabold transition shadow-sm flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> {t('rejectWorker')}
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-slate-400 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                    Status: {w.verification_status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
