import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FormInput from '../../components/ui/FormInput';
import {
  Users,
  Search,
  Shield,
  Eye,
  UserCheck,
  UserX,
  Mail,
  GraduationCap,
  CalendarCheck,
  PlusCircle,
  EyeOff,
} from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export function AdminUserManagementPage() {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals & Action states
  const [inspectUser, setInspectUser] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Create Organizer Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Event Management',
    organizationName: '',
  });
  const [createErrors, setCreateErrors] = useState({});

  const loadUsers = async () => {
    try {
      const list = await userService.getAllUsers();
      setUsers(list);
    } catch (err) {
      showToast(err.message || 'Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatusConfirm = async () => {
    if (!toggleTarget) return;
    setActionLoading(true);
    try {
      const updated = await userService.toggleUserStatus(toggleTarget.id);
      showToast(
        `User "${updated.name}" is now ${updated.status.toUpperCase()}`,
        'info'
      );
      setToggleTarget(null);
      await loadUsers();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const validateCreateForm = () => {
    const errs = {};
    if (!createFormData.name.trim()) errs.name = 'Full name is required';
    if (!createFormData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(createFormData.email)) {
      errs.email = 'Please enter a valid email format';
    }
    if (!createFormData.password) {
      errs.password = 'Password is required';
    } else if (createFormData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateOrganizerSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    setCreateLoading(true);
    try {
      const newOrganizer = await userService.createOrganizer(createFormData);
      showToast(`Organizer account for "${newOrganizer.name}" created successfully!`, 'success');
      setShowCreateModal(false);
      setCreateFormData({
        name: '',
        email: '',
        password: '',
        department: 'Event Management',
        organizationName: '',
      });
      setCreateErrors({});
      await loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to create organizer account', 'error');
    } finally {
      setCreateLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && (u.status || 'active') !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.studentId && u.studentId.toLowerCase().includes(q)) ||
        (u.department && u.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Directory of all students, faculty organizers, and platform administrators.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Organizer Account</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, student ID, or dept..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
          />
        </div>

        {/* Role & Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {['all', 'student', 'organizer', 'admin'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  roleFilter === r
                    ? 'bg-white text-brand-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'all' ? 'All Roles' : r}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner message="Loading user directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description="There are no user records matching your search query or role filter."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">User Profile</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">ID & Department</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const roleConfig = {
                    student: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: GraduationCap },
                    organizer: { color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: CalendarCheck },
                    admin: { color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Shield },
                  }[user.role] || { color: 'bg-slate-50 text-slate-700 border-slate-200', icon: Users };

                  const RoleIcon = roleConfig.icon;

                  return (
                    <tr key={user.id || user._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user.name ? user.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{user.name}</span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {user.email}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border capitalize ${roleConfig.color}`}
                        >
                          <RoleIcon className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* ID & Department */}
                      <td className="py-4 px-4">
                        <span className="font-mono text-slate-700 block text-[11px]">
                          {user.studentId || user.organizationName || 'N/A'}
                        </span>
                        <span className="text-slate-500 text-[11px]">{user.department || 'General'}</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={user.status === 'inactive' ? 'cancelled' : 'confirmed'}>
                          {(user.status || 'active').toUpperCase()}
                        </StatusBadge>
                      </td>

                      {/* Registration Date */}
                      <td className="py-4 px-4 text-slate-500">{formatDate(user.createdAt)}</td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setInspectUser(user)}
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="View Profile Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {user.role !== 'admin' && (
                            <button
                              onClick={() => setToggleTarget(user)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                user.status === 'active'
                                  ? 'text-rose-500 hover:bg-rose-50'
                                  : 'text-emerald-600 hover:bg-emerald-50'
                              }`}
                              title={user.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                            >
                              {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Organizer Account Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Organizer Account"
      >
        <form onSubmit={handleCreateOrganizerSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Create an official organizer account for faculty leads, club coordinators, or department event heads.
          </p>

          <FormInput
            label="Full Name"
            id="org-name"
            type="text"
            required
            placeholder="e.g. Dr. Jane Smith"
            value={createFormData.name}
            onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
            error={createErrors.name}
          />

          <FormInput
            label="Official College / Faculty Email"
            id="org-email"
            type="email"
            required
            placeholder="e.g. jane.smith@campus.edu"
            value={createFormData.email}
            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
            error={createErrors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormInput
              label="Department / Faculty"
              id="org-dept"
              type="text"
              placeholder="e.g. Computer Science"
              value={createFormData.department}
              onChange={(e) => setCreateFormData({ ...createFormData, department: e.target.value })}
            />
            <FormInput
              label="Club / Organization (Optional)"
              id="org-club"
              type="text"
              placeholder="e.g. ACM Student Chapter"
              value={createFormData.organizationName}
              onChange={(e) => setCreateFormData({ ...createFormData, organizationName: e.target.value })}
            />
          </div>

          <div className="relative">
            <FormInput
              label="Initial Password (min 8 characters)"
              id="org-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="••••••••"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              error={createErrors.password}
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

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createLoading}
              className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {createLoading ? 'Creating Account...' : 'Create Organizer Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Inspect User Modal */}
      <Modal
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
        title="User Account Details"
      >
        {inspectUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-base uppercase">
                {inspectUser.name ? inspectUser.name.charAt(0) : 'U'}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{inspectUser.name}</h4>
                <span className="text-slate-500 block">{inspectUser.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl">
              <div>
                <span className="text-slate-400 block text-[11px]">Role</span>
                <strong className="text-slate-800 capitalize">{inspectUser.role}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus ID / Club</span>
                <strong className="text-slate-800 font-mono">{inspectUser.studentId || inspectUser.organizationName || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <strong className="text-slate-800">{inspectUser.department || 'General'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Status</span>
                <strong className="text-slate-800 uppercase">{inspectUser.status || 'active'}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block text-[11px]">Registration Date</span>
                <strong className="text-slate-800">{formatDate(inspectUser.createdAt)}</strong>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectUser(null)}
                className="px-5 py-2 bg-brand-600 text-white rounded-xl font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Dialog for Deactivation / Activation */}
      <ConfirmDialog
        isOpen={!!toggleTarget}
        onClose={() => setToggleTarget(null)}
        onConfirm={handleToggleStatusConfirm}
        title={toggleTarget?.status === 'active' ? 'Deactivate User Account?' : 'Activate User Account?'}
        message={
          toggleTarget?.status === 'active'
            ? `Are you sure you want to deactivate ${toggleTarget?.name}? They will be temporarily prevented from logging into CampusConnect.`
            : `Are you sure you want to activate ${toggleTarget?.name}? They will be able to log in normally.`
        }
        confirmText={toggleTarget?.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
        isDestructive={toggleTarget?.status === 'active'}
        loading={actionLoading}
      />
    </div>
  );
}

export default AdminUserManagementPage;
