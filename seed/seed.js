const mongoose = require('mongoose');
require('dotenv').config();
const Survivor = require('../models/Survivor');
const Match = require('../models/Match');
const Gamble = require('../models/Gamble');
const Prediction = require('../models/Prediction');

const seedSurvivors = async () => {
  try {
    const existingSurvivors = await Survivor.countDocuments();

    /* if (existingSurvivors > 0) {
      console.log('Database already has survivors, skipping seeding');
      return;
    } */

    await Survivor.deleteMany({});
    await Match.deleteMany({});
    await Gamble.deleteMany({});
    await Prediction.deleteMany({});

    // Primero crear los matches
    const matches = [];

    const matchData = [
      { home: "Manchester United", away: "Liverpool", jornada: 1 },
      { home: "Arsenal", away: "Chelsea", jornada: 1 },
      { home: "Manchester City", away: "Tottenham", jornada: 1 },
      { home: "Real Madrid", away: "Barcelona", jornada: 1 },
      { home: "Atletico Madrid", away: "Sevilla", jornada: 1 },
      { home: "Valencia", away: "Villarreal", jornada: 1 },
      { home: "PSG", away: "Bayern Munich", jornada: 1 },
      { home: "AC Milan", away: "Inter Milan", jornada: 1 },
      { home: "Porto", away: "Benfica", jornada: 1 }
    ];

    for (let i = 0; i < matchData.length; i++) {
      const match = new Match({
        jornada: matchData[i].jornada,
        home: matchData[i].home,
        away: matchData[i].away,
        startAt: new Date(Date.now() + (i + 1) * 3600000) // 1 hora de diferencia entre cada match
      });
      await match.save();
      matches.push(match);
    }

    const sampleSurvivors = [
      {
        title: "Liga Premier 2025",
        description: "Survivor de la Premier League con los mejores equipos ingleses",
        lives: 3,
        jornadas: 38,
        currentJornada: 1,
        matches: matches.slice(0, 3).map(m => m._id) // Primeros 3 matches
      },
      {
        title: "La Liga Survivor",
        description: "Competencia survivor de La Liga española",
        lives: 3,
        jornadas: 38,
        currentJornada: 1,
        matches: matches.slice(3, 6).map(m => m._id) // Siguientes 3 matches
      },
      {
        title: "Champions League Knockout",
        description: "Eliminatorias de Champions League en formato survivor",
        lives: 3,
        jornadas: 10,
        currentJornada: 1,
        matches: matches.slice(6, 9).map(m => m._id) // Últimos 3 matches
      }
    ];

    await Survivor.insertMany(sampleSurvivors);
    console.log('✅ Sample survivors seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding survivors:', error);
  }
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  await seedSurvivors();
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
