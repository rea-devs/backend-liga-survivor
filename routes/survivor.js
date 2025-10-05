const express = require('express');
const router = express.Router();
const Survivor = require('../models/Survivor');
const Gamble = require('../models/Gamble');
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');

router.post('/join/:survivorId', async (req, res) => {
  const { survivorId } = req.params;
  const userId = req.query.userId || req.body.userId;
  if (!userId) return res.status(400).json({ ok:false, error: 'userId required' });

  try {
    const survivor = await Survivor.findById(survivorId);
    if (!survivor) return res.status(404).json({ ok:false, error: 'Survivor not found' });

    const exists = await Gamble.findOne({ survivor: survivorId, userId });
    if (exists) return res.status(400).json({ ok:false, error: 'Already joined' });

    const gamble = new Gamble({
      survivor: survivorId,
      userId,
      livesLeft: survivor.lives
    });
    await gamble.save();
    res.json({ ok:true, gamble });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error: 'Server error' });
  }
});

router.post('/pick', async (req, res) => {
  const { userId, survivorId, jornada, matchId, pick } = req.body;
  if (!userId || !survivorId || !jornada || !matchId || !pick)
    return res.status(400).json({ ok:false, error: 'Missing params' });

  try {
    const gamble = await Gamble.findOne({ survivor: survivorId, userId });
    if (!gamble) return res.status(404).json({ ok:false, error: 'Not joined' });
    if (gamble.eliminatedAtJornada) return res.status(400).json({ ok:false, error: 'User eliminated' });

    const exists = await Prediction.findOne({ gamble: gamble._id, jornada });
    if (exists) return res.status(400).json({ ok:false, error: 'Pick already made for this jornada' });

    const match = await Match.findById(matchId);
    if (!match) return res.status(404).json({ ok:false, error: 'Match not found' });

    const pred = new Prediction({
      gamble: gamble._id,
      jornada,
      matchId,
      pick
    });
    await pred.save();

    res.json({ ok:true, prediction: pred });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok:false, error: 'Server error' });
  }
});

module.exports = router;
