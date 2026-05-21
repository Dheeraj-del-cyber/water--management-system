# Smart Water Management System

Compact full-stack project for monitoring water levels using an ESP32 sensor, a Node.js + Express backend, and a lightweight web dashboard.

**Key Features**
- **Real-time logging**: ESP32 posts water-sensor readings to the server for persistence and analysis.
- **User auth**: Sign-up / login with JWT-based sessions and protected API routes.
- **Web dashboard**: Static front-end under `public/` for viewing status, historical logs, and leaderboards.
- **MongoDB persistence**: Sensor readings and users are stored using Mongoose models.

**Repository Structure**
- `server.js`: Express app and route mounting.
- `routes/`: `authRoutes.js`, `apiRoutes.js` — server endpoints.
- `models/`: `User.js`, `WaterLog.js` — Mongoose schemas.
- `middleware/`: `authMiddleware.js` — protects API endpoints.
- `public/`: Front-end pages and static assets (`index.html`, `dashboard.html`, `js/`, `css/`).
- `iot/esp32_water_sensor/esp32_water_sensor.ino`: ESP32 sketch for the sensor.

**Prerequisites**
- Node.js 18+ and npm
- A running MongoDB instance (local or Atlas)
- An ESP32 board and a water level sensor (or simulate POST requests)

**Environment Variables**
Create a `.env` file at the project root with:

```
MONGODB_URI=<your-mongodb-connection-string>
# or use MONGO_URI if your environment variable is named that
MONGO_URI=<your-mongodb-connection-string>
PORT=3000
```

**Install & Run (local)**

1. Install dependencies:

```
npm install
```

2. Start the server:

```
node server.js
```

The server serves the UI from the `public/` folder and exposes API routes under `/api` and auth under `/auth`.

**ESP32 (IoT) Quick Start**
1. Open `iot/esp32_water_sensor/esp32_water_sensor.ino` in the Arduino IDE or PlatformIO.
2. Configure your Wi‑Fi credentials and the server endpoint URL in the sketch.
3. Upload to the ESP32. The device will POST sensor readings to the server's API.

**API Overview**
- `POST /auth/signup` — create a user
- `POST /auth/login` — login and receive JWT
- `GET /api/logs` — (protected) fetch water logs
- `POST /api/logs` — (protected) submit a new reading (used by ESP32)

Open the routes in `routes/` for full details and parameters.

**Development Notes & Next Steps**
- Add `npm` scripts for `start` and `dev` (e.g., `nodemon`) to `package.json`.
- Add tests and linting.
- Harden auth (refresh tokens, rate limits) for production.

**License & Attribution**
This project is provided as-is. Add a license file if you plan to open-source it.

---

Updated README: core usage, hardware notes, and quick-start instructions.
