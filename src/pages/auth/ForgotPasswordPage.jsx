import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../contexts/ToastContext';
import FormInput from '../../components/ui/FormInput';
import { Layers, ArrowLeft, MailCheck, Info } from 'lucide-react';

export function ForgotPasswordPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('alex.rivera@campus.edu');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tokenInfo, setTokenInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setSubmitted(true);
      setTokenInfo(res.resetToken);
      showToast(res.message, 'info');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
              Campus<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Reset Password</h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter your college email address to receive password recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs space-y-2">
              <div className="font-bold flex items-center gap-1.5 text-sm text-emerald-800">
                <MailCheck className="w-5 h-5 text-emerald-600" />
                <span>Reset Simulation Dispatched</span>
              </div>
              <p>
                In a connected production system, an automated password reset email with a signed token would be sent to <strong>{email}</strong>.
              </p>
            </div>

            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900 space-y-2">
              <div className="font-semibold flex items-center gap-1">
                <Info className="w-4 h-4 text-brand-600" />
                <span>Demo Reset Link Ready:</span>
              </div>
              <Link
                to={`/reset-password?token=${tokenInfo}&email=${encodeURIComponent(email)}`}
                className="w-full inline-block text-center py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-semibold text-xs transition-colors"
              >
                Proceed to Reset Password Screen →
              </Link>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="College Email Address"
              id="forgot-email"
              type="email"
              required
              placeholder="you@campus.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending Recovery Link...' : 'Send Reset Link'}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
