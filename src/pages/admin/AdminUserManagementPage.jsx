import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/ui/StatusBadge';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
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

  // Filter users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
          User Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Directory of all students, faculty organizers, and platform administrators.
        </p>
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
                {filteredUsers.map((u) => {
                  const isActive = u.status === 'active';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                            alt={u.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{u.name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.role === 'organizer'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {u.role === 'admin' && <Shield className="w-3 h-3" />}
                          {u.role === 'organizer' && <CalendarCheck className="w-3 h-3" />}
                          {u.role === 'student' && <GraduationCap className="w-3 h-3" />}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>

                      {/* Department / ID */}
                      <td className="py-4 px-4">
                        <div className="font-mono text-[11px] font-bold text-slate-700">
                          {u.studentId || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {u.department}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <StatusBadge status={u.status} />
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setInspectUser(u)}
                            className="px-2.5 py-1 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-100 transition-colors font-medium text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {/* Toggle Active Status */}
                          <button
                            onClick={() => setToggleTarget(u)}
                            className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                              isActive
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </button>
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

      {/* Inspect User Modal */}
      <Modal
        isOpen={!!inspectUser}
        onClose={() => setInspectUser(null)}
        title="User Profile Record"
      >
        {inspectUser && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={inspectUser.avatar}
                alt={inspectUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-500"
              />
              <div>
                <h4 className="text-base font-bold text-slate-900">{inspectUser.name}</h4>
                <div className="text-slate-500">{inspectUser.email}</div>
                <div className="mt-1">
                  <StatusBadge status={inspectUser.status} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">User Role</span>
                <strong className="text-slate-800 capitalize">{inspectUser.role}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Campus ID</span>
                <strong className="text-slate-800 font-mono">{inspectUser.studentId}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Department</span>
                <strong className="text-slate-800">{inspectUser.department}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Class Year / Title</span>
                <strong className="text-slate-800">{inspectUser.year}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Phone Contact</span>
                <strong className="text-slate-800">{inspectUser.phone || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Registration Date</span>
                <strong className="text-slate-800">{formatDate(inspectUser.createdAt)}</strong>
              </div>
            </div>

            {inspectUser.bio && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[11px] mb-1">Bio:</span>
                <p className="text-slate-700 leading-relaxed">{inspectUser.bio}</p>
              </div>
            )}

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
