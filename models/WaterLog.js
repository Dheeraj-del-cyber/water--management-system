const mongoose = require('mongoose');

const waterLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomNumber: { type: String, required: true },
    amountLitres: { type: Number, required: true },
    flowRate: { type: Number, default: 0 },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WaterLog', waterLogSchema);
