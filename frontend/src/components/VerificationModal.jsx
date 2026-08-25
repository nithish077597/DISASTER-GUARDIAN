import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldAlert, Phone, KeyRound, MessageSquare, CheckCircle2, ArrowRight } from 'lucide-react';
import { authService } from '../services/authService';

export default function VerificationModal({ isOpen, onClose, targetActionName }) {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStep, setOtpStep] = useState(1);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await authService.sendMobileOtp(mobileNumber);
      setGeneratedOtp(res.generatedOtp);
      setOtpStep(2);
      setLoading(false);
    } catch {
      setLoading(false);
      setErrorMsg('Failed to send OTP.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await authService.verifyMobileOtp(mobileNumber, otpCode);
      setLoading(false);
      onClose();
      navigate('/citizen');
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || 'Invalid OTP code.');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none">
      <div className="max-w-md w-full bg-slate-900 border-2 border-red-600 rounded-3xl p-6 space-y-5 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-red-500 font-extrabold text-sm uppercase">
            <ShieldAlert className="w-5 h-5" />
            <span>AUTHENTICATION REQUIRED</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To access <strong>{targetActionName || 'Emergency Services'}</strong>, please verify your mobile number via real-time OTP.
        </p>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-600/60 text-red-400 text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {otpStep === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Generating Real-Time OTP...' : '[ GENERATE & SEND REAL-TIME OTP ]'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
            {generatedOtp && (
              <div className="p-3 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold flex items-center justify-between">
                <span>???? SMS OTP: <strong>{generatedOtp}</strong></span>
                <button
                  type="button"
                  onClick={() => setOtpCode(generatedOtp)}
                  className="px-2 py-0.5 rounded bg-cyan-600 text-white text-[10px] uppercase font-sans"
                >
                  Use Code
                </button>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-bold uppercase mb-1">Enter 6-Digit OTP Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 739201"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-mono font-black text-sm tracking-widest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying OTP...' : '[ VERIFY OTP & PROCEED ]'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
