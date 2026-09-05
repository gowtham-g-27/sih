import React, { useState } from 'react';
import { Award, HeartHandshake, ShieldCheck, FileText, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function WelfareClaimModal({ onClose, onSubmitClaim }) {
  const { t } = useAuth();
  const [claimType, setClaimType] = useState('EMERGENCY_MEDICAL');
  const [amount, setAmount] = useState('2500');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmitClaim({
      amount: parseFloat(amount),
      claim_type: claimType,
      description
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-sky-100 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="bg-sky-100 text-sky-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
            <HeartHandshake className="w-6 h-6 text-sky-600" />
          </div>
          <h3 className="text-xl font-black text-slate-900">{t('fileClaimBtn')}</h3>
          <p className="text-xs text-slate-500">
            Submit an emergency medical or accidental relief claim against your 5% cooperative welfare pool.
          </p>
        </div>

        {/* Active Policy Details */}
        <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200 space-y-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-extrabold text-sky-950 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-sky-600" /> {t('insuranceActive')}
            </span>
            <span className="text-[10px] bg-sky-200/60 text-sky-900 font-bold px-2 py-0.5 rounded">Active</span>
          </div>
          <p className="text-sky-800 text-[11px]">
            Policy #PMSBY-COOP-882194 • Valid till 31 Dec 2026 • Coverage: Up to ₹2,00,000
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Claim Category
            </label>
            <select
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              className="w-full border border-slate-300 rounded-2xl p-3.5 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
            >
              <option value="EMERGENCY_MEDICAL">🏥 Emergency Medical & Hospitalization Relief</option>
              <option value="ON_JOB_ACCIDENT">🩹 On-Job Minor Accident & Injury Reimbursement</option>
              <option value="TOOL_EQUIPMENT_GRANT">🔧 Tool & Protective Gear Replacement Grant</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Claim Amount (₹)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="2500"
              className="w-full border border-slate-300 rounded-2xl p-3.5 text-sm font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
              Incident & Diagnosis Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the medical situation or on-job incident..."
              className="w-full border border-slate-300 rounded-2xl p-3.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 h-20 resize-none"
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-xs transition"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-black text-xs transition shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting Claim...' : 'Submit Claim'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
