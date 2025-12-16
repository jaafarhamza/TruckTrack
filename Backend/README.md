# 🚛 TruckTrack Backend API

A comprehensive **Fleet Management System** backend API built with **Node.js**, **Express.js**, and **MongoDB**. This API powers the TruckTrack application, enabling fleet managers and drivers to manage trucks, trailers, trips, fuel consumption, tire tracking, and maintenance operations.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Data Models](#-data-models)
- [Authentication & Authorization](#-authentication--authorization)
- [Testing](#-testing)
- [Docker Deployment](#-docker-deployment)

---

## ✨ Features

### Fleet Management
- **Truck Management**: CRUD operations for trucks with mileage tracking, status management, and availability checks
- **Trailer Management**: Support for multiple trailer types (Flatbed, Refrigerated, Tanker, Container, Lowboy, Dry Van)
- **Tire Tracking**: Monitor tire wear, positions, and replacement schedules with automatic status updates

### Trip Management
- **Trip Lifecycle**: Full workflow from PLANNED → IN_PROGRESS → COMPLETED (or CANCELLED)
- **Driver Assignment**: Assign drivers to trips with route tracking
- **Mileage Tracking**: Automatic distance calculation between start and end kilometers
- **PDF Export**: Generate trip reports in PDF format

### Fuel & Consumption
- **Fuel Records**: Track refueling with station, city, volume, and cost details
- **Consumption Analytics**: Calculate average consumption (L/100km), efficiency (km/L), and cost per kilometer
- **Multi-fuel Support**: Diesel, Gasoline, Electric, Hybrid

### Maintenance System
- **Maintenance Rules**: Define maintenance schedules based on kilometers or time intervals
- **Maintenance Alerts**: Automatic alerts when maintenance is due
- **Maintenance Logs**: Track all maintenance activities with cost tracking

### Statistics & Analytics
- **Dashboard Summary**: Real-time fleet overview
- **Fleet Statistics**: Vehicle utilization and status breakdown
- **Trip Statistics**: Distance, duration, and performance metrics
- **Fuel Statistics**: Consumption trends and cost analysis
- **Driver Statistics**: Performance tracking by driver
- **Financial Summary**: Cost breakdown and expense tracking

### Security
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and Driver roles with specific permissions
- **Input Validation**: Comprehensive request validation using express-validator

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js 20+ |
| **Framework** | Express.js 4.18 |
| **Database** | MongoDB with Mongoose 8.0 ODM |
| **Authentication** | JSON Web Tokens (JWT) |
| **Password Hashing** | bcryptjs |
| **Validation** | express-validator |
| **PDF Generation** | PDFKit |
| **Testing** | Vitest + Supertest + MongoDB Memory Server |
| **Containerization** | Docker (multi-stage builds) |

---

## 📁 Project Structure

```
Backend/
├── config/
│   ├── database.js          # MongoDB connection setup
│   └── env.js               # Environment configuration
├── controllers/
│   ├── adminController.js   # Admin operations
│   ├── authController.js    # Authentication handlers
│   ├── driverController.js  # Driver operations
│   ├── fuelController.js    # Fuel management
│   ├── maintenanceAlertController.js
│   ├── maintenanceRuleController.js
│   ├── statisticsController.js
│   ├── tireController.js    # Tire management
│   ├── trailerController.js # Trailer management
│   ├── tripController.js    # Trip management
│   └── truckController.js   # Truck management
├── middlewares/
│   ├── auth.js              # JWT authentication middleware
│   ├── authorization.js     # Role-based access control
│   ├── validate.js          # Validation error handler
│   ├── validation.js        # Auth validations
│   ├── driverValidation.js
│   ├── fuelValidation.js
│   ├── maintenanceRuleValidation.js
│   ├── tireValidation.js
│   ├── trailerValidation.js
│   ├── tripValidation.js
│   └── truckValidation.js
├── models/
│   ├── Fuel.js              # Fuel record schema
│   ├── MaintenanceLog.js    # Maintenance log schema
│   ├── MaintenanceRule.js   # Maintenance rule schema
│   ├── Tire.js              # Tire schema
│   ├── Trailer.js           # Trailer schema
│   ├── Trip.js              # Trip schema
│   ├── Truck.js             # Truck schema
│   └── User.js              # User schema with auth methods
├── routes/
│   ├── adminRoutes.js       # /api/admin
│   ├── authRoutes.js        # /api/auth
│   ├── driverRoutes.js      # /api/drivers
│   ├── fuelRoutes.js        # /api/fuel
│   ├── maintenanceAlertRoutes.js  # /api/maintenance-alerts
│   ├── maintenanceRuleRoutes.js   # /api/maintenance-rules
│   ├── statisticsRoutes.js  # /api/statistics
│   ├── tireRoutes.js        # /api/tires
│   ├── trailerRoutes.js     # /api/trailers
│   ├── tripRoutes.js        # /api/trips
│   └── truckRoutes.js       # /api/trucks
├── services/
│   ├── adminService.js
│   ├── authService.js
│   ├── driverService.js
│   ├── fuelService.js
│   ├── maintenanceCalculationService.js
│   ├── maintenanceRuleService.js
│   ├── pdfService.js        # PDF generation
│   ├── statisticsService.js # Analytics & reporting
│   ├── tireService.js
│   ├── trailerService.js
│   ├── tripService.js
│   └── truckService.js
├── tests/                   # Test suites
├── utils/
│   ├── constants.js         # Enums and constants
│   ├── CustomError.js       # Custom error class
│   └── responseFormatter.js # Standardized responses
├── server.js                # Application entry point
├── Dockerfile               # Docker configuration
├── package.json
└── vitest.config.js         # Test configuration
```

---

## 🚀 Installation

### Prerequisites
- Node.js 20.x or higher
- MongoDB 6.0+ (local or MongoDB Atlas)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TruckTrack/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the server**
   ```bash
   npm run dev  # Development mode with hot reload
   npm start    # Production mode
   ```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment (development/production/test) | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/trucktrack` |
| `JWT_SECRET` | Secret key for JWT signing | (required) |
| `JWT_EXPIRE` | Token expiration time | `24h` |
| `FRONTEND_URL` | Frontend URL for CORS | (required) |

### Example `.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/trucktrack
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=24h
FRONTEND_URL=http://localhost:3000
```

---

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```

### Health Check
Once running, verify the API is working:
```bash
curl http://localhost:5000/health
# Response: {"status":"healthy","database":"connected","timestamp":"..."}

curl http://localhost:5000/api
# Response: {"message":"TruckTrack API is running","status":"success","database":"connected","environment":"development"}
```

---

## 📡 API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/profil` | Get current user profile | Protected |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/users` | List all users | Admin |
| PATCH | `/users/:id/activate` | Activate user | Admin |
| PATCH | `/users/:id/deactivate` | Deactivate user | Admin |

### Trucks (`/api/trucks`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all trucks | Protected |
| GET | `/available` | List available trucks | Protected |
| GET | `/:id` | Get truck by ID | Protected |
| POST | `/` | Create new truck | Admin |
| PUT | `/:id` | Update truck | Admin |
| DELETE | `/:id` | Delete truck | Admin |
| PATCH | `/:id/mileage` | Update truck mileage | Admin |

### Trailers (`/api/trailers`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all trailers | Protected |
| GET | `/available` | List available trailers | Protected |
| GET | `/:id` | Get trailer by ID | Protected |
| POST | `/` | Create new trailer | Admin |
| PUT | `/:id` | Update trailer | Admin |
| DELETE | `/:id` | Delete trailer | Admin |

### Tires (`/api/tires`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all tires | Protected |
| GET | `/vehicle/:vehicleType/:vehicleId` | Get tires by vehicle | Protected |
| GET | `/:id` | Get tire by ID | Protected |
| POST | `/` | Create new tire | Admin |
| PUT | `/:id` | Update tire | Admin |
| DELETE | `/:id` | Delete tire | Admin |
| PATCH | `/:id/km` | Update tire mileage | Admin |

### Trips (`/api/trips`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all trips | Admin |
| GET | `/stats` | Get trip statistics | Admin |
| GET | `/driver/:driverId` | Get driver's trips | Admin |
| GET | `/:id` | Get trip by ID | Admin |
| POST | `/` | Create new trip | Admin |
| PUT | `/:id` | Update trip | Admin |
| DELETE | `/:id` | Delete trip | Admin |
| PATCH | `/:id/start` | Start trip | Admin |
| PATCH | `/:id/complete` | Complete trip | Admin |
| PATCH | `/:id/cancel` | Cancel trip | Admin |
| PATCH | `/:id/fuel` | Update fuel consumption | Admin |

### Driver Trips (`/api/trips/my-trips`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/my-trips` | Get my trips | Driver |
| GET | `/my-trips/stats` | Get my trip statistics | Driver |
| GET | `/my-trips/:id` | Get my trip details | Driver |
| GET | `/my-trips/:id/pdf` | Download trip PDF | Driver |
| PATCH | `/my-trips/:id/start` | Start my trip | Driver |
| PATCH | `/my-trips/:id/complete` | Complete my trip | Driver |

### Fuel (`/api/fuel`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all fuel records | Protected |
| GET | `/vehicle/:vehicleType/:vehicleId` | Get fuel by vehicle | Protected |
| GET | `/:id` | Get fuel record by ID | Protected |
| POST | `/` | Create fuel record | Admin |
| PUT | `/:id` | Update fuel record | Admin |
| DELETE | `/:id` | Delete fuel record | Admin |

### Maintenance Rules (`/api/maintenance-rules`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | List all rules | Protected |
| GET | `/:id` | Get rule by ID | Protected |
| POST | `/` | Create rule | Admin |
| PUT | `/:id` | Update rule | Admin |
| DELETE | `/:id` | Delete rule | Admin |
| PATCH | `/:id/activate` | Activate rule | Admin |
| PATCH | `/:id/deactivate` | Deactivate rule | Admin |

### Maintenance Alerts (`/api/maintenance-alerts`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/` | Get all alerts | Protected |
| GET | `/vehicle/:vehicleType/:vehicleId` | Get vehicle alerts | Protected |

### Statistics (`/api/statistics`)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Dashboard summary | Admin |
| GET | `/fleet` | Fleet overview | Admin |
| GET | `/trips` | Trip statistics | Admin |
| GET | `/fuel` | Fuel statistics | Admin |
| GET | `/maintenance` | Maintenance statistics | Admin |
| GET | `/drivers` | Driver statistics | Admin |
| GET | `/financial` | Financial summary | Admin |

---

## 📦 Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| username | String | Unique username (3-50 chars) |
| email | String | Unique email address |
| password | String | Hashed password (min 6 chars) |
| role | Enum | `ADMIN` or `DRIVER` |
| firstName | String | First name |
| lastName | String | Last name |
| phone | String | Phone number |
| license | String | Driver's license (required for drivers) |
| hireDate | Date | Date of hire |
| active | Boolean | Account status |

### Truck
| Field | Type | Description |
|-------|------|-------------|
| plateNumber | String | Unique plate number |
| brand | String | Truck manufacturer |
| model | String | Truck model |
| year | Number | Manufacturing year |
| mileage | Number | Current odometer reading |
| status | Enum | `AVAILABLE`, `ON_TRIP`, `UNDER_MAINTENANCE`, `OUT_OF_SERVICE` |
| loadCapacity | Number | Maximum load capacity (kg) |
| averageConsumption | Number | Average fuel consumption |
| purchaseDate | Date | Purchase date |
| purchasePrice | Number | Purchase price |
| color | String | Truck color |
| serialNumber | String | Vehicle serial number |

### Trailer
| Field | Type | Description |
|-------|------|-------------|
| plateNumber | String | Unique plate number |
| type | Enum | `FLATBED`, `REFRIGERATED`, `TANKER`, `CONTAINER`, `LOWBOY`, `DRY_VAN` |
| brand | String | Trailer manufacturer |
| model | String | Trailer model |
| year | Number | Manufacturing year |
| status | Enum | Same as Truck status |
| loadCapacity | Number | Maximum load (kg) |
| length/width/height | Number | Dimensions (meters) |
| axles | Number | Number of axles (1-5) |
| tareWeight | Number | Empty weight |
| purchaseDate/purchasePrice | Date/Number | Purchase info |

### Trip
| Field | Type | Description |
|-------|------|-------------|
| tripNumber | String | Auto-generated (e.g., TRP-2412-0001) |
| driver | ObjectId | Reference to User |
| truck | ObjectId | Reference to Truck |
| trailer | ObjectId | Reference to Trailer (optional) |
| origin/destination | Object | Address with city, country, coordinates |
| departureDate | Date | Scheduled departure |
| arrivalDate | Date | Scheduled/actual arrival |
| status | Enum | `PLANNED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| startKm/endKm | Number | Odometer readings |
| fuelConsumed | Number | Total fuel used (liters) |
| fuelCost | Number | Total fuel cost |
| cargo | String | Cargo description |
| weight | Number | Cargo weight |
| remarks | String | Additional notes |

### Tire
| Field | Type | Description |
|-------|------|-------------|
| reference | String | Unique tire reference |
| vehicle | ObjectId | Reference to Truck/Trailer |
| vehicleType | Enum | `Truck` or `Trailer` |
| position | Enum | `FRONT_LEFT`, `FRONT_RIGHT`, `REAR_LEFT`, `REAR_RIGHT`, `SPARE` |
| brand | String | Tire manufacturer |
| model | String | Tire model |
| dimension | String | Size (e.g., 315/80R22.5) |
| installationDate | Date | when installed |
| installationKm | Number | Odometer at installation |
| currentKm | Number | Current odometer |
| status | Enum | `NEW`, `GOOD`, `WORN`, `TO_REPLACE` (auto-calculated) |
| pressure | Number | Current pressure (PSI) |
| purchasePrice | Number | Price paid |

### Fuel
| Field | Type | Description |
|-------|------|-------------|
| vehicle | ObjectId | Reference to Truck/Trailer |
| vehicleModel | Enum | `Truck` or `Trailer` |
| trip | ObjectId | Reference to Trip (optional) |
| date | Date | Refueling date |
| volume | Number | Liters (1-2000) |
| unitCost | Number | Price per liter |
| totalCost | Number | Total cost (auto-calculated) |
| currentKm | Number | Odometer reading |
| station | String | Fuel station name |
| city | String | Station city |
| invoice | String | Invoice number |
| fuelType | Enum | `DIESEL`, `GASOLINE`, `ELECTRIC`, `HYBRID` |

### MaintenanceRule
| Field | Type | Description |
|-------|------|-------------|
| type | Enum | `TIRE`, `OIL_CHANGE`, `CHECKUP`, `BRAKES`, `FILTERS`, `BELT` |
| description | String | Rule description |
| kmInterval | Number | Kilometers between maintenance |
| monthInterval | Number | Months between maintenance (1-60) |
| estimatedCost | Number | Expected cost |
| active | Boolean | Rule active status |

### MaintenanceLog
| Field | Type | Description |
|-------|------|-------------|
| vehicle | ObjectId | Reference to Truck/Trailer |
| vehicleType | Enum | `Truck` or `Trailer` |
| rule | ObjectId | Reference to MaintenanceRule |
| operationType | Enum | Type of maintenance |
| date | Date | Maintenance date |
| currentKm | Number | Odometer reading |
| description | String | Work performed |
| cost | Number | Actual cost |
| garage | String | Service location |
| invoice | String | Invoice number |
| technician | String | Technician name |
| duration | Number | Work duration (hours) |
| status | Enum | `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| nextMaintenanceKm | Number | Next due at km |
| nextMaintenanceDate | Date | Next due date |

---

## 🔒 Authentication & Authorization

### Authentication
The API uses **JWT (JSON Web Tokens)** for authentication.

**Login Flow:**
1. User sends credentials to `POST /api/auth/login`
2. Server validates and returns a JWT token
3. Client includes token in subsequent requests via `Authorization: Bearer <token>`

**Token Payload:**
```json
{
  "id": "user_id",
  "username": "john_doe",
  "email": "john@example.com",
  "role": "ADMIN"
}
```

### Authorization (Roles)

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access to all endpoints. Can manage users, vehicles, trips, and view all statistics. |
| **DRIVER** | Limited access. Can view available vehicles, manage own trips, and view own statistics. |

### Protected Routes
- All routes except `/api/auth/login` and `/api/auth/register` require authentication
- Admin routes require the user to have `ADMIN` role
- Drivers can only access their own trips via `/api/trips/my-trips`

---

## 🧪 Testing

The project uses **Vitest** as the test runner with **Supertest** for HTTP assertions and **MongoDB Memory Server** for database testing.

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── auth/              # Authentication tests
├── helpers/           # Test utilities
├── middlewares/       # Middleware tests
├── tires/             # Tire API tests
├── trailers/          # Trailer API tests
├── trucks/            # Truck API tests
└── setup.js           # Test configuration
```

---

## 🐳 Docker Deployment

The project includes a multi-stage Dockerfile optimized for both development and production.

### Build & Run with Docker

**Development:**
```bash
docker build --target development -t trucktrack-backend:dev .
docker run -p 5000:5000 -v $(pwd):/app trucktrack-backend:dev
```

**Production:**
```bash
docker build --target production -t trucktrack-backend:prod .
docker run -p 5000:5000 --env-file .env trucktrack-backend:prod
```

### Docker Features
- **Multi-stage builds**: Separate stages for dependencies, development, and production
- **Non-root user**: Production container runs as non-root for security
- **Health checks**: Built-in health check endpoint monitoring
- **Optimized layers**: Production dependencies cached separately

---

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

### HTTP Status Codes
| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

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

*Built with ❤️ for efficient fleet management*
