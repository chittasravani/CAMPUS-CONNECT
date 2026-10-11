import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import FormInput from '../../components/ui/FormInput';
import { User, Check, Camera, ShieldCheck, Mail, GraduationCap } from 'lucide-react';

export function ProfilePage() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentId: '',
    department: '',
    year: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        studentId: currentUser.studentId || '',
        department: currentUser.department || '',
        year: currentUser.year || '',
        phone: currentUser.phone || '',
        bio: currentUser.bio || '',
        avatar: currentUser.avatar || '',
      });
    }
  }, [currentUser]);

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          Profile Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal university details and digital pass identification info.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
              Profile Photo
            </label>
            <div className="flex flex-wrap items-center gap-4">
              <img
                src={formData.avatar || avatarOptions[0]}
                alt="Selected Avatar"
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-brand-500 shadow-sm"
              />
              <div className="space-y-2">
                <span className="text-xs text-slate-500 block">Choose an avatar preset:</span>
                <div className="flex items-center gap-2">
                  {avatarOptions.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, avatar: url })}
                      className={`relative rounded-xl overflow-hidden p-0.5 border-2 transition-all ${
                        formData.avatar === url ? 'border-brand-600 scale-105' : 'border-transparent'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx}`} className="w-9 h-9 rounded-lg object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Full Name"
              id="prof-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <FormInput
              label="College Email"
              id="prof-email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              helperText="Institutional email used for ticket dispatches"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormInput
              label="Student ID"
              id="prof-studentid"
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
            />

            <div>
              <label htmlFor="prof-dept" className="text-sm font-semibold text-slate-700 block mb-1.5">
                Department
              </label>
              <select
                id="prof-dept"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              >
                <option value="Computer Science & Engineering">Computer Science & Eng</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Mechanical Engineering">Mechanical Eng</option>
                <option value="Data Science & AI">Data Science & AI</option>
                <option value="Business Administration">Business Admin</option>
                <option value="Fine Arts & Humanities">Fine Arts & Humanities</option>
              </select>
            </div>

            <div>
              <label htmlFor="prof-year" className="text-sm font-semibold text-slate-700 block mb-1.5">
                Year of Study
              </label>
              <select
                id="prof-year"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Faculty Lead">Faculty / Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Contact Phone Number"
              id="prof-phone"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <FormInput
              label="Role Status"
              id="prof-role"
              disabled
              value={`${currentUser?.role?.toUpperCase()} ACCOUNT (Active)`}
              helperText="Managed by Campus Administration"
            />
          </div>

          <div>
            <label htmlFor="prof-bio" className="text-sm font-semibold text-slate-700 block mb-1.5">
              Bio / Interests
            </label>
            <textarea
              id="prof-bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell other students and event organizers about your technical interests..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
