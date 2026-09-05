import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import BookingModal from './components/BookingModal';
import ReviewModal from './components/ReviewModal';
import PaymentModal from './components/PaymentModal';
import CustomerScreen from './screens/CustomerScreen';
import WorkerScreen from './screens/WorkerScreen';
import AdminScreen from './screens/AdminScreen';
import AuthScreen from './screens/AuthScreen';
import { CheckCircle2, AlertCircle, HeartHandshake } from 'lucide-react';
import { 
  DEMO_USERS, DEMO_SERVICES, DEMO_WORKERS, 
  DEMO_SOCIETIES, DEMO_STATS, DEMO_FORECASTS 
} from './data/mockData';

const API_BASE = '/api';

function MainApp() {
  const { token, currentUser, loginUser, isAuthenticated, t } = useAuth();

  const [activeTab, setActiveTab] = useState('customer');
  const [services, setServices] = useState(DEMO_SERVICES);
  const [workers, setWorkers] = useState(DEMO_WORKERS);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(DEMO_STATS);
  const [forecasts, setForecasts] = useState(DEMO_FORECASTS);
  const [welfareLedger, setWelfareLedger] = useState([
    { id: 1, type: 'CONTRIBUTION', amount: 35, description: '5% Welfare Contribution from Booking #BK-104', created_at: new Date().toISOString() },
    { id: 2, type: 'CONTRIBUTION', amount: 45, description: '5% Welfare Contribution from Booking #BK-102', created_at: new Date(Date.now() - 86400000).toISOString() }
  ]);
  const [societies, setSocieties] = useState(DEMO_SOCIETIES);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Modals state
  const [bookedWorkerDetails, setBookedWorkerDetails] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [paymentBooking, setPaymentBooking] = useState(null);

  // Synchronize initial tab based on role
  useEffect(() => {
    if (currentUser?.role === 'FEDERATION_ADMIN') {
      setActiveTab('admin');
    } else if (currentUser?.role === 'WORKER') {
      setActiveTab('worker');
    } else {
      setActiveTab('customer');
    }
  }, [currentUser]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPublicData = async () => {
    try {
      const [srvRes, wrkRes, fedRes] = await Promise.allSettled([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/workers?lat=28.6139&lng=77.2090`),
        fetch(`${API_BASE}/federations`)
      ]);

      if (srvRes.status === 'fulfilled' && srvRes.value.ok) {
        const srvData = await srvRes.value.json();
        if (srvData && srvData.length > 0) setServices(srvData);
      }
      if (wrkRes.status === 'fulfilled' && wrkRes.value.ok) {
        const wrkData = await wrkRes.value.json();
        if (wrkData && wrkData.length > 0) setWorkers(wrkData);
      }
      if (fedRes.status === 'fulfilled' && fedRes.value.ok) {
        const fedData = await fedRes.json();
        if (fedData.societies && fedData.societies.length > 0) setSocieties(fedData.societies);
      }
    } catch (err) {
      console.log('Using pre-seeded offline demo data for marketplace');
    }
  };

  const fetchAppData = async () => {
    if (!token) {
      fetchPublicData();
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [srvRes, wrkRes, bokRes, statRes, fstRes, wlfRes, fedRes] = await Promise.allSettled([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/workers?lat=28.6139&lng=77.2090`, { headers }),
        fetch(`${API_BASE}/bookings`, { headers }),
        fetch(`${API_BASE}/admin/dashboard`, { headers }),
        fetch(`${API_BASE}/ai/forecast`, { headers }),
        fetch(`${API_BASE}/welfare`, { headers }),
        fetch(`${API_BASE}/federations`, { headers })
      ]);

      if (srvRes.status === 'fulfilled' && srvRes.value.ok) {
        const srvData = await srvRes.value.json();
        if (srvData?.length) setServices(srvData);
      }
      if (wrkRes.status === 'fulfilled' && wrkRes.value.ok) {
        const wrkData = await wrkRes.value.json();
        if (wrkData?.length) setWorkers(wrkData);
      }
      if (bokRes.status === 'fulfilled' && bokRes.value.ok) {
        const bokData = await bokRes.value.json();
        if (Array.isArray(bokData)) setBookings(bokData);
      }
      if (statRes.status === 'fulfilled' && statRes.value.ok) {
        const statData = await statRes.value.json();
        if (statData) setStats(statData);
      }
      if (fstRes.status === 'fulfilled' && fstRes.value.ok) {
        const fstData = await fstRes.value.json();
        if (fstData?.forecasts) setForecasts(fstData.forecasts);
      }
      if (wlfRes.status === 'fulfilled' && wlfRes.value.ok) {
        const wlfData = await wlfRes.value.json();
        if (Array.isArray(wlfData) && wlfData.length > 0) setWelfareLedger(wlfData);
      }
      if (fedRes.status === 'fulfilled' && fedRes.value.ok) {
        const fedData = await fedRes.value.json();
        if (fedData?.societies) setSocieties(fedData.societies);
      }
    } catch (err) {
      console.log('Using cached application state');
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppData();
      const interval = setInterval(fetchAppData, 8000);
      return () => clearInterval(interval);
    } else {
      fetchPublicData();
    }
  }, [token]);

  const handleLogin = async (identifier, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          loginUser(data.token, data.user);
          setShowAuthModal(false);
          showNotification(data.message || 'Login successful!');
          return;
        }
      }
      throw new Error('API unavailable, falling back to instant demo auth');
    } catch (err) {
      const cleanId = (identifier || '').trim().toLowerCase();
      let matchedUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === cleanId || u.phone === cleanId
      );

      if (!matchedUser) {
        if (cleanId.includes('worker') || cleanId.includes('ramesh')) {
          matchedUser = DEMO_USERS[1];
        } else if (cleanId.includes('admin') || cleanId.includes('federation')) {
          matchedUser = DEMO_USERS[2];
        } else {
          matchedUser = {
            id: Date.now(),
            name: identifier.split('@')[0] || 'Demo User',
            role: 'CUSTOMER',
            email: identifier,
            phone: '9876543210',
            token: `demo-token-${Date.now()}`
          };
        }
      }

      loginUser(matchedUser.token || 'demo-jwt-token', matchedUser);
      setShowAuthModal(false);
      showNotification(`Signed in as ${matchedUser.name} (${matchedUser.role})`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formPayload) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          loginUser(data.token, data.user);
          setShowAuthModal(false);
          showNotification(data.message || 'Registration successful!');
          return;
        }
      }
      throw new Error('Falling back to local registration');
    } catch (err) {
      const newUser = {
        id: Date.now(),
        name: formPayload.name || 'New Member',
        role: formPayload.role || 'CUSTOMER',
        email: formPayload.identifier,
        phone: formPayload.identifier,
        token: `reg-token-${Date.now()}`
      };
      loginUser(newUser.token, newUser);
      setShowAuthModal(false);
      showNotification(`Welcome to SahakarSeva, ${newUser.name}!`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async ({ service_id, scheduled_at, lat, lng, is_emergency }) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          service_id,
          scheduled_at,
          lat,
          lng,
          is_emergency: is_emergency ? 1 : 0
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          const assigned = workers.find((w) => w.id === data.assigned_worker_id) || workers[0];
          const srv = services.find((s) => s.id === parseInt(service_id)) || services[0];

          setBookedWorkerDetails({
            booking_id: data.booking_id,
            worker: assigned,
            service: srv,
            amount: data.amount,
            welfare_fee: data.welfare_fee,
            is_emergency: data.is_emergency,
            scheduled_at
          });

          showNotification(data.message);
          fetchAppData();
          return;
        }
      }
      throw new Error('Using fallback booking engine');
    } catch (err) {
      const srv = services.find((s) => s.id === parseInt(service_id)) || services[0];
      const assigned = workers[0] || DEMO_WORKERS[0];
      const baseAmount = srv ? srv.base_rate : 350;
      const totalAmount = is_emergency ? Math.round(baseAmount * 1.25) : baseAmount;
      const welfareFee = Math.round(totalAmount * 0.05);
      const newBookingId = Math.floor(100 + Math.random() * 900);

      const newBooking = {
        id: newBookingId,
        service_id: parseInt(service_id),
        service_name: srv ? srv.name : 'Service',
        service_category: srv ? srv.category : 'General',
        worker_id: assigned.id,
        worker_name: assigned.name,
        worker_phone: assigned.phone,
        worker_skills: assigned.skills,
        worker_certifications: assigned.certifications,
        worker_rating: assigned.rating,
        status: 'ACCEPTED',
        is_emergency: is_emergency ? 1 : 0,
        scheduled_at: scheduled_at || new Date().toISOString(),
        amount: totalAmount,
        welfare_fee: welfareFee,
        created_at: new Date().toISOString()
      };

      setBookings((prev) => [newBooking, ...prev]);

      setBookedWorkerDetails({
        booking_id: newBookingId,
        worker: assigned,
        service: srv,
        amount: totalAmount,
        welfare_fee: welfareFee,
        is_emergency: is_emergency ? 1 : 0,
        scheduled_at
      });

      showNotification(`Service auto-matched with ${assigned.name}!`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showNotification(data.message);
          fetchAppData();
          return;
        }
      }
      throw new Error('Local status update');
    } catch (err) {
      setBookings((prev) => 
        prev.map((b) => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      showNotification(`Milestone updated to ${newStatus.replace('_', ' ')}`);
    }
  };

  const handleUpdateAvailability = async (status) => {
    try {
      const res = await fetch(`${API_BASE}/workers/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotification('Availability updated');
        fetchAppData();
        return;
      }
      throw new Error('Local status update');
    } catch (err) {
      showNotification(`Worker status set to ${status}`);
    }
  };

  const handleProcessPayment = async (bookingId, paymentMethod) => {
    try {
      const res = await fetch(`${API_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id: bookingId,
          payment_method: paymentMethod
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showNotification(data.message);
          fetchAppData();
          return data;
        }
      }
      throw new Error('Local payment processing');
    } catch (err) {
      const target = bookings.find((b) => b.id === bookingId);
      const amount = target ? target.amount : 350;
      const welfareFee = target ? target.welfare_fee : 17.5;
      
      setBookings((prev) => 
        prev.map((b) => b.id === bookingId ? { ...b, status: 'PAID' } : b)
      );

      const paymentData = {
        success: true,
        message: 'Payment completed successfully!',
        payment: {
          id: Math.floor(1000 + Math.random() * 9000),
          booking_id: bookingId,
          amount,
          welfare_fee: welfareFee,
          payment_method: paymentMethod,
          transaction_ref: 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          status: 'SUCCESS'
        }
      };

      showNotification('Payment successful! 5% welfare fee credited to worker passbook.');
      return paymentData;
    }
  };

  const handleSubmitReview = async (booking_id, score, tags, comment) => {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          booking_id,
          score,
          tags,
          comment
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          showNotification(data.message);
          setReviewBookingId(null);
          fetchAppData();
          return;
        }
      }
      throw new Error('Local review processing');
    } catch (err) {
      setBookings((prev) => 
        prev.map((b) => b.id === booking_id ? { ...b, status: 'REVIEWED' } : b)
      );
      setReviewBookingId(null);
      showNotification('Review & 5-star rating submitted successfully!');
    }
  };

  const handleSubmitWelfareClaim = async (claimData) => {
    try {
      const res = await fetch(`${API_BASE}/welfare/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(claimData)
      });
      if (res.ok) {
        showNotification('Claim submitted to Federation Insurance Committee');
        fetchAppData();
        return;
      }
      throw new Error('Local claim submission');
    } catch (err) {
      showNotification(`Claim #${Math.floor(1000 + Math.random() * 9000)} registered with Federation`);
    }
  };

  const handleVerifyWorker = async (workerId, status) => {
    try {
      const res = await fetch(`${API_BASE}/admin/workers/${workerId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showNotification(`Worker status updated to ${status}`);
        fetchAppData();
        return;
      }
      throw new Error('Local verification');
    } catch (err) {
      setWorkers((prev) => 
        prev.map((w) => w.id === workerId ? { ...w, verification_status: status } : w)
      );
      showNotification(`Worker #${workerId} verification status set to ${status}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-white to-sky-50/30 flex flex-col text-slate-900 selection:bg-sky-200">
      {/* Sticky Top Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuth={() => setShowAuthModal(true)} 
      />

      {/* Auth Modal Overlay when requested */}
      {showAuthModal && (
        <AuthScreen 
          isModal={true} 
          onClose={() => setShowAuthModal(false)} 
          onLogin={handleLogin} 
          onRegister={handleRegister} 
          loading={loading} 
        />
      )}

      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white text-slate-900 px-5 py-3.5 rounded-2xl shadow-2xl border border-sky-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-sky-600 flex-shrink-0" />
            <span className="text-xs font-bold">{notification.msg}</span>
          </div>
        </div>
      )}

      {/* Global Modals */}
      <BookingModal
        bookingDetails={bookedWorkerDetails}
        onClose={() => setBookedWorkerDetails(null)}
      />

      <ReviewModal
        bookingId={reviewBookingId}
        onClose={() => setReviewBookingId(null)}
        onSubmit={handleSubmitReview}
      />

      <PaymentModal
        booking={paymentBooking}
        onClose={() => setPaymentBooking(null)}
        onProcessPayment={handleProcessPayment}
      />

      {/* Main Content View Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        {activeTab === 'customer' && (
          <CustomerScreen
            services={services}
            workers={workers}
            bookings={bookings}
            onCreateBooking={handleCreateBooking}
            onOpenReviewModal={(id) => setReviewBookingId(id)}
            onOpenPaymentModal={(b) => setPaymentBooking(b)}
            onRequireAuth={() => setShowAuthModal(true)}
            loading={loading}
          />
        )}

        {activeTab === 'worker' && (
          <WorkerScreen
            bookings={bookings}
            welfareLedger={welfareLedger}
            onUpdateStatus={handleUpdateBookingStatus}
            onUpdateAvailability={handleUpdateAvailability}
            onSubmitWelfareClaim={handleSubmitWelfareClaim}
          />
        )}

        {activeTab === 'admin' && (
          <AdminScreen
            stats={stats}
            forecasts={forecasts}
            workers={workers}
            societies={societies}
            onVerifyWorker={handleVerifyWorker}
          />
        )}
      </main>

      {/* Modern Civic-Tech Footer */}
      <footer className="bg-white text-slate-600 py-8 px-4 border-t border-sky-100 text-xs mt-12 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-slate-900">SahakarSeva</span>
            <span className="text-slate-500">— Cooperative Digital Service Marketplace Platform</span>
          </div>
          <p className="text-slate-400 text-[11px]">
            © 2026 SahakarSeva. Powered by Labour Cooperative Federations & Societies. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
