'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X } from 'lucide-react'

interface Paddle {
  x: number
  y: number
  width: number
  height: number
  speed: number
  score: number
}

interface Ball {
  x: number
  y: number
  radius: number
  dx: number
  dy: number
  speed: number
}

interface GameState {
  playerPaddle: Paddle
  aiPaddle: Paddle
  ball: Ball
  isPlaying: boolean
  gameOver: boolean
  winner: 'player' | 'ai' | null
  level: number
  maxScore: number
  time: number
  gameStarted: boolean
}

interface PongGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PADDLE_WIDTH = 15
const PADDLE_HEIGHT = 80
const BALL_RADIUS = 8
const INITIAL_BALL_SPEED = 4

export default function PongGame({ onGameEnd, onClose }: PongGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    playerPaddle: {
      x: 50,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 8,
      score: 0
    },
    aiPaddle: {
      x: CANVAS_WIDTH - 50 - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: 6,
      score: 0
    },
    ball: {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT / 2,
      radius: BALL_RADIUS,
      dx: INITIAL_BALL_SPEED,
      dy: INITIAL_BALL_SPEED,
      speed: INITIAL_BALL_SPEED
    },
    isPlaying: false,
    gameOver: false,
    winner: null,
    level: 1,
    maxScore: 5,
    time: 0,
    gameStarted: false
  })

  const [isMounted, setIsMounted] = useState(false)
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const timerRef = useRef<NodeJS.Timeout>()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const keysPressed = useRef<Set<string>>(new Set())

  // 🎮 MANEJAR TECLAS - SOLUCIÓN PARA PRODUCCIÓN
  const handleKeyDown = (event: KeyboardEvent) => {
    const gameKeys = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', ' ', 'Escape']
    if (!gameKeys.includes(event.key)) return

    if (gameState.gameOver) return
    
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
    const gameKeys = ['ArrowUp', 'ArrowDown', 'w', 'W', 's', 'S', ' ', 'Escape']
    if (!gameKeys.includes(event.key)) return

    event.preventDefault()
    event.stopPropagation()
    keysPressed.current.delete(event.key)
  }

  // 🎮 LÓGICA PRINCIPAL DEL JUEGO
  const updateGame = () => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev

      const newState = { ...prev }

      // Mover paddle del jugador
      if (keysPressed.current.has('ArrowUp') || keysPressed.current.has('w') || keysPressed.current.has('W')) {
        newState.playerPaddle = {
          ...newState.playerPaddle,
          y: Math.max(0, newState.playerPaddle.y - newState.playerPaddle.speed)
        }
      }
      if (keysPressed.current.has('ArrowDown') || keysPressed.current.has('s') || keysPressed.current.has('S')) {
        newState.playerPaddle = {
          ...newState.playerPaddle,
          y: Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.playerPaddle.y + newState.playerPaddle.speed)
        }
      }

      // IA del paddle enemigo (mejorada)
      const ballCenter = newState.ball.y
      const paddleCenter = newState.aiPaddle.y + newState.aiPaddle.height / 2
      const difficulty = 0.7 + (newState.level * 0.1) // IA más difícil por nivel
      
      if (ballCenter < paddleCenter - 10) {
        newState.aiPaddle.y = Math.max(0, newState.aiPaddle.y - newState.aiPaddle.speed * difficulty)
      } else if (ballCenter > paddleCenter + 10) {
        newState.aiPaddle.y = Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newState.aiPaddle.y + newState.aiPaddle.speed * difficulty)
      }

      // Mover pelota
      newState.ball.x += newState.ball.dx
      newState.ball.y += newState.ball.dy

      // Colisión con bordes superior e inferior
      if (newState.ball.y - newState.ball.radius <= 0 || newState.ball.y + newState.ball.radius >= CANVAS_HEIGHT) {
        newState.ball.dy = -newState.ball.dy
      }

      // Colisión con paddle del jugador
      if (
        newState.ball.x - newState.ball.radius <= newState.playerPaddle.x + newState.playerPaddle.width &&
        newState.ball.x - newState.ball.radius >= newState.playerPaddle.x &&
        newState.ball.y >= newState.playerPaddle.y &&
        newState.ball.y <= newState.playerPaddle.y + newState.playerPaddle.height
      ) {
        newState.ball.dx = Math.abs(newState.ball.dx) // Asegurar que vaya hacia la derecha
        
        // Agregar efecto de ángulo basado en dónde golpea el paddle
        const hitPos = (newState.ball.y - newState.playerPaddle.y) / newState.playerPaddle.height
        newState.ball.dy = (hitPos - 0.5) * 8 // Efecto de ángulo
      }

      // Colisión con paddle de la IA
      if (
        newState.ball.x + newState.ball.radius >= newState.aiPaddle.x &&
        newState.ball.x + newState.ball.radius <= newState.aiPaddle.x + newState.aiPaddle.width &&
        newState.ball.y >= newState.aiPaddle.y &&
        newState.ball.y <= newState.aiPaddle.y + newState.aiPaddle.height
      ) {
        newState.ball.dx = -Math.abs(newState.ball.dx) // Asegurar que vaya hacia la izquierda
        
        // Agregar efecto de ángulo
        const hitPos = (newState.ball.y - newState.aiPaddle.y) / newState.aiPaddle.height
        newState.ball.dy = (hitPos - 0.5) * 8
      }

      // Verificar puntuación
      if (newState.ball.x < 0) {
        // Punto para la IA
        newState.aiPaddle.score += 1
        resetBall(newState, 'ai')
      } else if (newState.ball.x > CANVAS_WIDTH) {
        // Punto para el jugador
        newState.playerPaddle.score += 1
        resetBall(newState, 'player')
      }

      // Verificar victoria
      if (newState.playerPaddle.score >= newState.maxScore) {
        newState.gameOver = true
        newState.winner = 'player'
        newState.isPlaying = false
      } else if (newState.aiPaddle.score >= newState.maxScore) {
        newState.gameOver = true
        newState.winner = 'ai'
        newState.isPlaying = false
      }

      return newState
    })
  }

  // 🎮 RESETEAR PELOTA
  const resetBall = (state: GameState, lastScorer: 'player' | 'ai') => {
    state.ball.x = CANVAS_WIDTH / 2
    state.ball.y = CANVAS_HEIGHT / 2
    
    // La pelota va hacia el lado opuesto del que anotó
    state.ball.dx = lastScorer === 'player' ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED
    state.ball.dy = (Math.random() - 0.5) * 6 // Dirección Y aleatoria
  }

  // 🎮 CONTROLES DEL JUEGO
  const startGame = () => {
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      gameStarted: true,
      gameOver: false 
    }))
    
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    toast.success('🏓 ¡Pong iniciado! Usa flechas o WASD para moverte')
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      playerPaddle: { ...prev.playerPaddle, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
      aiPaddle: { ...prev.aiPaddle, y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2, score: 0 },
      ball: {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        dx: INITIAL_BALL_SPEED,
        dy: INITIAL_BALL_SPEED,
        speed: INITIAL_BALL_SPEED
      },
      isPlaying: false,
      gameOver: false,
      winner: null,
      time: 0,
      gameStarted: false
    }))
    
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    toast.info('🔄 Juego reiniciado')
  }

  const endGame = () => {
    const isWinner = gameState.winner === 'player'
    const baseScore = gameState.playerPaddle.score * 100
    const timeBonus = Math.max(0, 300 - gameState.time)
    const winBonus = isWinner ? 500 : 0
    const finalScore = baseScore + timeBonus + winBonus

    const rewards = {
      coins: Math.floor(finalScore / 20) + (isWinner ? 20 : 5),
      experience: finalScore + (isWinner ? 50 : 10),
      happiness: Math.min(50, Math.floor(finalScore / 10) + (isWinner ? 20 : 5))
    }
    
    onGameEnd(finalScore, rewards)
    toast.success(`🎉 ¡Pong ${isWinner ? 'ganado' : 'perdido'}! Puntuación: ${finalScore}`)
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
    if (gameState.isPlaying && !gameState.gameOver && isMounted) {
      gameLoopRef.current = setTimeout(updateGame, 16) // ~60 FPS
    }

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, isMounted, gameState.playerPaddle.y, gameState.ball])

  // 🎮 TIMER
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && isMounted) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, time: prev.time + 1 }))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState.isPlaying, gameState.gameOver, isMounted])

  // 🎮 DETECTAR GAME OVER
  useEffect(() => {
    if (gameState.gameOver && gameState.gameStarted) {
      setTimeout(() => {
        endGame()
      }, 2000)
    }
  }, [gameState.gameOver, gameState.gameStarted])

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
    gradient.addColorStop(0, '#1a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f0f23')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Línea central
    ctx.setLineDash([10, 10])
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()
    ctx.setLineDash([])

    // Paddle del jugador
    ctx.fillStyle = '#00ff88'
    ctx.fillRect(
      gameState.playerPaddle.x,
      gameState.playerPaddle.y,
      gameState.playerPaddle.width,
      gameState.playerPaddle.height
    )

    // Paddle de la IA
    ctx.fillStyle = '#ff4444'
    ctx.fillRect(
      gameState.aiPaddle.x,
      gameState.aiPaddle.y,
      gameState.aiPaddle.width,
      gameState.aiPaddle.height
    )

    // Pelota
    const ballGradient = ctx.createRadialGradient(
      gameState.ball.x, gameState.ball.y, 0,
      gameState.ball.x, gameState.ball.y, gameState.ball.radius
    )
    ballGradient.addColorStop(0, '#ffffff')
    ballGradient.addColorStop(0.7, '#cccccc')
    ballGradient.addColorStop(1, '#888888')
    
    ctx.fillStyle = ballGradient
    ctx.beginPath()
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2)
    ctx.fill()

    // Marcador
    ctx.fillStyle = '#ffffff'
    ctx.font = '36px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(
      `${gameState.playerPaddle.score} - ${gameState.aiPaddle.score}`,
      canvas.width / 2,
      50
    )

  }, [gameState, isMounted])

  // No renderizar hasta estar montado
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 text-white border-red-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-2xl">🏓 Cargando Pong...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-red-900 via-orange-800 to-yellow-900 text-white border-red-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="text-4xl">🏓</div>
              Pong Classic
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
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold mb-2">📋 Instrucciones</h3>
              <p className="text-sm mb-2">
                🎯 <strong>Objetivo:</strong> Gana {gameState.maxScore} puntos antes que la IA
              </p>
              <p className="text-sm mb-2">
                🎮 <strong>Controles:</strong> Flechas ↑↓ o W/S para mover tu paddle
              </p>
              <p className="text-sm">
                🏓 <strong>Estrategia:</strong> Devuelve la pelota y haz que la IA falle
              </p>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{gameState.playerPaddle.score}</div>
              <div className="text-sm opacity-80">Tu Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{gameState.aiPaddle.score}</div>
              <div className="text-sm opacity-80">IA Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{formatTime(gameState.time)}</div>
              <div className="text-sm opacity-80">Tiempo</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{gameState.maxScore}</div>
              <div className="text-sm opacity-80">Meta</div>
            </div>
          </div>

          {/* CANVAS DEL JUEGO */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-2 border-red-500 rounded-lg bg-black"
                style={{ outline: 'none' }}
              />
              
              {/* OVERLAY GAME OVER */}
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl mb-4">
                      {gameState.winner === 'player' ? '🏆' : '💀'}
                    </div>
                    <div className="text-2xl font-bold mb-2">
                      {gameState.winner === 'player' ? '¡Ganaste!' : '¡Perdiste!'}
                    </div>
                    <div className="text-lg mb-4">
                      {gameState.playerPaddle.score} - {gameState.aiPaddle.score}
                    </div>
                    <Button onClick={resetGame} className="bg-red-600 hover:bg-red-700">
                      🔄 Jugar de nuevo
                    </Button>
                  </div>
                </div>
              )}
              
              {/* OVERLAY PAUSA */}
              {!gameState.isPlaying && !gameState.gameOver && gameState.gameStarted && (
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
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                🏓 ¡Comenzar Pong!
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
              <p>🎮 Controles: <span className="font-bold">↑↓</span> o <span className="font-bold">W/S</span> para mover | <span className="font-bold">ESPACIO</span> = Pausar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}