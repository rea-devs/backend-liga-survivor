const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  jornada: { type: Number, required: true },
  home: { type: String, required: true },
  away: { type: String, required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  startAt: { type: Date },
  result: { type: String, enum: ['home','away','draw','pending'], default: 'pending' }
});

module.exports = mongoose.model('Match', MatchSchema);
