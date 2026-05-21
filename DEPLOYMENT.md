# Deployment Steps

## 1. Prerequisites
- Node.js (v18+)
- MongoDB instance (local or Atlas)

## 2. Environment Variables
Create a `.env` file in the root directory and add the following:
```
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartwater
# or use MONGO_URI instead if that is your environment name
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/smartwater
JWT_SECRET=your_super_secret_key_here
```

## 3. Installation
Run the following command to install dependencies:
```bash
npm install
```

## 4. Run the Server
To start the server in development mode:
```bash
node server.js
```

## 5. IoT Integration (ESP32)
The ESP32 module needs to make a `POST` request to `http://<your-server-ip>:3000/api/iot/log` with the following JSON payload:
```json
{
  "roomNumber": "101",
  "amountLitres": 2.5,
  "flowRate": 1.2
}
```

## 6. Hosting
- **Backend/Frontend**: You can deploy this entire repository to services like Render, Heroku, or DigitalOcean.
- Ensure that the `.env` variables are correctly configured in the hosting provider's dashboard.
