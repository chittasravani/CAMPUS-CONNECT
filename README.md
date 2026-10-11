# CampusConnect 🎓

**Centralized College Event Operating System & Management Platform**

CampusConnect is a modern, responsive, full-stack-ready college event management web application. It connects students, event organizers, and campus administrators into one unified platform.

Built with **React 19**, **Vite**, **Tailwind CSS**, **React Router 7**, and **Lucide Icons**, CampusConnect features an isolated, centralized mock service layer that allows complete multi-page interactivity, QR ticket generation, real-time filtering, and live attendance scanning—architected for future integration with **Node.js, Express, and MongoDB**.

---

## 🌟 Key Features by User Role

### 1. 🎓 Student Experience
- **Public & Discovery Portal**: Search by title or keywords, filter by category (*Technical, Cultural, Sports, Workshops, Seminars, Competitions*), status (*Open, Full, Completed*), and date (*Today, This Week, Upcoming*).
- **One-Click Event Registration**: Automatic capacity verification and duplicate registration prevention.
- **Automated Waitlist Queue**: When events reach 100% capacity, students can join an organized waitlist with real-time queue position tracking.
- **Digital QR Ticket Wallet (`/student/tickets`)**: Scannable, tamper-resistant QR passes with formatted pass codes (e.g., `CC-TCK-784291`), date, and venue details.
- **Print / PDF Pass Export**: Print-friendly ticket layout with single-click browser print support (`Ctrl+P`).
- **Participation Certificates**: Official academic and cultural council certificates of participation with unique credential IDs for attended events.
- **Event Reviews & Star Ratings**: 1 to 5-star ratings and written reviews for attended events with duplicate prevention.
- **Bookmarks & Notifications**: Save favorite events to a personal wishlist and receive instant schedule/venue alert notices.
- **Student Profile Management**: Edit department, graduation year, contact info, and profile avatar with persistent storage.

### 2. 📋 Organizer Studio
- **Dashboard Metrics**: Live counters for total events, published count, attendee conversions, and attendance percentage.
- **Comprehensive Event Management**:
  - Full CRUD operations: Create, save drafts, edit, preview, publish, and cancel events.
  - Form validations: End date following start date, valid positive capacity limits, deadline constraints, and pre-curated high-resolution poster presets.
- **Participant Roster & Real CSV Export (`/organizer/registrations`)**:
  - Filter participants by registration and check-in status.
  - Search participants by student name, roll number, or ticket code.
  - **Live CSV Export**: Generates and downloads a real `.csv` spreadsheet formatted for security and department audits.
- **QR Attendance Scanner & Manual Lookup (`/organizer/attendance`)**:
  - Camera-based scanning using device camera (`getUserMedia`) with graceful permission handling.
  - One-click scan simulation presets for fast evaluation without a webcam.
  - **Duplicate Scan Prevention**: Rejects repeated scans and alerts organizers with original check-in timestamps.
  - **Cross-Event Guard**: Validates that scanned passes belong to the selected event; alerts if a pass is for another event.
  - Live attendance counters (*Attended, Pending, Check-in Rate*).
- **Organizer Analytics**: Visual capacity fill meters and category distribution charts.

### 3. 🛡️ Campus Administrator Console
- **Platform Health & Metrics**: Real-time platform stats (*Total Users, Campus Events, Total Registrations, Global Attendance*).
- **User Directory Administration (`/admin/users`)**:
  - Search and filter students, organizers, and faculty.
  - Inspect complete student profiles.
  - Interactively activate or deactivate accounts with immediate effect on authentication.
- **Event Submissions Moderation (`/admin/events`)**:
  - Review submitted event drafts from student clubs.
  - One-click "Approve & Publish" or "Reject / Cancel" with required moderator feedback notes.
- **Platform Intelligence & Trajectory (`/admin/analytics`)**:
  - Month-by-month registration trajectory and category popularity breakdowns.
- **Official Reports & Data Exports (`/admin/reports`)**:
  - Downloadable CSV exports for:
    1. *Platform Events Catalog CSV*
    2. *User Directory & Rosters CSV*
    3. *Audited Attendance Log CSV*

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite |
| **Styling** | Tailwind CSS (Deep Indigo `#4f46e5`, Violet `#8b5cf6`, Slate neutrals) |
| **Icons** | Lucide React |
| **Routing** | React Router DOM v7 |
| **QR Engine** | `qrcode.react` (SVG QR generation) |
| **State Management** | React Context API (`AuthContext`, `ToastContext`) |
| **Data Layer** | Centralized Service Layer (`src/services/*`) + Browser LocalStorage persistence |
| **Ready For Backend** | Node.js, Express.js, MongoDB (Mongoose) |

---

## 🔌 Future Backend & MongoDB Integration Architecture

CampusConnect is decoupled from storage logic. React components **never** access `localStorage` directly—all state transitions flow through `src/services/`.

```
React Components & Pages
          │
          ▼
Centralized Service Layer (src/services/)
  ├── authService.js
  ├── eventService.js
  ├── registrationService.js
  ├── attendanceService.js
  ├── userService.js
  ├── notificationService.js
  └── feedbackService.js
          │
          ├── (Phase 1 / Current): storage.js -> LocalStorage Mock Persistence
          └── (Phase 2 / Production): Axios/Fetch -> Express REST API (VITE_API_BASE_URL)
```

### Switching to Real Backend
1. In `src/config/apiConfig.js`, set `USE_MOCK: false` or set the environment variable:
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
2. Replace the internal Promise returns in `src/services/` with `axios.get()` or `axios.post()`. The component interfaces and state contracts will remain identical.

