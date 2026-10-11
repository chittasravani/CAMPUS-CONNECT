import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import FormInput from '../../components/ui/FormInput';
import { Layers, Eye, EyeOff, Sparkles, GraduationCap, CalendarCheck, Shield } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: 'alex.rivera@campus.edu',
    password: 'password123',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Quick fill helper for evaluators
  const fillCredentials = (email, roleName) => {
    setFormData({
      email,
      password: roleName === 'Admin' ? 'Admin@Campus2026!' : 'password123',
    });
    setErrors({});
    showToast(`Filled credentials for ${roleName}`, 'info', 1500);
  };

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) {
      errs.email = 'College email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(formData);
      showToast(`Welcome back, ${user.name}!`, 'success');
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'organizer') {
        navigate('/organizer/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      showToast(err.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
              Campus<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your registrations, passes, or event manager workspace.
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>One-Click Demo Fill:</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('alex.rivera@campus.edu', 'Student')}
              className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <GraduationCap className="w-3 h-3 text-brand-600" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('robert.chen@campus.edu', 'Organizer')}
              className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <CalendarCheck className="w-3 h-3 text-brand-600" />
              <span>Organizer</span>
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('admin@campus.edu', 'Admin')}
              className="px-2 py-1.5 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 transition-colors flex items-center justify-center gap-1 shadow-xs"
            >
              <Shield className="w-3 h-3 text-brand-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="College Email Address"
            id="login-email"
            type="email"
            required
            placeholder="you@campus.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />

          <div className="relative">
            <FormInput
              label="Password"
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-9 text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600" />
              <span>Remember me</span>
            </label>
            <Link
              to="/forgot-password"
              className="font-semibold text-brand-600 hover:text-brand-800"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Don't have a student account? </span>
          <Link to="/register" className="font-bold text-brand-600 hover:text-brand-800">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
