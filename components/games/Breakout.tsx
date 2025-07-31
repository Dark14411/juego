'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

interface Position {
  x: number
  y: number
}

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
  speed: number
}

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
}

interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  points: number
  destroyed: boolean
}

interface GameState {
  ball: Ball
  paddle: Paddle
  bricks: Brick[]
  score: number
  lives: number
  level: number
  isPlaying: boolean
  gameOver: boolean
  gameWon: boolean
  gameStarted: boolean
}

interface BreakoutGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const BALL_RADIUS = 8
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BRICK_WIDTH = 75
const BRICK_HEIGHT = 20
const BRICK_ROWS = 8
const BRICK_COLS = 10

// Colores de los ladrillos por fila (de arriba hacia abajo)
const BRICK_COLORS = [
  { color: '#ff0000', points: 70 }, // Rojo
  { color: '#ff4500', points: 60 }, // Naranja-Rojo
  { color: '#ffa500', points: 50 }, // Naranja
  { color: '#ffff00', points: 40 }, // Amarillo
  { color: '#9aff9a', points: 30 }, // Verde claro
  { color: '#00ff00', points: 20 }, // Verde
  { color: '#00ffff', points: 10 }, // Cian
  { color: '#0000ff', points: 10 }  // Azul
]

export default function BreakoutGame({ onGameEnd, onClose }: BreakoutGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 100,
      dx: 4,
      dy: -4,
      radius: BALL_RADIUS,
      speed: 4
    },
    paddle: {
      x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
      y: CANVAS_HEIGHT - 50,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 8
    },
    bricks: [],
    score: 0,
    lives: 3,
    level: 1,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    gameStarted: false
  })

  const [isMounted, setIsMounted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const keysPressed = useRef<Set<string>>(new Set())

  // 🎮 CREAR LADRILLOS
  const createBricks = (): Brick[] => {
    const bricks: Brick[] = []
    const startX = (CANVAS_WIDTH - (BRICK_COLS * BRICK_WIDTH)) / 2
    const startY = 80

    for (let row = 0; row < BRICK_ROWS; row++) {
      const colorData = BRICK_COLORS[row] || BRICK_COLORS[BRICK_COLORS.length - 1]
      
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: startX + col * BRICK_WIDTH,
          y: startY + row * BRICK_HEIGHT,
          width: BRICK_WIDTH - 2,
          height: BRICK_HEIGHT - 2,
          color: colorData.color,
          points: colorData.points,
          destroyed: false
        })
      }
    }

    return bricks
  }

  // 🎮 MANEJAR TECLAS - SOLUCIÓN PARA PRODUCCIÓN
  const handleKeyDown = (event: KeyboardEvent) => {
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D', ' ', 'Escape']
    if (!gameKeys.includes(event.key)) return

    event.preventDefault()
    event.stopPropagation()
    keysPressed.current.add(event.key)

    // Auto-iniciar con primera tecla
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, isPlaying: true, gameStarted: true }))
    }

    // Pausar con espacio
    if (event.key === ' ') {
      setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
    }
  }

  const handleKeyUp = (event: KeyboardEvent) => {
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'a', 'A', 'd', 'D', ' ', 'Escape']
    if (!gameKeys.includes(event.key)) return

    event.preventDefault()
    event.stopPropagation()
    keysPressed.current.delete(event.key)
  }

  // 🎮 DETECTAR COLISIONES
  const detectCollision = (rect1: any, rect2: any): boolean => {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y
  }

  // 🎮 LÓGICA PRINCIPAL DEL JUEGO
  const updateGame = () => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.gameOver || prev.gameWon) return prev

      const newState = { ...prev }

      // Mover paddle
      if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('a') || keysPressed.current.has('A')) {
        newState.paddle.x = Math.max(0, newState.paddle.x - newState.paddle.speed)
      }
      if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('d') || keysPressed.current.has('D')) {
        newState.paddle.x = Math.min(CANVAS_WIDTH - newState.paddle.width, newState.paddle.x + newState.paddle.speed)
      }

      // Mover pelota
      newState.ball.x += newState.ball.dx
      newState.ball.y += newState.ball.dy

      // Colisión con paredes laterales
      if (newState.ball.x - newState.ball.radius <= 0 || newState.ball.x + newState.ball.radius >= CANVAS_WIDTH) {
        newState.ball.dx = -newState.ball.dx
      }

      // Colisión con pared superior
      if (newState.ball.y - newState.ball.radius <= 0) {
        newState.ball.dy = -newState.ball.dy
      }

      // Colisión con paddle
      if (
        newState.ball.y + newState.ball.radius >= newState.paddle.y &&
        newState.ball.y - newState.ball.radius <= newState.paddle.y + newState.paddle.height &&
        newState.ball.x >= newState.paddle.x &&
        newState.ball.x <= newState.paddle.x + newState.paddle.width
      ) {
        // Calcular ángulo de rebote basado en dónde golpea el paddle
        const hitPos = (newState.ball.x - newState.paddle.x) / newState.paddle.width
        const angle = (hitPos - 0.5) * Math.PI / 3 // Máximo 60 grados

        newState.ball.dx = Math.sin(angle) * newState.ball.speed
        newState.ball.dy = -Math.abs(Math.cos(angle) * newState.ball.speed)
      }

      // Colisión con ladrillos
      newState.bricks = newState.bricks.map(brick => {
        if (brick.destroyed) return brick

        if (detectCollision(
          { x: newState.ball.x - newState.ball.radius, y: newState.ball.y - newState.ball.radius, width: newState.ball.radius * 2, height: newState.ball.radius * 2 },
          brick
        )) {
          // Determinar desde qué lado golpeó la pelota
          const ballCenterX = newState.ball.x
          const ballCenterY = newState.ball.y
          const brickCenterX = brick.x + brick.width / 2
          const brickCenterY = brick.y + brick.height / 2

          const dx = ballCenterX - brickCenterX
          const dy = ballCenterY - brickCenterY

          if (Math.abs(dx) > Math.abs(dy)) {
            // Colisión horizontal
            newState.ball.dx = -newState.ball.dx
          } else {
            // Colisión vertical
            newState.ball.dy = -newState.ball.dy
          }

          newState.score += brick.points
          return { ...brick, destroyed: true }
        }

        return brick
      })

      // Verificar si ganó (todos los ladrillos destruidos)
      const remainingBricks = newState.bricks.filter(brick => !brick.destroyed)
      if (remainingBricks.length === 0) {
        newState.gameWon = true
        newState.isPlaying = false
      }

      // Verificar si perdió una vida
      if (newState.ball.y > CANVAS_HEIGHT) {
        newState.lives -= 1
        
        if (newState.lives <= 0) {
          newState.gameOver = true
          newState.isPlaying = false
        } else {
          // Resetear pelota
          newState.ball.x = CANVAS_WIDTH / 2
          newState.ball.y = CANVAS_HEIGHT - 100
          newState.ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1)
          newState.ball.dy = -4
        }
      }

      return newState
    })
  }

  // 🎮 CONTROLES DEL JUEGO
  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 100,
        dx: 4 * (Math.random() > 0.5 ? 1 : -1),
        dy: -4,
        radius: BALL_RADIUS,
        speed: 4
      },
      paddle: {
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: 8
      },
      bricks: createBricks(),
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: true,
      gameOver: false,
      gameWon: false,
      gameStarted: true
    }))

    if (containerRef.current) {
      containerRef.current.focus()
    }

    toast.success('🎯 ¡Breakout iniciado! Usa flechas o A/D para mover')
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT - 100,
        dx: 4,
        dy: -4,
        radius: BALL_RADIUS,
        speed: 4
      },
      paddle: {
        x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
        y: CANVAS_HEIGHT - 50,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: 8
      },
      bricks: [],
      score: 0,
      lives: 3,
      level: 1,
      isPlaying: false,
      gameOver: false,
      gameWon: false,
      gameStarted: false
    }))

    if (containerRef.current) {
      containerRef.current.focus()
    }

    toast.info('🔄 Juego reiniciado')
  }

  const endGame = () => {
    const isWinner = gameState.gameWon
    const bonusPoints = isWinner ? gameState.lives * 100 : 0
    const finalScore = gameState.score + bonusPoints

    const rewards = {
      coins: Math.floor(finalScore / 25) + (isWinner ? 30 : 10),
      experience: finalScore + (isWinner ? 60 : 15),
      happiness: Math.min(70, Math.floor(finalScore / 15) + (isWinner ? 30 : 10))
    }

    onGameEnd(finalScore, rewards)
    toast.success(`🎉 ¡Breakout ${isWinner ? 'completado' : 'terminado'}! Puntuación: ${finalScore}`)
  }

  // 🎮 MONTAJE DEL COMPONENTE
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // 🎮 EVENT LISTENERS PARA PRODUCCIÓN
  useEffect(() => {
    if (!isMounted) return

    const keyDownHandler = (e: KeyboardEvent) => handleKeyDown(e)
    const keyUpHandler = (e: KeyboardEvent) => handleKeyUp(e)

    document.addEventListener('keydown', keyDownHandler, true)
    document.addEventListener('keyup', keyUpHandler, true)
    window.addEventListener('keydown', keyDownHandler, true)
    window.addEventListener('keyup', keyUpHandler, true)

    const container = containerRef.current
    if (container) {
      container.tabIndex = 0
      container.style.outline = 'none'
      container.focus()

      container.addEventListener('keydown', keyDownHandler)
      container.addEventListener('keyup', keyUpHandler)

      const handleClick = () => container.focus()
      container.addEventListener('click', handleClick)

      return () => {
        document.removeEventListener('keydown', keyDownHandler, true)
        document.removeEventListener('keyup', keyUpHandler, true)
        window.removeEventListener('keydown', keyDownHandler, true)
        window.removeEventListener('keyup', keyUpHandler, true)
        container.removeEventListener('keydown', keyDownHandler)
        container.removeEventListener('keyup', keyUpHandler)
        container.removeEventListener('click', handleClick)
      }
    }

    return () => {
      document.removeEventListener('keydown', keyDownHandler, true)
      document.removeEventListener('keyup', keyUpHandler, true)
      window.removeEventListener('keydown', keyDownHandler, true)
      window.removeEventListener('keyup', keyUpHandler, true)
    }
  }, [isMounted])

  // 🎮 GAME LOOP
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && !gameState.gameWon && isMounted) {
      gameLoopRef.current = setTimeout(updateGame, 16) // ~60 FPS
    }

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, gameState.gameWon, isMounted, gameState.ball, gameState.paddle])

  // 🎮 DETECTAR GAME OVER/WIN
  useEffect(() => {
    if ((gameState.gameOver || gameState.gameWon) && gameState.gameStarted) {
      setTimeout(() => {
        endGame()
      }, 2000)
    }
  }, [gameState.gameOver, gameState.gameWon, gameState.gameStarted])

  // 🎮 RENDERIZADO DEL CANVAS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isMounted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo del juego
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#000033')
    gradient.addColorStop(0.5, '#000066')
    gradient.addColorStop(1, '#000099')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Dibujar ladrillos
    gameState.bricks.forEach(brick => {
      if (!brick.destroyed) {
        // Sombra del ladrillo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width, brick.height)
        
        // Ladrillo principal
        ctx.fillStyle = brick.color
        ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
        
        // Brillo del ladrillo
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height - 4)
        
        // Borde del ladrillo
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
        ctx.lineWidth = 1
        ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
      }
    })

    // Dibujar paddle
    // Sombra del paddle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(gameState.paddle.x + 2, gameState.paddle.y + 2, gameState.paddle.width, gameState.paddle.height)
    
    // Paddle principal con gradiente
    const paddleGradient = ctx.createLinearGradient(
      gameState.paddle.x, gameState.paddle.y,
      gameState.paddle.x, gameState.paddle.y + gameState.paddle.height
    )
    paddleGradient.addColorStop(0, '#ffffff')
    paddleGradient.addColorStop(0.5, '#cccccc')
    paddleGradient.addColorStop(1, '#888888')
    
    ctx.fillStyle = paddleGradient
    ctx.fillRect(gameState.paddle.x, gameState.paddle.y, gameState.paddle.width, gameState.paddle.height)

    // Dibujar pelota
    // Sombra de la pelota
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.beginPath()
    ctx.arc(gameState.ball.x + 2, gameState.ball.y + 2, gameState.ball.radius, 0, Math.PI * 2)
    ctx.fill()
    
    // Pelota principal con gradiente
    const ballGradient = ctx.createRadialGradient(
      gameState.ball.x - 2, gameState.ball.y - 2, 0,
      gameState.ball.x, gameState.ball.y, gameState.ball.radius
    )
    ballGradient.addColorStop(0, '#ffffff')
    ballGradient.addColorStop(0.7, '#ffff00')
    ballGradient.addColorStop(1, '#ff8800')
    
    ctx.fillStyle = ballGradient
    ctx.beginPath()
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2)
    ctx.fill()

  }, [gameState, isMounted])

  // No renderizar hasta estar montado
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 text-white border-orange-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-2xl">🎯 Cargando Breakout...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const remainingBricks = gameState.bricks.filter(brick => !brick.destroyed).length
  const totalBricks = gameState.bricks.length

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-orange-900 via-red-800 to-pink-900 text-white border-orange-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="text-4xl">🎯</div>
              Breakout
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* INSTRUCCIONES */}
          {!gameState.gameStarted && (
            <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold mb-2">📋 Instrucciones</h3>
              <p className="text-sm mb-2">
                🎯 <strong>Objetivo:</strong> Destruye todos los ladrillos rebotando la pelota con tu paleta
              </p>
              <p className="text-sm mb-2">
                🎮 <strong>Controles:</strong> Flechas ←→ o A/D para mover la paleta
              </p>
              <p className="text-sm">
                ⚡ <strong>Estrategia:</strong> Controla el ángulo de rebote golpeando con diferentes partes de la paleta
              </p>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{gameState.score}</div>
              <div className="text-sm opacity-80">Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{gameState.lives}</div>
              <div className="text-sm opacity-80">Vidas</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{gameState.level}</div>
              <div className="text-sm opacity-80">Nivel</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{remainingBricks}/{totalBricks}</div>
              <div className="text-sm opacity-80">Ladrillos</div>
            </div>
          </div>

          {/* CANVAS DEL JUEGO */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-2 border-orange-500 rounded-lg bg-black"
                style={{ outline: 'none' }}
              />
              
              {/* OVERLAY GAME OVER */}
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💀</div>
                    <div className="text-2xl font-bold mb-2">¡Game Over!</div>
                    <div className="text-lg mb-4">Puntuación: {gameState.score}</div>
                    <Button onClick={resetGame} className="bg-orange-600 hover:bg-orange-700">
                      🔄 Jugar de nuevo
                    </Button>
                  </div>
                </div>
              )}
              
              {/* OVERLAY VICTORIA */}
              {gameState.gameWon && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <div className="text-2xl font-bold mb-2">¡Victoria!</div>
                    <div className="text-lg mb-4">Puntuación: {gameState.score + gameState.lives * 100}</div>
                    <Button onClick={resetGame} className="bg-green-600 hover:bg-green-700">
                      🔄 Jugar de nuevo
                    </Button>
                  </div>
                </div>
              )}
              
              {/* OVERLAY PAUSA */}
              {!gameState.isPlaying && !gameState.gameOver && !gameState.gameWon && gameState.gameStarted && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">⏸️</div>
                    <div className="text-xl font-bold">Juego Pausado</div>
                    <div className="text-sm">Presiona ESPACIO para continuar</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex flex-wrap justify-center gap-4">
            {!gameState.gameStarted ? (
              <Button
                onClick={startGame}
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                🎯 ¡Comenzar Breakout!
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={pauseGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4"
                >
                  {gameState.isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {gameState.isPlaying ? 'Pausar' : 'Continuar'}
                </Button>
                
                <Button
                  onClick={resetGame}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Reiniciar
                </Button>
              </div>
            )}
          </div>

          {/* AYUDA DE CONTROLES */}
          {gameState.gameStarted && (
            <div className="text-center text-sm opacity-70">
              <p>🎮 Controles: <span className="font-bold">←→</span> o <span className="font-bold">A/D</span> para mover | <span className="font-bold">ESPACIO</span> = Pausar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}