const express = require('express');
const router = express.Router();
const Survivor = require('../models/Survivor');
const Gamble = require('../models/Gamble');
const Prediction = require('../models/Prediction');

router.get('/', async (req, res) => {
  try {
    const survivors = await Survivor.find().populate('matches').lean();
    const data = await Promise.all(survivors.map(async s => {
      const count = await Gamble.countDocuments({ survivor: s._id });

      // Obtener información detallada de los gambles (incluyendo vidas)
      const gambles = await Gamble.find({ survivor: s._id }).select('userId livesLeft eliminatedAtJornada').lean();

      return {
        ...s,
        participants: count,
        gambles: gambles // Agregar información de gambles con vidas
      };
    }));

    console.log('Data fetched:', JSON.stringify(data, null, 2));

    res.json({ ok: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

// Nueva ruta para obtener el estado detallado de un gamble específico
router.get('/gamble/:survivorId/:userId', async (req, res) => {
  try {
    const { survivorId, userId } = req.params;

    const gamble = await Gamble.findOne({
      survivor: survivorId,
      userId: userId
    }).populate('survivor').lean();

    if (!gamble) {
      return res.status(404).json({ ok: false, error: 'Gamble not found' });
    }

    // Obtener las predicciones del usuario
    const predictions = await Prediction.find({ gamble: gamble._id }).populate('matchId').lean();

    res.json({
      ok: true,
      gamble: {
        ...gamble,
        predictions: predictions
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
});

module.exports = router;
