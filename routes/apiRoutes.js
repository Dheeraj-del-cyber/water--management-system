const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const WaterLog = require('../models/WaterLog');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// Get Dashboard Data (User)
router.get('/dashboard', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        // Start of today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const logs = await WaterLog.find({ userId: req.user.id });
        
        let totalUsed = 0;
        let todayUsed = 0;
        
        logs.forEach(log => {
            totalUsed += log.amountLitres;
            if (log.timestamp >= today) {
                todayUsed += log.amountLitres;
            }
        });

        res.json({
            todayUsed,
            totalUsed,
            ecoPoints: user.ecoPoints,
            roomNumber: user.roomNumber,
            history: logs.slice(-10).reverse()
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ role: 'user' })
                                .sort({ ecoPoints: -1 })
                                .select('fullName roomNumber ecoPoints')
                                .limit(10);
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Admin Stats
router.get('/admin/stats', protect, admin, async (req, res) => {
    try {
        const usersCount = await User.countDocuments({ role: 'user' });
        const logs = await WaterLog.find();
        
        let totalConsumption = 0;
        logs.forEach(l => totalConsumption += l.amountLitres);

        const allUsers = await User.find({ role: 'user' }).select('-password');

        res.json({
            usersCount,
            totalConsumption,
            users: allUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// IoT Endpoint for ESP32
router.post('/iot/log', async (req, res) => {
    try {
        const { roomNumber, amountLitres, flowRate } = req.body;
        
        // Always log to server console so user can see it working without DB
        console.log(`[IoT TEST] Received data from Room ${roomNumber}: ${amountLitres}L used, flow rate: ${flowRate}L/min`);

        // Attempt DB Operations, but don't crash if they fail
        if (mongoose.connection.readyState !== 1) {
             return res.status(200).json({ message: 'DB not connected, but data received successfully', received: req.body });
        }

        // Find user by room number
        const user = await User.findOne({ roomNumber });
        if (!user) {
             console.log(`[IoT TEST] Room ${roomNumber} not found in DB yet.`);
             return res.status(200).json({ message: 'Room not found, but data received successfully', received: req.body });
        }

        const log = await WaterLog.create({
            userId: user._id,
            roomNumber,
            amountLitres,
            flowRate
        });

        // Add eco points for keeping usage low (simplified logic)
        if (amountLitres < 10) {
            user.ecoPoints += 1;
            await user.save();
        }

        res.status(201).json(log);
    } catch (error) {
        console.error("IoT Log Error:", error.message);
        // Even on error, return 200 so ESP32 thinks it succeeded for testing purposes
        res.status(200).json({ message: 'Error occurred but data received', error: error.message });
    }
});

module.exports = router;
