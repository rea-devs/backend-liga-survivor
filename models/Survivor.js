const mongoose = require('mongoose');

const SurvivorSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  lives: { type: Number, default: 3 },
  jornadas: { type: Number, default: 38 },
  currentJornada: { type: Number, default: 1 },
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Match' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survivor', SurvivorSchema);
