const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const path = require('path');
const Database = require('./database');
const AuthDatabase = require('./auth-database');
const config = require('./config');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const PORT = config.PORT;
const JWT_SECRET = config.JWT_SECRET;

// 🔧 MIDDLEWARE PARA PARSING
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🗄️ CONEXIÓN MONGODB REAL
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ Error de conexión MongoDB:'));
db.once('open', () => {
    console.log('✅ Conectado a MongoDB exitosamente');
    console.log('📊 Base de datos:', config.MONGODB_URI);
});

// 🗄️ ESQUEMAS MONGODB REALES
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    coins: { type: Number, default: 1000 },
    gems: { type: Number, default: 50 },
    level: { type: Number, default: 1 },
    experience: { type: Number, default: 0 },
    purchasedItems: [{ type: String }],
    stats: {
        hunger: { type: Number, default: 85 },
        happiness: { type: Number, default: 92 },
        energy: { type: Number, default: 78 }
    },
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

const gameSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    gameType: { type: String, required: true },
    score: { type: Number, required: true },
    coinsEarned: { type: Number, required: true },
    playtime: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const GameSession = mongoose.model('GameSession', gameSessionSchema);

// 🔐 MIDDLEWARE DE AUTENTICACIÓN
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token requerido' });
    }
    
    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido' });
    }
};

