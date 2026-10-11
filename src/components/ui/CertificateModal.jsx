import React from 'react';
import Modal from './Modal';
import { Award, Download, Printer } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export function CertificateModal({ isOpen, onClose, registration }) {
  if (!registration) return null;

  const { event, studentName, department, ticketCode } = registration;
  const certId = `CERT-${ticketCode || 'CC-2026'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="printable-ticket flex flex-col items-center">
        {/* Certificate Frame */}
        <div className="w-full bg-amber-50/40 border-8 border-double border-amber-800/40 p-6 sm:p-10 rounded-xl relative text-center shadow-inner">
          {/* Top Emblem */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md">
              <Award className="w-10 h-10" />
            </div>
          </div>

          <h5 className="text-xs uppercase font-bold tracking-widest text-amber-900/80 mb-1">
            CAMPUS CONNECT ACTIVITIES COUNCIL
          </h5>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-4 tracking-tight">
            Certificate of Participation
          </h2>

          <p className="text-xs text-slate-500 uppercase tracking-widest mb-6">
            THIS IS PROUDLY PRESENTED TO
          </p>

          <div className="text-2xl sm:text-3xl font-bold font-serif text-brand-700 border-b-2 border-amber-300 inline-block pb-1 px-8 mb-4">
            {studentName}
          </div>

          <p className="text-sm text-slate-700 max-w-lg mx-auto leading-relaxed mb-6 font-serif">
            from the department of <span className="font-semibold text-slate-900">{department || 'Engineering'}</span> for active participation and successful completion of{' '}
            <span className="font-semibold text-slate-900 italic">"{event?.title || 'College Event'}"</span> conducted on{' '}
            <span className="font-semibold text-slate-900">{formatDate(event?.startDate)}</span> at CampusConnect Central.
          </p>

          {/* Signatures & Seal */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-amber-200/80 text-xs text-slate-600">
            <div className="text-center">
              <div className="font-serif italic text-base text-slate-800 mb-1">Dr. Robert Chen</div>
              <div className="w-32 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <span>Faculty Coordinator</span>
            </div>
            <div className="text-center">
              <div className="font-serif italic text-base text-slate-800 mb-1">Dean Eleanor Vance</div>
              <div className="w-32 h-0.5 bg-slate-400 mx-auto mb-1"></div>
              <span>Dean of Student Life</span>
            </div>
          </div>

          {/* Verification Code */}
          <div className="mt-6 text-[10px] font-mono text-slate-400">
            Official Credential ID: {certId} • Verified by CampusConnect
          </div>
        </div>

        {/* Action Buttons */}
        <div className="no-print flex items-center justify-end gap-3 w-full mt-6">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors shadow-sm text-sm"
          >
            <Printer className="w-4 h-4" /> Print / Save PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors shadow-sm text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default CertificateModal;
