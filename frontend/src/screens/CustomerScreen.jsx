import React, { useState } from 'react';
import { 
  Zap, Calendar, MapPin, ShieldCheck, DollarSign, HeartHandshake, 
  Sparkles, Star, AlertTriangle, Briefcase, FileText, CheckCircle2, 
  Clock, ArrowRight, UserCheck, Wrench, Droplets, Hammer, Heart, Sparkle, Car,
  Radio, CreditCard, Award, Eye, Flame, ShieldAlert, ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GeoMapRadar from '../components/GeoMapRadar';
import WorkerProfileModal from '../components/WorkerProfileModal';
import PhonePodiumMockup from '../components/PhonePodiumMockup';
import CategoryExplorerStage from '../components/CategoryExplorerStage';
import WorkflowJourneyRoadmap from '../components/WorkflowJourneyRoadmap';

const categoryIcons = {
  Electrical: <Zap className="w-5 h-5 text-amber-500" />,
  Plumbing: <Droplets className="w-5 h-5 text-blue-500" />,
  Carpentry: <Hammer className="w-5 h-5 text-amber-700" />,
  Painting: <Sparkles className="w-5 h-5 text-purple-500" />,
  'Domestic Help': <HeartHandshake className="w-5 h-5 text-teal-600" />,
  Caregiving: <Heart className="w-5 h-5 text-rose-500" />,
  Gardening: <Sparkle className="w-5 h-5 text-emerald-600" />,
  Cleaning: <Sparkle className="w-5 h-5 text-cyan-600" />,
  Driving: <Car className="w-5 h-5 text-indigo-500" />,
  'Appliance Technician': <Wrench className="w-5 h-5 text-orange-500" />
};

export default function CustomerScreen({
  services,
  workers,
  bookings,
  onCreateBooking,
  onOpenReviewModal,
  onOpenPaymentModal,
  onRequireAuth,
  loading
}) {
  const { currentUser, isAuthenticated, t } = useAuth();

  // Booking Form State
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [bookingLat, setBookingLat] = useState('28.6139');
  const [bookingLng, setBookingLng] = useState('77.2090');
  const [scheduledAt, setScheduledAt] = useState('2026-03-05 10:00');
  const [isEmergency, setIsEmergency] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('ALL');
  const [showRadar, setShowRadar] = useState(true);
  const [inspectingWorker, setInspectingWorker] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleSubmitBooking = (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    if (!selectedServiceId) {
      alert('Please choose a cooperative service first');
      return;
    }
    onCreateBooking({
      service_id: selectedServiceId,
      lat: parseFloat(bookingLat),
      lng: parseFloat(bookingLng),
      scheduled_at: isEmergency ? 'IMMEDIATE EMERGENCY SOS' : scheduledAt,
      is_emergency: isEmergency
    });
  };

  const handleBookDirectWorker = (worker) => {
    if (!isAuthenticated) {
      if (onRequireAuth) onRequireAuth();
      return;
    }
    const matchedService = services.find(s => worker.skills.includes(s.category)) || services[0];
    if (matchedService) {
      setSelectedServiceId(matchedService.id.toString());
      onCreateBooking({
        service_id: matchedService.id,
        lat: parseFloat(bookingLat),
        lng: parseFloat(bookingLng),
        scheduled_at: isEmergency ? 'IMMEDIATE EMERGENCY SOS' : scheduledAt,
        is_emergency: isEmergency
      });
    }
  };

  const handleCategoryStageSelect = (categoryName) => {
    const matchedService = services.find(s => s.category === categoryName) || services[0];
    if (matchedService) {
      setSelectedServiceId(matchedService.id.toString());
      // Scroll smoothly to booking section
      const bookElem = document.getElementById('booking-section');
      if (bookElem) {
        bookElem.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const filteredServices = selectedCategoryFilter === 'ALL'
    ? services
    : services.filter(s => s.category === selectedCategoryFilter);

  const categories = ['ALL', ...new Set(services.map(s => s.category))];

  return (
    <div className="space-y-12 animate-in fade-in duration-300">
      
      {/* Worker Profile Credential Inspector Modal */}
      <WorkerProfileModal
        worker={inspectingWorker}
        onClose={() => setInspectingWorker(null)}
        onBookDirect={handleBookDirectWorker}
      />

      {/* OkayGo Gig-v2 Inspired Hero Header in Light Blue & White */}
      <section className="relative overflow-hidden rounded-[36px] bg-gradient-to-b from-sky-50/90 via-white to-blue-50/60 p-8 sm:p-14 text-slate-900 border border-sky-200/80 shadow-xl shadow-sky-500/5">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 bg-sky-100/90 text-sky-800 px-4 py-1.5 rounded-full border border-sky-300 text-xs font-black tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping"></span>
            Cooperative Labour Service Marketplace • Delhi NCR
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
            Verified Skilled Tasks. <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">Fair Wages Near You.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect directly with police-verified, Skill India certified artisans from registered Labour Cooperative Societies. Zero commission cuts, transparent standardized rates, and 5% health welfare security.
          </p>

          {/* Dual Action CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <a 
              href="#booking-section"
              className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black px-8 py-4 rounded-full transition shadow-xl shadow-sky-500/25 text-sm flex items-center gap-2 transform hover:-translate-y-0.5"
            >
              Book a Verified Worker <ArrowRight className="w-4 h-4" />
            </a>

            <button
              type="button"
              onClick={() => setIsEmergency(!isEmergency)}
              className={`px-8 py-4 rounded-full text-sm font-black transition-all flex items-center gap-2 border shadow-md ${
                isEmergency
                  ? 'bg-rose-600 border-rose-400 text-white scale-105 ring-4 ring-rose-500/30 animate-pulse'
                  : 'bg-white border-2 border-sky-200 text-slate-800 hover:bg-sky-50 hover:border-sky-300'
              }`}
            >
              <Zap className={`w-4 h-4 ${isEmergency ? 'text-amber-300 fill-amber-300' : 'text-amber-500'}`} />
              {isEmergency ? '🚨 SOS EMERGENCY ACTIVE' : '⚡ 15-Min SOS Emergency Mode'}
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            100% Police Clearance Verified • 5% Health Pool Protected • Backed by Labour Cooperative Federations
          </p>
        </div>
      </section>

      {/* OkayGo Gig-v2 Phone Podium Mockup Stage with 6 Benefit Nodes */}
      <PhonePodiumMockup
        services={services}
        workers={workers}
        onSelectCategory={handleCategoryStageSelect}
      />

      {/* OkayGo Gig-v2 Category Explorer Stage */}
      <CategoryExplorerStage
        onSelectCategoryForBooking={handleCategoryStageSelect}
      />

      {/* OkayGo Gig-v2 4-Step Journey Roadmap */}
      <WorkflowJourneyRoadmap />

      {/* Booking Form & Service Discovery Section */}
      <div id="booking-section" className="space-y-6 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Book Verified Cooperative Service</h2>
            <p className="text-xs text-slate-500">Auto-match with the nearest certified artisan based on real-time geo-spatial score</p>
          </div>
          {isEmergency && (
            <span className="bg-rose-600 text-white text-xs px-3.5 py-1.5 rounded-full font-black uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-md">
              <AlertTriangle className="w-4 h-4" /> SOS Priority Dispatch
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Booking Form Card */}
          <div className={`p-6 sm:p-8 rounded-3xl shadow-lg border space-y-5 transition-all ${
            isEmergency 
              ? 'bg-gradient-to-b from-rose-50/70 to-white border-rose-300 ring-2 ring-rose-200' 
              : 'bg-white border-sky-100 shadow-sky-500/5'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className={`w-5 h-5 ${isEmergency ? 'text-rose-600' : 'text-sky-600'}`} />
                {isEmergency ? '🚨 SOS Emergency Booking' : t('bookService')}
              </h3>
              {isEmergency && (
                <span className="text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-200">
                  Sub-15 min dispatch
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitBooking} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  {t('service')}
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-3.5 text-sm font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50 focus:bg-white transition"
                  required
                >
                  <option value="">{t('chooseService')}</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.category}: {s.name} (₹{s.base_rate} {s.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    {t('yourLat')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingLat}
                      onChange={(e) => setBookingLat(e.target.value)}
                      className="w-full border border-slate-300 rounded-2xl p-3 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    {t('yourLng')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingLng}
                      onChange={(e) => setBookingLng(e.target.value)}
                      className="w-full border border-slate-300 rounded-2xl p-3 text-xs font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    />
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>
              </div>

              {!isEmergency && (
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                    {t('scheduleTime')}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full border border-slate-300 rounded-2xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-slate-50"
                    />
                    <Clock className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center gap-2 text-sm ${
                  isEmergency
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                    : 'bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-sky-600/20'
                } disabled:opacity-50`}
              >
                <Zap className="w-5 h-5 fill-current" />
                {isEmergency ? t('emergencyBookBtn') : t('autoMatchBtn')}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-xs text-slate-500 leading-normal">
              <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
              <span>Matched using certified skills, police records, proximity, and 5% health welfare contribution.</span>
            </div>
          </div>

          {/* 10+ Service Categories Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-sky-600" /> {t('serviceCatalog')}
                </h3>
                
                {/* Category Pills */}
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategoryFilter(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        selectedCategoryFilter === cat
                          ? 'bg-sky-600 text-white shadow-sm'
                          : 'bg-sky-50/80 text-slate-600 hover:bg-sky-100 hover:text-sky-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {filteredServices.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setSelectedServiceId(s.id.toString())}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-start ${
                      selectedServiceId === s.id.toString()
                        ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500/20'
                        : 'border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-sky-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-100">
                          {categoryIcons[s.category] || <Briefcase className="w-4 h-4 text-sky-600" />}
                        </div>
                        <span className="text-[11px] font-black text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                          {s.category}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{s.name}</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Standard Wage Rate</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-sky-800">₹{s.base_rate}</span>
                      <p className="text-[10px] text-slate-400 font-semibold">{s.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Geo-Spatial Map Radar & Nearby Verified Workers */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-600" /> {t('nearbyWorkers')}
            </h3>
            <p className="text-xs text-slate-500">Live verified workers ranked by 5-factor geo-spatial match score</p>
          </div>
          <button
            type="button"
            onClick={() => setShowRadar(!showRadar)}
            className="text-xs font-extrabold text-sky-800 bg-sky-50 hover:bg-sky-100 px-3.5 py-1.5 rounded-xl border border-sky-200 flex items-center gap-1.5 transition"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>{showRadar ? 'Hide Map Radar' : 'View Live Map Radar'}</span>
          </button>
        </div>

        {/* GeoMapRadar Component */}
        {showRadar && (
          <GeoMapRadar
            workers={workers}
            customerLat={parseFloat(bookingLat)}
            customerLng={parseFloat(bookingLng)}
            onSelectWorker={(w) => setInspectingWorker(w)}
          />
        )}

        {/* Worker Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map((w) => (
            <div
              key={w.id}
              className="p-5 rounded-3xl border border-sky-100 bg-white hover:border-sky-300 transition-all space-y-3.5 shadow-sm hover:shadow-md"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 bg-gradient-to-br from-sky-600 to-blue-700 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                    {w.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-sm">{w.name}</h4>
                      <span className="text-amber-500 text-xs font-black">★ {w.rating || '4.8'}</span>
                    </div>
                    <p className="text-xs text-slate-500">{w.society_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 border border-sky-200">
                        <ShieldCheck className="w-3 h-3 text-sky-600" /> Police Verified
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {w.experience_years} yrs exp
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-sky-100 text-sky-800 text-xs px-2.5 py-1 rounded-full font-black border border-sky-200">
                    {w.match_score || 95}% Match
                  </span>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    {w.distance_km ? `${w.distance_km} km away` : 'Nearby'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                  <span className="line-clamp-1 font-medium">{w.certifications || 'Govt. Skill India NSDC Certified'}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setInspectingWorker(w)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" /> {t('viewProfile')}
                </button>
                <button
                  type="button"
                  onClick={() => handleBookDirectWorker(w)}
                  className="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-2.5 rounded-xl font-extrabold text-xs transition shadow-sm"
                >
                  Book Worker
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Bookings & Full Service History */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sky-100 shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-600" /> {t('myBookings')}
          </h3>
          <span className="text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            {bookings.length} Total Bookings
          </span>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-sky-50/90 via-blue-50/50 to-white border border-sky-200 text-center space-y-3.5 shadow-xs">
            <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center mx-auto shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-extrabold text-slate-900">{t('guestNoticeTitle')}</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
                {t('guestBookingsPrompt')}
              </p>
            </div>
            <button
              type="button"
              onClick={onRequireAuth}
              className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black px-6 py-3 rounded-2xl text-xs shadow-md shadow-sky-500/20 transition-all transform hover:scale-105"
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('signInRegister')}</span>
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium">{t('noBookings')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] text-slate-400 uppercase tracking-wider font-extrabold">
                  <th className="pb-3.5">ID</th>
                  <th className="pb-3.5">{t('service')}</th>
                  <th className="pb-3.5">{t('assignedWorker')}</th>
                  <th className="pb-3.5">{t('status')}</th>
                  <th className="pb-3.5">{t('scheduled')}</th>
                  <th className="pb-3.5 text-right">{t('amount')} / {t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-4 font-black text-slate-800">
                      #{b.id}
                      {b.is_emergency === 1 && (
                        <span className="ml-1 text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-black">SOS</span>
                      )}
                    </td>
                    <td className="py-4 font-extrabold text-slate-900">{b.service_name}</td>
                    <td className="py-4 text-sky-800 font-bold">
                      {b.worker_name ? (
                        <span className="flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-sky-600" /> {b.worker_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Pending Assignment</span>
                      )}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-extrabold inline-flex items-center gap-1.5 ${
                          b.status === 'PAID' || b.status === 'REVIEWED'
                            ? 'bg-sky-100 text-sky-800 border border-sky-200'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : b.status === 'ACCEPTED'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : b.status === 'ON_THE_WAY'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-4 text-slate-500 text-xs font-medium">{b.scheduled_at}</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-black text-slate-900 text-base">₹{b.amount}</span>
                        
                        {/* Digital Payment Button if Completed */}
                        {b.status === 'COMPLETED' && (
                          <button
                            onClick={() => onOpenPaymentModal(b)}
                            className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-3 py-1.5 rounded-xl font-extrabold transition shadow-sm flex items-center gap-1"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> {t('payNow')}
                          </button>
                        )}

                        {/* Digital Invoice Receipt */}
                        {(b.status === 'PAID' || b.status === 'REVIEWED' || b.status === 'COMPLETED') && (
                          <button
                            onClick={() => setSelectedInvoice(b)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                            title="View Digital Invoice"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                          </button>
                        )}

                        {/* Rate / Review Button */}
                        {(b.status === 'PAID' || b.status === 'COMPLETED') && (
                          <button
                            onClick={() => onOpenReviewModal(b.id)}
                            className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-xl font-black transition shadow-sm flex items-center gap-1"
                          >
                            <Star className="w-3.5 h-3.5 fill-white" /> {t('rateReview')}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 border border-sky-100">
            <div className="flex justify-between items-start border-b border-sky-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                  Official Cooperative Digital Receipt
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Invoice #{selectedInvoice.id}</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Service Category:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.service_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Assigned Cooperative Worker:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.worker_name || 'Assigned'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Scheduled Date:</span>
                <span className="font-bold text-slate-900">{selectedInvoice.scheduled_at}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Standard Base Wage to Worker:</span>
                <span className="font-bold text-slate-900">₹{selectedInvoice.amount - (selectedInvoice.welfare_fee || Math.round(selectedInvoice.amount * 0.05))}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-sky-700">
                <span className="font-semibold">5% Worker Health & Welfare Contribution:</span>
                <span className="font-bold">+₹{selectedInvoice.welfare_fee || Math.round(selectedInvoice.amount * 0.05)}</span>
              </div>
              <div className="flex justify-between py-2.5 text-sm font-black text-slate-900 border-t-2 border-sky-100">
                <span>Total Amount:</span>
                <span className="text-sky-700 text-base">₹{selectedInvoice.amount}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-extrabold py-3.5 rounded-2xl transition text-sm shadow-md"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
