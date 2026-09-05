import React from 'react';
import { ShieldCheck, Phone, CheckCircle2, Sparkles, HeartHandshake, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BookingModal({ bookingDetails, onClose }) {
  const { t } = useAuth();
  if (!bookingDetails) return null;

  const { booking_id, worker, service, amount, welfare_fee, scheduled_at } = bookingDetails;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-sky-100 relative transform scale-100 transition-all">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-600/30 flex-shrink-0">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 leading-tight">
              {t('workerAssignedSuccess')}
            </h3>
            <span className="inline-block mt-0.5 text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
              {t('bookingId')}{booking_id}
            </span>
          </div>
        </div>

        {/* Worker Card Highlight */}
        <div className="bg-gradient-to-br from-white to-sky-50/60 p-5 rounded-2xl border border-sky-100 space-y-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md border-2 border-white">
              {worker?.name?.charAt(0) || 'W'}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-base">{worker?.name}</h4>
                <span className="bg-amber-50 text-amber-900 text-xs font-black px-2 py-0.5 rounded-lg flex items-center gap-1 border border-amber-300/50">
                  ★ {worker?.rating || '4.9'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">{worker?.society_name || 'Delhi Skilled Artisans Cooperative'}</p>
              
              <div className="flex items-center gap-2 mt-1.5">
                <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-sky-200">
                  <ShieldCheck className="w-3 h-3 text-sky-600" /> {t('policeVerified')}
                </span>
                <span className="bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
                  {worker?.experience_years || 5}+ yrs exp
                </span>
              </div>
            </div>
          </div>

          {/* Pricing & Wage Breakdown Grid */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/80 text-xs">
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t('service')}</span>
              <span className="font-bold text-slate-900">{service?.name}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t('matchScore')}</span>
              <span className="font-extrabold text-sky-700 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" /> {worker?.match_score || 96}% Verified
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">{t('fairWageRate')}</span>
              <span className="font-extrabold text-slate-900 text-sm">₹{amount}</span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
              <span className="text-sky-700 block font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                <HeartHandshake className="w-3 h-3 text-sky-600" /> {t('welfareContribution')}
              </span>
              <span className="font-extrabold text-sky-700 text-sm">₹{welfare_fee} (5% pool)</span>
            </div>
          </div>

          {/* Worker Contact Info */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-sky-600" />
              <span>{t('workerContact')}:</span>
            </div>
            <strong className="text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
              {worker?.phone || 'Available in app'}
            </strong>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={onClose}
          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-2xl transition shadow-lg shadow-sky-600/20 text-sm"
        >
          {t('doneViewBookings')}
        </button>
      </div>
    </div>
  );
}
