# 🎮 Tamagotchi Pro & Retro Arcade

Una aplicación completa que combina un Tamagotchi virtual con juegos retro arcade, todo integrado con MongoDB Atlas.

## 🚀 Características

### 🐾 Modo Tamagotchi
- **Cuidado automático**: Las barras de hambre, felicidad, energía y limpieza bajan automáticamente cada minuto
- **Feedback visual**: Animaciones y efectos visuales para todas las acciones
- **Sistema de niveles**: Gana experiencia y sube de nivel
- **Mascotas compañeras**: Sistema de mascotas que dan bonificaciones

### 🕹️ Modo Retro Arcade
- **6 juegos clásicos**: Pong, Tetris, Breakout, Memory, Simon, 2048
- **Controles optimizados**: Teclado y mouse funcionando perfectamente
- **Sistema de puntuación**: Guarda tus mejores puntajes
- **Recompensas**: Gana monedas y experiencia jugando

### 🛒 Tienda Pro
- **Personalización**: Cambia colores del Tamagotchi
- **Fondos retro**: Compra fondos especiales
- **Accesorios**: Sombreros, coronas y más
- **Sistema de monedas**: Gasta y gana monedas/gemas

### 📊 Base de Datos
- **MongoDB Atlas**: Todos los datos guardados en la nube
- **Registros completos**: Login, acciones, progreso
- **Stats persistentes**: Progreso del Tamagotchi guardado

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone [url-del-repositorio]
cd superhero-game-clean

# Instalar dependencias
npm install

# Iniciar el servidor
npm start
```

## 🌐 Uso

1. **Abre tu navegador** y ve a `http://localhost:8081`
2. **Navega entre modos**:
   - 🏠 **Inicio**: Panel principal
   - 🐾 **Modo Tamagotchi**: Cuidado de mascota virtual
   - 🕹️ **Modo Retro Arcade**: Juegos clásicos
   - 🛒 **Tienda Pro**: Personalización
   - 🏆 **Logros**: Sistema de logros
   - ⚙️ **Perfil**: Estadísticas y progreso

## 🎮 Controles de Juegos

### Pong
- **Flechas arriba/abajo** o **W/S**: Mover paleta
- **Espacio**: Pausar
- **Escape**: Salir

### Tetris
- **Flechas**: Mover bloques
- **Espacio**: Rotar
- **Flecha abajo**: Caída rápida

### Breakout
- **Flechas izquierda/derecha**: Mover paleta
- **Espacio**: Lanzar pelota

### Memory
- **Click**: Revelar cartas
- **Encuentra parejas** para ganar

### Simon
- **Click en colores**: Repetir secuencia
- **Escucha y memoriza**

### 2048
- **Flechas**: Mover números
- **Combina hasta 2048**

## 🗄️ Base de Datos

La aplicación usa MongoDB Atlas con las siguientes colecciones:
- `mascotas_fantasticas.registros`: Registros de usuario y acciones
- `mascotas_fantasticas.tamagotchi_stats`: Estadísticas del Tamagotchi

## 🎨 Tecnologías

- **Frontend**: React, Next.js, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui
- **Animaciones**: Framer Motion
- **Backend**: Node.js, Express
- **Base de datos**: MongoDB Atlas
- **Notificaciones**: Sonner

## 📱 Responsive

La aplicación es completamente responsive y funciona en:
- 📱 Móviles
- 💻 Tablets
- 🖥️ Desktop

## 🚀 Despliegue

La aplicación está configurada para desplegarse en:
- **Render**: Configurado automáticamente
- **Heroku**: Procfile incluido
- **Vercel**: Compatible con Next.js

## 🎯 Características Destacadas

- ✅ **Modos completamente separados**
- ✅ **Tamagotchi funcional con degradación automática**
- ✅ **Juegos 100% jugables con controles optimizados**
- ✅ **Scrollbar fijo durante juegos**
- ✅ **Snake completamente eliminado**
- ✅ **Base de datos funcional**
- ✅ **Tienda con cambio de colores persistente**
- ✅ **QA completo y probado**

---

**🎮 ¡Disfruta de tu Tamagotchi Pro y juegos retro!**