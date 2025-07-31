'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from 'lucide-react'

interface GameButton {
  id: number
  color: string
  name: string
  isActive: boolean
  isPressed: boolean
}

interface GameState {
  buttons: GameButton[]
  sequence: number[]
  playerSequence: number[]
  currentIndex: number
  isPlaying: boolean
  isShowingSequence: boolean
  gameOver: boolean
  score: number
  level: number
  lives: number
  bestScore: number
  gameStarted: boolean
  soundEnabled: boolean
}

interface SimonGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const BUTTONS = [
  { id: 0, color: '#ef4444', name: 'Red' },
  { id: 1, color: '#22c55e', name: 'Green' },
  { id: 2, color: '#3b82f6', name: 'Blue' },
  { id: 3, color: '#fbbf24', name: 'Yellow' }
]

const BUTTON_ACTIVE_TIME = 600
const SEQUENCE_INTERVAL = 800

export default function SimonGame({ onGameEnd, onClose }: SimonGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    buttons: BUTTONS.map(btn => ({
      id: btn.id,
      color: btn.color,
      name: btn.name,
      isActive: false,
      isPressed: false
    })),
    sequence: [],
    playerSequence: [],
    currentIndex: 0,
    isPlaying: false,
    isShowingSequence: false,
    gameOver: false,
    score: 0,
    level: 1,
    lives: 3,
    bestScore: 0,
    gameStarted: false,
    soundEnabled: true
  })

  const [isMounted, setIsMounted] = useState(false)
  const sequenceTimeoutRef = useRef<NodeJS.Timeout>()
  const buttonTimeoutRef = useRef<NodeJS.Timeout>()
  const gameLoopRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // 🎮 GENERAR NUEVA SECUENCIA
  const generateNewSequence = () => {
    const newSequence: number[] = []
    for (let i = 0; i < gameState.level + 2; i++) {
      newSequence.push(Math.floor(Math.random() * 4))
    }

    setGameState(prev => ({
      ...prev,
      sequence: newSequence,
      playerSequence: [],
      currentIndex: 0,
      isShowingSequence: true
    }))

    // Mostrar secuencia después de un momento
    setTimeout(() => {
      showSequence(newSequence, 0)
    }, 500)
  }

  // 🎮 MOSTRAR SECUENCIA
  const showSequence = (sequence: number[], index: number) => {
    if (index >= sequence.length) {
      setGameState(prev => ({ ...prev, isShowingSequence: false }))
      return
    }

    const buttonId = sequence[index]
    
    // Activar botón
    setGameState(prev => ({
      ...prev,
      buttons: prev.buttons.map(btn => 
        btn.id === buttonId 
          ? { ...btn, isActive: true }
          : btn
      )
    }))

    // Desactivar botón después de un tiempo
    buttonTimeoutRef.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        buttons: prev.buttons.map(btn => ({ ...btn, isActive: false }))
      }))

      // Mostrar siguiente botón
      sequenceTimeoutRef.current = setTimeout(() => {
        showSequence(sequence, index + 1)
      }, 300)
    }, BUTTON_ACTIVE_TIME)
  }

  // 🎮 MANEJAR CLICK EN BOTÓN - SOLUCIÓN PARA PRODUCCIÓN
  const handleButtonClick = (buttonId: number) => {
    // No hacer nada si está mostrando secuencia o el juego terminó
    if (gameState.isShowingSequence || gameState.gameOver) return

    // Auto-iniciar juego con primer click
    if (!gameState.gameStarted) {
      setGameState(prev => ({ 
        ...prev, 
        isPlaying: true, 
        gameStarted: true 
      }))
      generateNewSequence()
      return
    }

    if (!gameState.isPlaying) return

    // Efecto visual del botón presionado
    setGameState(prev => ({
      ...prev,
      buttons: prev.buttons.map(btn =>
        btn.id === buttonId
          ? { ...btn, isPressed: true }
          : btn
      )
    }))

    // Quitar efecto visual después de un momento
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        buttons: prev.buttons.map(btn => ({ ...btn, isPressed: false }))
      }))
    }, 200)

    // Verificar si es correcto
    const expectedButton = gameState.sequence[gameState.currentIndex]
    
    if (buttonId === expectedButton) {
      // ¡Correcto!
      const newPlayerSequence = [...gameState.playerSequence, buttonId]
      const newCurrentIndex = gameState.currentIndex + 1

      setGameState(prev => ({
        ...prev,
        playerSequence: newPlayerSequence,
        currentIndex: newCurrentIndex
      }))

      // Verificar si completó la secuencia
      if (newCurrentIndex >= gameState.sequence.length) {
        // ¡Secuencia completada!
        const newScore = gameState.score + (gameState.level * 10)
        const newLevel = gameState.level + 1
        
        setGameState(prev => ({
          ...prev,
          score: newScore,
          level: newLevel,
          bestScore: Math.max(prev.bestScore, newScore)
        }))

        toast.success(`¡Nivel ${gameState.level} completado! +${gameState.level * 10} puntos`)
        
        // Generar nueva secuencia después de un momento
        setTimeout(() => {
          if (!gameState.gameOver) {
            generateNewSequence()
          }
        }, 1500)
      }
    } else {
      // ¡Incorrecto!
      const newLives = gameState.lives - 1
      
      setGameState(prev => ({
        ...prev,
        lives: newLives,
        gameOver: newLives <= 0
      }))

      if (newLives > 0) {
        toast.error(`¡Incorrecto! Te quedan ${newLives} vidas`)
        
        // Reintentar la secuencia actual después de un momento
        setTimeout(() => {
          setGameState(prev => ({
            ...prev,
            playerSequence: [],
            currentIndex: 0,
            isShowingSequence: true
          }))
          showSequence(gameState.sequence, 0)
        }, 1500)
      } else {
        toast.error('¡Game Over! Se acabaron las vidas')
      }
    }
  }

  // 🎮 CONTROLES DEL JUEGO
  const startGame = () => {
    setGameState(prev => ({ 
      ...prev, 
      isPlaying: true, 
      gameStarted: true,
      gameOver: false,
      score: 0,
      level: 1,
      lives: 3,
      sequence: [],
      playerSequence: [],
      currentIndex: 0
    }))
    
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    setTimeout(() => {
      generateNewSequence()
    }, 500)
    
    toast.success('🎯 ¡Simon Dice iniciado! Observa y repite la secuencia')
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    // Limpiar timeouts
    if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
    if (buttonTimeoutRef.current) clearTimeout(buttonTimeoutRef.current)
    if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
    
    setGameState(prev => ({
      ...prev,
      buttons: BUTTONS.map(btn => ({
        id: btn.id,
        color: btn.color,
        name: btn.name,
        isActive: false,
        isPressed: false
      })),
      sequence: [],
      playerSequence: [],
      currentIndex: 0,
      isPlaying: false,
      isShowingSequence: false,
      gameOver: false,
      score: 0,
      level: 1,
      lives: 3,
      gameStarted: false
    }))
    
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    toast.info('🔄 Juego reiniciado')
  }

  const toggleSound = () => {
    setGameState(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  const endGame = () => {
    const rewards = {
      coins: Math.floor(gameState.score / 10) + 15,
      experience: gameState.score + 25,
      happiness: Math.min(50, Math.floor(gameState.score / 5) + 15)
    }
    
    onGameEnd(gameState.score, rewards)
    toast.success(`🎉 ¡Simon Dice terminado! Puntuación: ${gameState.score}`)
  }

  // 🎮 MONTAJE DEL COMPONENTE
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // 🎮 DETECTAR GAME OVER
  useEffect(() => {
    if (gameState.gameOver && gameState.gameStarted) {
      setTimeout(() => {
        endGame()
      }, 2000)
    }
  }, [gameState.gameOver, gameState.gameStarted])

  // 🎮 LIMPIAR TIMEOUTS AL DESMONTAR
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) clearTimeout(sequenceTimeoutRef.current)
      if (buttonTimeoutRef.current) clearTimeout(buttonTimeoutRef.current)
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current)
    }
  }, [])

  // No renderizar hasta estar montado
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white border-purple-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-2xl">🎯 Cargando Simon Dice...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-900 text-white border-purple-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="text-4xl">🎯</div>
              Simon Dice
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                className="text-white hover:bg-white/20"
              >
                {gameState.soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* INSTRUCCIONES */}
          {!gameState.gameStarted && (
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold mb-2">📋 Instrucciones</h3>
              <p className="text-sm mb-2">
                🎯 <strong>Objetivo:</strong> Observa la secuencia de colores y repítela exactamente
              </p>
              <p className="text-sm mb-2">
                🖱️ <strong>Controles:</strong> Haz click en los botones de colores para repetir la secuencia
              </p>
              <p className="text-sm">
                🧠 <strong>Estrategia:</strong> Memoriza el patrón y aumenta la dificultad nivel a nivel
              </p>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{gameState.score}</div>
              <div className="text-sm opacity-80">Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{gameState.level}</div>
              <div className="text-sm opacity-80">Nivel</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{gameState.lives}</div>
              <div className="text-sm opacity-80">Vidas</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{gameState.bestScore}</div>
              <div className="text-sm opacity-80">Mejor</div>
            </div>
          </div>

          {/* ESTADO DEL JUEGO */}
          {gameState.gameStarted && (
            <div className="text-center">
              {gameState.isShowingSequence ? (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-lg font-bold">👀 Observa la secuencia...</div>
                </div>
              ) : gameState.isPlaying ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-lg font-bold">
                    🎯 Tu turno: {gameState.currentIndex + 1}/{gameState.sequence.length}
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-lg font-bold">⏸️ Juego pausado</div>
                </div>
              )}
            </div>
          )}

          {/* BOTONES DE SIMON */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-4 p-6">
              {gameState.buttons.map((button) => (
                <div
                  key={button.id}
                  className={`
                    w-32 h-32 rounded-xl cursor-pointer transform transition-all duration-150
                    ${button.isActive ? 'scale-110 brightness-150' : 'scale-100'}
                    ${button.isPressed ? 'scale-95 brightness-125' : ''}
                    ${gameState.isShowingSequence ? 'cursor-not-allowed' : 'hover:scale-105'}
                    border-4 border-white/20 hover:border-white/40
                  `}
                  style={{
                    backgroundColor: button.color,
                    boxShadow: button.isActive || button.isPressed 
                      ? `0 0 30px ${button.color}` 
                      : 'none'
                  }}
                  onClick={() => handleButtonClick(button.id)}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-white font-bold text-lg opacity-80">
                      {button.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTROLES */}
          <div className="flex flex-wrap justify-center gap-4">
            {!gameState.gameStarted ? (
              <Button
                onClick={startGame}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                🎯 ¡Comenzar Simon Dice!
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={pauseGame}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4"
                  disabled={gameState.isShowingSequence}
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

          {/* MENSAJE DE GAME OVER */}
          {gameState.gameOver && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">💀</div>
              <h3 className="text-xl font-bold mb-2">¡Game Over!</h3>
              <p className="text-sm">
                Alcanzaste el nivel <strong>{gameState.level}</strong> con <strong>{gameState.score}</strong> puntos
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}