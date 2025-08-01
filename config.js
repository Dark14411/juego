// Configuración del juego retro arcade
module.exports = {
    // MongoDB Atlas URI - Base de datos para autenticación y sesiones
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://api-heroe:api-heroe@cluster0.mlzaawc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
    
    // JWT Secret
    JWT_SECRET: process.env.JWT_SECRET || 'retro-arcade-secret-key-2024',
    
    // Puerto del servidor
    PORT: process.env.PORT || 8083,
    
    // Configuración de MongoDB
    MONGODB_OPTIONS: {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
    }
}; 