const mongoose = require('mongoose');
const config = require('./config');

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        try {
            await mongoose.connect(config.MONGODB_URI, config.MONGODB_OPTIONS);
            console.log('✅ Conectado a MongoDB exitosamente');
            console.log(`📊 Base de datos: ${config.MONGODB_URI}`);
        } catch (error) {
            console.error('❌ Error conectando a MongoDB:', error);
            process.exit(1);
        }
    }

    // Crear sesión de juego
    async createGameSession(userId) {
        try {
            const session = {
                userId: userId,
                startTime: new Date(),
                endTime: null,
                playtime: 0,
                createdAt: new Date()
            };

            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('game_sessions');
            const result = await sessionsCollection.insertOne(session);
            
            return result.insertedId.toString();
        } catch (error) {
            console.error('Error creando sesión de juego:', error);
            throw error;
        }
    }

    // Actualizar fin de sesión
    async updateSessionEnd(sessionId, playtime) {
        try {
            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('game_sessions');
            
            await sessionsCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(sessionId) },
                { 
                    $set: { 
                        endTime: new Date(),
                        playtime: playtime
                    }
                }
            );
        } catch (error) {
            console.error('Error actualizando sesión:', error);
            throw error;
        }
    }

    // Guardar puntuación
    async saveScore(userId, sessionId, gameType, score) {
        try {
            const scoreData = {
                userId: userId,
                sessionId: sessionId,
                gameType: gameType,
                score: score,
                createdAt: new Date()
            };

            const db = mongoose.connection.db;
            const scoresCollection = db.collection('scores');
            const result = await scoresCollection.insertOne(scoreData);
            
            return result.insertedId.toString();
        } catch (error) {
            console.error('Error guardando puntuación:', error);
            throw error;
        }
    }

    // Obtener mejores puntuaciones
    async getTopScores(gameType, limit = 10) {
        try {
            const db = mongoose.connection.db;
            const scoresCollection = db.collection('scores');
            
            const scores = await scoresCollection
                .find({ gameType: gameType })
                .sort({ score: -1 })
                .limit(limit)
                .toArray();
            
            return scores;
        } catch (error) {
            console.error('Error obteniendo puntuaciones:', error);
            throw error;
        }
    }

    // Obtener puntuaciones del usuario
    async getUserScores(userId) {
        try {
            const db = mongoose.connection.db;
            const scoresCollection = db.collection('scores');
            
            const scores = await scoresCollection
                .find({ userId: userId })
                .sort({ createdAt: -1 })
                .toArray();
            
            return scores;
        } catch (error) {
            console.error('Error obteniendo puntuaciones del usuario:', error);
            throw error;
        }
    }

    // Obtener sesiones de juego del usuario
    async getUserGameSessions(userId) {
        try {
            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('game_sessions');
            
            const sessions = await sessionsCollection
                .find({ userId: userId })
                .sort({ startTime: -1 })
                .toArray();
            
            return sessions;
        } catch (error) {
            console.error('Error obteniendo sesiones de juego:', error);
            throw error;
        }
    }

    // Obtener estadísticas completas del usuario
    async getUserCompleteStats(userId) {
        try {
            const db = mongoose.connection.db;
            const scoresCollection = db.collection('scores');
            const sessionsCollection = db.collection('game_sessions');
            
            const scores = await scoresCollection.find({ userId: userId }).toArray();
            const sessions = await sessionsCollection.find({ userId: userId }).toArray();
            
            const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
            const totalPlaytime = sessions.reduce((sum, session) => sum + (session.playtime || 0), 0);
            const gamesPlayed = scores.length;
            const sessionsCount = sessions.length;
            
            return {
                totalScore,
                totalPlaytime,
                gamesPlayed,
                sessionsCount,
                averageScore: gamesPlayed > 0 ? totalScore / gamesPlayed : 0,
                scores: scores,
                sessions: sessions
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas completas:', error);
            throw error;
        }
    }

    // Crear estadísticas del Pou
    async createPouStats(sessionId) {
        try {
            const pouStats = {
                sessionId: sessionId,
                hunger: 100,
                happiness: 100,
                energy: 100,
                level: 1,
                experience: 0,
                coins: 0,
                gems: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const db = mongoose.connection.db;
            const pouStatsCollection = db.collection('pou_stats');
            const result = await pouStatsCollection.insertOne(pouStats);
            
            return result.insertedId.toString();
        } catch (error) {
            console.error('Error creando estadísticas del Pou:', error);
            throw error;
        }
    }

    // Actualizar estadísticas del Pou
    async updatePouStats(sessionId, hunger, happiness, energy) {
        try {
            const db = mongoose.connection.db;
            const pouStatsCollection = db.collection('pou_stats');
            
            await pouStatsCollection.updateOne(
                { sessionId: sessionId },
                { 
                    $set: { 
                        hunger: hunger,
                        happiness: happiness,
                        energy: energy,
                        updatedAt: new Date()
                    }
                }
            );
        } catch (error) {
            console.error('Error actualizando estadísticas del Pou:', error);
            throw error;
        }
    }

    // Obtener estadísticas del Pou
    async getPouStats(sessionId) {
        try {
            const db = mongoose.connection.db;
            const pouStatsCollection = db.collection('pou_stats');
            
            const stats = await pouStatsCollection.findOne({ sessionId: sessionId });
            return stats;
        } catch (error) {
            console.error('Error obteniendo estadísticas del Pou:', error);
            throw error;
        }
    }

    // Crear logro
    async createAchievement(userId, title, description, type, points, icon) {
        try {
            const achievement = {
                userId: userId,
                title: title,
                description: description,
                type: type,
                points: points,
                icon: icon,
                unlockedAt: new Date(),
                createdAt: new Date()
            };

            const db = mongoose.connection.db;
            const achievementsCollection = db.collection('achievements');
            const result = await achievementsCollection.insertOne(achievement);
            
            return result.insertedId.toString();
        } catch (error) {
            console.error('Error creando logro:', error);
            throw error;
        }
    }
}

module.exports = Database; 