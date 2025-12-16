# 🚛 TruckTrack

**Smart Fleet Tracking & Management Platform**

TruckTrack is a full-stack web application that helps transport companies monitor truck routes, fuel consumption, maintenance, and driver performance — all from one centralized dashboard.

---

## 📦 Project Overview

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 19 + Vite | Modern SPA with role-based dashboards |
| **Backend** | Node.js + Express | RESTful API with JWT authentication |
| **Database** | MongoDB | Document database with Mongoose ODM |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 6.0+ (or use Docker)
- Docker & Docker Compose (optional)

### Option 1: Docker Compose (Recommended)

```bash
# Clone and navigate to project
git clone <repository-url>
cd TruckTrack

# Copy environment file
cp .env.example .env

# Start all services
docker-compose up -d
```

**Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Option 2: Manual Setup

```bash
# Backend
cd Backend
npm install
cp .env.example .env  # Configure MongoDB URI and JWT secret
npm run dev           # Runs on http://localhost:5000

# Frontend (new terminal)
cd Frontend
npm install
cp .env.example .env  # Set VITE_API_URL
npm run dev           # Runs on http://localhost:5173
```

---

## 🔑 Default Credentials

After starting the application, register a new user:
- First user can be activated by directly updating MongoDB `active: true`
- Or use the admin panel to activate users

---

## 📂 Project Structure

```
TruckTrack/
├── Backend/              # Express.js API server
│   ├── controllers/      # Route handlers
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── middlewares/      # Auth, validation
│   └── README.md         # 📖 Detailed backend docs
│
├── Frontend/             # React SPA
│   ├── src/
│   │   ├── pages/        # Route pages
│   │   ├── components/   # Reusable UI
│   │   ├── services/     # API clients
│   │   └── store/        # Redux state
│   └── README.md         # 📖 Detailed frontend docs
│
├── docker-compose.yml    # Production compose
├── docker-compose.dev.yml # Development compose
└── DOCKER.md             # Docker documentation
```

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **Fleet Management** | Trucks, trailers, and tires with status tracking |
| **Trip Management** | Plan, assign, start, complete trips with route tracking |
| **Fuel Tracking** | Monitor consumption, costs, and efficiency metrics |
| **Maintenance** | Rules-based maintenance alerts and scheduling |
| **Driver Portal** | Separate dashboard for drivers to manage their trips |
| **Analytics** | Interactive charts and performance dashboards |
| **Role-Based Access** | Admin and Driver roles with different permissions |

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Backend README](./Backend/README.md) | API endpoints, models, authentication details |
| [Frontend README](./Frontend/README.md) | Components, routing, state management |
| [Docker Guide](./DOCKER.md) | Container deployment instructions |

---

## 🛠 Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, PDFKit

**Frontend:** React 19, Vite, Redux Toolkit, React Router, Axios, Recharts

**DevOps:** Docker, Nginx, Vitest

---

## 📜 License

MIT License

---

*Built with ❤️ for efficient fleet management*
