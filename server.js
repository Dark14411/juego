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

// Ruta principal - RESTAURAR APLICACIÓN ORIGINAL COMPLETA
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎮 Tamagotchi Pro & Retro Arcade</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="icon" href="/favicon.ico">
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Press Start 2P', monospace;
                    background: linear-gradient(135deg, #000428 0%, #004e92 50%, #667eea 100%);
                    color: #39ff14;
                    overflow-x: hidden;
                    min-height: 100vh;
                }
                
                /* 🎮 LAYOUT PRINCIPAL CON MENÚ LATERAL */
                .app-container {
                    display: flex;
                    min-height: 100vh;
                }
                
                /* 🎮 MENÚ LATERAL RETRO */
                .sidebar {
                    width: 280px;
                    background: rgba(0, 0, 0, 0.8);
                    border-right: 3px solid #39ff14;
                    padding: 20px;
                    box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
                    backdrop-filter: blur(10px);
                    position: fixed;
                    height: 100vh;
                    overflow-y: auto;
                    z-index: 1000;
                }
                
                .sidebar-header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #39ff14;
                }
                
                .sidebar-header h1 {
                    font-size: 1.2rem;
                    margin-bottom: 10px;
                    text-shadow: 0 0 10px #39ff14;
                }
                
                .sidebar-header p {
                    font-size: 0.7rem;
                    opacity: 0.8;
                }
                
                /* 🎮 NAVEGACIÓN LATERAL */
                .nav-menu {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .nav-item {
                    background: rgba(57, 255, 20, 0.1);
                    border: 2px solid #39ff14;
                    color: #39ff14;
                    padding: 15px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 0.8rem;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .nav-item:hover {
                    background: rgba(57, 255, 20, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(57, 255, 20, 0.5);
                }
                
                .nav-item.active {
                    background: linear-gradient(45deg, #39ff14, #00ff88);
                    color: #000;
                    box-shadow: 0 0 20px rgba(57, 255, 20, 0.8);
                }
                
                .nav-item::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
                    transition: left 0.5s;
                }
                
                .nav-item:hover::before {
                    left: 100%;
                }
                
                /* 🎮 CONTENIDO PRINCIPAL */
                .main-content {
                    flex: 1;
                    margin-left: 280px;
                    padding: 20px;
                    min-height: 100vh;
                }
                
                /* 🎮 HEADER CON STATS */
                .header {
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid #39ff14;
                    border-radius: 15px;
                    padding: 20px;
                    margin-bottom: 20px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
                }
                
                .header-title {
                    text-align: center;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                    text-shadow: 0 0 10px #39ff14;
                }
                
                /* 🎮 BARRAS DE STATS ANIMADAS */
                .stats-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 20px;
                }
                
                .stat-bar {
                    background: rgba(0, 0, 0, 0.5);
                    border: 2px solid #39ff14;
                    border-radius: 10px;
                    padding: 15px;
                    position: relative;
                    overflow: hidden;
                }
                
                .stat-label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    font-size: 0.7rem;
                }
                
                .stat-progress {
                    height: 20px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 10px;
                    overflow: hidden;
                    position: relative;
                }
                
                .stat-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ff006e, #ff6b6b, #4ecdc4, #45b7d1);
                    border-radius: 10px;
                    transition: width 0.5s ease;
                    position: relative;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.8; }
                }
                
                .stat-fill::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 2s infinite;
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                /* 🎮 PANEL DE CONTENIDO */
                .content-panel {
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid #39ff14;
                    border-radius: 15px;
                    padding: 30px;
                    backdrop-filter: blur(10px);
                    box-shadow: 0 0 20px rgba(57, 255, 20, 0.3);
                    min-height: 500px;
                }
                
                /* 🎮 TAMAGOTCHI VISUAL */
                .tamagotchi-container {
                    text-align: center;
                    margin: 30px 0;
                }
                
                .tamagotchi {
                    width: 200px;
                    height: 200px;
                    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
                    border: 4px solid #39ff14;
                    border-radius: 50%;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4rem;
                    position: relative;
                    animation: float 3s ease-in-out infinite;
                    box-shadow: 0 0 30px rgba(57, 255, 20, 0.5);
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                /* 🎮 BOTONES DE ACCIÓN */
                .action-buttons {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                    gap: 15px;
                    margin: 20px 0;
                }
                
                .action-btn {
                    background: linear-gradient(45deg, #39ff14, #00ff88);
                    border: none;
                    color: #000;
                    padding: 15px;
                    border-radius: 10px;
                    cursor: pointer;
                    font-family: 'Press Start 2P', monospace;
                    font-size: 0.7rem;
                    font-weight: bold;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .action-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(57, 255, 20, 0.5);
                }
                
                .action-btn:active {
                    transform: translateY(0);
                }
                
                /* 🎮 JUEGOS GRID */
                .games-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .game-card {
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid #39ff14;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }
                
                .game-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 25px rgba(57, 255, 20, 0.5);
                }
                
                .game-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(57, 255, 20, 0.2), transparent);
                    transition: left 0.5s;
                }
                
                .game-card:hover::before {
                    left: 100%;
                }
                
                .game-icon {
                    font-size: 3rem;
                    margin-bottom: 10px;
                }
                
                .game-title {
                    font-size: 0.8rem;
                    margin-bottom: 5px;
                }
                
                .game-desc {
                    font-size: 0.6rem;
                    opacity: 0.8;
                }
                
                /* 🎮 TIENDA INTERACTIVA */
                .store-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin: 20px 0;
                }
                
                .store-item {
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid #39ff14;
                    border-radius: 10px;
                    padding: 20px;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }
                
                .store-item:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 10px 20px rgba(57, 255, 20, 0.3);
                }
                
                .store-item-icon {
                    font-size: 2.5rem;
                    margin-bottom: 10px;
                }
                
                .store-item-title {
                    font-size: 0.8rem;
                    margin-bottom: 5px;
                }
                
                .store-item-price {
                    font-size: 0.7rem;
                    color: #ffd700;
                    margin-bottom: 10px;
                }
                
                .buy-btn {
                    background: linear-gradient(45deg, #ffd700, #ffed4e);
                    border: none;
                    color: #000;
                    padding: 8px 15px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-family: 'Press Start 2P', monospace;
                    font-size: 0.6rem;
                    font-weight: bold;
                }
                
                /* 🎮 RESPONSIVE */
                @media (max-width: 768px) {
                    .sidebar {
                        width: 100%;
                        position: relative;
                        height: auto;
                    }
                    
                    .main-content {
                        margin-left: 0;
                    }
                    
                    .app-container {
                        flex-direction: column;
                    }
                    
                    .stats-container {
                        grid-template-columns: 1fr;
                    }
                    
                    .games-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                /* 🎮 ANIMACIONES ESPECIALES */
                .glow {
                    animation: glow 2s ease-in-out infinite alternate;
                }
                
                @keyframes glow {
                    from { box-shadow: 0 0 10px #39ff14; }
                    to { box-shadow: 0 0 20px #39ff14, 0 0 30px #39ff14; }
                }
                
                .shake {
                    animation: shake 0.5s ease-in-out;
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
            </style>
        </head>
        <body>
            <div class="app-container">
                <!-- 🎮 MENÚ LATERAL RETRO -->
                <div class="sidebar">
                    <div class="sidebar-header">
                        <h1>🎮 GAME HUB</h1>
                        <p>Retro Arcade Pro</p>
                    </div>
                    
                    <div class="nav-menu">
                        <div class="nav-item active" onclick="showSection('home')">
                            🏠 Inicio
                        </div>
                        <div class="nav-item" onclick="showSection('tamagotchi')">
                            🐾 Tamagotchi
                        </div>
                        <div class="nav-item" onclick="showSection('arcade')">
                            🕹️ Retro Arcade
                        </div>
                        <div class="nav-item" onclick="showSection('store')">
                            🛒 Tienda Pro
                        </div>
                        <div class="nav-item" onclick="showSection('achievements')">
                            🏆 Logros
                        </div>
                        <div class="nav-item" onclick="showSection('profile')">
                            ⚙️ Perfil
                        </div>
                        <div class="nav-item" onclick="showLoginForm()">
                            🔐 Login
                        </div>
                    </div>
                </div>
                
                <!-- 🎮 CONTENIDO PRINCIPAL -->
                <div class="main-content">
                    <!-- 🎮 HEADER CON STATS -->
                    <div class="header">
                        <div class="header-title">
                            🎮 Tamagotchi Pro & Retro Arcade
                        </div>
                        
                        <!-- 🎮 BARRAS DE STATS ANIMADAS -->
                        <div class="stats-container">
                            <div class="stat-bar">
                                <div class="stat-label">
                                    <span>🍽️ Hambre</span>
                                    <span id="hunger-value">85%</span>
                                </div>
                                <div class="stat-progress">
                                    <div class="stat-fill" id="hunger-bar" style="width: 85%"></div>
                                </div>
                            </div>
                            
                            <div class="stat-bar">
                                <div class="stat-label">
                                    <span>😊 Felicidad</span>
                                    <span id="happiness-value">92%</span>
                                </div>
                                <div class="stat-progress">
                                    <div class="stat-fill" id="happiness-bar" style="width: 92%"></div>
                                </div>
                            </div>
                            
                            <div class="stat-bar">
                                <div class="stat-label">
                                    <span>⚡ Energía</span>
                                    <span id="energy-value">78%</span>
                                </div>
                                <div class="stat-progress">
                                    <div class="stat-fill" id="energy-bar" style="width: 78%"></div>
                                </div>
                            </div>
                            
                            <div class="stat-bar">
                                <div class="stat-label">
                                    <span>💰 Monedas</span>
                                    <span id="coins-value">1,250</span>
                                </div>
                                <div class="stat-progress">
                                    <div class="stat-fill" id="coins-bar" style="width: 100%"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 🎮 PANEL DE CONTENIDO -->
                    <div class="content-panel" id="content">
                        <div id="home-section">
                            <h2>🎮 ¡Bienvenido al Game Hub!</h2>
                            <p>Tu experiencia gaming completa está lista.</p>
                            
                            <!-- 🎮 TAMAGOTCHI VISUAL -->
                            <div class="tamagotchi-container">
                                <div class="tamagotchi glow">
                                    🐾
                                </div>
                                <h3>Tu mascota virtual</h3>
                                <p>Nivel 5 - Experiencia 1,250/2,000</p>
                            </div>
                            
                            <!-- 🎮 BOTONES DE ACCIÓN -->
                            <div class="action-buttons">
                                <button class="action-btn" onclick="feedPet()">🍽️ Alimentar</button>
                                <button class="action-btn" onclick="playWithPet()">🎾 Jugar</button>
                                <button class="action-btn" onclick="cleanPet()">🛁 Limpiar</button>
                                <button class="action-btn" onclick="sleepPet()">😴 Dormir</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <script>
                // 🎮 SISTEMA DE NAVEGACIÓN
                function showSection(section) {
                    const navItems = document.querySelectorAll('.nav-item');
                    navItems.forEach(item => item.classList.remove('active'));
                    event.target.classList.add('active');
                    
                    const content = document.getElementById('content');
                    
                    switch(section) {
                        case 'home':
                            content.innerHTML = \`
                                <h2>🎮 ¡Bienvenido al Game Hub!</h2>
                                <p>Tu experiencia gaming completa está lista.</p>
                                
                                <div class="tamagotchi-container">
                                    <div class="tamagotchi glow">
                                        🐾
                                    </div>
                                    <h3>Tu mascota virtual</h3>
                                    <p>Nivel 5 - Experiencia 1,250/2,000</p>
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="action-btn" onclick="feedPet()">🍽️ Alimentar</button>
                                    <button class="action-btn" onclick="playWithPet()">🎾 Jugar</button>
                                    <button class="action-btn" onclick="cleanPet()">🛁 Limpiar</button>
                                    <button class="action-btn" onclick="sleepPet()">😴 Dormir</button>
                                </div>
                            \`;
                            break;
                            
                        case 'tamagotchi':
                            content.innerHTML = \`
                                <h2>🐾 Modo Tamagotchi</h2>
                                <p>¡Cuida de tu mascota virtual!</p>
                                
                                <div class="tamagotchi-container">
                                    <div class="tamagotchi glow">
                                        🐾
                                    </div>
                                    <h3>Estado: Feliz 😊</h3>
                                    <p>Nivel 5 - Experiencia 1,250/2,000</p>
                                </div>
                                
                                <div class="action-buttons">
                                    <button class="action-btn" onclick="feedPet()">🍽️ Alimentar</button>
                                    <button class="action-btn" onclick="playWithPet()">🎾 Jugar</button>
                                    <button class="action-btn" onclick="cleanPet()">🛁 Limpiar</button>
                                    <button class="action-btn" onclick="sleepPet()">😴 Dormir</button>
                                </div>
                                
                                <div class="stats-container">
                                    <div class="stat-bar">
                                        <div class="stat-label">
                                            <span>🍽️ Hambre</span>
                                            <span id="hunger-value">85%</span>
                                        </div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" id="hunger-bar" style="width: 85%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-bar">
                                        <div class="stat-label">
                                            <span>😊 Felicidad</span>
                                            <span id="happiness-value">92%</span>
                                        </div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" id="happiness-bar" style="width: 92%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-bar">
                                        <div class="stat-label">
                                            <span>⚡ Energía</span>
                                            <span id="energy-value">78%</span>
                                        </div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" id="energy-bar" style="width: 78%"></div>
                                        </div>
                                    </div>
                                </div>
                            \`;
                            break;
                            
                        case 'arcade':
                            content.innerHTML = \`
                                <h2>🕹️ Modo Retro Arcade</h2>
                                <p>¡Juega los mejores clásicos!</p>
                                
                                <div class="games-grid">
                                    <div class="game-card" onclick="startGame('pong')">
                                        <div class="game-icon">🏓</div>
                                        <div class="game-title">Pong</div>
                                        <div class="game-desc">Clásico tenis</div>
                                    </div>
                                    
                                    <div class="game-card" onclick="startGame('tetris')">
                                        <div class="game-icon">🧩</div>
                                        <div class="game-title">Tetris</div>
                                        <div class="game-desc">Piezas caídas</div>
                                    </div>
                                    
                                    <div class="game-card" onclick="startGame('memory')">
                                        <div class="game-icon">🧠</div>
                                        <div class="game-title">Memory</div>
                                        <div class="game-desc">Encuentra pares</div>
                                    </div>
                                    
                                    <div class="game-card" onclick="startGame('simon')">
                                        <div class="game-icon">🎵</div>
                                        <div class="game-title">Simon</div>
                                        <div class="game-desc">Repite secuencias</div>
                                    </div>
                                    
                                    <div class="game-card" onclick="startGame('breakout')">
                                        <div class="game-icon">🏀</div>
                                        <div class="game-title">Breakout</div>
                                        <div class="game-desc">Rompe bloques</div>
                                    </div>
                                    
                                    <div class="game-card" onclick="startGame('2048')">
                                        <div class="game-icon">🔢</div>
                                        <div class="game-title">2048</div>
                                        <div class="game-desc">Combina números</div>
                                    </div>
                                </div>
                            \`;
                            break;
                            
                        case 'store':
                            content.innerHTML = \`
                                <h2>🛒 Tienda Pro</h2>
                                <p>¡Compra mejoras para tu mascota!</p>
                                
                                <div class="store-grid">
                                    <div class="store-item">
                                        <div class="store-item-icon">🎨</div>
                                        <div class="store-item-title">Cambio de Color</div>
                                        <div class="store-item-price">💰 50 monedas</div>
                                        <button class="buy-btn" onclick="buyItem('color')">Comprar</button>
                                    </div>
                                    
                                    <div class="store-item">
                                        <div class="store-item-icon">🏠</div>
                                        <div class="store-item-title">Fondo Nuevo</div>
                                        <div class="store-item-price">💰 100 monedas</div>
                                        <button class="buy-btn" onclick="buyItem('background')">Comprar</button>
                                    </div>
                                    
                                    <div class="store-item">
                                        <div class="store-item-icon">👑</div>
                                        <div class="store-item-title">Corona Real</div>
                                        <div class="store-item-price">💎 25 gemas</div>
                                        <button class="buy-btn" onclick="buyItem('crown')">Comprar</button>
                                    </div>
                                    
                                    <div class="store-item">
                                        <div class="store-item-icon">⭐</div>
                                        <div class="store-item-title">Boost XP</div>
                                        <div class="store-item-price">💰 200 monedas</div>
                                        <button class="buy-btn" onclick="buyItem('xp')">Comprar</button>
                                    </div>
                                </div>
                            \`;
                            break;
                            
                        case 'achievements':
                            content.innerHTML = \`
                                <h2>🏆 Logros</h2>
                                <p>¡Desbloquea logros especiales!</p>
                                
                                <div class="store-grid">
                                    <div class="store-item">
                                        <div class="store-item-icon">🎯</div>
                                        <div class="store-item-title">Primer Paso</div>
                                        <div class="store-item-price">✅ Completado</div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" style="width: 100%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="store-item">
                                        <div class="store-item-icon">🎮</div>
                                        <div class="store-item-title">Gamer Pro</div>
                                        <div class="store-item-price">🔄 3/5 juegos</div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" style="width: 60%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="store-item">
                                        <div class="store-item-icon">💰</div>
                                        <div class="store-item-title">Rico</div>
                                        <div class="store-item-price">🔄 1,250/5,000</div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" style="width: 25%"></div>
                                        </div>
                                    </div>
                                </div>
                            \`;
                            break;
                            
                        case 'profile':
                            content.innerHTML = \`
                                <h2>⚙️ Perfil</h2>
                                <p>Gestiona tu cuenta y configuración</p>
                                
                                <div class="action-buttons">
                                    <button class="action-btn" onclick="showSettings()">⚙️ Configuración</button>
                                    <button class="action-btn" onclick="showStats()">📊 Estadísticas</button>
                                    <button class="action-btn" onclick="logout()">🚪 Cerrar Sesión</button>
                                </div>
                                
                                <div class="stats-container">
                                    <div class="stat-bar">
                                        <div class="stat-label">
                                            <span>🎮 Juegos Jugados</span>
                                            <span>15</span>
                                        </div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" style="width: 75%"></div>
                                        </div>
                                    </div>
                                    
                                    <div class="stat-bar">
                                        <div class="stat-label">
                                            <span>🏆 Logros</span>
                                            <span>8/20</span>
                                        </div>
                                        <div class="stat-progress">
                                            <div class="stat-fill" style="width: 40%"></div>
                                        </div>
                                    </div>
                                </div>
                            \`;
                            break;
                    }
                }
                
                // 🎮 FUNCIONES DE ACCIÓN
                function feedPet() {
                    updateStat('hunger', 10);
                    showFeedback('🍽️ ¡Alimentado! +10 hambre');
                }
                
                function playWithPet() {
                    updateStat('happiness', 15);
                    updateStat('energy', -5);
                    showFeedback('🎾 ¡Jugando! +15 felicidad, -5 energía');
                }
                
                function cleanPet() {
                    updateStat('happiness', 5);
                    showFeedback('🛁 ¡Limpio! +5 felicidad');
                }
                
                function sleepPet() {
                    updateStat('energy', 20);
                    updateStat('hunger', -5);
                    showFeedback('😴 ¡Durmiendo! +20 energía, -5 hambre');
                }
                
                function updateStat(stat, change) {
                    const valueElement = document.getElementById(stat + '-value');
                    const barElement = document.getElementById(stat + '-bar');
                    
                    if (valueElement && barElement) {
                        let currentValue = parseInt(valueElement.textContent);
                        currentValue = Math.max(0, Math.min(100, currentValue + change));
                        
                        valueElement.textContent = currentValue + '%';
                        barElement.style.width = currentValue + '%';
                        
                        // Animación de feedback
                        barElement.parentElement.classList.add('shake');
                        setTimeout(() => {
                            barElement.parentElement.classList.remove('shake');
                        }, 500);
                    }
                }
                
                function showFeedback(message) {
                    const feedback = document.createElement('div');
                    feedback.textContent = message;
                    feedback.style.cssText = \`
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(57, 255, 20, 0.9);
                        color: #000;
                        padding: 15px 25px;
                        border-radius: 10px;
                        font-family: 'Press Start 2P', monospace;
                        font-size: 0.8rem;
                        z-index: 10000;
                        animation: fadeInOut 2s ease-in-out;
                    \`;
                    
                    document.body.appendChild(feedback);
                    setTimeout(() => {
                        document.body.removeChild(feedback);
                    }, 2000);
                }
                
                function startGame(game) {
                    showFeedback(\`🎮 Iniciando \${game}...\`);
                    
                    if (game === 'pong') {
                        startPongGame();
                    } else if (game === 'tetris') {
                        startTetrisGame();
                    } else if (game === 'memory') {
                        startMemoryGame();
                    } else if (game === 'simon') {
                        startSimonGame();
                    } else if (game === 'breakout') {
                        startBreakoutGame();
                    } else if (game === '2048') {
                        start2048Game();
                    }
                }
                
                // 🎮 PONG REAL Y JUGABLE - CORREGIDO
                function startPongGame() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🏓 PONG - Clásico Tenis</h2>
                            <p>Usa W/S para mover la paleta izquierda, ↑/↓ para la derecha</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Score: <span id="pong-score">0</span></span>
                                <span>Vidas: <span id="pong-lives">3</span></span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: center;">
                            <canvas id="pong-canvas" width="600" height="400" style="border: 3px solid #39ff14; background: #000; border-radius: 10px; outline: none;" tabindex="0"></canvas>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    const canvas = document.getElementById('pong-canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Variables del juego
                    let ball = { x: 300, y: 200, dx: 4, dy: 4, radius: 8 };
                    let leftPaddle = { x: 20, y: 150, width: 10, height: 80, dy: 0 };
                    let rightPaddle = { x: 570, y: 150, width: 10, height: 80, dy: 0 };
                    let score = 0;
                    let lives = 3;
                    let keys = {};
                    
                    // FOCUS EN EL CANVAS PARA CAPTURAR EVENTOS
                    canvas.focus();
                    
                    // PREVENT DEFAULT EN TODOS LOS EVENTOS DE TECLADO
                    function handleKeyDown(e) {
                        e.preventDefault(); // PREVIENE SCROLL
                        keys[e.key] = true;
                    }
                    
                    function handleKeyUp(e) {
                        e.preventDefault(); // PREVIENE SCROLL
                        keys[e.key] = false;
                    }
                    
                    // Eventos de teclado SOLO en el canvas
                    canvas.addEventListener('keydown', handleKeyDown);
                    canvas.addEventListener('keyup', handleKeyUp);
                    
                    // Función de actualización
                    function update() {
                        // Movimiento de paletas
                        if (keys['w'] || keys['W']) leftPaddle.y -= 5;
                        if (keys['s'] || keys['S']) leftPaddle.y += 5;
                        if (keys['ArrowUp']) rightPaddle.y -= 5;
                        if (keys['ArrowDown']) rightPaddle.y += 5;
                        
                        // Límites de paletas
                        leftPaddle.y = Math.max(0, Math.min(320, leftPaddle.y));
                        rightPaddle.y = Math.max(0, Math.min(320, rightPaddle.y));
                        
                        // Movimiento de la pelota
                        ball.x += ball.dx;
                        ball.y += ball.dy;
                        
                        // Colisión con paredes
                        if (ball.y <= 0 || ball.y >= 400) ball.dy *= -1;
                        
                        // Colisión con paletas
                        if (ball.x <= 30 && ball.y >= leftPaddle.y && ball.y <= leftPaddle.y + 80) {
                            ball.dx *= -1;
                            score += 10;
                            document.getElementById('pong-score').textContent = score;
                        }
                        
                        if (ball.x >= 570 && ball.y >= rightPaddle.y && ball.y <= rightPaddle.y + 80) {
                            ball.dx *= -1;
                            score += 10;
                            document.getElementById('pong-score').textContent = score;
                        }
                        
                        // Pelota perdida
                        if (ball.x <= 0 || ball.x >= 600) {
                            lives--;
                            document.getElementById('pong-lives').textContent = lives;
                            ball.x = 300;
                            ball.y = 200;
                            ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
                            ball.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
                            
                            if (lives <= 0) {
                                showFeedback(\`🏓 Game Over! Score: \${score}\`);
                                updateCoins(score);
                                setTimeout(() => closeGame(), 2000);
                                return;
                            }
                        }
                    }
                    
                    // Función de dibujo
                    function draw() {
                        // Limpiar canvas
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, 600, 400);
                        
                        // Dibujar línea central
                        ctx.strokeStyle = '#39ff14';
                        ctx.setLineDash([10, 10]);
                        ctx.beginPath();
                        ctx.moveTo(300, 0);
                        ctx.lineTo(300, 400);
                        ctx.stroke();
                        ctx.setLineDash([]);
                        
                        // Dibujar pelota
                        ctx.fillStyle = '#39ff14';
                        ctx.beginPath();
                        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Dibujar paletas
                        ctx.fillStyle = '#39ff14';
                        ctx.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
                        ctx.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);
                    }
                    
                    // Loop del juego
                    function gameLoop() {
                        update();
                        draw();
                        requestAnimationFrame(gameLoop);
                    }
                    
                    gameLoop();
                }
                
                // 🎮 TETRIS REAL Y JUGABLE - CORREGIDO
                function startTetrisGame() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🧩 TETRIS - Piezas Caídas</h2>
                            <p>Usa ← → para mover, ↓ para bajar rápido, ↑ para rotar</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Score: <span id="tetris-score">0</span></span>
                                <span>Líneas: <span id="tetris-lines">0</span></span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: center;">
                            <canvas id="tetris-canvas" width="300" height="600" style="border: 3px solid #39ff14; background: #000; border-radius: 10px; outline: none;" tabindex="0"></canvas>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    const canvas = document.getElementById('tetris-canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // FOCUS EN EL CANVAS
                    canvas.focus();
                    
                    const BOARD_WIDTH = 10;
                    const BOARD_HEIGHT = 20;
                    const BLOCK_SIZE = 30;
                    
                    let board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(0));
                    let currentPiece = null;
                    let score = 0;
                    let lines = 0;
                    
                    const PIECES = [
                        [[1,1,1,1]], // I
                        [[1,1],[1,1]], // O
                        [[1,1,1],[0,1,0]], // T
                        [[1,1,1],[1,0,0]], // L
                        [[1,1,1],[0,0,1]], // J
                        [[1,1,0],[0,1,1]], // S
                        [[0,1,1],[1,1,0]]  // Z
                    ];
                    
                    function createPiece() {
                        const piece = PIECES[Math.floor(Math.random() * PIECES.length)];
                        return {
                            shape: piece,
                            x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece[0].length / 2),
                            y: 0
                        };
                    }
                    
                    function drawBoard() {
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, 300, 600);
                        
                        for (let y = 0; y < BOARD_HEIGHT; y++) {
                            for (let x = 0; x < BOARD_WIDTH; x++) {
                                if (board[y][x]) {
                                    ctx.fillStyle = '#39ff14';
                                    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                                }
                            }
                        }
                        
                        if (currentPiece) {
                            ctx.fillStyle = '#ff6b6b';
                            for (let y = 0; y < currentPiece.shape.length; y++) {
                                for (let x = 0; x < currentPiece.shape[y].length; x++) {
                                    if (currentPiece.shape[y][x]) {
                                        ctx.fillRect((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                                    }
                                }
                            }
                        }
                    }
                    
                    function isValidMove(piece, dx, dy) {
                        for (let y = 0; y < piece.shape.length; y++) {
                            for (let x = 0; x < piece.shape[y].length; x++) {
                                if (piece.shape[y][x]) {
                                    const newX = piece.x + x + dx;
                                    const newY = piece.y + y + dy;
                                    if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
                                        return false;
                                    }
                                }
                            }
                        }
                        return true;
                    }
                    
                    function mergePiece() {
                        for (let y = 0; y < currentPiece.shape.length; y++) {
                            for (let x = 0; x < currentPiece.shape[y].length; x++) {
                                if (currentPiece.shape[y][x]) {
                                    board[currentPiece.y + y][currentPiece.x + x] = 1;
                                }
                            }
                        }
                    }
                    
                    function clearLines() {
                        let linesCleared = 0;
                        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
                            if (board[y].every(cell => cell)) {
                                board.splice(y, 1);
                                board.unshift(Array(BOARD_WIDTH).fill(0));
                                linesCleared++;
                                y++;
                            }
                        }
                        if (linesCleared > 0) {
                            lines += linesCleared;
                            score += linesCleared * 100;
                            document.getElementById('tetris-score').textContent = score;
                            document.getElementById('tetris-lines').textContent = lines;
                            showFeedback(\`🧩 ¡\${linesCleared} líneas completadas! +100 puntos\`);
                        }
                    }
                    
                    // PREVENT DEFAULT EN EVENTOS DE TECLADO
                    canvas.addEventListener('keydown', (e) => {
                        e.preventDefault(); // PREVIENE SCROLL
                        if (!currentPiece) return;
                        
                        switch(e.key) {
                            case 'ArrowLeft':
                                if (isValidMove(currentPiece, -1, 0)) currentPiece.x--;
                                break;
                            case 'ArrowRight':
                                if (isValidMove(currentPiece, 1, 0)) currentPiece.x++;
                                break;
                            case 'ArrowDown':
                                if (isValidMove(currentPiece, 0, 1)) currentPiece.y++;
                                break;
                            case 'ArrowUp':
                                const rotated = rotatePiece(currentPiece);
                                if (isValidMove(rotated, 0, 0)) currentPiece = rotated;
                                break;
                        }
                    });
                    
                    function rotatePiece(piece) {
                        const rotated = [];
                        for (let x = 0; x < piece.shape[0].length; x++) {
                            rotated[x] = [];
                            for (let y = piece.shape.length - 1; y >= 0; y--) {
                                rotated[x][piece.shape.length - 1 - y] = piece.shape[y][x];
                            }
                        }
                        return { ...piece, shape: rotated };
                    }
                    
                    let dropTime = 0;
                    function gameLoop() {
                        dropTime++;
                        
                        if (dropTime > 30) {
                            if (isValidMove(currentPiece, 0, 1)) {
                                currentPiece.y++;
                            } else {
                                mergePiece();
                                clearLines();
                                currentPiece = createPiece();
                                
                                if (!isValidMove(currentPiece, 0, 0)) {
                                    showFeedback(\`🧩 Game Over! Score: \${score}\`);
                                    updateCoins(score);
                                    setTimeout(() => closeGame(), 2000);
                                    return;
                                }
                            }
                            dropTime = 0;
                        }
                        
                        drawBoard();
                        requestAnimationFrame(gameLoop);
                    }
                    
                    currentPiece = createPiece();
                    gameLoop();
                }
                
                // 🎮 MEMORY REAL Y JUGABLE
                function startMemoryGame() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🧠 MEMORY - Encuentra Pares</h2>
                            <p>Haz click en las cartas para encontrar pares</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Moves: <span id="memory-moves">0</span></span>
                                <span>Pairs: <span id="memory-pairs">0</span>/6</span>
                            </div>
                        </div>
                        
                        <div id="memory-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 400px; margin: 0 auto;"></div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    const grid = document.getElementById('memory-grid');
                    const cards = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎮', '🎲', '🎯', '🎪', '🎨', '🎭'];
                    let flipped = [];
                    let matched = [];
                    let moves = 0;
                    let pairs = 0;
                    
                    // Mezclar cartas
                    for (let i = cards.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [cards[i], cards[j]] = [cards[j], cards[i]];
                    }
                    
                    cards.forEach((card, index) => {
                        const cardElement = document.createElement('div');
                        cardElement.style.cssText = \`
                            width: 80px; height: 80px; background: #39ff14; border: 2px solid #39ff14;
                            display: flex; align-items: center; justify-content: center; font-size: 2rem;
                            cursor: pointer; border-radius: 10px; transition: all 0.3s ease;
                        \`;
                        cardElement.textContent = '❓';
                        cardElement.dataset.index = index;
                        cardElement.dataset.card = card;
                        
                        cardElement.addEventListener('click', () => {
                            if (flipped.length < 2 && !flipped.includes(index) && !matched.includes(index)) {
                                cardElement.textContent = card;
                                cardElement.style.background = '#ff6b6b';
                                flipped.push(index);
                                
                                if (flipped.length === 2) {
                                    moves++;
                                    document.getElementById('memory-moves').textContent = moves;
                                    
                                    if (cards[flipped[0]] === cards[flipped[1]]) {
                                        matched.push(...flipped);
                                        pairs++;
                                        document.getElementById('memory-pairs').textContent = pairs;
                                        showFeedback(\`🧠 ¡Par encontrado! \${pairs}/6\`);
                                        
                                        if (pairs === 6) {
                                            const score = Math.max(1000 - moves * 10, 100);
                                            showFeedback(\`🧠 ¡Victoria! Score: \${score}\`);
                                            updateCoins(score);
                                            setTimeout(() => closeGame(), 2000);
                                        }
                                    } else {
                                        setTimeout(() => {
                                            flipped.forEach(i => {
                                                const el = grid.children[i];
                                                el.textContent = '❓';
                                                el.style.background = '#39ff14';
                                            });
                                            flipped = [];
                                        }, 1000);
                                    }
                                    flipped = [];
                                }
                            }
                        });
                        
                        grid.appendChild(cardElement);
                    });
                }
                
                // 🎮 SIMON REAL Y JUGABLE
                function startSimonGame() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🎵 SIMON - Repite Secuencias</h2>
                            <p>Observa la secuencia y repítela</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Level: <span id="simon-level">1</span></span>
                                <span>Score: <span id="simon-score">0</span></span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: center;">
                            <div id="simon-buttons" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 300px;">
                                <div class="simon-btn" data-color="red" style="width: 120px; height: 120px; background: #ff4444; border-radius: 50%; cursor: pointer; border: 3px solid #39ff14;"></div>
                                <div class="simon-btn" data-color="blue" style="width: 120px; height: 120px; background: #4444ff; border-radius: 50%; cursor: pointer; border: 3px solid #39ff14;"></div>
                                <div class="simon-btn" data-color="green" style="width: 120px; height: 120px; background: #44ff44; border-radius: 50%; cursor: pointer; border: 3px solid #39ff14;"></div>
                                <div class="simon-btn" data-color="yellow" style="width: 120px; height: 120px; background: #ffff44; border-radius: 50%; cursor: pointer; border: 3px solid #39ff14;"></div>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    let sequence = [];
                    let playerSequence = [];
                    let level = 1;
                    let score = 0;
                    let isPlaying = false;
                    
                    function addToSequence() {
                        const colors = ['red', 'blue', 'green', 'yellow'];
                        sequence.push(colors[Math.floor(Math.random() * colors.length)]);
                    }
                    
                    function playSequence() {
                        isPlaying = true;
                        let i = 0;
                        
                        const interval = setInterval(() => {
                            if (i < sequence.length) {
                                const btn = document.querySelector(\`[data-color="\${sequence[i]}"]\`);
                                btn.style.filter = 'brightness(1.5)';
                                setTimeout(() => {
                                    btn.style.filter = 'brightness(1)';
                                }, 500);
                                i++;
                            } else {
                                clearInterval(interval);
                                isPlaying = false;
                                playerSequence = [];
                            }
                        }, 800);
                    }
                    
                    document.querySelectorAll('.simon-btn').forEach(btn => {
                        btn.addEventListener('click', () => {
                            if (!isPlaying) {
                                const color = btn.dataset.color;
                                playerSequence.push(color);
                                
                                btn.style.filter = 'brightness(1.5)';
                                setTimeout(() => {
                                    btn.style.filter = 'brightness(1)';
                                }, 200);
                                
                                if (playerSequence[playerSequence.length - 1] !== sequence[playerSequence.length - 1]) {
                                    showFeedback(\`🎵 Game Over! Level: \${level}\`);
                                    updateCoins(score);
                                    setTimeout(() => closeGame(), 2000);
                                    return;
                                }
                                
                                if (playerSequence.length === sequence.length) {
                                    level++;
                                    score += level * 100;
                                    document.getElementById('simon-level').textContent = level;
                                    document.getElementById('simon-score').textContent = score;
                                    showFeedback(\`🎵 ¡Nivel \${level} completado! +100 puntos\`);
                                    addToSequence();
                                    setTimeout(() => playSequence(), 1000);
                                }
                            }
                        });
                    });
                    
                    addToSequence();
                    setTimeout(() => playSequence(), 1000);
                }
                
                // 🎮 BREAKOUT REAL Y JUGABLE
                function startBreakoutGame() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🏀 BREAKOUT - Rompe Bloques</h2>
                            <p>Usa ← → para mover la paleta</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Score: <span id="breakout-score">0</span></span>
                                <span>Lives: <span id="breakout-lives">3</span></span>
                            </div>
                        </div>
                        
                        <div style="display: flex; justify-content: center;">
                            <canvas id="breakout-canvas" width="400" height="500" style="border: 3px solid #39ff14; background: #000; border-radius: 10px;"></canvas>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    const canvas = document.getElementById('breakout-canvas');
                    const ctx = canvas.getContext('2d');
                    
                    let paddle = { x: 175, y: 450, width: 50, height: 10 };
                    let ball = { x: 200, y: 430, dx: 3, dy: -3, radius: 5 };
                    let blocks = [];
                    let score = 0;
                    let lives = 3;
                    let keys = {};
                    
                    // Crear bloques
                    for (let row = 0; row < 5; row++) {
                        for (let col = 0; col < 8; col++) {
                            blocks.push({
                                x: col * 50,
                                y: row * 30 + 50,
                                width: 48,
                                height: 28,
                                color: \`hsl(\${row * 60}, 70%, 50%)\`
                            });
                        }
                    }
                    
                    document.addEventListener('keydown', (e) => {
                        keys[e.key] = true;
                    });
                    
                    document.addEventListener('keyup', (e) => {
                        keys[e.key] = false;
                    });
                    
                    function update() {
                        // Movimiento de paleta
                        if (keys['ArrowLeft']) paddle.x -= 5;
                        if (keys['ArrowRight']) paddle.x += 5;
                        paddle.x = Math.max(0, Math.min(350, paddle.x));
                        
                        // Movimiento de pelota
                        ball.x += ball.dx;
                        ball.y += ball.dy;
                        
                        // Colisión con paredes
                        if (ball.x <= 0 || ball.x >= 400) ball.dx *= -1;
                        if (ball.y <= 0) ball.dy *= -1;
                        
                        // Colisión con paleta
                        if (ball.y >= paddle.y && ball.y <= paddle.y + paddle.height &&
                            ball.x >= paddle.x && ball.x <= paddle.x + paddle.width) {
                            ball.dy *= -1;
                            ball.dx += (ball.x - (paddle.x + paddle.width/2)) * 0.1;
                        }
                        
                        // Colisión con bloques
                        blocks.forEach((block, index) => {
                            if (ball.x >= block.x && ball.x <= block.x + block.width &&
                                ball.y >= block.y && ball.y <= block.y + block.height) {
                                ball.dy *= -1;
                                blocks.splice(index, 1);
                                score += 10;
                                document.getElementById('breakout-score').textContent = score;
                            }
                        });
                        
                        // Pelota perdida
                        if (ball.y >= 500) {
                            lives--;
                            document.getElementById('breakout-lives').textContent = lives;
                            ball.x = 200;
                            ball.y = 430;
                            ball.dx = 3;
                            ball.dy = -3;
                            
                            if (lives <= 0) {
                                showFeedback(\`🏀 Game Over! Score: \${score}\`);
                                updateCoins(score);
                                setTimeout(() => closeGame(), 2000);
                                return;
                            }
                        }
                        
                        // Victoria
                        if (blocks.length === 0) {
                            score += 500;
                            showFeedback(\`🏀 ¡Victoria! Score: \${score}\`);
                            updateCoins(score);
                            setTimeout(() => closeGame(), 2000);
                            return;
                        }
                    }
                    
                    function draw() {
                        ctx.fillStyle = '#000';
                        ctx.fillRect(0, 0, 400, 500);
                        
                        // Dibujar paleta
                        ctx.fillStyle = '#39ff14';
                        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
                        
                        // Dibujar pelota
                        ctx.fillStyle = '#ff6b6b';
                        ctx.beginPath();
                        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
                        ctx.fill();
                        
                        // Dibujar bloques
                        blocks.forEach(block => {
                            ctx.fillStyle = block.color;
                            ctx.fillRect(block.x, block.y, block.width, block.height);
                        });
                    }
                    
                    function gameLoop() {
                        update();
                        draw();
                        requestAnimationFrame(gameLoop);
                    }
                    
                    gameLoop();
                }
                
                // 🎮 2048 REAL Y JUGABLE
                function start2048Game() {
                    const content = document.getElementById('content');
                    content.innerHTML = \`
                        <div style="text-align: center; margin-bottom: 20px;">
                            <h2>🔢 2048 - Combina Números</h2>
                            <p>Usa las flechas para mover y combinar números</p>
                            <div style="display: flex; justify-content: center; gap: 20px; margin: 10px 0;">
                                <span>Score: <span id="2048-score">0</span></span>
                                <span>Best: <span id="2048-best">0</span></span>
                            </div>
                        </div>
                        
                        <div id="2048-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 300px; margin: 0 auto; background: #000; padding: 20px; border-radius: 10px; border: 3px solid #39ff14;"></div>
                        
                        <div style="text-align: center; margin-top: 20px;">
                            <button class="action-btn" onclick="closeGame()">🏠 Volver al Menú</button>
                        </div>
                    \`;
                    
                    const grid = document.getElementById('2048-grid');
                    let board = Array(4).fill().map(() => Array(4).fill(0));
                    let score = 0;
                    let best = 0;
                    
                    function createCell(value) {
                        const cell = document.createElement('div');
                        cell.style.cssText = \`
                            width: 60px; height: 60px; background: \${value === 0 ? '#333' : \`hsl(\${Math.log2(value) * 30}, 70%, 50%)\`};
                            display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
                            font-weight: bold; color: white; border-radius: 5px; transition: all 0.3s ease;
                        \`;
                        cell.textContent = value === 0 ? '' : value;
                        return cell;
                    }
                    
                    function updateGrid() {
                        grid.innerHTML = '';
                        board.forEach(row => {
                            row.forEach(value => {
                                grid.appendChild(createCell(value));
                            });
                        });
                    }
                    
                    function addRandomTile() {
                        const empty = [];
                        board.forEach((row, i) => {
                            row.forEach((cell, j) => {
                                if (cell === 0) empty.push([i, j]);
                            });
                        });
                        
                        if (empty.length > 0) {
                            const [i, j] = empty[Math.floor(Math.random() * empty.length)];
                            board[i][j] = Math.random() < 0.9 ? 2 : 4;
                        }
                    }
                    
                    function move(direction) {
                        let moved = false;
                        const oldBoard = JSON.parse(JSON.stringify(board));
                        
                        if (direction === 'left' || direction === 'right') {
                            board.forEach(row => {
                                const filtered = row.filter(cell => cell !== 0);
                                if (direction === 'right') filtered.reverse();
                                
                                for (let i = 0; i < filtered.length - 1; i++) {
                                    if (filtered[i] === filtered[i + 1]) {
                                        filtered[i] *= 2;
                                        score += filtered[i];
                                        filtered.splice(i + 1, 1);
                                    }
                                }
                                
                                while (filtered.length < 4) {
                                    if (direction === 'left') filtered.push(0);
                                    else filtered.unshift(0);
                                }
                                
                                if (direction === 'right') filtered.reverse();
                                
                                for (let i = 0; i < 4; i++) {
                                    if (row[i] !== filtered[i]) moved = true;
                                    row[i] = filtered[i];
                                }
                            });
                        } else {
                            for (let j = 0; j < 4; j++) {
                                const column = board.map(row => row[j]);
                                const filtered = column.filter(cell => cell !== 0);
                                
                                if (direction === 'down') filtered.reverse();
                                
                                for (let i = 0; i < filtered.length - 1; i++) {
                                    if (filtered[i] === filtered[i + 1]) {
                                        filtered[i] *= 2;
                                        score += filtered[i];
                                        filtered.splice(i + 1, 1);
                                    }
                                }
                                
                                while (filtered.length < 4) {
                                    if (direction === 'up') filtered.push(0);
                                    else filtered.unshift(0);
                                }
                                
                                if (direction === 'down') filtered.reverse();
                                
                                for (let i = 0; i < 4; i++) {
                                    if (board[i][j] !== filtered[i]) moved = true;
                                    board[i][j] = filtered[i];
                                }
                            }
                        }
                        
                        if (moved) {
                            addRandomTile();
                            updateGrid();
                            document.getElementById('2048-score').textContent = score;
                            if (score > best) {
                                best = score;
                                document.getElementById('2048-best').textContent = best;
                            }
                            
                            // Verificar victoria
                            board.forEach(row => {
                                row.forEach(cell => {
                                    if (cell === 2048) {
                                        showFeedback(\`🔢 ¡2048 alcanzado! Score: \${score}\`);
                                        updateCoins(score);
                                        setTimeout(() => closeGame(), 2000);
                                    }
                                });
                            });
                        }
                    }
                    
                    document.addEventListener('keydown', (e) => {
                        switch(e.key) {
                            case 'ArrowLeft': move('left'); break;
                            case 'ArrowRight': move('right'); break;
                            case 'ArrowUp': move('up'); break;
                            case 'ArrowDown': move('down'); break;
                        }
                    });
                    
                    addRandomTile();
                    addRandomTile();
                    updateGrid();
                }
                
                function closeGame() {
                    showSection('arcade');
                }
                
                function updateCoins(score) {
                    const coinsElement = document.getElementById('coins-value');
                    if (coinsElement) {
                        let currentCoins = parseInt(coinsElement.textContent.replace(',', ''));
                        currentCoins += Math.floor(score / 10);
                        coinsElement.textContent = currentCoins.toLocaleString();
                    }
                }
                
                // 🎮 DECAY AUTOMÁTICO DE STATS
                setInterval(() => {
                    updateStat('hunger', -1);
                    updateStat('happiness', -0.5);
                    updateStat('energy', -0.5);
                }, 30000); // Cada 30 segundos
                
                // 🎮 INICIALIZACIÓN
                document.addEventListener('DOMContentLoaded', function() {
                    console.log('🎮 Game Hub iniciado correctamente');
                });
            </script>
        </body>
        </html>
    `);
});

// Ruta para el Tamagotchi (redirigir al juego principal)
app.get('/tamagotchi', (req, res) => {
    res.redirect('/retro-arcade');
});

// Ruta para el juego original - redirigir a la aplicación Next.js
app.get('/retro-arcade', (req, res) => {
    res.redirect('/');
});

// Ruta para servir archivos estáticos
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/components', express.static(path.join(__dirname, 'components')));
app.use('/app', express.static(path.join(__dirname, 'app')));

// Ruta para servir la aplicación Next.js
app.get('*', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🎮 Tamagotchi Pro & Retro Arcade</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <meta name="description" content="Tamagotchi Pro & Retro Arcade - Tu Experiencia Gaming Completa">
            <link rel="icon" href="/favicon.ico">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    text-align: center;
                }
                .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                }
                .spinner {
                    width: 50px;
                    height: 50px;
                    border: 5px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top-color: #fff;
                    animation: spin 1s ease-in-out infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                h1 {
                    font-size: 2rem;
                    margin: 0;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                }
                p {
                    font-size: 1.1rem;
                    opacity: 0.8;
                    margin: 10px 0;
                }
                .features {
                    display: flex;
                    gap: 20px;
                    flex-wrap: wrap;
                    justify-content: center;
                    margin-top: 30px;
                }
                .feature {
                    background: rgba(255,255,255,0.1);
                    padding: 15px;
                    border-radius: 10px;
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255,255,255,0.2);
                }
            </style>
        </head>
        <body>
            <div class="loading">
                <div class="spinner"></div>
                <h1>🎮 Tamagotchi Pro & Retro Arcade</h1>
                <p>Cargando tu experiencia gaming completa...</p>
                <div class="features">
                    <div class="feature">🐾 Tamagotchi Virtual</div>
                    <div class="feature">🕹️ Juegos Retro</div>
                    <div class="feature">🛒 Tienda Pro</div>
                    <div class="feature">🏆 Logros</div>
                </div>
            </div>
            <script>
                // Redirigir a la aplicación Next.js
                setTimeout(() => {
                    window.location.href = '/app';
                }, 2000);
            </script>
        </body>
        </html>
    `);
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