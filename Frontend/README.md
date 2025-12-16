# 🚛 TruckTrack Frontend

A modern, responsive **Fleet Management Dashboard** built with **React 19**, **Vite**, and **Redux Toolkit**. This frontend application provides an intuitive interface for fleet managers and drivers to manage trucks, trailers, trips, fuel consumption, tire tracking, and maintenance operations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Application Routes](#-application-routes)
- [Components](#-components)
- [State Management](#-state-management)
- [API Services](#-api-services)
- [Design System](#-design-system)
- [Docker Deployment](#-docker-deployment)

---

## ✨ Features

### 🎨 Modern UI/UX
- **Dark Theme**: Sleek dark mode interface with teal and purple accent colors
- **Responsive Design**: Fully responsive layout that works on desktop, tablet, and mobile
- **Interactive Charts**: Data visualization with Recharts (bar, line, pie charts)
- **Smooth Animations**: CSS transitions and micro-interactions for enhanced UX
- **Glass Morphism**: Modern glass-effect UI components

### 👤 Role-Based Dashboards

#### Admin Dashboard
- **Fleet Overview**: Real-time statistics on trucks, trailers, and drivers
- **Trip Management**: Create, assign, start, complete, and cancel trips
- **Vehicle Management**: Full CRUD for trucks and trailers
- **Fuel Tracking**: Monitor fuel consumption and costs
- **Tire Management**: Track tire wear and replacement schedules
- **Maintenance System**: Configure rules and view maintenance alerts
- **Analytics**: Interactive charts showing trip trends, fuel costs, top routes, and driver performance

#### Driver Dashboard
- **My Trips**: View assigned trips with status tracking
- **Trip Actions**: Start and complete trips directly
- **Trip Statistics**: Personal performance metrics
- **PDF Export**: Download trip reports

### 🔐 Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route guards for authenticated users
- **Role-Based Access**: Separate views and permissions for Admin vs Driver
- **Persistent Sessions**: Authentication state persisted in localStorage

### 📊 Data Visualization
- **Pie Charts**: Trip status distribution
- **Bar Charts**: Monthly trip trends
- **Line Charts**: Fuel cost trends over time
- **Statistics Cards**: Key performance indicators
- **Top Lists**: Popular routes and top-performing drivers

---

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| **Framework** | React | 19.2.0 |
| **Build Tool** | Vite | 7.2.4 |
| **State Management** | Redux Toolkit | 2.11.1 |
| **Routing** | React Router DOM | 7.10.1 |
| **HTTP Client** | Axios | 1.13.2 |
| **Charts** | Recharts | 3.6.0 |
| **Notifications** | React Toastify | 11.0.5 |
| **Linting** | ESLint | 9.39.1 |
| **Production Server** | Nginx | Alpine |
| **Containerization** | Docker | Multi-stage |

---

## 📁 Project Structure

```
Frontend/
├── public/                     # Static assets
├── src/
│   ├── assets/                 # Images and icons
│   ├── components/
│   │   ├── common/             # Reusable components
│   │   │   ├── Sidebar.jsx/.css           # Navigation sidebar
│   │   │   ├── ProfileModal.jsx/.css      # User profile modal
│   │   │   ├── LoadingSpinner.jsx/.css    # Loading indicator
│   │   │   ├── TruckFormModal.jsx/.css    # Truck CRUD form
│   │   │   ├── TrailerFormModal.jsx/.css  # Trailer CRUD form
│   │   │   ├── TireFormModal.jsx/.css     # Tire CRUD form
│   │   │   ├── TripFormModal.jsx/.css     # Trip CRUD form
│   │   │   ├── FuelFormModal.jsx/.css     # Fuel record form
│   │   │   ├── DriverFormModal.jsx/.css   # Driver management form
│   │   │   ├── MaintenanceRuleFormModal.jsx/.css
│   │   │   ├── MileageUpdateModal.jsx/.css
│   │   │   ├── TirePositionDiagram.jsx/.css
│   │   │   ├── TireStatistics.jsx/.css
│   │   │   ├── FuelStatistics.jsx/.css
│   │   │   └── DriverTripHistoryModal.jsx/.css
│   │   └── routes/
│   │       ├── PrivateRoute.jsx           # Auth-protected route wrapper
│   │       └── RoleBasedRoute.jsx         # Role-restricted route wrapper
│   ├── hooks/
│   │   └── useAuthInit.js      # Auth initialization hook
│   ├── pages/
│   │   ├── Home.jsx/.css                  # Landing page
│   │   ├── Login.jsx                      # Login page
│   │   ├── Register.jsx                   # Registration page
│   │   ├── Dashboard.jsx/.css             # Main dashboard
│   │   ├── AdminPanel.jsx/.css            # Admin overview
│   │   ├── TrucksPage.jsx/.css            # Truck management
│   │   ├── TrailersPage.jsx/.css          # Trailer management
│   │   ├── TiresPage.jsx/.css             # Tire management
│   │   ├── TripsPage.jsx/.css             # Trip management
│   │   ├── FuelPage.jsx/.css              # Fuel records
│   │   ├── DriversPage.jsx/.css           # Driver management
│   │   ├── MaintenanceRulesPage.jsx/.css  # Maintenance rules
│   │   ├── MaintenanceAlertsPage.jsx/.css # Maintenance alerts
│   │   ├── DriverDashboard.jsx/.css       # Driver-specific dashboard
│   │   ├── Unauthorized.jsx/.css          # Access denied page
│   │   └── NotFound.jsx                   # 404 page
│   ├── services/
│   │   ├── api.js              # Axios instance with interceptors
│   │   ├── authService.js      # Authentication API calls
│   │   ├── truckService.js     # Truck API calls
│   │   ├── trailerService.js   # Trailer API calls
│   │   ├── tireService.js      # Tire API calls
│   │   ├── tripService.js      # Trip API calls
│   │   ├── fuelService.js      # Fuel API calls
│   │   ├── driverService.js    # Driver API calls
│   │   ├── maintenanceRuleService.js
│   │   ├── maintenanceAlertService.js
│   │   ├── statisticsService.js # Dashboard statistics
│   │   ├── adminService.js     # Admin operations
│   │   └── profileService.js   # User profile
│   ├── store/
│   │   ├── index.js            # Redux store configuration
│   │   └── slices/
│   │       └── authSlice.js    # Authentication state slice
│   ├── styles/
│   │   ├── variables.css       # CSS custom properties (design tokens)
│   │   ├── base.css            # Base/reset styles
│   │   ├── utilities.css       # Utility classes
│   │   └── components/         # Component-specific styles
│   ├── utils/
│   │   ├── storage.js          # LocalStorage utilities
│   │   └── validation.js       # Form validation helpers
│   ├── App.jsx                 # Main app with routing
│   ├── App.css                 # App-level styles
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles
├── Dockerfile                  # Docker multi-stage build
├── nginx.conf                  # Nginx configuration
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── package.json
└── index.html                  # HTML template
```

---

## 🚀 Installation

### Prerequisites
- Node.js 20.x or higher
- npm or yarn
- Backend API running (see Backend README)

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TruckTrack/Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |

### Example `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

> **Note**: All Vite environment variables must be prefixed with `VITE_` to be accessible in the client code.

---

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Starts Vite dev server with hot module replacement at `http://localhost:5173`

### Production Build
```bash
npm run build
```
Creates optimized production bundle in `dist/` directory

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build

### Lint Code
```bash
npm run lint
```
Run ESLint to check for code quality issues

---

## 🗺 Application Routes

### Public Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with features showcase |
| `/login` | `Login` | User authentication |
| `/register` | `Register` | New user registration |
| `/unauthorized` | `Unauthorized` | Access denied page |

### Protected Routes (Authenticated Users)
| Path | Component | Description |
|------|-----------|-------------|
| `/dashboard` | `Dashboard` | Main dashboard (role-adaptive) |

### Admin Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/admin` | `AdminPanel` | Admin overview panel |
| `/admin/trucks` | `TrucksPage` | Truck management |
| `/admin/trailers` | `TrailersPage` | Trailer management |
| `/admin/tires` | `TiresPage` | Tire tracking |
| `/admin/fuel` | `FuelPage` | Fuel records |
| `/admin/drivers` | `DriversPage` | Driver management |
| `/admin/trips` | `TripsPage` | Trip management |
| `/admin/maintenance-rules` | `MaintenanceRulesPage` | Maintenance rules config |
| `/admin/maintenance-alerts` | `MaintenanceAlertsPage` | Maintenance alerts |

### Driver Routes
| Path | Component | Description |
|------|-----------|-------------|
| `/driver` | `DriverDashboard` | Driver's personal dashboard |
| `/driver/trips` | `DriverDashboard` | Driver's trips view |

---

## 🧩 Components

### Common Components

| Component | Description |
|-----------|-------------|
| `Sidebar` | Navigation sidebar with role-based menu items |
| `ProfileModal` | User profile view and management |
| `LoadingSpinner` | Loading indicator for async operations |
| `TruckFormModal` | Create/Edit truck form |
| `TrailerFormModal` | Create/Edit trailer form |
| `TireFormModal` | Create/Edit tire form |
| `TripFormModal` | Create/Edit trip form |
| `FuelFormModal` | Create/Edit fuel record form |
| `DriverFormModal` | Create/Edit driver form |
| `MaintenanceRuleFormModal` | Create/Edit maintenance rules |
| `MileageUpdateModal` | Update vehicle mileage |
| `TirePositionDiagram` | Visual tire position display |
| `TireStatistics` | Tire wear and status stats |
| `FuelStatistics` | Fuel consumption analytics |
| `DriverTripHistoryModal` | View driver's trip history |

### Route Guards

| Component | Description |
|-----------|-------------|
| `PrivateRoute` | Requires authentication to access |
| `RoleBasedRoute` | Requires specific role(s) to access |

---

## 📦 State Management

The application uses **Redux Toolkit** for state management.

### Store Structure
```javascript
{
  auth: {
    user: Object | null,      // Current user data
    token: String | null,     // JWT token
    isAuthenticated: Boolean, // Auth status
    loading: Boolean          // Loading state
  }
}
```

### Auth Slice Actions

| Action | Description |
|--------|-------------|
| `setCredentials` | Set user and token after login |
| `logout` | Clear auth state on logout |
| `setLoading` | Update loading state |

### Auth Persistence
- Token and user data are persisted to `localStorage`
- Auth state is restored on app initialization via `useAuthInit` hook

---

## 📡 API Services

All API calls are centralized in the `services/` directory.

### API Configuration (`api.js`)
- Base URL configured via `VITE_API_URL` environment variable
- Request interceptor adds JWT token to headers
- Response interceptor handles 401 errors (auto-redirect to login)
- 10-second timeout for all requests

### Available Services

| Service | Endpoints |
|---------|-----------|
| `authService` | login, register |
| `truckService` | CRUD, available trucks, mileage update |
| `trailerService` | CRUD, available trailers |
| `tireService` | CRUD, vehicle tires, km update |
| `tripService` | CRUD, start, complete, cancel, fuel update, driver trips, PDF |
| `fuelService` | CRUD, vehicle fuel records |
| `driverService` | List, activate, deactivate, trip history, stats |
| `maintenanceRuleService` | CRUD, activate, deactivate |
| `maintenanceAlertService` | Get all, get by vehicle |
| `statisticsService` | Dashboard, fleet, trips, fuel, maintenance, drivers, financial |
| `adminService` | User management |
| `profileService` | User profile |

---

## 🎨 Design System

### CSS Variables (`variables.css`)

The design system uses CSS custom properties for theming:

#### Colors
```css
/* Background */
--bg-main: #121212;         /* Main background */
--bg-surface: #1e1e1e;      /* Card/surface background */
--bg-elevated: #2a2a2a;     /* Elevated elements */

/* Primary Accent (Teal) */
--primary-500: #14b8a6;     /* Main primary color */

/* Secondary Accent (Purple) */
--secondary-500: #a855f7;   /* Main secondary color */

/* Text */
--text-primary: #f8fafc;    /* Primary text */
--text-secondary: #cbd5e1;  /* Secondary text */
--text-muted: #94a3b8;      /* Muted text */

/* Status */
--success: #10b981;         /* Success/green */
--warning: #f59e0b;         /* Warning/orange */
--danger: #ef4444;          /* Error/red */
--info: #3b82f6;            /* Info/blue */
```

#### Spacing
```css
--space-1: 4px;
--space-2: 8px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
```

#### Border Radius
```css
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 16px;
--radius-full: 9999px;
```

#### Typography
- **Sans-serif**: Inter, system fonts
- **Monospace**: Fira Code

---

## 🐳 Docker Deployment

The project includes a multi-stage Dockerfile optimized for both development and production.

### Build & Run

**Development:**
```bash
docker build --target development -t trucktrack-frontend:dev .
docker run -p 5173:5173 -v $(pwd):/app trucktrack-frontend:dev
```

**Production:**
```bash
docker build --target production -t trucktrack-frontend:prod .
docker run -p 80:80 trucktrack-frontend:prod
```

### Docker Stages

| Stage | Purpose |
|-------|---------|
| `build` | Build production bundle with Vite |
| `development` | Development server with hot reload |
| `production` | Nginx serving static files |

### Nginx Configuration

The production build uses Nginx with:
- **Gzip compression** for faster loading
- **Security headers** (X-Frame-Options, X-Content-Type-Options, etc.)
- **Static asset caching** (1 year for JS, CSS, images)
- **SPA routing** (all routes fallback to index.html)

---

## 🔧 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## 📝 Code Style

The project uses ESLint with the following plugins:
- `eslint-plugin-react-hooks` - React hooks rules
- `eslint-plugin-react-refresh` - Fast refresh compatibility

Run linting:
```bash
npm run lint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**TruckTrack Team**

---

*Built with ❤️ using React and Vite*
