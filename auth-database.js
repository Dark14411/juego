const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const config = require('./config');

class AuthDatabase {
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

    // Crear usuario
    async createUser(username, email, password) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const user = {
                username: username,
                email: email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
                lastLogin: null
            };

            const db = mongoose.connection.db;
            const usersCollection = db.collection('users');
            
            // Verificar si el usuario ya existe
            const existingUser = await usersCollection.findOne({ email: email });
            if (existingUser) {
                throw new Error('El usuario ya existe');
            }
            
            const result = await usersCollection.insertOne(user);
            
            return {
                id: result.insertedId.toString(),
                username: user.username,
                email: user.email,
                createdAt: user.createdAt
            };
        } catch (error) {
            console.error('Error creando usuario:', error);
            throw error;
        }
    }

    // Obtener usuario por email
    async getUserByEmail(email) {
        try {
            const db = mongoose.connection.db;
            const usersCollection = db.collection('users');
            
            const user = await usersCollection.findOne({ email: email });
            return user;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            throw error;
        }
    }

    // Verificar contraseña
    async verifyPassword(password, hashedPassword) {
        try {
            return await bcrypt.compare(password, hashedPassword);
        } catch (error) {
            console.error('Error verificando contraseña:', error);
            return false;
        }
    }

    // Crear sesión
    async createSession(userId, ip, userAgent, metadata = {}) {
        try {
            const sessionId = crypto.randomBytes(32).toString('hex');
            
            const session = {
                sessionId: sessionId,
                userId: userId,
                ip: ip,
                userAgent: userAgent,
                metadata: metadata,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
                isActive: true
            };

            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('sessions');
            await sessionsCollection.insertOne(session);
            
            return { sessionId: sessionId };
        } catch (error) {
            console.error('Error creando sesión:', error);
            throw error;
        }
    }

    // Invalidar sesión
    async invalidateSession(token) {
        try {
            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('sessions');
            
            await sessionsCollection.updateOne(
                { sessionId: token },
                { $set: { isActive: false, updatedAt: new Date() } }
            );
        } catch (error) {
            console.error('Error invalidando sesión:', error);
            throw error;
        }
    }

    // Registrar intento de login
    async logLoginAttempt(userId, ip, userAgent, success, errorMessage = null, sessionId = null) {
        try {
            const loginAttempt = {
                userId: userId,
                ip: ip,
                userAgent: userAgent,
                success: success,
                errorMessage: errorMessage,
                sessionId: sessionId,
                timestamp: new Date()
            };

            const db = mongoose.connection.db;
            const loginAttemptsCollection = db.collection('login_attempts');
            await loginAttemptsCollection.insertOne(loginAttempt);
        } catch (error) {
            console.error('Error registrando intento de login:', error);
            // No lanzar error para no interrumpir el flujo principal
        }
    }

    // Registrar actividad del usuario
    async logUserActivity(userId, activityType, description, ip, userAgent, metadata = {}) {
        try {
            const activity = {
                userId: userId,
                activityType: activityType,
                description: description,
                ip: ip,
                userAgent: userAgent,
                metadata: metadata,
                timestamp: new Date()
            };

            const db = mongoose.connection.db;
            const activitiesCollection = db.collection('user_activities');
            await activitiesCollection.insertOne(activity);
        } catch (error) {
            console.error('Error registrando actividad:', error);
            // No lanzar error para no interrumpir el flujo principal
        }
    }

    // Obtener sesiones del usuario
    async getUserSessions(userId) {
        try {
            const db = mongoose.connection.db;
            const sessionsCollection = db.collection('sessions');
            
            const sessions = await sessionsCollection
                .find({ userId: userId })
                .sort({ createdAt: -1 })
                .toArray();
            
            return sessions;
        } catch (error) {
            console.error('Error obteniendo sesiones:', error);
            throw error;
        }
    }

    // Obtener actividades del usuario
    async getUserActivities(userId, limit = 50) {
        try {
            const db = mongoose.connection.db;
            const activitiesCollection = db.collection('user_activities');
            
            const activities = await activitiesCollection
                .find({ userId: userId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();
            
            return activities;
        } catch (error) {
            console.error('Error obteniendo actividades:', error);
            throw error;
        }
    }

    // Obtener historial de login
    async getLoginHistory(userId, limit = 20) {
        try {
            const db = mongoose.connection.db;
            const loginAttemptsCollection = db.collection('login_attempts');
            
            const history = await loginAttemptsCollection
                .find({ userId: userId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .toArray();
            
            return history;
        } catch (error) {
            console.error('Error obteniendo historial de login:', error);
            throw error;
        }
    }

    // Actualizar último login
    async updateLastLogin(userId) {
        try {
            const db = mongoose.connection.db;
            const usersCollection = db.collection('users');
            
            await usersCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(userId) },
                { $set: { lastLogin: new Date(), updatedAt: new Date() } }
            );
        } catch (error) {
            console.error('Error actualizando último login:', error);
            // No lanzar error para no interrumpir el flujo principal
        }
    }
}

module.exports = AuthDatabase; 