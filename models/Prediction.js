const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
  gamble: { type: mongoose.Schema.Types.ObjectId, ref: 'Gamble', required: true },
  jornada: { type: Number, required: true },
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  pick: { type: String, enum: ['home','away'], required: true },
  createdAt: { type: Date, default: Date.now },
  correct: { type: Boolean, default: null }
});

module.exports = mongoose.model('Prediction', PredictionSchema);
