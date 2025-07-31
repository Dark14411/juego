const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 10000;

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '/')));

// Ruta principal - redireccionar a retro-arcade-game.html
app.get('/', (req, res) => {
  res.redirect('/retro-arcade-game.html');
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🎮 Retro Arcade Game corriendo en http://localhost:${PORT}`);
  console.log(`🎯 Abre http://localhost:${PORT} para jugar`);
});