// 🔐 API REGISTRO REAL
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        // Validar campos
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos son requeridos' });
        }
        
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Usuario o email ya existe' });
        }
        
        // Encriptar contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Crear usuario nuevo
        const user = new User({
            username,
            email,
            password: hashedPassword,
            coins: 1000,
            gems: 50,
            level: 1,
            experience: 0,
            purchasedItems: [],
            stats: {
                hunger: 85,
                happiness: 92,
                energy: 78
            }
        });
        
        await user.save();
        
        // Generar token
        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '24h' });
        
        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins,
                gems: user.gems,
                level: user.level,
                experience: user.experience,
                purchasedItems: user.purchasedItems,
                stats: user.stats
            }
        });
        
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔐 API LOGIN REAL
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validar campos
        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son requeridos' });
        }
        
        // Buscar usuario
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Actualizar último login
        user.lastLogin = new Date();
        await user.save();
        
        // Generar token
        const token = jwt.sign({ userId: user._id }, config.JWT_SECRET, { expiresIn: '24h' });
        
        res.json({
            success: true,
            message: 'Login exitoso',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins,
                gems: user.gems,
                level: user.level,
                experience: user.experience,
                purchasedItems: user.purchasedItems,
                stats: user.stats
            }
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🐾 API ACCIONES TAMAGOTCHI REALES
app.post('/api/tamagotchi/action', authenticateToken, async (req, res) => {
    try {
        const { action } = req.body;
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        let coinsEarned = 0;
        let message = '';
        
        switch (action) {
            case 'feed':
                user.stats.hunger = Math.min(100, user.stats.hunger + 15);
                user.experience += 5;
                coinsEarned = 1;
                message = '🍽️ ¡Mascota alimentada! +1 moneda';
                break;
                
            case 'play':
                user.stats.happiness = Math.min(100, user.stats.happiness + 20);
                user.stats.energy = Math.max(0, user.stats.energy - 10);
                user.experience += 10;
                coinsEarned = 2;
                message = '🎾 ¡Jugando con la mascota! +2 monedas';
                break;
                
            case 'clean':
                user.stats.energy = Math.min(100, user.stats.energy + 10);
                user.experience += 7;
                coinsEarned = 1;
                message = '🛁 ¡Mascota limpia! +1 moneda';
                break;
                
            case 'sleep':
                user.stats.energy = Math.min(100, user.stats.energy + 25);
                user.experience += 8;
                coinsEarned = 1;
                message = '😴 ¡Mascota durmiendo! +1 moneda';
                break;
                
            default:
                return res.status(400).json({ error: 'Acción inválida' });
        }
        
        // Verificar level up
        if (user.experience >= 1000) {
            user.level += 1;
            user.experience -= 1000;
            user.coins += user.level * 5;
            message += ` ⭐ ¡Subiste al nivel ${user.level}! +${user.level * 5} monedas`;
        }
        
        // Actualizar monedas
        user.coins += coinsEarned;
        
        await user.save();
        
        res.json({
            success: true,
            message,
            user: {
                coins: user.coins,
                gems: user.gems,
                level: user.level,
                experience: user.experience,
                stats: user.stats
            }
        });
        
    } catch (error) {
        console.error('Error en acción Tamagotchi:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🎮 API JUEGOS REALES
app.post('/api/games/complete', authenticateToken, async (req, res) => {
    try {
        const { gameType, score } = req.body;
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Calcular recompensas por juego
        const rewards = {
            'pong': Math.floor(score / 10),
            'tetris': Math.floor(score / 100),
            'memory': Math.floor(score / 50),
            'simon': Math.floor(score / 50),
            'breakout': Math.floor(score / 100),
            '2048': Math.floor(score / 100)
        };
        
        const coinsEarned = rewards[gameType] || 10;
        
        // Actualizar usuario
        user.coins += coinsEarned;
        user.experience += score;
        
        // Verificar level up
        if (user.experience >= 1000) {
            user.level += 1;
            user.experience -= 1000;
            user.coins += user.level * 5;
        }
        
        await user.save();
        
        // Guardar sesión de juego
        const gameSession = new GameSession({
            userId: user._id,
            gameType,
            score,
            coinsEarned,
            playtime: Math.floor(Math.random() * 300) + 60 // 1-6 minutos
        });
        
        await gameSession.save();
        
        res.json({
            success: true,
            message: `🎮 ¡${gameType.toUpperCase()} completado! +${coinsEarned} monedas`,
            coinsEarned,
            user: {
                coins: user.coins,
                level: user.level,
                experience: user.experience
            }
        });
        
    } catch (error) {
        console.error('Error en juego:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🛒 API TIENDA REAL
app.post('/api/store/buy', authenticateToken, async (req, res) => {
    try {
        const { itemId } = req.body;
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const items = {
            'color_blue': { name: 'Color Azul', price: 100, type: 'color' },
            'color_red': { name: 'Color Rojo', price: 150, type: 'color' },
            'color_green': { name: 'Color Verde', price: 200, type: 'color' },
            'background_space': { name: 'Fondo Espacial', price: 300, type: 'background' },
            'background_forest': { name: 'Fondo Bosque', price: 250, type: 'background' },
            'crown': { name: 'Corona Real', price: 500, type: 'accessory' },
            'xp_boost': { name: 'Boost XP', price: 200, type: 'boost' }
        };
        
        const item = items[itemId];
        if (!item) {
            return res.status(400).json({ error: 'Item no encontrado' });
        }
        
        if (user.coins < item.price) {
            return res.status(400).json({ error: 'No tienes suficientes monedas' });
        }
        
        if (user.purchasedItems.includes(itemId)) {
            return res.status(400).json({ error: 'Ya tienes este item' });
        }
        
        // Realizar compra
        user.coins -= item.price;
        user.purchasedItems.push(itemId);
        
        await user.save();
        
        res.json({
            success: true,
            message: `🛒 ¡${item.name} comprado por ${item.price} monedas!`,
            user: {
                coins: user.coins,
                purchasedItems: user.purchasedItems
            }
        });
        
    } catch (error) {
        console.error('Error en compra:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📊 API OBTENER USUARIO
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                coins: user.coins,
                gems: user.gems,
                level: user.level,
                experience: user.experience,
                purchasedItems: user.purchasedItems,
                stats: user.stats,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
        
    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 📊 API ESTADÍSTICAS DE JUEGOS
app.get('/api/user/game-stats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const gameStats = await GameSession.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            { $group: {
                _id: '$gameType',
                totalGames: { $sum: 1 },
                totalScore: { $sum: '$score' },
                totalCoins: { $sum: '$coinsEarned' },
                bestScore: { $max: '$score' },
                totalPlaytime: { $sum: '$playtime' }
            }}
        ]);
        
        res.json({
            success: true,
            gameStats
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🔄 DECAY AUTOMÁTICO DE STATS
app.post('/api/tamagotchi/decay', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        // Aplicar decay automático
        user.stats.hunger = Math.max(0, user.stats.hunger - 1);
        user.stats.happiness = Math.max(0, user.stats.happiness - 0.5);
        user.stats.energy = Math.max(0, user.stats.energy - 0.8);
        
        await user.save();
        
        res.json({
            success: true,
            stats: user.stats
        });
        
    } catch (error) {
        console.error('Error en decay:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 🎮 SERVIR APLICACIÓN FRONTEND
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'retro-arcade-original.html'));
});

// 🚀 INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log('🎮 Retro Arcade Game con MongoDB corriendo en http://localhost:' + PORT);
    console.log('🎯 Abre http://localhost:' + PORT + ' para jugar');
    console.log('📊 Base de datos MongoDB inicializada');
    console.log('🔐 Sistema de autenticación MongoDB activo');
});