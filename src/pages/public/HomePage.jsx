import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import EventCard from '../../components/events/EventCard';
import { EVENT_CATEGORIES } from '../../data/seedData';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  Ticket,
  QrCode,
  ShieldCheck,
  Users,
  Award,
  Zap,
  Code,
  Music,
  Trophy,
  Wrench,
  BookOpen,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      eventService.getFeaturedEvents(6),
      eventService.getFavorites(),
    ]).then(([events, favs]) => {
      setFeaturedEvents(events);
      setFavorites(favs);
      setLoading(false);
    });
  }, []);

  const categoryIconMap = {
    Code: Code,
    Music: Music,
    Trophy: Trophy,
    Wrench: Wrench,
    BookOpen: BookOpen,
    Flame: Flame,
  };

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-slate-50 to-white pt-12 sm:pt-20 pb-16 lg:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 text-brand-700 text-xs font-bold border border-brand-200/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                <span>The Premier College Event Experience</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] font-serif">
                Discover. <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-accent-600">
                  Participate.
                </span>{' '}
                Connect.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                CampusConnect brings university life into one centralized hub. Explore hackathons,
                cultural festivals, sports tournaments, and faculty workshops. Register in one click
                and get your digital QR ticket instantly.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/events"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/25 hover:shadow-brand-500/35 transition-all flex items-center justify-center gap-2"
                >
                  <span>Explore Events</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Join CampusConnect</span>
                </Link>
              </div>

              {/* Feature Highlights Pills */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Instant QR Passes</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Verified Attendance</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Official Certificates</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow Backdrop */}
                <div className="absolute -inset-2 bg-gradient-to-r from-brand-500/20 to-accent-500/20 rounded-3xl blur-2xl transform -rotate-2"></div>

                {/* Main Card */}
                <div className="relative bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="relative h-60 rounded-2xl overflow-hidden mb-4 bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
                      alt="HackCampus 2026"
                      className="w-full h-full object-cover opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                    <div className="absolute top-3 left-3 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Next Major Event
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs text-brand-300 font-semibold">Technical • Hackathon</div>
                      <h4 className="text-base font-bold truncate">HackCampus 2026 National Hackathon</h4>
                    </div>
                  </div>

                  {/* Pass Mock Snippet */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center shrink-0">
                        <QrCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">Verified QR Pass</div>
                        <div className="text-[11px] text-slate-500">Scan at entrance for fast entry</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-card">
          <div className="text-center p-3">
            <div className="text-2xl sm:text-4xl font-extrabold text-brand-600 font-serif">5,200+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Student Participants</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-4xl font-extrabold text-accent-600 font-serif">140+</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Events Organized</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-4xl font-extrabold text-emerald-600 font-serif">99.4%</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">QR Check-in Rate</div>
          </div>
          <div className="text-center p-3 border-l border-slate-100">
            <div className="text-2xl sm:text-4xl font-extrabold text-indigo-600 font-serif">28</div>
            <div className="text-xs sm:text-sm font-medium text-slate-500 mt-1">Clubs & Departments</div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED EVENTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
              Handpicked Highlights
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
              Featured Campus Events
            </h2>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-800 transition-colors"
          >
            <span>View All Events</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isFavorite={favorites.includes(event.id)}
            />
          ))}
        </div>
      </section>

      {/* 4. EVENT CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            Browse By Interest
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Explore Event Categories
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Find activities that align with your degree, hobbies, athletic ambitions, and creative pursuits.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {EVENT_CATEGORIES.map((cat) => {
            const Icon = categoryIconMap[cat.icon] || Zap;
            return (
              <Link
                key={cat.id}
                to={`/events?category=${cat.id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-card hover:shadow-card-hover hover:border-brand-300 text-center flex flex-col items-center justify-center transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center transition-colors mb-3">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {cat.label}
                </h4>
                <span className="text-[11px] text-slate-400 mt-0.5">Explore →</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 rounded-3xl mx-4 sm:mx-6 lg:mx-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Frictionless Experience
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-1 font-serif">
              How CampusConnect Works
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Three simple steps from discovery to official certificate credential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-brand-400 flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-lg font-bold mb-2">Discover an Event</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Filter through verified campus events by category, date, and live capacity. Read detailed rules and prerequisites.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-600/30 border border-accent-500/40 text-accent-400 flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-lg font-bold mb-2">Register in Seconds</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                One-click registration reserves your seat. If capacity is full, join the automated waitlist queue with priority order.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 border border-slate-700 p-6 rounded-2xl relative text-center flex flex-col items-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-lg font-bold mb-2">Attend With QR Ticket</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Present your digital pass at the entrance. Organizers scan your pass for instant check-in and automated certificate eligibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BENEFITS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Role-Based Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Designed for the Entire Campus Community
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Students */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-brand-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">For Students</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Personal digital pass wallet with offline support</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Instant notifications for schedule or venue changes</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Verified participation certificates for resumes</span>
              </li>
            </ul>
          </div>

          {/* For Organizers */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-accent-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">For Organizers</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Automated capacity enforcement & waitlist handling</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Camera-based QR scanning prevents duplicate entries</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>One-click CSV exports of attendee rosters</span>
              </li>
            </ul>
          </div>

          {/* For Administrators */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-card space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-sky-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">For Administrators</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Platform-wide event review and approval workflows</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Campus engagement analytics & category metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>User role administration and account moderation</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-accent-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-serif">
              Ready to Dive Into Campus Life?
            </h2>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
              Join thousands of students building skills, competing in championships, and making lasting college memories with CampusConnect.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/register"
                className="px-6 py-3 rounded-xl bg-white text-brand-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-colors"
              >
                Sign Up as Student
              </Link>
              <Link
                to="/events"
                className="px-6 py-3 rounded-xl bg-brand-800/80 hover:bg-brand-900 text-white font-semibold text-sm border border-brand-500/50 transition-colors"
              >
                Explore All Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
