'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X, Gamepad2 } from 'lucide-react'

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

interface Controls {
  up: boolean
  down: boolean
  touchY: number | null
  mouseY: number | null
}

interface PongProGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 400
const PADDLE_WIDTH = 15
const PADDLE_HEIGHT = 80
const BALL_RADIUS = 8
const PADDLE_SPEED = 6
const INITIAL_BALL_SPEED = 4

export default function PongProGame({ onGameEnd, onClose }: PongProGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>()
  const gameStateRef = useRef<GameState>()
  const controlsRef = useRef<Controls>({
    up: false,
    down: false,
    touchY: null,
    mouseY: null
  })

  const [gameState, setGameState] = useState<GameState>({
    playerPaddle: {
      x: 20,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
      score: 0
    },
    aiPaddle: {
      x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
      y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      speed: PADDLE_SPEED,
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

  // 🎮 CONTROLES MEJORADOS PARA PRODUCCIÓN
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        e.preventDefault()
        controlsRef.current.up = true
        break
      case 'arrowdown':
      case 's':
        e.preventDefault()
        controlsRef.current.down = true
        break
      case ' ':
        e.preventDefault()
        toggleGame()
        break
      case 'escape':
        e.preventDefault()
        pauseGame()
        break
    }
  }, [])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    switch (e.key.toLowerCase()) {
      case 'arrowup':
      case 'w':
        controlsRef.current.up = false
        break
      case 'arrowdown':
      case 's':
        controlsRef.current.down = false
        break
    }
  }, [])

  // 🎮 CONTROLES TÁCTILES OPTIMIZADOS
  const handleTouchStart = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleY = CANVAS_HEIGHT / rect.height
      controlsRef.current.touchY = (touch.clientY - rect.top) * scaleY
    }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleY = CANVAS_HEIGHT / rect.height
      controlsRef.current.touchY = (touch.clientY - rect.top) * scaleY
    }
  }, [])

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    e.preventDefault()
    controlsRef.current.touchY = null
  }, [])

  // 🎮 CONTROLES DE RATÓN PRECISOS
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (canvas) {
      const rect = canvas.getBoundingClientRect()
      const scaleY = CANVAS_HEIGHT / rect.height
      controlsRef.current.mouseY = (e.clientY - rect.top) * scaleY
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    controlsRef.current.mouseY = null
  }, [])

  // 🎮 CONFIGURAR EVENTOS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Eventos de teclado
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Eventos táctiles
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Eventos de ratón
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleKeyDown, handleKeyUp, handleTouchStart, handleTouchMove, handleTouchEnd, handleMouseMove, handleMouseLeave])

  // 🎮 ACTUALIZAR POSICIÓN DE PADDLE
  const updatePlayerPaddle = useCallback((paddle: Paddle): Paddle => {
    const controls = controlsRef.current
    let newY = paddle.y

    // Control por teclado
    if (controls.up) {
      newY -= paddle.speed
    }
    if (controls.down) {
      newY += paddle.speed
    }

    // Control táctil
    if (controls.touchY !== null) {
      const targetY = controls.touchY - paddle.height / 2
      const diff = targetY - newY
      newY += Math.sign(diff) * Math.min(Math.abs(diff), paddle.speed)
    }

    // Control de ratón (más suave)
    if (controls.mouseY !== null && !controls.touchY) {
      const targetY = controls.mouseY - paddle.height / 2
      const diff = targetY - newY
      newY += Math.sign(diff) * Math.min(Math.abs(diff), paddle.speed * 0.8)
    }

    // Limitar a los bordes
    newY = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, newY))

    return { ...paddle, y: newY }
  }, [])

  // 🎮 IA MEJORADA
  const updateAIPaddle = useCallback((paddle: Paddle, ball: Ball): Paddle => {
    const paddleCenter = paddle.y + paddle.height / 2
    const ballY = ball.y
    const diff = ballY - paddleCenter
    
    // IA más inteligente basada en el nivel
    const aiSpeed = paddle.speed * (0.6 + gameState.level * 0.1)
    const maxMove = Math.min(Math.abs(diff), aiSpeed)
    
    let newY = paddle.y
    if (Math.abs(diff) > 5) { // Zona muerta para evitar temblores
      newY += Math.sign(diff) * maxMove
    }

    newY = Math.max(0, Math.min(CANVAS_HEIGHT - paddle.height, newY))
    return { ...paddle, y: newY }
  }, [gameState.level])

  // 🎮 FÍSICA DE LA PELOTA
  const updateBall = useCallback((ball: Ball, playerPaddle: Paddle, aiPaddle: Paddle): Ball => {
    let newBall = { ...ball }
    newBall.x += newBall.dx
    newBall.y += newBall.dy

    // Rebote en paredes superior e inferior
    if (newBall.y <= newBall.radius || newBall.y >= CANVAS_HEIGHT - newBall.radius) {
      newBall.dy = -newBall.dy
      newBall.y = Math.max(newBall.radius, Math.min(CANVAS_HEIGHT - newBall.radius, newBall.y))
    }

    // Colisión con paddle del jugador
    if (newBall.x - newBall.radius <= playerPaddle.x + playerPaddle.width &&
        newBall.y >= playerPaddle.y &&
        newBall.y <= playerPaddle.y + playerPaddle.height &&
        newBall.dx < 0) {
      
      const hitPos = (newBall.y - playerPaddle.y) / playerPaddle.height
      const angle = (hitPos - 0.5) * Math.PI / 3 // Máximo 60 grados
      
      newBall.dx = Math.abs(newBall.dx)
      newBall.dy = Math.sin(angle) * newBall.speed
      newBall.x = playerPaddle.x + playerPaddle.width + newBall.radius
    }

    // Colisión con paddle de la IA
    if (newBall.x + newBall.radius >= aiPaddle.x &&
        newBall.y >= aiPaddle.y &&
        newBall.y <= aiPaddle.y + aiPaddle.height &&
        newBall.dx > 0) {
      
      const hitPos = (newBall.y - aiPaddle.y) / aiPaddle.height
      const angle = (hitPos - 0.5) * Math.PI / 3
      
      newBall.dx = -Math.abs(newBall.dx)
      newBall.dy = Math.sin(angle) * newBall.speed
      newBall.x = aiPaddle.x - newBall.radius
    }

    return newBall
  }, [])

  // 🎮 RENDERIZADO OPTIMIZADO
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return

    const state = gameStateRef.current
    if (!state) return

    // Limpiar canvas
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Línea central
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 2
    ctx.setLineDash([10, 10])
    ctx.beginPath()
    ctx.moveTo(CANVAS_WIDTH / 2, 0)
    ctx.lineTo(CANVAS_WIDTH / 2, CANVAS_HEIGHT)
    ctx.stroke()
    ctx.setLineDash([])

    // Paddle del jugador
    ctx.fillStyle = '#3b82f6'
    ctx.fillRect(state.playerPaddle.x, state.playerPaddle.y, state.playerPaddle.width, state.playerPaddle.height)

    // Paddle de la IA
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(state.aiPaddle.x, state.aiPaddle.y, state.aiPaddle.width, state.aiPaddle.height)

    // Pelota con efecto de glow
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2)
    ctx.fillStyle = '#fbbf24'
    ctx.fill()
    
    // Efecto de glow para la pelota
    ctx.beginPath()
    ctx.arc(state.ball.x, state.ball.y, state.ball.radius + 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(251, 191, 36, 0.3)'
    ctx.fill()

    // Marcadores
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 36px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(state.playerPaddle.score.toString(), CANVAS_WIDTH / 4, 50)
    ctx.fillText(state.aiPaddle.score.toString(), (3 * CANVAS_WIDTH) / 4, 50)

    // Indicadores de control
    if (!state.gameStarted) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.font = '16px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('WASD, Flechas, Ratón o Táctil para jugar', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 30)
    }
  }, [])

  // 🎮 LOOP DEL JUEGO
  const gameLoop = useCallback(() => {
    const state = gameStateRef.current
    if (!state || state.gameOver || !state.isPlaying) return

    // Actualizar elementos
    const newPlayerPaddle = updatePlayerPaddle(state.playerPaddle)
    const newAIPaddle = updateAIPaddle(state.aiPaddle, state.ball)
    const newBall = updateBall(state.ball, newPlayerPaddle, newAIPaddle)

    let newState = {
      ...state,
      playerPaddle: newPlayerPaddle,
      aiPaddle: newAIPaddle,
      ball: newBall,
      time: state.time + 1/60
    }

    // Verificar puntos
    if (newBall.x < 0) {
      newState.aiPaddle.score++
      newState.ball = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        dx: -INITIAL_BALL_SPEED,
        dy: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
        speed: INITIAL_BALL_SPEED
      }
    } else if (newBall.x > CANVAS_WIDTH) {
      newState.playerPaddle.score++
      newState.ball = {
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: BALL_RADIUS,
        dx: INITIAL_BALL_SPEED,
        dy: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
        speed: INITIAL_BALL_SPEED
      }
    }

    // Verificar fin del juego
    if (newState.playerPaddle.score >= newState.maxScore || newState.aiPaddle.score >= newState.maxScore) {
      newState.gameOver = true
      newState.isPlaying = false
      newState.winner = newState.playerPaddle.score >= newState.maxScore ? 'player' : 'ai'
      
      const finalScore = newState.playerPaddle.score * 100
      const rewards = {
        coins: newState.playerPaddle.score * 10,
        experience: Math.floor(finalScore / 10),
        happiness: newState.winner === 'player' ? 20 : 5
      }
      
      onGameEnd(finalScore, rewards)
      
      if (newState.winner === 'player') {
        toast.success(`¡Victoria! Puntuación: ${finalScore}`)
      } else {
        toast.error('¡Derrota! Inténtalo de nuevo')
      }
    }

    gameStateRef.current = newState
    setGameState(newState)
    render()

    if (newState.isPlaying && !newState.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [updatePlayerPaddle, updateAIPaddle, updateBall, render, onGameEnd])

  // 🎮 CONTROLES DEL JUEGO
  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      gameStarted: true
    }))
    toast.success('¡Pong Pro iniciado! Usa WASD, flechas, ratón o táctil')
  }, [])

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false
    }))
  }, [])

  const toggleGame = useCallback(() => {
    setGameState(prev => {
      const newPlaying = !prev.isPlaying
      if (newPlaying && !prev.gameStarted) {
        return { ...prev, isPlaying: true, gameStarted: true }
      }
      return { ...prev, isPlaying: newPlaying }
    })
  }, [])

  const resetGame = useCallback(() => {
    const newState: GameState = {
      playerPaddle: {
        x: 20,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
        score: 0
      },
      aiPaddle: {
        x: CANVAS_WIDTH - 20 - PADDLE_WIDTH,
        y: CANVAS_HEIGHT / 2 - PADDLE_HEIGHT / 2,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        speed: PADDLE_SPEED,
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
    }
    setGameState(newState)
    gameStateRef.current = newState
    toast.info('Juego reiniciado')
  }, [])

  // 🎮 EFECTOS
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, gameLoop])

  useEffect(() => {
    render()
  }, [render])

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl bg-gradient-to-br from-gray-900 to-black text-white border-0 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-blue-400" />
              🏓 Pong Pro
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                Nivel {gameState.level}
              </Badge>
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
        <CardContent className="space-y-4">
          {/* 🎮 INFORMACIÓN DEL JUEGO */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-500/20 text-blue-300">
                Jugador: {gameState.playerPaddle.score}
              </Badge>
              <Badge className="bg-red-500/20 text-red-300">
                IA: {gameState.aiPaddle.score}
              </Badge>
              <Badge className="bg-purple-500/20 text-purple-300">
                Primero a {gameState.maxScore}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {!gameState.gameStarted ? (
                <Button onClick={startGame} className="bg-green-500 hover:bg-green-600">
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
              ) : gameState.isPlaying ? (
                <Button onClick={pauseGame} className="bg-yellow-500 hover:bg-yellow-600">
                  <Pause className="w-4 h-4 mr-2" />
                  Pausar
                </Button>
              ) : (
                <Button onClick={toggleGame} className="bg-green-500 hover:bg-green-600">
                  <Play className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
              )}
              <Button onClick={resetGame} variant="outline" className="border-gray-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>

          {/* 🎮 CANVAS DEL JUEGO */}
          <div className="flex justify-center">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              className="border-2 border-gray-600 bg-black rounded-lg shadow-2xl cursor-none"
              style={{ touchAction: 'none' }}
            />
          </div>

          {/* 🎮 CONTROLES */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <h4 className="font-semibold mb-2 text-blue-300">⌨️ Teclado:</h4>
              <p>W/S o ↑/↓ para mover</p>
              <p>Espacio para pausar</p>
              <p>Escape para pausar</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <h4 className="font-semibold mb-2 text-green-300">🖱️ Ratón:</h4>
              <p>Mueve el ratón arriba/abajo</p>
              <p>Control suave y preciso</p>
              <p>Automático sin clicks</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-3">
              <h4 className="font-semibold mb-2 text-purple-300">📱 Táctil:</h4>
              <p>Toca y arrastra en pantalla</p>
              <p>Control directo</p>
              <p>Optimizado para móviles</p>
            </div>
          </div>

          {/* 🎮 RESULTADO DEL JUEGO */}
          {gameState.gameOver && (
            <div className="text-center p-6 bg-white/10 rounded-lg">
              <h3 className="text-2xl font-bold mb-2">
                {gameState.winner === 'player' ? '🎉 ¡Victoria!' : '😔 Derrota'}
              </h3>
              <p className="text-lg mb-4">
                Puntuación Final: {gameState.playerPaddle.score} - {gameState.aiPaddle.score}
              </p>
              <Button onClick={resetGame} className="bg-blue-500 hover:bg-blue-600">
                <RotateCcw className="w-4 h-4 mr-2" />
                Jugar de Nuevo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}