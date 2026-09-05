import React, { useState } from 'react';
import { 
  Users, Award, ShieldCheck, DollarSign, CheckCircle2, Clock, 
  MapPin, Phone, Star, Navigation, ArrowRight, HeartHandshake, FileCheck,
  ToggleLeft, ToggleRight, AlertCircle, PlusCircle, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WelfareClaimModal from '../components/WelfareClaimModal';

export default function WorkerScreen({
  bookings,
  welfareLedger,
  onUpdateStatus,
  onUpdateAvailability,
  onSubmitWelfareClaim
}) {
  const { currentUser, t } = useAuth();
  const [availability, setAvailability] = useState('ONLINE');
  const [isUpdatingAvail, setIsUpdatingAvail] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Calculate worker quick metrics
  const completedCount = bookings.filter(b => b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED').length;
  const totalEarnings = bookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED')
    .reduce((sum, b) => sum + (b.amount - (b.welfare_fee || Math.round(b.amount * 0.05))), 0);
  const totalWelfareFund = welfareLedger.reduce((sum, item) => sum + item.amount, 0);

  const handleToggleStatus = async (newStatus) => {
    setIsUpdatingAvail(true);
    setAvailability(newStatus);
    if (onUpdateAvailability) {
      await onUpdateAvailability(newStatus);
    }
    setIsUpdatingAvail(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welfare Claim Modal */}
      {showClaimModal && (
        <WelfareClaimModal
          onClose={() => setShowClaimModal(false)}
          onSubmitClaim={onSubmitWelfareClaim}
        />
      )}

      {/* Worker Profile & Live Availability Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-sky-400/30">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border-2 border-white/40">
              {currentUser?.name?.charAt(0) || 'W'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black">{currentUser?.name}</h2>
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-0.5 rounded-full border border-white/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-200" /> {t('policeVerified')}
                </span>
              </div>
              <p className="text-xs text-sky-100 font-medium mt-1">
                Cooperative Member • Delhi Skilled Artisans & Technicians Cooperative Society (DL/SOC/2023/881)
              </p>
            </div>
          </div>

          {/* Real-Time Availability Switcher */}
          <div className="bg-white/15 backdrop-blur-md p-3 rounded-2xl border border-white/25 flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-sky-100 uppercase font-extrabold tracking-wider block">
                {t('availabilityStatus')}
              </span>
              <span className="text-xs font-black text-white flex items-center gap-1.5 justify-end">
                <span className={`w-2 h-2 rounded-full ${availability === 'ONLINE' ? 'bg-sky-300 animate-ping' : 'bg-amber-300'}`}></span>
                {availability === 'ONLINE' ? t('onlineStatus') : t('busyStatus')}
              </span>
            </div>

            <div className="flex bg-black/20 p-1 rounded-xl border border-white/20">
              <button
                type="button"
                onClick={() => handleToggleStatus('ONLINE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  availability === 'ONLINE' ? 'bg-white text-sky-900 shadow' : 'text-sky-100 hover:text-white'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => handleToggleStatus('OFFLINE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                  availability === 'OFFLINE' ? 'bg-slate-700 text-white shadow' : 'text-sky-100 hover:text-white'
                }`}
              >
                Offline
              </button>
            </div>
          </div>

        </div>

        {/* Quick Performance Counter Strip */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-sky-400/40">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-sky-100 uppercase font-bold tracking-wider">{t('completedJobs')}</span>
            <p className="text-xl font-black text-white mt-0.5">{completedCount}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-sky-100 uppercase font-bold tracking-wider">{t('totalEarnings')}</span>
            <p className="text-xl font-black text-white mt-0.5">₹{totalEarnings}</p>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-amber-200 uppercase font-bold tracking-wider">{t('avgRating')}</span>
            <p className="text-xl font-black text-amber-200 mt-0.5 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-amber-300 text-amber-300" /> 4.9
            </p>
          </div>
        </div>
      </div>

      {/* Govt Certification & Insurance Policy Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certification Card */}
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Govt. Skill India & Police Clearance</h3>
              <p className="text-xs text-slate-500">Verified by Society & Delhi Police</p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-1">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Skill Certification:</span>
              <span className="font-bold text-slate-800">Skill India NSDC Level 4 (ITI Gold Standard)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Police Clearance Certificate:</span>
              <span className="font-bold text-slate-800">DL/POL/2023/4491 (Verified)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Society Member ID:</span>
              <span className="font-bold text-sky-800">DL/SOC/2023/881-W09</span>
            </div>
          </div>
        </div>

        {/* Insurance & Welfare Pool Card */}
        <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-sky-50 text-sky-700 rounded-xl border border-sky-200">
                <HeartHandshake className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">{t('insurancePolicyTitle')}</h3>
                <p className="text-xs text-slate-500">{t('insuranceActive')}</p>
              </div>
            </div>
            <button
              onClick={() => setShowClaimModal(true)}
              className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl transition shadow-sm"
            >
              + File Claim
            </button>
          </div>

          <div className="space-y-2 text-xs text-slate-600 pt-1">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Policy Number:</span>
              <span className="font-bold text-slate-800">PMSBY-COOP-882194</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-400">Accident & Medical Coverage:</span>
              <span className="font-bold text-slate-800">Up to ₹2,00,000 (Active)</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Your Accumulated Welfare Fund:</span>
              <span className="font-black text-sky-700 text-sm">₹{totalWelfareFund}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Assigned Jobs & 4-Stage Stepper */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-600" /> {t('workerTitle')}
            </h3>
            <p className="text-xs text-slate-500">Live service orders assigned through cooperative dispatch</p>
          </div>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            {bookings.length} Assigned Orders
          </span>
        </div>

        {bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-sky-600/40" />
            <p className="text-sm font-medium">{t('noJobs')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="p-5 sm:p-6 rounded-2xl border border-sky-100 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition-all space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-black text-slate-900 text-base">
                        Booking #{b.id} — {b.service_name}
                      </h4>
                      {b.is_emergency === 1 && (
                        <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                          🚨 Emergency SOS
                        </span>
                      )}
                      <span
                        className={`text-xs px-3 py-0.5 rounded-full font-black uppercase tracking-wider ${
                          b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : b.status === 'ACCEPTED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : b.status === 'ON_THE_WAY'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {t('customer')}: <strong className="text-slate-800">{b.customer_name}</strong> • Scheduled: {b.scheduled_at}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-sky-800">
                      ₹{b.amount - (b.welfare_fee || Math.round(b.amount * 0.05))} Net
                    </span>
                    <p className="text-[10px] text-sky-600 font-semibold">(+5% deposited to your welfare fund)</p>
                  </div>
                </div>

                {/* Status Stepper Action Buttons */}
                <div className="pt-3 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-sky-600" />
                    <span>Current Stage: <strong className="text-slate-800">{b.status}</strong></span>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.status === 'ACCEPTED' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'ON_THE_WAY')}
                        className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-extrabold transition shadow-md flex items-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" /> {t('startOnWay')}
                      </button>
                    )}

                    {b.status === 'ON_THE_WAY' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'IN_PROGRESS')}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2.5 rounded-xl font-extrabold transition shadow-md flex items-center gap-1.5"
                      >
                        <Clock className="w-3.5 h-3.5" /> {t('beginService')}
                      </button>
                    )}

                    {b.status === 'IN_PROGRESS' && (
                      <button
                        onClick={() => onUpdateStatus(b.id, 'COMPLETED')}
                        className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs px-4 py-2.5 rounded-xl font-extrabold transition shadow-md flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t('markCompleted')}
                      </button>
                    )}

                    {(b.status === 'COMPLETED' || b.status === 'PAID' || b.status === 'REVIEWED') && (
                      <span className="text-xs font-black text-sky-800 bg-sky-50 px-3 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-sky-600" /> {t('completedSuccess')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Welfare & Insurance Passbook Ledger */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-sky-600" /> {t('welfareTitle')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{t('welfareDesc')}</p>
          </div>
          <div className="bg-sky-50 text-sky-800 px-4 py-2 rounded-2xl border border-sky-200 font-black text-sm">
            Total Fund: ₹{totalWelfareFund}
          </div>
        </div>

        {/* Ledger table */}
        <div className="space-y-2.5">
          {welfareLedger.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No welfare transactions recorded yet.</p>
          ) : (
            welfareLedger.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white transition text-xs"
              >
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900">{item.worker_name}</span>
                  <span className="text-[11px] text-slate-500 ml-2">({item.society_name})</span>
                  <p className="text-slate-500">{item.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`font-black text-sm ${item.amount > 0 ? 'text-sky-700' : 'text-rose-600'}`}>
                    {item.amount > 0 ? `+₹${item.amount}` : `-₹${Math.abs(item.amount)}`}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium">{item.created_at}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
