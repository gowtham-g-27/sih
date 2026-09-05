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

const API_BASE = '/api';

function MainApp() {
  const { token, currentUser, loginUser, isAuthenticated, t } = useAuth();

  const [activeTab, setActiveTab] = useState('customer');
  const [services, setServices] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [forecasts, setForecasts] = useState([]);
  const [welfareLedger, setWelfareLedger] = useState([]);
  const [societies, setSocieties] = useState([]);
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
      const [srvRes, wrkRes, fedRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/workers?lat=28.6139&lng=77.2090`),
        fetch(`${API_BASE}/federations`)
      ]);

      if (srvRes.ok) setServices(await srvRes.json());
      if (wrkRes.ok) setWorkers(await wrkRes.json());
      if (fedRes.ok) {
        const fedData = await fedRes.json();
        setSocieties(fedData.societies || []);
      }
    } catch (err) {
      console.error('Error fetching public marketplace data:', err);
    }
  };

  const fetchAppData = async () => {
    if (!token) {
      fetchPublicData();
      return;
    }
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [srvRes, wrkRes, bokRes, statRes, fstRes, wlfRes, fedRes] = await Promise.all([
        fetch(`${API_BASE}/services`),
        fetch(`${API_BASE}/workers?lat=28.6139&lng=77.2090`, { headers }),
        fetch(`${API_BASE}/bookings`, { headers }),
        fetch(`${API_BASE}/admin/dashboard`, { headers }),
        fetch(`${API_BASE}/ai/forecast`, { headers }),
        fetch(`${API_BASE}/welfare`, { headers }),
        fetch(`${API_BASE}/federations`, { headers })
      ]);

      if (srvRes.ok) setServices(await srvRes.json());
      if (wrkRes.ok) setWorkers(await wrkRes.json());
      if (bokRes.ok) setBookings(await bokRes.json());
      if (statRes.ok) setStats(await statRes.json());
      if (fstRes.ok) setForecasts((await fstRes.json()).forecasts || []);
      if (wlfRes.ok) setWelfareLedger(await wlfRes.json());
      if (fedRes.ok) {
        const fedData = await fedRes.json();
        setSocieties(fedData.societies || []);
      }
    } catch (err) {
      console.error('Error fetching marketplace data:', err);
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
      const data = await res.json();
      if (data.success) {
        loginUser(data.token, data.user);
        setShowAuthModal(false);
        showNotification(data.message || 'Login successful!');
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      alert('Network error during login');
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
      const data = await res.json();
      if (data.success) {
        loginUser(data.token, data.user);
        setShowAuthModal(false);
        showNotification(data.message || 'Registration successful!');
      } else {
        alert(data.error || 'Registration failed');
      }
    } catch (err) {
      alert('Network error during registration');
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
      const data = await res.json();
      if (data.success) {
        const assigned = workers.find((w) => w.id === data.assigned_worker_id) || workers[0];
        const srv = services.find((s) => s.id === parseInt(service_id));

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
      } else {
        alert(data.error || 'Failed to create booking');
      }
    } catch (err) {
      alert('Error creating service booking');
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAppData();
      }
    } catch (err) {
      alert('Error updating booking status');
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAppData();
      }
    } catch (err) {
      alert('Error updating availability');
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAppData();
        return data;
      } else {
        alert(data.error || 'Payment failed');
        return null;
      }
    } catch (err) {
      alert('Error processing digital payment');
      return null;
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        setReviewBookingId(null);
        fetchAppData();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      alert('Error submitting rating & review');
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAppData();
      } else {
        alert(data.error || 'Failed to file claim');
      }
    } catch (err) {
      alert('Error filing welfare claim');
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
      const data = await res.json();
      if (data.success) {
        showNotification(data.message);
        fetchAppData();
      }
    } catch (err) {
      alert('Error verifying worker status');
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
