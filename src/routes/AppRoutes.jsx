import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from '../layouts/RootLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import HomePage from '../pages/public/HomePage';
import EventsPage from '../pages/public/EventsPage';
import EventDetailsPage from '../pages/public/EventDetailsPage';
import AboutPage from '../pages/public/AboutPage';
import NotFoundPage from '../pages/public/NotFoundPage';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Student Pages
import StudentDashboardPage from '../pages/student/StudentDashboardPage';
import MyRegistrationsPage from '../pages/student/MyRegistrationsPage';

// Organizer Pages
import OrganizerDashboardPage from '../pages/organizer/OrganizerDashboardPage';
import ManageEventsPage from '../pages/organizer/ManageEventsPage';
import EventFormPage from '../pages/organizer/EventFormPage';
import ParticipantManagementPage from '../pages/organizer/ParticipantManagementPage';
import AttendancePage from '../pages/organizer/AttendancePage';

// Admin Pages
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUserManagementPage from '../pages/admin/AdminUserManagementPage';
import AdminEventSubmissionsPage from '../pages/admin/AdminEventSubmissionsPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailsPage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<Navigate to="/login" replace />} />
        <Route path="/reset-password" element={<Navigate to="/login" replace />} />

        {/* Student Dashboard Routes */}
        <Route path="/student" element={<DashboardLayout expectedRole="student" />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="registrations" element={<MyRegistrationsPage />} />
          <Route path="tickets" element={<Navigate to="/student/registrations" replace />} />
          <Route path="favorites" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="notifications" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="profile" element={<Navigate to="/student/dashboard" replace />} />
        </Route>

        {/* Organizer Dashboard Routes */}
        <Route path="/organizer" element={<DashboardLayout expectedRole="organizer" />}>
          <Route index element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="dashboard" element={<OrganizerDashboardPage />} />
          <Route path="events" element={<ManageEventsPage />} />
          <Route path="events/new" element={<EventFormPage />} />
          <Route path="events/:eventId/edit" element={<EventFormPage />} />
          <Route path="registrations" element={<ParticipantManagementPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="analytics" element={<Navigate to="/organizer/dashboard" replace />} />
        </Route>

        {/* Administrator Dashboard Routes */}
        <Route path="/admin" element={<DashboardLayout expectedRole="admin" />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserManagementPage />} />
          <Route path="events" element={<AdminEventSubmissionsPage />} />
          <Route path="analytics" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="reports" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* 404 Wildcard */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
