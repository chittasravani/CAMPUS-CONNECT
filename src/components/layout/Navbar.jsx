import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { notificationService } from '../../services/notificationService';
import {
  Sparkles,
  Calendar,
  Ticket,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Layers,
  LayoutDashboard,
  Heart,
  Settings,
  Shield,
  CheckCircle,
} from 'lucide-react';

export function Navbar() {
  const { currentUser, logout, isAuthenticated, isStudent, isOrganizer, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  // Load notifications for current user
  useEffect(() => {
    if (currentUser?.id) {
      notificationService.getNotifications(currentUser.id).then(setNotifications);
    } else {
      setNotifications([]);
    }
  }, [currentUser?.id, location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotifDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (currentUser?.id) {
      await notificationService.markAllAsRead(currentUser.id);
      const updated = await notificationService.getNotifications(currentUser.id);
      setNotifications(updated);
      showToast('All notifications marked as read', 'info');
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('Signed out successfully', 'info');
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${
      isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900'
    }`;

  const getDashboardPath = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isOrganizer) return '/organizer/dashboard';
    return '/student/dashboard';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-600 to-accent-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1 font-serif">
                Campus<span className="text-brand-600">Connect</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block -mt-1">
                Event Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/events" className={navLinkClass}>
              Explore Events
            </NavLink>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
            {isAuthenticated && (
              <NavLink to={getDashboardPath()} className={navLinkClass}>
                Dashboard
              </NavLink>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* User Dropdown */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200/60"
                  >
                    <img
                      src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'}
                      alt={currentUser?.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200"
                    />
                    <div className="text-left hidden lg:block">
                      <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                        {currentUser?.name}
                      </div>
                      <span className="text-[10px] capitalize text-brand-600 font-medium">
                        {currentUser?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <div className="text-sm font-bold text-slate-900 truncate">
                          {currentUser?.name}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{currentUser?.email}</div>
                        <div className="mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                            {currentUser?.role} Account
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>

                        {isStudent && (
                          <Link
                            to="/student/registrations"
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                          >
                            <Calendar className="w-4 h-4" /> My Registrations
                          </Link>
                        )}

                        {isOrganizer && (
                          <>
                            <Link
                              to="/organizer/events"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <Calendar className="w-4 h-4" /> Manage Events
                            </Link>
                            <Link
                              to="/organizer/attendance"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Attendance
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/users"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <User className="w-4 h-4" /> User Management
                            </Link>
                            <Link
                              to="/admin/events"
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-brand-600"
                            >
                              <Shield className="w-4 h-4" /> Review Submissions
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm hover:shadow-brand-500/20 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          <NavLink
            to="/"
            end
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Explore Events
          </NavLink>
          <NavLink
            to="/about"
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            About
          </NavLink>

          {isAuthenticated ? (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Logged in as {currentUser?.name} ({currentUser?.role})
              </div>
              <Link
                to={getDashboardPath()}
                className="block px-3 py-2 rounded-lg text-sm font-semibold bg-brand-50 text-brand-700"
              >
                Dashboard
              </Link>
              {isStudent && (
                <Link
                  to="/student/registrations"
                  className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                >
                  My Registrations
                </Link>
              )}
              {isOrganizer && (
                <>
                  <Link
                    to="/organizer/events"
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                  >
                    My Events
                  </Link>
                  <Link
                    to="/organizer/attendance"
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                  >
                    Attendance Scanner
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link
                    to="/admin/users"
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/events"
                    className="block px-3 py-2 rounded-lg text-sm font-semibold text-slate-700"
                  >
                    Event Submissions
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-200 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 text-sm"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="w-full text-center px-4 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Navbar;
