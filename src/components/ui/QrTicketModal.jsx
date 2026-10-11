import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Modal from './Modal';
import StatusBadge from './StatusBadge';
import { Calendar, MapPin, Printer, ShieldCheck, User } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function QrTicketModal({ isOpen, onClose, registration }) {
  if (!registration) return null;

  const { event, ticketCode, studentName, collegeStudentId, department, attendanceStatus, registrationDate } = registration;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="printable-ticket flex flex-col items-center">
        {/* Header Ribbon */}
        <div className="w-full bg-gradient-to-r from-brand-600 to-accent-600 text-white rounded-t-xl p-4 text-center mb-4">
          <div className="text-xs uppercase font-bold tracking-widest text-indigo-100">Official Campus Pass</div>
          <h4 className="text-lg font-extrabold truncate mt-0.5">{event?.title || 'College Event Pass'}</h4>
          <p className="text-xs text-indigo-200 mt-1">{event?.category} • Admission Pass</p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-slate-200 shadow-sm flex flex-col items-center mb-4">
          <QRCodeSVG
            value={ticketCode || 'CC-DEMO-TICKET'}
            size={170}
            level="H"
            includeMargin={true}
            fgColor="#1e1b4b"
          />
          <div className="mt-2 text-center">
            <span className="text-xs font-mono font-bold tracking-widest text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              {ticketCode}
            </span>
          </div>
        </div>

        {/* Details List */}
        <div className="w-full bg-slate-50 rounded-xl p-4 border border-slate-200/80 text-sm space-y-2.5 mb-5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs">
              <User className="w-3.5 h-3.5" /> Attendee
            </span>
            <span className="font-semibold text-slate-900 text-right">
              {studentName} ({collegeStudentId})
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5" /> Date & Time
            </span>
            <span className="font-medium text-slate-800 text-right">
              {formatDate(event?.startDate)} at {formatTime(event?.startDate)}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5" /> Venue
            </span>
            <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
              {event?.venue || 'Campus Auditorium'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 text-xs">Status</span>
            <StatusBadge status={attendanceStatus || 'registered'} />
          </div>
        </div>

        {/* Security / Verification notice */}
        <div className="flex items-start gap-2 bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 text-indigo-900 text-xs leading-relaxed mb-5 w-full">
          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <span>
            Present this QR code on your phone or printed pass at the venue entrance. Organizer scanning records your verified attendance.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-sm text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default QrTicketModal;
