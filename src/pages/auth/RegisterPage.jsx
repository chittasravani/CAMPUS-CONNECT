import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import FormInput from '../../components/ui/FormInput';
import { Layers, Eye, EyeOff, CheckCircle } from 'lucide-react';

export function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: 'Computer Science & Engineering',
    year: '1st Year',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'College email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Please enter a valid email format';
    }
    if (!formData.studentId.trim()) errs.studentId = 'Student ID / Roll number is required';
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await register(formData);
      showToast(`Account created successfully! Welcome to CampusConnect, ${user.name}.`, 'success');
      navigate('/student/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-serif">
              Campus<span className="text-brand-600">Connect</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 font-serif">Create Student Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Join the centralized platform for campus event registration & digital passes.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              id="reg-name"
              required
              placeholder="e.g. Jordan Hayes"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={errors.name}
            />

            <FormInput
              label="College Email"
              id="reg-email"
              type="email"
              required
              placeholder="jordan.h@campus.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Student ID / Roll No"
              id="reg-studentid"
              required
              placeholder="STU-2025-001"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              error={errors.studentId}
            />

            <div>
              <label htmlFor="reg-dept" className="text-sm font-semibold text-slate-700 block mb-1.5">
                Department <span className="text-rose-500">*</span>
              </label>
              <select
                id="reg-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              >
                <option value="Computer Science & Engineering">Computer Science & Eng</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Eng</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Business Administration">Business Admin (MBA)</option>
                <option value="Fine Arts & Humanities">Fine Arts & Humanities</option>
              </select>
            </div>

            <div>
              <label htmlFor="reg-year" className="text-sm font-semibold text-slate-700 block mb-1.5">
                Year of Study <span className="text-rose-500">*</span>
              </label>
              <select
                id="reg-year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year (Sophomore)</option>
                <option value="3rd Year">3rd Year (Junior)</option>
                <option value="4th Year">4th Year (Senior)</option>
                <option value="Graduate">Postgraduate / Masters</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <FormInput
                label="Password"
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="At least 6 characters"
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

            <FormInput
              label="Confirm Password"
              id="reg-confirm-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Re-type password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={errors.confirmPassword}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating Student Profile...' : 'Create Account & Continue'}
            </button>
          </div>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link to="/login" className="font-bold text-brand-600 hover:text-brand-800">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
