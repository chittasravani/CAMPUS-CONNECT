import React from 'react';

export function StatusBadge({ status, className = '' }) {
  if (!status) return null;

  const s = status.toLowerCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';
  let label = status.charAt(0).toUpperCase() + status.slice(1);

  if (s === 'published' || s === 'approved' || s === 'active' || s === 'confirmed' || s === 'attended') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
    if (s === 'approved') label = 'Approved';
    if (s === 'published') label = 'Published';
  } else if (s === 'draft' || s === 'pending') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
    if (s === 'pending') label = 'Pending Approval';
    if (s === 'draft') label = 'Draft';
  } else if (s === 'cancelled' || s === 'inactive' || s === 'absent' || s === 'rejected') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
    if (s === 'rejected') label = 'Rejected';
    if (s === 'cancelled') label = 'Cancelled';
  } else if (s === 'completed') {
    styles = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  } else if (s === 'registered' || s === 'open') {
    styles = 'bg-indigo-50 text-indigo-700 border-indigo-200';
    dot = 'bg-indigo-500';
  } else if (s === 'full' || s === 'waiting') {
    styles = 'bg-purple-50 text-purple-700 border-purple-200';
    dot = 'bg-purple-500';
    if (s === 'waiting') label = 'Waitlisted';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {label}
    </span>
  );
}

export default StatusBadge;
