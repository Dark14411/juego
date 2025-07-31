'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X } from 'lucide-react'
import { 
  useGameState, 
  useGameEventListeners, 
  createSafeKeyHandler, 
  cleanupGameControls, 
  resetGameControls,
  calculateGameRewards,
  GAME_CONSTANTS
} from '@/lib/game-utils'

interface Position {
  x: number
  y: number
}

interface SnakeGameState {
  snake: Position[]
  food: Position
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  isPlaying: boolean
  score: number
  highScore: number
  gameOver: boolean
  level: number
  speed: number
  gameStarted: boolean
}

interface SnakeGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const GRID_SIZE = GAME_CONSTANTS.GRID_SIZE
const INITIAL_SPEED = GAME_CONSTANTS.INITIAL_SPEED

export default function SnakeGame({ onGameEnd, onClose }: SnakeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 🎮 ESTADO DEL JUEGO CON LIMPIEZA AUTOMÁTICA
  const {
    gameState,
    updateGameState,
    endGame,
    resetGame,
    cleanupManager,
    isMounted
  } = useGameState<SnakeGameState>({
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    direction: 'RIGHT',
    isPlaying: false,
    score: 0,
    highScore: 0,
    gameOver: false,
    level: 1,
    speed: INITIAL_SPEED,
    gameStarted: false
  }, (score, rewards) => onGameEnd(score, rewards))

  // 🎮 GENERAR COMIDA ALEATORIA
  const generateFood = (snake: Position[]): Position => {
    let newFood: Position
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    return newFood
  }

  // 🎮 MANEJAR TECLAS CON LIMPIEZA SEGURA
  const handleKeyPress = createSafeKeyHandler((event: KeyboardEvent) => {
    if (!isMounted) return

    updateGameState(prev => {
      if (prev.gameOver) return prev

      // Auto-iniciar con primera tecla
      if (!prev.gameStarted) {
        return { ...prev, isPlaying: true, gameStarted: true }
      }

      // Pausar/reanudar con espacio
      if (event.key === ' ') {
        return { ...prev, isPlaying: !prev.isPlaying }
      }

      if (!prev.isPlaying) return prev

      let newDirection = prev.direction

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDirection = prev.direction !== 'DOWN' ? 'UP' : prev.direction
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          newDirection = prev.direction !== 'UP' ? 'DOWN' : prev.direction
          break
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDirection = prev.direction !== 'RIGHT' ? 'LEFT' : prev.direction
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDirection = prev.direction !== 'LEFT' ? 'RIGHT' : prev.direction
          break
        default:
          return prev
      }

      return { ...prev, direction: newDirection }
    })
  })

  // 🎮 MOVER SERPIENTE CON LIMPIEZA SEGURA
  const moveSnake = () => {
    if (!isMounted) return

    updateGameState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev

      const newSnake = [...prev.snake]
      const head = { ...newSnake[0] }

      // Mover cabeza
      switch (prev.direction) {
        case 'UP':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE
          break
        case 'DOWN':
          head.y = (head.y + 1) % GRID_SIZE
          break
        case 'LEFT':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE
          break
        case 'RIGHT':
          head.x = (head.x + 1) % GRID_SIZE
          break
      }

      // Verificar colisión con cuerpo
      if (newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y)) {
        // Limpiar controles antes de terminar
        cleanupGameControls(containerRef)
        
        const rewards = calculateGameRewards(prev.score, 'snake', false)
        endGame(prev.score, rewards)
        return { ...prev, gameOver: true, isPlaying: false }
      }

      newSnake.unshift(head)

      // Verificar si come comida
      if (head.x === prev.food.x && head.y === prev.food.y) {
        const newFood = generateFood(newSnake)
        const newScore = prev.score + 10
        const newLevel = Math.floor(newScore / 50) + 1
        const newSpeed = Math.max(GAME_CONSTANTS.MIN_SPEED, INITIAL_SPEED - (newLevel - 1) * GAME_CONSTANTS.SPEED_INCREMENT)

        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          score: newScore,
          level: newLevel,
          speed: newSpeed,
          highScore: Math.max(prev.highScore, newScore)
        }
      } else {
        newSnake.pop()
        return { ...prev, snake: newSnake }
      }
    })
  }

  // 🎮 CONTROLES DEL JUEGO CON LIMPIEZA
  const startGame = () => {
    resetGameControls(containerRef)
    
    updateGameState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      gameStarted: true,
      gameOver: false 
    }))
    
    toast.success('🐍 ¡Snake iniciado! Usa WASD o flechas para moverte')
  }

  const pauseGame = () => {
    updateGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGameState = () => {
    // Limpiar controles
    cleanupGameControls(containerRef)
    
    const newSnake = [{ x: 10, y: 10 }]
    const newFood = generateFood(newSnake)
    
    resetGame({
      snake: newSnake,
      food: newFood,
      direction: 'RIGHT',
      score: 0,
      level: 1,
      speed: INITIAL_SPEED,
      highScore: gameState.highScore
    })
    
    // Restaurar controles después de reset
    setTimeout(() => {
      resetGameControls(containerRef)
    }, 100)
    
    toast.info('🔄 Juego reiniciado')
  }

  // 🎮 EVENT LISTENERS SEGUROS
  useGameEventListeners([
    {
      element: document,
      event: 'keydown',
      handler: (event: Event) => handleKeyPress(event as KeyboardEvent),
      options: true
    },
    {
      element: window,
      event: 'keydown',
      handler: (event: Event) => handleKeyPress(event as KeyboardEvent),
      options: true
    }
  ], [isMounted])

  // 🎮 GAME LOOP CON LIMPIEZA AUTOMÁTICA
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && isMounted) {
      const timeout = cleanupManager.addTimeout(moveSnake, gameState.speed)
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, gameState.speed, isMounted])

  // 🎮 RENDERIZADO DEL CANVAS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isMounted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = (canvas.width / GRID_SIZE) * i
      ctx.beginPath()
      ctx.moveTo(pos, 0)
      ctx.lineTo(pos, canvas.height)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, pos)
      ctx.lineTo(canvas.width, pos)
      ctx.stroke()
    }

    // Dibujar serpiente
    ctx.fillStyle = '#4ade80'
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Cabeza
        ctx.fillStyle = '#22c55e'
      } else {
        // Cuerpo
        ctx.fillStyle = '#4ade80'
      }
      
      const x = (segment.x * canvas.width) / GRID_SIZE
      const y = (segment.y * canvas.height) / GRID_SIZE
      const size = canvas.width / GRID_SIZE
      
      ctx.fillRect(x, y, size, size)
      
      // Borde
      ctx.strokeStyle = '#16a34a'
      ctx.lineWidth = 1
      ctx.strokeRect(x, y, size, size)
    })

    // Dibujar comida
    ctx.fillStyle = '#ef4444'
    const foodX = (gameState.food.x * canvas.width) / GRID_SIZE
    const foodY = (gameState.food.y * canvas.height) / GRID_SIZE
    const foodSize = canvas.width / GRID_SIZE
    
    ctx.fillRect(foodX, foodY, foodSize, foodSize)
    
    // Borde de comida
    ctx.strokeStyle = '#dc2626'
    ctx.lineWidth = 2
    ctx.strokeRect(foodX, foodY, foodSize, foodSize)
  }, [gameState.snake, gameState.food, isMounted])

  // 🎮 MONTAJE DEL COMPONENTE
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.tabIndex = 0
      containerRef.current.style.outline = 'none'
      containerRef.current.focus()
      
      const handleClick = () => containerRef.current?.focus()
      containerRef.current.addEventListener('click', handleClick)
      
      return () => {
        if (containerRef.current) {
          containerRef.current.removeEventListener('click', handleClick)
        }
      }
    }
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/50 backdrop-blur-md border-white/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          🐍 Snake Épico
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 🎮 ESTADÍSTICAS */}
        <div className="flex justify-between items-center text-white">
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-white/70">Puntuación:</span>
              <div className="text-xl font-bold text-green-400">{gameState.score}</div>
            </div>
            <div>
              <span className="text-sm text-white/70">Nivel:</span>
              <div className="text-xl font-bold text-blue-400">{gameState.level}</div>
            </div>
            <div>
              <span className="text-sm text-white/70">Mejor:</span>
              <div className="text-xl font-bold text-yellow-400">{gameState.highScore}</div>
            </div>
          </div>
        </div>

        {/* 🎮 CANVAS DEL JUEGO */}
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden border-2 border-white/20"
          style={{ width: '400px', height: '400px' }}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={400}
            className="block"
          />
          
          {/* 🎮 OVERLAY DE PAUSA */}
          {!gameState.isPlaying && gameState.gameStarted && !gameState.gameOver && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-2xl font-bold mb-2">⏸️ Pausado</div>
                <div className="text-sm">Presiona ESPACIO para continuar</div>
              </div>
            </div>
          )}
          
          {/* 🎮 OVERLAY DE GAME OVER */}
          {gameState.gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-3xl font-bold mb-4">💀 Game Over</div>
                <div className="text-xl mb-2">Puntuación: {gameState.score}</div>
                <div className="text-sm text-white/70">Presiona REINICIAR para jugar de nuevo</div>
              </div>
            </div>
          )}
        </div>

        {/* 🎮 CONTROLES */}
        <div className="flex justify-center gap-2">
          <Button
            onClick={startGame}
            disabled={gameState.isPlaying && !gameState.gameOver}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </Button>
          
          <Button
            onClick={pauseGame}
            disabled={!gameState.gameStarted || gameState.gameOver}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Pause className="w-4 h-4 mr-2" />
            {gameState.isPlaying ? 'Pausar' : 'Reanudar'}
          </Button>
          
          <Button
            onClick={resetGameState}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reiniciar
          </Button>
        </div>

        {/* 🎮 INSTRUCCIONES */}
        <div className="text-center text-white/70 text-sm">
          <div>Usa WASD o flechas para mover la serpiente</div>
          <div>Come la comida roja para crecer y ganar puntos</div>
          <div>¡No te choques contigo mismo!</div>
        </div>
      </CardContent>
    </Card>
  )
}