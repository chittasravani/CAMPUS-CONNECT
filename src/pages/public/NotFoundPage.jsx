import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowLeft, Home, Compass } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-20 px-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <Layers className="w-8 h-8" />
        </div>
        <div>
          <span className="text-4xl sm:text-6xl font-extrabold text-brand-600 font-serif">404</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2 font-serif">Page Not Found</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            The campus route you requested does not exist or has been moved to a different university sector.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          <Link
            to="/events"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
