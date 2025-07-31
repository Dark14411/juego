const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const Database = require('./database');
const AuthDatabase = require('./auth-database');
const config = require('./config');

const app = express();
const PORT = config.PORT;
const JWT_SECRET = config.JWT_SECRET;

// Inicializar bases de datos
const db = new Database();
const authDB = new AuthDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '/')));

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token de acceso requerido' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido' });
        }
        req.user = user;
        next();
    });
};

// Rutas de autenticación
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
        }

        // Verificar si el usuario ya existe
        const existingUser = await authDB.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'El usuario ya existe' });
        }

        // Crear nuevo usuario
        const user = await authDB.createUser(username, email, password);
        
        // Crear sesión de juego automáticamente
        const gameSession = await db.createGameSession(user.id);
        
        // Crear estadísticas iniciales del Pou
        await db.createPouStats(gameSession);
        
        // Crear logro inicial
        await db.createAchievement(
            user.id,
            'Primer Paso',
            'Te registraste en Retro Arcade',
            'registration',
            1,
            '🎯'
        );
        
        // Generar token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            token,
            user: { id: user.id, username: user.username, email: user.email },
            gameSession: gameSession
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }

        // Buscar usuario
        const user = await authDB.getUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Verificar contraseña
        const validPassword = await authDB.verifyPassword(password, user.password);
        if (!validPassword) {
            // Registrar intento fallido
            await authDB.logLoginAttempt(
                user._id,
                req.ip,
                req.headers['user-agent'],
                false,
                'Contraseña incorrecta'
            );
            return res.status(400).json({ error: 'Credenciales inválidas' });
        }

        // Crear sesión
        const session = await authDB.createSession(
            user._id,
            req.ip,
            req.headers['user-agent'],
            {
                device_type: 'web',
                browser: req.headers['user-agent'],
                os: 'Unknown',
                location: req.ip
            }
        );

        // Registrar login exitoso
        await authDB.logLoginAttempt(
            user._id,
            req.ip,
            req.headers['user-agent'],
            true,
            null,
            session.sessionId
        );

        // Registrar actividad
        await authDB.logUserActivity(
            user._id,
            'login',
            'Inicio de sesión exitoso',
            req.ip,
            req.headers['user-agent'],
            { method: 'password', success: true }
        );

        // Generar token
        const token = jwt.sign(
            { id: user._id.toString(), username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: { id: user._id.toString(), username: user.username, email: user.email },
            sessionId: session.sessionId
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para cerrar sesión
app.post('/api/logout', authenticateToken, async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        // Invalidar sesión
        await authDB.invalidateSession(token);
        
        // Registrar actividad
        await authDB.logUserActivity(
            req.user.id,
            'logout',
            'Cierre de sesión',
            req.ip,
            req.headers['user-agent'],
            { method: 'token', success: true }
        );
        
        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        console.error('Error cerrando sesión:', error);
        res.status(500).json({ error: 'Error cerrando sesión' });
    }
});

// Rutas de sesión de juego
app.post('/api/start-session', authenticateToken, async (req, res) => {
    try {
        const sessionId = await db.createGameSession(req.user.id);
        await db.createPouStats(sessionId);
        
        res.json({ sessionId, message: 'Sesión iniciada' });
    } catch (error) {
        console.error('Error iniciando sesión:', error);
        res.status(500).json({ error: 'Error iniciando sesión' });
    }
});

app.post('/api/end-session', authenticateToken, async (req, res) => {
    try {
        const { sessionId, playtime } = req.body;
        await db.updateSessionEnd(sessionId, playtime);
        
        res.json({ message: 'Sesión terminada' });
    } catch (error) {
        console.error('Error terminando sesión:', error);
        res.status(500).json({ error: 'Error terminando sesión' });
    }
});

// Rutas de puntuaciones
app.post('/api/save-score', authenticateToken, async (req, res) => {
    try {
        const { sessionId, gameType, score } = req.body;
        const scoreId = await db.saveScore(req.user.id, sessionId, gameType, score);
        
        res.json({ scoreId, message: 'Puntuación guardada' });
    } catch (error) {
        console.error('Error guardando puntuación:', error);
        res.status(500).json({ error: 'Error guardando puntuación' });
    }
});

app.get('/api/leaderboard/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const scores = await db.getTopScores(gameType);
        
        res.json(scores);
    } catch (error) {
        console.error('Error obteniendo leaderboard:', error);
        res.status(500).json({ error: 'Error obteniendo leaderboard' });
    }
});

app.get('/api/user-stats', authenticateToken, async (req, res) => {
    try {
        const scores = await db.getUserScores(req.user.id);
        res.json(scores);
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
});

// Obtener sesiones de juego del usuario
app.get('/api/user-game-sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await db.getUserGameSessions(req.user.id);
        res.json(sessions);
    } catch (error) {
        console.error('Error obteniendo sesiones de juego:', error);
        res.status(500).json({ error: 'Error obteniendo sesiones de juego' });
    }
});

