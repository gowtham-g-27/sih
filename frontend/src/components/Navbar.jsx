import React from 'react';
import { 
  HeartHandshake, Briefcase, Users, ShieldCheck, 
  LogOut, Globe, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { currentUser, logoutUser, language, setLanguage, t } = useAuth();

  return (
    <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100/80 text-slate-800 shadow-xs">
      {/* Top subtle sky accent line */}
      <div className="h-0.5 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-400 w-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2 rounded-xl text-white shadow-sm shadow-sky-500/20 flex items-center justify-center transform hover:scale-105 transition">
            <HeartHandshake className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 leading-tight">
                {t('appName')}
              </h1>
              <span className="hidden sm:inline-flex text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200/80 items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-sky-600" /> {t('platformBadge')}
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium leading-tight">
              {t('federationSub')}
            </p>
          </div>
        </div>

        {/* Right Navigation & Controls */}
        <div className="flex items-center gap-3">
          
          {/* Multilingual Selector Toggle */}
          <div className="flex items-center bg-slate-50 hover:bg-sky-50 px-2.5 py-1.5 rounded-xl border border-slate-200/70 hover:border-sky-200 text-xs transition">
            <Globe className="w-3.5 h-3.5 text-sky-600 mr-1.5" />
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="font-bold text-slate-700 hover:text-sky-800 flex items-center gap-1 transition"
              title="Switch Language / भाषा बदलें"
            >
              <span className={language === 'en' ? 'text-sky-700 font-black' : 'text-slate-400'}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={language === 'hi' ? 'text-sky-700 font-black' : 'text-slate-400'}>हिन्दी</span>
            </button>
          </div>

          {/* Conditional Portals or Auth CTA Button */}
          {currentUser ? (
            <>
              {/* Role Navigation Portal Switcher */}
              <div className="flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 shadow-inner">
                {currentUser?.role === 'CUSTOMER' && (
                  <button
                    onClick={() => setActiveTab('customer')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === 'customer'
                        ? 'bg-white text-sky-800 shadow-xs border border-sky-200/60'
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5 text-sky-600" /> {t('customerPortal')}
                  </button>
                )}

                {currentUser?.role === 'WORKER' && (
                  <button
                    onClick={() => setActiveTab('worker')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === 'worker'
                        ? 'bg-white text-sky-800 shadow-xs border border-sky-200/60'
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5 text-sky-600" /> {t('workerPortal')}
                  </button>
                )}

                {currentUser?.role === 'FEDERATION_ADMIN' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                      activeTab === 'admin'
                        ? 'bg-white text-sky-800 shadow-xs border border-sky-200/60'
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" /> {t('adminPortal')}
                  </button>
                )}
              </div>

              {/* User Profile Info & Logout */}
              <div className="flex items-center gap-2.5 bg-sky-50/80 pl-3 pr-1.5 py-1 rounded-xl border border-sky-200/60 shadow-xs">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 tracking-tight leading-tight">{currentUser?.name}</p>
                  <span className="text-[10px] text-sky-600 font-bold uppercase tracking-wider block">
                    {currentUser?.role?.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={logoutUser}
                  title={t('logout')}
                  className="bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-all duration-200 border border-slate-200/80 hover:border-rose-200 shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              {/* Primary Sign In / Register CTA */}
              <button
                onClick={onOpenAuth}
                className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-sm shadow-sky-500/20 transition-all transform hover:scale-[1.02]"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{t('signInRegister')}</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