### MongoDB Data Model Schema Mapping

```javascript
// User Schema (users collection)
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ['student', 'organizer', 'admin'] },
  studentId: String,
  department: String,
  year: String,
  phone: String,
  avatar: String,
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: Date
}

// Event Schema (events collection)
{
  _id: ObjectId,
  title: String,
  description: String,
  category: { type: String, enum: ['Technical', 'Cultural', 'Sports', 'Workshops', 'Seminars', 'Competitions'] },
  posterUrl: String,
  organizerId: { type: ObjectId, ref: 'User' },
  organizerName: String,
  startDate: Date,
  endDate: Date,
  venue: String,
  registrationDeadline: Date,
  capacity: Number,
  registeredCount: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'published', 'cancelled', 'completed'] },
  eligibility: String,
  contactEmail: String,
  tags: [String]
}

// Registration Schema (registrations collection)
{
  _id: ObjectId,
  eventId: { type: ObjectId, ref: 'Event' },
  studentId: { type: ObjectId, ref: 'User' },
  studentName: String,
  studentEmail: String,
  collegeStudentId: String,
  department: String,
  ticketCode: { type: String, unique: true }, // e.g. "CC-TCK-784291"
  status: { type: String, enum: ['confirmed', 'cancelled'] },
  attendanceStatus: { type: String, enum: ['registered', 'attended', 'absent'] },
  attendedAt: Date,
  registrationDate: Date
}
```

---

## 👥 Demo Accounts (1-Click Switcher Available in UI)

The top **Demo Sandbox Bar** allows 1-click role switching without manually retyping passwords. Alternatively, sign in using:

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Alex Rivera | `alex.rivera@campus.edu` | `password123` |
| **Student** | Priya Sharma | `priya.sharma@campus.edu` | `password123` |
| **Organizer** | Dr. Robert Chen | `robert.chen@campus.edu` | `password123` |
| **Organizer** | Sarah Jenkins | `sarah.jenkins@campus.edu` | `password123` |
| **Admin** | Dean Eleanor Vance | `admin@campus.edu` | `password123` |

*Note: You can click the **Reset Data** button in the top bar anytime to restore sample events, tickets, and notifications to their original default state.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended, verified on v24.16.0)
- npm (v9+ recommended, verified on v11.13.0)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Logic Verification Suite
```bash
node test_services.js
```
Executes all 8 service test suites covering duplicate registration checks, QR scan verification, waitlist rules, and permissions.

### 4. Build for Production
```bash
npm run build
```
Creates an optimized, tree-shaken static bundle in `dist/`.

---

## 📁 Project Directory Structure

```
CAMPUS CONNECT/
├── public/                 # Static public assets
├── src/
│   ├── assets/             # Logos and imagery
│   ├── components/
│   │   ├── common/         # Shared helpers
│   │   ├── events/         # EventCard, EventFilters
│   │   ├── layout/         # Navbar, Footer, Sidebar, DemoRoleBar
│   │   └── ui/             # StatusBadge, Modal, ConfirmDialog, StatCard, QrTicketModal, CertificateModal, FormInput, EmptyState, LoadingSpinner
│   ├── config/
│   │   └── apiConfig.js    # API endpoints & mock mode configuration
│   ├── contexts/
│   │   ├── AuthContext.jsx # Auth state, role switcher, current user
│   │   └── ToastContext.jsx# Animated notifications system
│   ├── data/
│   │   └── seedData.js     # 15+ realistic events & 8 demo users
│   ├── layouts/
│   │   ├── RootLayout.jsx  # Main application layout wrapper
│   │   └── DashboardLayout.jsx # Role-aware dashboard shell with sidebar
│   ├── pages/
│   │   ├── auth/           # Login, Register, ForgotPassword, ResetPassword
│   │   ├── public/         # HomePage, EventsPage, EventDetailsPage, AboutPage, NotFoundPage
│   │   ├── student/        # StudentDashboard, MyRegistrations, MyTickets, Favorites, Notifications, Profile
│   │   ├── organizer/      # OrganizerDashboard, ManageEvents, EventForm, ParticipantManagement, Attendance, Analytics
│   │   └── admin/          # AdminDashboard, UserManagement, EventSubmissions, PlatformAnalytics, Reports
│   ├── routes/
│   │   └── AppRoutes.jsx   # Client-side router definition
│   ├── services/
│   │   ├── storage.js      # LocalStorage manager with seed persistence
│   │   ├── authService.js  # Authentication and profile mutations
│   │   ├── eventService.js # Event queries, search, filters, CRUD
│   │   ├── registrationService.js # Capacity, waitlists, duplicate prevention
│   │   ├── attendanceService.js   # QR check-in & duplicate scan alerts
│   │   ├── userService.js  # User directory and activation controls
│   │   ├── notificationService.js # In-app notification management
│   │   └── feedbackService.js     # Star ratings and reviews
│   ├── utils/
│   │   └── helpers.js      # CSV exporter, date formatters, ticket code generator
│   ├── App.jsx             # Top-level context provider shell
│   ├── index.css           # Tailwind base, typography, print rules
│   └── main.jsx            # React root entry point
├── test_services.js        # Automated business logic verification suite
├── tailwind.config.js      # Brand design system tokens & colors
├── vite.config.js          # Vite build configuration
└── package.json            # Project dependencies & scripts
```

---

## 📜 License
CampusConnect is open source and ready for collegiate and institutional deployment.
