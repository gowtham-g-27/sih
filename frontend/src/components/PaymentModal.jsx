import React, { useState } from 'react';
import { 
  CreditCard, QrCode, Building2, CheckCircle2, ShieldCheck, 
  DollarSign, HeartHandshake, Printer, X, Download, FileText, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PaymentModal({ booking, onClose, onProcessPayment }) {
  const { t } = useAuth();
  const [method, setMethod] = useState('UPI_QR');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState(null);

  if (!booking) return null;

  const baseWage = booking.amount - (booking.welfare_fee || Math.round(booking.amount * 0.05));
  const welfareAmount = booking.welfare_fee || Math.round(booking.amount * 0.05);

  const handlePay = async () => {
    setIsProcessing(true);
    const receipt = await onProcessPayment(booking.id, method);
    setIsProcessing(false);
    if (receipt) {
      setCompletedReceipt(receipt);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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

        {!completedReceipt ? (
          <>
            {/* Payment Header */}
            <div className="space-y-1">
              <div className="bg-sky-100 text-sky-700 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-xs">
                <CreditCard className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900">{t('digitalPaymentTitle')}</h3>
              <p className="text-xs text-slate-500">
                Service: <strong className="text-slate-800">{booking.service_name}</strong> • Booking #{booking.id}
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-600">Select Digital Payment Channel</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMethod('UPI_QR')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                    method === 'UPI_QR'
                      ? 'border-sky-500 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-sky-600" />
                  <span>UPI QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('NETBANKING')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                    method === 'NETBANKING'
                      ? 'border-sky-500 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Building2 className="w-5 h-5 text-sky-600" />
                  <span>NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARD')}
                  className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 ${
                    method === 'CARD'
                      ? 'border-sky-500 bg-sky-50/80 text-sky-950 ring-2 ring-sky-500/20 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-sky-600" />
                  <span>Debit / Card</span>
                </button>
              </div>
            </div>

            {/* Method Visual Display */}
            {method === 'UPI_QR' && (
              <div className="p-4 bg-sky-50/50 rounded-2xl border border-sky-100 text-center space-y-2">
                <div className="w-32 h-32 bg-white p-2 mx-auto rounded-xl border border-sky-200 shadow-sm flex items-center justify-center">
                  {/* Simulated QR Code Canvas */}
                  <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-white p-2">
                    <QrCode className="w-14 h-14 text-sky-400" />
                    <span className="text-[8px] font-mono mt-1 text-sky-200">UPI: sahakar@upi</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Scan with Google Pay, PhonePe, Paytm or BHIM</p>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Standard Fair Wage to Worker:</span>
                <span className="font-bold text-slate-900">₹{baseWage}</span>
              </div>
              <div className="flex justify-between text-sky-700 font-semibold">
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5" /> 5% Worker Health & Insurance Fund:
                </span>
                <span className="font-bold">+₹{welfareAmount}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-sky-200/80 text-sm font-black text-slate-900">
                <span>Total Amount Payable:</span>
                <span className="text-sky-800 text-base">₹{booking.amount}</span>
              </div>
            </div>

            {/* Pay Submit Button */}
            <button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-black py-4 rounded-2xl transition shadow-lg shadow-sky-600/20 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isProcessing ? 'Processing Digital Payment...' : `${t('confirmPayment')} (₹${booking.amount})`}
            </button>
          </>
        ) : (
          /* Official Digital Invoice Receipt View */
          <div className="space-y-5 animate-in fade-in">
            <div className="text-center space-y-1">
              <div className="bg-sky-100 text-sky-700 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-7 h-7 text-sky-600" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Payment Successful!</h3>
              <p className="text-xs text-sky-700 font-semibold">{completedReceipt.message}</p>
            </div>

            {/* Printable Invoice Card */}
            <div className="bg-sky-50/50 p-5 rounded-2xl border border-sky-100 text-xs space-y-3 font-sans">
              <div className="flex justify-between items-start border-b border-sky-100 pb-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm">{t('appName')}</h4>
                  <p className="text-[10px] text-slate-500">Cooperative Federation Reg #DL/FED/2026/01</p>
                </div>
                <span className="bg-sky-100 text-sky-800 text-[10px] font-black px-2 py-0.5 rounded border border-sky-200">PAID</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-slate-900">{completedReceipt.transaction_ref}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span className="font-bold text-slate-900">{booking.service_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assigned Worker:</span>
                  <span className="font-bold text-slate-900">{booking.worker_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Channel:</span>
                  <span className="font-bold text-slate-900">{completedReceipt.payment_method}</span>
                </div>
                <div className="flex justify-between text-sky-700">
                  <span>Worker Welfare Deduction:</span>
                  <span className="font-bold">₹{completedReceipt.welfare_fee}</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-sky-100">
                  <span>Grand Total:</span>
                  <span className="text-sky-800">₹{completedReceipt.amount}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-800 py-3.5 rounded-2xl font-extrabold text-xs transition flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> {t('printInvoice')}
              </button>
              <button
                onClick={onClose}
                className="w-1/2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white py-3.5 rounded-2xl font-extrabold text-xs transition shadow-md"
              >
                Done
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
