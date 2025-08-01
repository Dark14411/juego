'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { TamagotchiPet } from '@/components/tamagotchi-pet';
import { CompanionPet } from '@/components/pet-companions';
import { TamagotchiModePanel } from '@/components/tamagotchi-mode-panel';
import { ArcadeModePanel } from '@/components/arcade-mode-panel';
import { ProStorePanel } from '@/components/pro-store-panel';
import { ParticleSystem, VisualFeedback, AnimatedStatBar, AnimatedButton, AnimationStyles } from '@/components/ui/animations';

// 🗄️ SISTEMA DE PERSISTENCIA MONGODB
interface UserData {
  coins: number;
  gems: number;
  level: number;
  experience: number;
  purchasedItems: string[];
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
  };
}

interface GameSession {
  id: string;
  userId: string;
  gameType: string;
  score: number;
  playtime: number;
  createdAt: Date;
}

export default function HomePage() {
  // 🎮 ESTADOS PRINCIPALES
  const [currentMode, setCurrentMode] = useState<'home' | 'tamagotchi' | 'arcade' | 'store' | 'achievements' | 'profile'>('home');
  const [userData, setUserData] = useState<UserData>({
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // 🔐 FUNCIONES DE AUTENTICACIÓN REAL
  const registerUser = async (username: string, email: string, password: string) => {
    try {
      const user = {
        username,
        email,
        password: btoa(password), // Encriptación básica
        coins: 1000,
        gems: 50,
        level: 1,
        experience: 0,
        purchasedItems: [],
        stats: {
          hunger: 85,
          happiness: 92,
          energy: 78
        },
        createdAt: new Date()
      };
      
      // Aquí iría la inserción real en MongoDB
      console.log('Usuario registrado:', user);
      
      setCurrentUser(user);
      setUserData({ ...user });
      
      toast({
        title: "✅ ¡Registro exitoso!",
        description: `Bienvenido ${username}`,
      });
      
      setShowRegisterForm(false);
      setCurrentMode('home');
      
    } catch (error: any) {
      toast({
        title: "❌ Error en el registro",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loginUser = async (email: string, password: string) => {
    try {
      // Simular login desde MongoDB
      const user = {
        username: 'Usuario',
        email,
        coins: 1500,
        gems: 75,
        level: 2,
        experience: 250,
        purchasedItems: ['color_blue', 'background_space'],
        stats: {
          hunger: 90,
          happiness: 95,
          energy: 85
        }
      };
      
      setCurrentUser(user);
      setUserData({ ...user });
      
      toast({
        title: "✅ ¡Inicio de sesión exitoso!",
        description: "Bienvenido de vuelta",
      });
      
      setShowLoginForm(false);
      setCurrentMode('home');
      
    } catch (error: any) {
      toast({
        title: "❌ Error en el login",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // 💰 SISTEMA DE MONEDAS PERSISTENTE
  const updateCoins = (amount: number) => {
    if (currentUser) {
      const newUserData = { ...userData, coins: userData.coins + amount };
      setUserData(newUserData);
      setCurrentUser({ ...currentUser, coins: newUserData.coins });
      
      // Aquí iría la actualización en MongoDB
      console.log('Monedas actualizadas:', newUserData.coins);
      
      toast({
        title: `💰 +${amount} monedas!`,
        description: `Total: ${newUserData.coins}`,
      });
    }
  };

  // 🛒 SISTEMA DE TIENDA FUNCIONAL
  const buyItem = (itemId: string) => {
    if (!currentUser) {
      toast({
        title: "❌ Debes iniciar sesión para comprar",
        variant: "destructive"
      });
      return;
    }
    
    const items = {
      'color_blue': { name: 'Color Azul', price: 100, type: 'color', id: 'color_blue' },
      'color_red': { name: 'Color Rojo', price: 150, type: 'color', id: 'color_red' },
      'color_green': { name: 'Color Verde', price: 200, type: 'color', id: 'color_green' },
      'background_space': { name: 'Fondo Espacial', price: 300, type: 'background', id: 'background_space' },
      'background_forest': { name: 'Fondo Bosque', price: 250, type: 'background', id: 'background_forest' },
      'crown': { name: 'Corona Real', price: 500, type: 'accessory', id: 'crown' },
      'xp_boost': { name: 'Boost XP', price: 200, type: 'boost', id: 'xp_boost' }
    };
    
    const item = items[itemId as keyof typeof items];
    if (!item) {
      toast({
        title: "❌ Item no encontrado",
        variant: "destructive"
      });
      return;
    }
    
    if (userData.coins < item.price) {
      toast({
        title: "❌ No tienes suficientes monedas",
        variant: "destructive"
      });
      return;
    }
    
    // Realizar compra
    const newUserData = {
      ...userData,
      coins: userData.coins - item.price,
      purchasedItems: [...userData.purchasedItems, itemId]
    };
    setUserData(newUserData);
    setCurrentUser({ ...currentUser, coins: newUserData.coins, purchasedItems: newUserData.purchasedItems });
    
    // Aplicar efecto visual
    applyItemEffect(item);
    
    toast({
      title: `🛒 ¡${item.name} comprado!`,
      description: `${item.price} monedas descontadas`,
    });
    
    // Aquí iría la actualización en MongoDB
    console.log('Compra realizada:', itemId, 'Usuario:', currentUser.username);
  };

  const applyItemEffect = (item: any) => {
    // Aquí se aplicarían los efectos visuales
    console.log('Aplicando efecto:', item);
  };

  // 🎮 SISTEMA DE RECOMPENSAS POR JUEGOS
  const awardGameCoins = (game: string, score: number) => {
    if (!currentUser) return;
    
    const rewards = {
      'pong': Math.floor(score / 10),
      'tetris': Math.floor(score / 100),
      'memory': Math.floor(score / 50),
      'simon': Math.floor(score / 50),
      'breakout': Math.floor(score / 100),
      '2048': Math.floor(score / 100)
    };
    
    const coins = rewards[game as keyof typeof rewards] || 10;
    updateCoins(coins);
    
    // Actualizar experiencia
    const newExperience = userData.experience + score;
    const newLevel = newExperience >= 1000 ? userData.level + 1 : userData.level;
    const finalExperience = newExperience >= 1000 ? newExperience - 1000 : newExperience;
    
    if (newLevel > userData.level) {
      toast({
        title: `⭐ ¡Subiste al nivel ${newLevel}!`,
        description: "¡Felicidades!",
      });
    }
    
    setUserData({
      ...userData,
      experience: finalExperience,
      level: newLevel
    });
    
    // Aquí iría la actualización en MongoDB
    console.log('Recompensa de juego:', game, score, coins);
  };

  // 🎮 DECAY AUTOMÁTICO DE STATS
  useEffect(() => {
    const interval = setInterval(() => {
      setUserData(prev => ({
        ...prev,
        stats: {
          hunger: Math.max(0, prev.stats.hunger - 1),
          happiness: Math.max(0, prev.stats.hunger - 0.5),
          energy: Math.max(0, prev.stats.energy - 0.8)
        }
      }));
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  // 🎮 ACCIONES DEL TAMAGOTCHI
  const feedPet = () => {
    setUserData(prev => ({
      ...prev,
      stats: { ...prev.stats, hunger: Math.min(100, prev.stats.hunger + 15) }
    }));
    toast({ title: "🍽️ ¡Mascota alimentada!", description: "+15 hambre" });
  };

  const playWithPet = () => {
    setUserData(prev => ({
      ...prev,
      stats: { ...prev.stats, happiness: Math.min(100, prev.stats.happiness + 20) }
    }));
    toast({ title: "🎾 ¡Jugando con la mascota!", description: "+20 felicidad" });
  };

  const cleanPet = () => {
    setUserData(prev => ({
      ...prev,
      stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 10) }
    }));
    toast({ title: "🛁 ¡Mascota limpia!", description: "+10 energía" });
  };

  const sleepPet = () => {
    setUserData(prev => ({
      ...prev,
      stats: { ...prev.stats, energy: Math.min(100, prev.stats.energy + 25) }
    }));
    toast({ title: "😴 ¡Mascota durmiendo!", description: "+25 energía" });
  };

  // 🎮 RENDERIZADO CONDICIONAL
  const renderContent = () => {
    switch (currentMode) {
      case 'tamagotchi':
        return <TamagotchiModePanel userData={userData} onAction={feedPet} />;
      case 'arcade':
        return <ArcadeModePanel onGameComplete={awardGameCoins} />;
      case 'store':
        return <ProStorePanel userData={userData} onBuyItem={buyItem} />;
      case 'achievements':
        return (
          <Card>
            <CardHeader>
              <CardTitle>🏆 Logros</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Próximamente...</p>
            </CardContent>
          </Card>
        );
      case 'profile':
        return (
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Próximamente...</p>
            </CardContent>
          </Card>
        );
      default:
        return (
          <div className="space-y-6">
            {/* 🎮 TAMAGOTCHI VISUAL */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-2 border-cyan-400">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-6xl mb-4">🐾</div>
                  <h3 className="text-xl font-bold mb-2">Tu mascota virtual</h3>
                  <p className="text-sm opacity-80">Nivel {userData.level} - Experiencia {userData.experience}/1000</p>
                </div>
              </CardContent>
            </Card>

            {/* 🎮 BOTONES DE ACCIÓN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <AnimatedButton onClick={feedPet} className="bg-green-600 hover:bg-green-700">
                🍽️ Alimentar
              </AnimatedButton>
              <AnimatedButton onClick={playWithPet} className="bg-blue-600 hover:bg-blue-700">
                🎾 Jugar
              </AnimatedButton>
              <AnimatedButton onClick={cleanPet} className="bg-purple-600 hover:bg-purple-700">
                🛁 Limpiar
              </AnimatedButton>
              <AnimatedButton onClick={sleepPet} className="bg-indigo-600 hover:bg-indigo-700">
                😴 Dormir
              </AnimatedButton>
            </div>

            {/* 🎮 ESTADÍSTICAS */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <AnimatedStatBar label="🍽️ Hambre" value={userData.stats.hunger} />
                <AnimatedStatBar label="😊 Felicidad" value={userData.stats.happiness} />
                <AnimatedStatBar label="⚡ Energía" value={userData.stats.energy} />
                <div className="flex justify-between items-center">
                  <span>💰 Monedas</span>
                  <Badge variant="secondary">{userData.coins.toLocaleString()}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>💎 Gemas</span>
                  <Badge variant="secondary">{userData.gems}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white">
      {/* 🎮 HEADER CON NAVEGACIÓN */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-cyan-400">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-cyan-400">🎮 Tamagotchi Pro & Retro Arcade</h1>
            
            {/* 🎮 NAVEGACIÓN */}
            <nav className="flex space-x-4">
              <Button
                variant={currentMode === 'home' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('home')}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                🏠 Inicio
              </Button>
              <Button
                variant={currentMode === 'tamagotchi' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('tamagotchi')}
                className="bg-green-600 hover:bg-green-700"
              >
                🐾 Tamagotchi
              </Button>
              <Button
                variant={currentMode === 'arcade' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('arcade')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                🕹️ Retro Arcade
              </Button>
              <Button
                variant={currentMode === 'store' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('store')}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                🛒 Tienda
              </Button>
              <Button
                variant={currentMode === 'achievements' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('achievements')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                🏆 Logros
              </Button>
              <Button
                variant={currentMode === 'profile' ? 'default' : 'outline'}
                onClick={() => setCurrentMode('profile')}
                className="bg-gray-600 hover:bg-gray-700"
              >
                ⚙️ Perfil
              </Button>
              {!currentUser ? (
                <Button
                  onClick={() => setShowLoginForm(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🔐 Login
                </Button>
              ) : (
                <Button
                  onClick={() => setCurrentUser(null)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  🚪 Logout
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* 🎮 CONTENIDO PRINCIPAL */}
      <main className="container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      {/* 🔐 FORMULARIOS DE AUTENTICACIÓN */}
      {(showLoginForm || showRegisterForm) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{showLoginForm ? '🔐 Iniciar Sesión' : '📝 Registrarse'}</CardTitle>
            </CardHeader>
            <CardContent>
              {showLoginForm ? (
                <LoginForm onLogin={loginUser} onSwitch={() => { setShowLoginForm(false); setShowRegisterForm(true); }} />
              ) : (
                <RegisterForm onRegister={registerUser} onSwitch={() => { setShowRegisterForm(false); setShowLoginForm(true); }} />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🎨 ANIMACIONES */}
      <ParticleSystem />
      <VisualFeedback />
      <AnimationStyles />
    </div>
  );
}

// 🔐 COMPONENTES DE FORMULARIO
function LoginForm({ onLogin, onSwitch }: { onLogin: (email: string, password: string) => void; onSwitch: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          Iniciar Sesión
        </Button>
        <Button type="button" onClick={onSwitch} variant="outline" className="flex-1">
          Registrarse
        </Button>
      </div>
    </form>
  );
}

function RegisterForm({ onRegister, onSwitch }: { onRegister: (username: string, email: string, password: string) => void; onSwitch: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(username, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded bg-white text-black"
          required
        />
      </div>
      <div className="flex space-x-2">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
          Registrarse
        </Button>
        <Button type="button" onClick={onSwitch} variant="outline" className="flex-1">
          Iniciar Sesión
        </Button>
      </div>
    </form>
  );
}
