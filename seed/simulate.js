const mongoose = require('mongoose');
require('dotenv').config();
const Match = require('../models/Match');
const Prediction = require('../models/Prediction');
const Gamble = require('../models/Gamble');
const Survivor = require('../models/Survivor');

const simulateMatches = async () => {
    try {
        // Verificar que existan predicciones
        const totalPredictions = await Prediction.countDocuments();
        if (totalPredictions === 0) {
            console.log('❌ No hay predicciones para evaluar. Primero deben hacer picks los jugadores.');
            return;
        }

        console.log(`📊 Encontradas ${totalPredictions} predicciones para evaluar`);

        // Obtener todos los matches pendientes que tienen predicciones
        const matchesWithPredictions = await Match.find({
            result: 'pending',
            _id: { $in: await Prediction.distinct('matchId') }
        });

        if (matchesWithPredictions.length === 0) {
            console.log('❌ No hay matches pendientes con predicciones para simular.');
            return;
        }

        console.log(`🎲 Simulando ${matchesWithPredictions.length} matches...`);

        for (const match of matchesWithPredictions) {
            // Simular resultado del partido (aleatorio)
            const outcomes = ['home'/* , 'away', 'draw' */];
            const randomResult = outcomes[Math.floor(Math.random() * outcomes.length)];

            // Generar marcadores realistas
            let homeScore, awayScore;
            switch (randomResult) {
                case 'home':
                    homeScore = Math.floor(Math.random() * 3) + 1; // 1-3 goles
                    awayScore = Math.floor(Math.random() * homeScore); // 0 a menos que home
                    break;
                case 'away':
                    awayScore = Math.floor(Math.random() * 3) + 1; // 1-3 goles
                    homeScore = Math.floor(Math.random() * awayScore); // 0 a menos que away
                    break;
                case 'draw':
                    const drawScore = Math.floor(Math.random() * 3); // 0-2 goles cada uno
                    homeScore = drawScore;
                    awayScore = drawScore;
                    break;
            }

            // Actualizar el match con el resultado
            await Match.findByIdAndUpdate(match._id, {
                result: randomResult,
                homeScore,
                awayScore
            });

            console.log(`⚽ ${match.home} ${homeScore}-${awayScore} ${match.away} (${randomResult})`);

            // Evaluar predicciones para este match
            const predictions = await Prediction.find({ matchId: match._id }).populate('gamble');

            for (const prediction of predictions) {
                const isCorrect = prediction.pick === randomResult;

                // Actualizar la predicción
                await Prediction.findByIdAndUpdate(prediction._id, {
                    correct: isCorrect
                });

                // Actualizar vidas del gamble
                const gamble = prediction.gamble;

                // En Survivor pierdes vida si tu equipo NO GANA (pierde o empata)
                if (!isCorrect) {
                    // Si la predicción es incorrecta, pierde una vida
                    const newLives = Math.max(0, gamble.livesLeft - 1);
                    const updateData = { livesLeft: newLives };

                    // Si se queda sin vidas, marcar jornada de eliminación
                    if (newLives === 0) {
                        updateData.eliminatedAtJornada = prediction.jornada;
                    }

                    const updatedGamble = await Gamble.findByIdAndUpdate(gamble._id, updateData);
                    if (!updatedGamble) {
                        console.error(`❌ Error actualizando gamble para usuario ${gamble.userId}`);
                    } else {

                        console.log(`💔 Usuario ${gamble.userId} perdió una vida (${newLives} restantes) - Eligió ${prediction.pick}, resultado: ${randomResult}`);
                        if (newLives === 0) {
                            console.log(`☠️  Usuario ${gamble.userId} ELIMINADO en jornada ${prediction.jornada}`);
                        }
                    }

                } else {
                    console.log(`✅ Usuario ${gamble.userId} acertó - Eligió ${prediction.pick}, resultado: ${randomResult}`);
                }
            }
        }

        // Mostrar estadísticas finales
        await showStatistics();

    } catch (error) {
        console.error('❌ Error simulando matches:', error);
    }
};

const showStatistics = async () => {
    try {
        console.log('\n📈 ESTADÍSTICAS FINALES:');
        console.log('========================');

        const survivors = await Survivor.find();

        for (const survivor of survivors) {
            console.log(`\n🏆 ${survivor.title}:`);

            const gambles = await Gamble.find({ survivor: survivor._id });
            const totalPlayers = gambles.length;
            const activePlayers = gambles.filter(g => !g.eliminatedAtJornada).length;
            const eliminatedPlayers = totalPlayers - activePlayers;

            console.log(`   👥 Jugadores totales: ${totalPlayers}`);
            console.log(`   ✅ Jugadores activos: ${activePlayers}`);
            console.log(`   ❌ Jugadores eliminados: ${eliminatedPlayers}`);

            if (activePlayers > 0) {
                const activeGambles = gambles.filter(g => !g.eliminatedAtJornada);
                const avgLives = activeGambles.reduce((sum, g) => sum + g.livesLeft, 0) / activePlayers;
                console.log(`   💖 Promedio de vidas: ${avgLives.toFixed(1)}`);

                // Mostrar top 3 jugadores
                const topPlayers = activeGambles
                    .sort((a, b) => b.livesLeft - a.livesLeft)
                    .slice(0, 3);

                console.log(`   🥇 Top jugadores:`);
                topPlayers.forEach((gamble, index) => {
                    console.log(`      ${index + 1}. Usuario ${gamble.userId}: ${gamble.livesLeft} vidas`);
                });
            }
        }

        // Estadísticas de predicciones
        const totalPredictions = await Prediction.countDocuments();
        const correctPredictions = await Prediction.countDocuments({ correct: true });
        const incorrectPredictions = await Prediction.countDocuments({ correct: false });
        const accuracy = totalPredictions > 0 ? (correctPredictions / totalPredictions * 100).toFixed(1) : 0;

        console.log(`\n🎯 PRECISIÓN GENERAL:`);
        console.log(`   Predicciones totales: ${totalPredictions}`);
        console.log(`   Correctas: ${correctPredictions}`);
        console.log(`   Incorrectas: ${incorrectPredictions}`);
        console.log(`   Precisión: ${accuracy}%`);

    } catch (error) {
        console.error('❌ Error mostrando estadísticas:', error);
    }
};

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    await simulateMatches();
    process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });