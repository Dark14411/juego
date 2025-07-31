'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Gamepad2, 
  Trophy, 
  Star,
  Zap,
  Target,
  Puzzle,
  Grid3X3,
  Play
} from 'lucide-react'

interface ArcadeGame {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  difficulty: 'Fácil' | 'Medio' | 'Difícil'
  category: string
  gradient: string
}

interface ArcadeModeProps {
  onStartGame?: (gameId: string) => void
}

export default function ArcadeModePanel({ onStartGame }: ArcadeModeProps) {
  const [selectedGame, setSelectedGame] = useState<string | null>(null)

  const arcadeGames: ArcadeGame[] = [
    {
      id: 'pong',
      name: '🏓 Pong Retro',
      icon: <Target className="w-8 h-8" />,
      description: 'El clásico juego de ping pong con gráficos retro. Controla tu paleta y vence a la IA.',
      difficulty: 'Medio',
      category: 'Deportes',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'tetris',
      name: '🧩 Tetris Pro',
      icon: <Grid3X3 className="w-8 h-8" />,
      description: 'Organiza los bloques que caen para formar líneas completas. ¡El puzzle más adictivo!',
      difficulty: 'Medio',
      category: 'Puzzle',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'breakout',
      name: '🧱 Breakout Classic',
      icon: <Zap className="w-8 h-8" />,
      description: 'Rompe todos los ladrillos rebotando la pelota con tu paleta. ¡Acción pura!',
      difficulty: 'Fácil',
      category: 'Arcade',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      id: 'memory',
      name: '🧠 Memory Challenge',
      icon: <Puzzle className="w-8 h-8" />,
      description: 'Pon a prueba tu memoria encontrando las parejas de cartas. Entrena tu cerebro.',
      difficulty: 'Fácil',
      category: 'Mental',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'simon',
      name: '🎵 Simon Says',
      icon: <Star className="w-8 h-8" />,
      description: 'Repite la secuencia de colores y sonidos. ¿Hasta dónde puedes llegar?',
      difficulty: 'Medio',
      category: 'Musical',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: '2048',
      name: '🔢 2048 Fusion',
      icon: <Grid3X3 className="w-8 h-8" />,
      description: 'Combina números para llegar al 2048. Estrategia y matemáticas en acción.',
      difficulty: 'Difícil',
      category: 'Matemática',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ]

  const handleGameSelect = (gameId: string) => {
    setSelectedGame(gameId)
    if (onStartGame) {
      onStartGame(gameId)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fácil': return 'bg-green-500'
      case 'Medio': return 'bg-yellow-500'
      case 'Difícil': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Deportes': return '🏓'
      case 'Puzzle': return '🧩'
      case 'Arcade': return '🕹️'
      case 'Mental': return '🧠'
      case 'Musical': return '🎵'
      case 'Matemática': return '🔢'
      default: return '🎮'
    }
  }

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto">
      {/* 🎮 HEADER */}
      <Card className="bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <Gamepad2 className="w-10 h-10 text-cyan-300" />
            🕹️ Modo Retro Arcade
            <Badge variant="secondary" className="bg-white/20 text-white">
              {arcadeGames.length} Juegos
            </Badge>
          </CardTitle>
          <p className="text-lg opacity-90">
            Juegos clásicos retro con controles mejorados para producción
          </p>
        </CardHeader>
      </Card>

      {/* 🎮 SELECCIÓN DE JUEGOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arcadeGames.map((game) => (
          <Card 
            key={game.id}
            className={`
              relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer
              ${selectedGame === game.id 
                ? 'border-cyan-400 shadow-lg shadow-cyan-400/50 scale-105' 
                : 'border-gray-600 hover:border-cyan-300'
              }
              bg-gradient-to-br from-gray-900 to-gray-800
            `}
            onClick={() => setSelectedGame(game.id)}
          >
            {/* HEADER GRADIENT */}
            <div className={`h-3 w-full bg-gradient-to-r ${game.gradient}`} />

            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* ICON */}
                <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${game.gradient} flex items-center justify-center text-white shadow-2xl`}>
                  {game.icon}
                </div>

                {/* INFO */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                  <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* BADGES */}
                <div className="flex justify-center gap-2 mb-4">
                  <Badge className={`${getDifficultyColor(game.difficulty)} text-white font-semibold`}>
                    {game.difficulty}
                  </Badge>
                  <Badge variant="outline" className="border-gray-400 text-gray-300">
                    {getCategoryIcon(game.category)} {game.category}
                  </Badge>
                </div>

                {/* BOTÓN DE JUGAR */}
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleGameSelect(game.id)
                  }}
                  className={`w-full font-bold py-3 transition-all bg-gradient-to-r ${game.gradient} hover:shadow-lg hover:shadow-${game.gradient.split('-')[1]}-500/50`}
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  ¡Jugar Ahora!
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🎮 INFORMACIÓN DE CONTROLES */}
      <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Controles y Características
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-cyan-300">🎮 Controles Universales:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Teclado:</strong> WASD o Flechas</li>
                <li>• <strong>Ratón:</strong> Click y movimiento</li>
                <li>• <strong>Táctil:</strong> Optimizado para móviles</li>
                <li>• <strong>Responsive:</strong> Se adapta a tu pantalla</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-emerald-300">🏆 Sistema de Puntuación:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Records:</strong> Se guardan automáticamente</li>
                <li>• <strong>Leaderboard:</strong> Compite con otros</li>
                <li>• <strong>Progreso:</strong> Desbloquea logros</li>
                <li>• <strong>Recompensas:</strong> Gana monedas jugando</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-3 text-purple-300">✨ Características Pro:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Sin lag:</strong> Optimizado para producción</li>
                <li>• <strong>Fluido:</strong> 60 FPS garantizados</li>
                <li>• <strong>Pausable:</strong> Pausa en cualquier momento</li>
                <li>• <strong>Progreso:</strong> Se guarda automáticamente</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎮 ESTADÍSTICAS DE JUEGOS */}
      <Card className="bg-gradient-to-br from-gray-900 to-black text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400" />
            Logros y Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-cyan-400">6</div>
              <div className="text-sm text-gray-300">Juegos Disponibles</div>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-green-400">100%</div>
              <div className="text-sm text-gray-300">Sin Bugs</div>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">60</div>
              <div className="text-sm text-gray-300">FPS Garantizados</div>
            </div>
            
            <div className="text-center p-4 bg-white/10 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">∞</div>
              <div className="text-sm text-gray-300">Diversión Infinita</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}