import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ShieldCheck, QrCode, Database, Server, Smartphone, Award, CheckCircle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 space-y-12">
      {/* Hero */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200">
          <Layers className="w-4 h-4 text-brand-600" />
          <span>About CampusConnect</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-serif">
          Centralized College Event Operating System
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Transforming university activities from scattered paper flyers and Google Forms into a sleek,
          digital-first community platform designed for students, faculty organizers, and campus administrators.
        </p>
      </div>

      {/* Vision & Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-brand-600 flex items-center justify-center font-bold text-lg font-serif">
            01
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">The Student Experience</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Students frequently miss out on hackathons, cultural fests, and workshops simply because announcements get buried in email threads. CampusConnect aggregates all campus happenings into a real-time, searchable calendar with instant one-click registration and a digital QR pass wallet.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 text-accent-600 flex items-center justify-center font-bold text-lg font-serif">
            02
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">The Organizer Operating Hub</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Managing attendee lists on clipboards causes long entry queues and duplicate entries. With CampusConnect, organizers enforce capacity limits, manage automated waitlists, scan QR tickets in milliseconds using any smartphone camera, and export real-time rosters to CSV.
          </p>
        </div>
      </div>

      {/* Architectural Overview: Ready for Full MERN Stack */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-8 border border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-brand-400">
            Software Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 font-serif">
            Full-Stack-Ready Architecture
          </h2>
          <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
            CampusConnect is engineered from the ground up for seamless integration with a Node.js,
            Express, and MongoDB backend.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="text-brand-400 font-mono text-xs font-bold flex items-center gap-2">
              <Database className="w-4 h-4" /> 1. MongoDB Collections
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Data models (`User`, `Event`, `Registration`, `WaitlistEntry`, `Notification`, `Feedback`) map 1-to-1 to Mongoose schemas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="text-accent-400 font-mono text-xs font-bold flex items-center gap-2">
              <Server className="w-4 h-4" /> 2. Centralized Service Layer
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Components call `eventService`, `authService`, and `registrationService`. Swapping mock implementations with Axios HTTP calls requires 0 component changes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <div className="text-emerald-400 font-mono text-xs font-bold flex items-center gap-2">
              <QrCode className="w-4 h-4" /> 3. Verification Boundaries
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Clear security boundaries: frontend validation ensures UX responsiveness while backend API contracts enforce strict data integrity.
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-4">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
        >
          <span>Explore Campus Events</span>
        </Link>
      </div>
    </div>
  );
}

export default AboutPage;
