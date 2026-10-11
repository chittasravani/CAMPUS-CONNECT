import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registrationService } from '../../services/registrationService';
import { QRCodeSVG } from 'qrcode.react';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { Ticket, Calendar, MapPin, Printer, ShieldCheck, Sparkles, User } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/helpers';

export function MyTicketsPage() {
  const { currentUser } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    registrationService
      .getRegistrationsByStudent(currentUser.id)
      .then((regs) => {
        // Filter only confirmed passes
        setRegistrations(regs.filter((r) => r.status === 'confirmed'));
      })
      .finally(() => setLoading(false));
  }, [currentUser?.id]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Digital Ticket Wallet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Your official admission passes with scannable QR verification for campus events.
          </p>
        </div>

        {registrations.length > 0 && (
          <button
            onClick={handlePrint}
            className="no-print self-start sm:self-auto flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Passes</span>
          </button>
        )}
      </div>

      {loading ? (
        <LoadingSpinner message="Loading ticket wallet..." />
      ) : registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Your ticket wallet is empty"
          description="Register for upcoming campus hackathons, workshops, or sports tournaments to receive your passes."
          actionText="Browse Available Events"
          onAction={() => (window.location.href = '/events')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((reg) => (
            <div
              key={reg.id}
              className="printable-ticket bg-white rounded-3xl border border-slate-200/90 shadow-card hover:shadow-card-hover transition-all overflow-hidden flex flex-col justify-between"
            >
              {/* Header Gradient */}
              <div className="bg-gradient-to-r from-brand-600 to-accent-600 text-white p-5">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-100 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-brand-300" /> Official Admission Pass
                  </span>
                  <StatusBadge status={reg.attendanceStatus} />
                </div>
                <h3 className="text-lg font-bold truncate">{reg.event?.title}</h3>
                <p className="text-xs text-indigo-100">{reg.event?.category} • CampusConnect Pass</p>
              </div>

              {/* Pass Body: QR Code + Meta details */}
              <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
                {/* QR Code */}
                <div className="bg-white p-3 rounded-2xl border-2 border-dashed border-slate-200 shadow-xs flex flex-col items-center shrink-0">
                  <QRCodeSVG
                    value={reg.ticketCode}
                    size={140}
                    level="H"
                    includeMargin={true}
                    fgColor="#1e1b4b"
                  />
                  <span className="mt-1 text-[11px] font-mono font-bold tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {reg.ticketCode}
                  </span>
                </div>

                {/* Details list */}
                <div className="flex-1 space-y-3 text-xs w-full">
                  <div>
                    <span className="text-slate-400 font-medium block text-[11px]">Attendee</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {reg.studentName} ({reg.collegeStudentId})
                    </span>
                    <span className="text-slate-500 block text-[11px]">{reg.department}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-800">
                        {formatDate(reg.event?.startDate)}
                      </span>
                      <span className="block text-slate-500">
                        {formatTime(reg.event?.startDate)} - {formatTime(reg.event?.endDate)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-medium text-slate-800">{reg.event?.venue}</span>
                  </div>
                </div>
              </div>

              {/* Security info bar */}
              <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Scan upon venue entrance</span>
                </span>
                <Link
                  to={`/events/${reg.eventId}`}
                  className="font-semibold text-brand-600 hover:text-brand-800 text-xs no-print"
                >
                  View Event →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTicketsPage;
