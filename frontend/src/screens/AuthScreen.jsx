import React, { useState } from 'react';
import { 
  HeartHandshake, ShieldCheck, Key, UserPlus, 
  Globe, CheckCircle2, UserCheck, Briefcase, Users, Lock, Phone, Mail, Award, Building2, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen({ onLogin, onRegister, loading, isModal = false, onClose }) {
  const { language, setLanguage, t } = useAuth();

  const [authMode, setAuthMode] = useState('login');
  const [identifier, setIdentifier] = useState('vikram@gmail.com');
  const [password, setPassword] = useState('Password@123');
  const [regName, setRegName] = useState('');
  const [regRole, setRegRole] = useState('CUSTOMER');
  const [regSocietyId, setRegSocietyId] = useState('1');
  const [regSkill, setRegSkill] = useState('Electrical');
  const [regCert, setRegCert] = useState('Govt. Skill India NSDC Level 4, ITI Certified');

  // Quick Demo account switcher helper
  const selectDemoAccount = (role) => {
    if (role === 'CUSTOMER') {
      setIdentifier('vikram@gmail.com');
      setPassword('Password@123');
    } else if (role === 'WORKER') {
      setIdentifier('ramesh@sahakarseva.coop');
      setPassword('Password@123');
    } else if (role === 'ADMIN') {
      setIdentifier('admin@sahakarseva.coop');
      setPassword('Password@123');
    }
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    onLogin(identifier, password);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    onRegister({ 
      identifier, 
      password, 
      name: regName, 
      role: regRole,
      society_id: parseInt(regSocietyId),
      skills: regSkill,
      certifications: regCert
    });
  };

  const containerClasses = isModal
    ? "fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    : "min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100/70 flex items-center justify-center p-4 sm:p-6 text-slate-800";

  return (
    <div className={containerClasses} onClick={isModal ? (e) => e.target === e.currentTarget && onClose && onClose() : undefined}>
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden border border-sky-100 relative max-h-[92vh]">
        
        {/* Close Button for Modal */}
        {isModal && onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-md transition border border-slate-200"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        {/* Left Brand Showcase Banner */}
        <div className="bg-gradient-to-br from-sky-600 via-blue-700 to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border border-white/30 backdrop-blur-md">
                <HeartHandshake className="w-8 h-8 text-white" />
              </div>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                className="bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl text-xs font-bold border border-white/25 flex items-center gap-1.5 transition"
              >
                <Globe className="w-3.5 h-3.5 text-sky-200" />
                <span>{language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}</span>
              </button>
            </div>

            <div>
              <h1 className="text-3xl font-black tracking-tight">{t('appName')}</h1>
              <p className="text-xs text-sky-200 font-bold uppercase tracking-wider mt-1">
                {t('appTagline')}
              </p>
            </div>

            <p className="text-xs text-sky-100 leading-relaxed pt-2">
              Empowering 50,000+ certified cooperative artisans, technicians, and caregivers through cooperative governance, verified credentials, and 5% health welfare security.
            </p>
          </div>

          {/* Quick Demo Credentials Bar */}
          <div className="pt-6 relative z-10 space-y-2">
            <span className="text-[10px] font-black uppercase text-sky-200 tracking-wider block">
              ⚡ 1-Click Demo Persona Login
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => selectDemoAccount('CUSTOMER')}
                className="bg-white/15 hover:bg-white/25 p-2 rounded-xl text-[11px] font-bold text-center border border-white/20 transition"
              >
                👤 Customer
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('WORKER')}
                className="bg-white/15 hover:bg-white/25 p-2 rounded-xl text-[11px] font-bold text-center border border-white/20 transition"
              >
                👷 Worker
              </button>
              <button
                type="button"
                onClick={() => selectDemoAccount('ADMIN')}
                className="bg-white/15 hover:bg-white/25 p-2 rounded-xl text-[11px] font-bold text-center border border-white/20 transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        </div>

        {/* Right Authentication Form */}
        <div className="p-8 sm:p-10 space-y-5 flex flex-col justify-center max-h-[85vh] overflow-y-auto">
          
          {/* Mode Switcher Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                authMode === 'login'
                  ? 'bg-white text-sky-900 shadow-md border border-sky-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition ${
                authMode === 'register'
                  ? 'bg-white text-sky-900 shadow-md border border-sky-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t('register')}
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  {t('identifierLabel')}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="vikram@gmail.com or 9998887776"
                    className="w-full border border-slate-300 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  {t('passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-slate-300 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-4" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold py-4 rounded-2xl transition shadow-lg shadow-sky-500/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Key className="w-4 h-4" /> {loading ? 'Signing In...' : t('signInBtn')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ramesh Kumar"
                  className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  {t('identifierLabel')}
                </label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ramesh@sahakarseva.coop or 9876543210"
                  className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  {t('passwordLabel')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  {t('roleLabel')}
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-3 text-xs font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                >
                  <option value="CUSTOMER">{t('roleCustomer')}</option>
                  <option value="WORKER">{t('roleWorker')}</option>
                  <option value="FEDERATION_ADMIN">{t('roleAdmin')}</option>
                </select>
              </div>

              {regRole === 'WORKER' && (
                <>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      {t('societyLabel')}
                    </label>
                    <select
                      value={regSocietyId}
                      onChange={(e) => setRegSocietyId(e.target.value)}
                      className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    >
                      <option value="1">Delhi Skilled Artisans & Technicians (DL/SOC/2023/881)</option>
                      <option value="2">Capital Domestic & Care Services (DL/SOC/2024/1042)</option>
                      <option value="3">NCR Community Builders & Painters (DL/SOC/2024/1108)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      {t('skillLabel')}
                    </label>
                    <input
                      type="text"
                      value={regSkill}
                      onChange={(e) => setRegSkill(e.target.value)}
                      placeholder="e.g. Electrical, Plumbing, Carpentry"
                      className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      {t('certLabel')}
                    </label>
                    <input
                      type="text"
                      value={regCert}
                      onChange={(e) => setRegCert(e.target.value)}
                      placeholder="e.g. Skill India NSDC Level 4, ITI Certified"
                      className="w-full border border-slate-300 rounded-2xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-2xl transition shadow-lg shadow-sky-500/20 text-xs flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <UserPlus className="w-4 h-4" /> {loading ? 'Creating Account...' : t('createAccount')}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
