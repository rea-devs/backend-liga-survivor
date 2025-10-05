const mongoose = require('mongoose');

const GambleSchema = new mongoose.Schema({
  survivor: { type: mongoose.Schema.Types.ObjectId, ref: 'Survivor', required: true },
  userId: { type: String, required: true },
  livesLeft: { type: Number, required: true },
  joinedAt: { type: Date, default: Date.now },
  eliminatedAtJornada: { type: Number, default: null }
});

module.exports = mongoose.model('Gamble', GambleSchema);