// Obtener estadísticas completas del usuario
app.get('/api/user-complete-stats', authenticateToken, async (req, res) => {
    try {
        const userStats = await db.getUserCompleteStats(req.user.id);
        res.json(userStats);
    } catch (error) {
        console.error('Error obteniendo estadísticas completas:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas completas' });
    }
});

// Rutas de autenticación y sesiones
app.get('/api/user-sessions', authenticateToken, async (req, res) => {
    try {
        const sessions = await authDB.getUserSessions(req.user.id);
        res.json(sessions);
    } catch (error) {
        console.error('Error obteniendo sesiones:', error);
        res.status(500).json({ error: 'Error obteniendo sesiones' });
    }
});

app.get('/api/user-activity', authenticateToken, async (req, res) => {
    try {
        const activities = await authDB.getUserActivities(req.user.id);
        res.json(activities);
    } catch (error) {
        console.error('Error obteniendo actividad:', error);
        res.status(500).json({ error: 'Error obteniendo actividad' });
    }
});

app.get('/api/login-history', authenticateToken, async (req, res) => {
    try {
        const history = await authDB.getLoginHistory(req.user.id);
        res.json(history);
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ error: 'Error obteniendo historial' });
    }
});

// Rutas del Pou
app.put('/api/pou-stats', authenticateToken, async (req, res) => {
    try {
        const { sessionId, hunger, happiness, energy } = req.body;
        await db.updatePouStats(sessionId, hunger, happiness, energy);
        
        res.json({ message: 'Estadísticas del Pou actualizadas' });
    } catch (error) {
        console.error('Error actualizando Pou:', error);
        res.status(500).json({ error: 'Error actualizando Pou' });
    }
});

app.get('/api/pou-stats/:sessionId', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const stats = await db.getPouStats(sessionId);
        
        if (!stats) {
            return res.status(404).json({ error: 'Estadísticas no encontradas' });
        }
        
        res.json(stats);
    } catch (error) {
        console.error('Error obteniendo estadísticas del Pou:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas del Pou' });
    }
});

// Ruta principal - menú de juegos
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎮 Game Hub</title>
            <style>
                body {
                    font-family: 'Press Start 2P', monospace;
                    background: linear-gradient(45deg, #000428, #004e92);
                    color: #39ff14;
                    text-align: center;
                    padding: 50px;
                }
                .game-link {
                    display: inline-block;
                    margin: 20px;
                    padding: 20px;
                    background: rgba(57, 255, 20, 0.1);
                    border: 2px solid #39ff14;
                    border-radius: 10px;
                    color: #39ff14;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }
                .game-link:hover {
                    background: rgba(57, 255, 20, 0.3);
                    transform: scale(1.05);
                }
                h1 { font-size: 24px; margin-bottom: 40px; }
                .game-link h2 { font-size: 16px; margin: 10px 0; }
                .game-link p { font-size: 10px; opacity: 0.8; }
            </style>
        </head>
        <body>
            <h1>🎮 GAME HUB 🎮</h1>
            <a href="/retro-arcade" class="game-link">
                <h2>🎮 Retro Arcade</h2>
                <p>Juego con autenticación y base de datos</p>
            </a>
            <a href="/retro-arcade" class="game-link">
                <h2>🐾 Tamagotchi Retro</h2>
                <p>Mascota virtual integrada en el juego principal</p>
            </a>
        </body>
        </html>
    `);
});

// Ruta para el Tamagotchi (redirigir al juego principal)
app.get('/tamagotchi', (req, res) => {
    res.redirect('/retro-arcade');
});

// Ruta para el juego original
app.get('/retro-arcade', (req, res) => {
    res.sendFile(path.join(__dirname, 'retro-arcade-game.html'));
});

// Iniciar servidor con manejo de errores
const server = app.listen(PORT, () => {
    console.log(`🎮 Retro Arcade Game con MongoDB corriendo en http://localhost:${PORT}`);
    console.log(`🎯 Abre http://localhost:${PORT} para jugar`);
    console.log('📊 Base de datos MongoDB inicializada');
    console.log('🔐 Sistema de autenticación MongoDB activo');
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`❌ Puerto ${PORT} ya está en uso`);
        console.log('💡 Solución:');
        console.log(`   1. Ejecuta: netstat -ano | findstr :${PORT}`);
        console.log(`   2. Ejecuta: taskkill /PID [PID] /F`);
        console.log(`   3. Vuelve a ejecutar: npm start`);
        console.log(`   4. O cambia el puerto en config.js`);
        process.exit(1);
    } else {
        console.error('❌ Error iniciando servidor:', err);
        process.exit(1);
    }
});