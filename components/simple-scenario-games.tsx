'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Gamepad2, 
  Coins, 
  Star, 
  Trophy, 
  Play, 
  RotateCcw, 
  Home,
  Zap,
  Target,
  Crown
} from 'lucide-react'

// 🎮 INTERFACES
interface SimpleGame {
  id: string
  name: string
  description: string
  backgroundImage: string
  difficulty: 1 | 2 | 3 | 4 | 5
  bestScore: number
  completed: boolean
  unlocked: boolean
  rewards: {
    coins: number
    experience: number
  }
}

interface GameSession {
  isPlaying: boolean
  score: number
  timeLeft: number
  level: number
}

export default function SimpleScenarioGames({ 
  onGameComplete, 
  playerLevel = 5, 
  playerCoins = 1000 
}: {
  onGameComplete?: (rewards: any) => void
  playerLevel?: number
  playerCoins?: number
}) {
  // 🎮 ESTADOS
  const [selectedGame, setSelectedGame] = useState<SimpleGame | null>(null)
  const [gameSession, setGameSession] = useState<GameSession>({
    isPlaying: false,
    score: 0,
    timeLeft: 60,
    level: 1
  })
  const [completedGames, setCompletedGames] = useState(0)
  const [totalScore, setTotalScore] = useState(0)

  // 🎮 JUEGOS DISPONIBLES
  const games: SimpleGame[] = [
    {
      id: 'crystal-adventure',
      name: 'Aventura de Cristales',
      description: 'Explora un mundo mágico lleno de cristales brillantes',
      backgroundImage: '/escenarios/a98a1fe05019c395040c7872f7a26be4.gif',
      difficulty: 1,
      bestScore: 0,
      completed: false,
      unlocked: true,
      rewards: { coins: 50, experience: 10 }
    },
    {
      id: 'ethereal-dance',
      name: 'Danza Etérea',
      description: 'Sumérgete en un paisaje de ondas de energía mágica',
      backgroundImage: '/escenarios/46ac9e282d3c303934a72d941845785b.gif',
      difficulty: 2,
      bestScore: 0,
      completed: false,
      unlocked: true,
      rewards: { coins: 75, experience: 15 }
    },
    {
      id: 'mystic-forest',
      name: 'Bosque Místico',
      description: 'Un tranquilo paseo por un bosque encantado',
      backgroundImage: '/escenarios/download.jpg',
      difficulty: 1,
      bestScore: 0,
      completed: false,
      unlocked: true,
      rewards: { coins: 40, experience: 8 }
    },
    {
      id: 'ancient-ruins',
      name: 'Ruinas Ancestrales',
      description: 'Descubre los secretos de antiguas civilizaciones',
      backgroundImage: '/escenarios/PruebaEscenario 2022-10-02 16-01-40-original.webp',
      difficulty: 3,
      bestScore: 0,
      completed: false,
      unlocked: true,
      rewards: { coins: 100, experience: 20 }
    }
  ]

  // 🎮 FUNCIONES DEL JUEGO
  const startGame = (game: SimpleGame) => {
    setSelectedGame(game)
    setGameSession({
      isPlaying: true,
      score: 0,
      timeLeft: 60,
      level: 1
    })
    toast.success(`¡Iniciando ${game.name}!`)
  }

  const endGame = (won: boolean = false) => {
    if (!selectedGame) return

    setGameSession(prev => ({ ...prev, isPlaying: false }))
    
    if (won) {
      setCompletedGames(prev => prev + 1)
      setTotalScore(prev => prev + gameSession.score)
      
      // Actualizar mejor score
      const updatedGames = games.map(g => 
        g.id === selectedGame.id 
          ? { ...g, bestScore: Math.max(g.bestScore, gameSession.score), completed: true }
          : g
      )
      
      // Recompensas
      const rewards = {
        coins: selectedGame.rewards.coins,
        experience: selectedGame.rewards.experience,
        score: gameSession.score
      }
      
      onGameComplete?.(rewards)
      toast.success(`¡Victoria! +${rewards.coins} monedas, +${rewards.experience} XP`)
    } else {
      toast.error('¡Tiempo agotado! Inténtalo de nuevo')
    }
  }

  // 🎮 SIMULACIÓN DE JUEGO
  const simulateGameplay = () => {
    if (!gameSession.isPlaying) return

    setGameSession(prev => {
      const newScore = prev.score + Math.floor(Math.random() * 10) + 1
      const newTimeLeft = prev.timeLeft - 1

      if (newTimeLeft <= 0) {
        endGame(true)
        return prev
      }

      return {
        ...prev,
        score: newScore,
        timeLeft: newTimeLeft
      }
    })
  }

  // 🎮 EFECTO DE JUEGO
  useEffect(() => {
    if (gameSession.isPlaying) {
      const interval = setInterval(simulateGameplay, 1000)
      return () => clearInterval(interval)
    }
  }, [gameSession.isPlaying])

  // 🎮 COMPONENTE DE TARJETA DE JUEGO
  const GameCard = ({ game }: { game: SimpleGame }) => (
    <Card 
      className="gaming-card rgb-card group cursor-pointer hover:scale-105 transition-all duration-300"
      onClick={() => startGame(game)}
    >
      <div className="relative h-48 overflow-hidden rounded-t-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center rgb-bg"
          style={{ backgroundImage: `url(${game.backgroundImage})` }}
        />
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Overlay con información */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3">
            <h3 className="text-lg font-bold text-white rgb-text">{game.name}</h3>
            <p className="text-white/80 text-sm mb-2">{game.description}</p>
            
            {/* Badges con RGB */}
            <div className="flex gap-2 mb-3">
              <Badge className="rgb-glow" variant="secondary">
                Nivel {game.difficulty}
              </Badge>
              {game.completed && (
                <Badge className="rgb-glow bg-green-600">Completado</Badge>
              )}
            </div>
            
            {/* Recompensas */}
            <div className="flex justify-between text-sm">
              <span className="text-yellow-400 rgb-text">+{game.rewards.coins} 💰</span>
              <span className="text-blue-400 rgb-text">+{game.rewards.experience} ⭐</span>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4">
        <Button className="w-full gaming-button rgb-button">
          <Play className="w-4 h-4 mr-2" />
          Jugar Ahora
        </Button>
      </CardContent>
    </Card>
  )

  // 🎮 PANTALLA DE JUEGO
  const GameScreen = () => {
    if (!selectedGame) return null

    return (
      <div className="space-y-6">
        {/* Header del juego */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2 rgb-text">{selectedGame.name}</h2>
          <p className="text-white/80">{selectedGame.description}</p>
        </div>

        {/* Pantalla de juego */}
        <Card className="rgb-card">
          <CardContent className="p-6">
            <div className="relative h-96 rounded-2xl overflow-hidden">
              {/* Fondo del escenario con RGB */}
              <div 
                className="absolute inset-0 bg-cover bg-center rgb-bg"
                style={{ backgroundImage: `url(${selectedGame.backgroundImage})` }}
              />
              
              {/* Overlay con efectos RGB */}
              <div className="absolute inset-0 bg-black/30" />
              
              {/* UI del juego */}
              <div className="relative z-10 p-6 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 rgb-border">
                    <h3 className="text-xl font-bold text-white rgb-text">{selectedGame.name}</h3>
                    <p className="text-white/80 text-sm">{selectedGame.description}</p>
                  </div>
                  
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 rgb-border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400 rgb-text">{gameSession.score}</div>
                      <div className="text-white/70 text-sm">Score</div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg p-4 inline-block rgb-border">
                    <div className="text-3xl mb-2 rgb-pulse">🎮</div>
                    <div className="text-white font-semibold rgb-text">¡Jugando!</div>
                    <div className="text-white/70 text-sm">
                      {gameSession.timeLeft}s / 60s
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="mt-6 flex justify-center gap-4">
              {gameSession.isPlaying ? (
                <Button 
                  onClick={() => endGame(true)}
                  className="gaming-button rgb-button"
                  size="lg"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Terminar Juego
                </Button>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold rgb-text">¡Juego Completado!</h3>
                  <p className="text-lg rgb-text">Score final: {gameSession.score}</p>
                  <div className="flex justify-center gap-4 mt-6">
                    <Button onClick={() => startGame(selectedGame)} className="rgb-button">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Jugar de Nuevo
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedGame(null)} className="rgb-button">
                      <Home className="w-4 h-4 mr-2" />
                      Volver al Menú
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <div className="text-center text-white/70 space-y-2">
          <p className="text-sm">🎮 Juego simplificado con progreso automático</p>
          <p className="text-xs">Los puntos se generan automáticamente durante el tiempo de juego</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {!selectedGame ? (
          <>
            {/* Header con RGB */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-4 rgb-text">
                🎮 Juegos de Escenarios
              </h1>
              <p className="text-xl text-white/80 mb-6">
                Aventuras épicas en mundos únicos
              </p>
              <div className="flex justify-center gap-6">
                <div className="flex items-center gap-2 text-yellow-400 rgb-text">
                  <Gamepad2 className="w-5 h-5 rgb-pulse" />
                  <span className="font-bold">{games.filter(g => g.unlocked).length} Juegos Disponibles</span>
                </div>
                <div className="flex items-center gap-2 text-green-400 rgb-text">
                  <Coins className="w-5 h-5 rgb-pulse" />
                  <span className="font-bold">{playerCoins.toLocaleString()} Monedas</span>
                </div>
              </div>
            </div>

            {/* Grid de juegos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {games.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Estadísticas con RGB */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rgb-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2 rgb-pulse">🎯</div>
                  <h3 className="text-xl font-bold mb-2 rgb-text">Score Total</h3>
                  <p className="text-2xl font-bold text-yellow-400 rgb-text">{totalScore.toLocaleString()}</p>
                </CardContent>
              </Card>
              
              <Card className="rgb-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2 rgb-pulse">🏆</div>
                  <h3 className="text-xl font-bold mb-2 rgb-text">Juegos Completados</h3>
                  <p className="text-2xl font-bold text-green-400 rgb-text">{completedGames}</p>
                </CardContent>
              </Card>
              
              <Card className="rgb-card">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-2 rgb-pulse">⭐</div>
                  <h3 className="text-xl font-bold mb-2 rgb-text">Nivel Jugador</h3>
                  <p className="text-2xl font-bold text-purple-400 rgb-text">{playerLevel}</p>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <GameScreen />
        )}
      </div>
    </div>
  )
} 