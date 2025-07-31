'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X, Clock, Trophy } from 'lucide-react'

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
  isSelected: boolean
}

interface GameState {
  cards: Card[]
  flippedCards: number[]
  matchedPairs: number
  moves: number
  time: number
  isPlaying: boolean
  gameOver: boolean
  score: number
  level: number
  bestTime: number
  bestMoves: number
  gameStarted: boolean
}

interface MemoryGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const EMOJIS = ['🐾', '🌟', '🎮', '🏆', '💎', '🎯', '⚡', '🎨', '🌈', '🎪', '🎭', '🚀', '⭐', '🎉', '🎊', '🎁']
const GRID_SIZES = {
  1: { rows: 4, cols: 3, pairs: 6 },
  2: { rows: 4, cols: 4, pairs: 8 },
  3: { rows: 5, cols: 4, pairs: 10 }
}

export default function MemoryGame({ onGameEnd, onClose }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>({
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    time: 0,
    isPlaying: false,
    gameOver: false,
    score: 0,
    level: 1,
    bestTime: 0,
    bestMoves: 0,
    gameStarted: false
  })

  const [isMounted, setIsMounted] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const matchTimeoutRef = useRef<NodeJS.Timeout>()
  const containerRef = useRef<HTMLDivElement>(null)

  // 🎮 INICIALIZAR JUEGO
  const initializeGame = () => {
    const { pairs } = GRID_SIZES[gameState.level as keyof typeof GRID_SIZES]
    const selectedEmojis = EMOJIS.slice(0, pairs)
    const cardPairs = [...selectedEmojis, ...selectedEmojis]
    
    // Mezclar las cartas
    const shuffledCards = cardPairs
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
        isSelected: false
      }))
      .sort(() => Math.random() - 0.5)

    setGameState(prev => ({
      ...prev,
      cards: shuffledCards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      time: 0,
      isPlaying: false,
      gameOver: false,
      score: 0,
      gameStarted: false
    }))
  }

  // 🎮 MANEJAR CLICK EN CARTA - SOLUCIÓN PARA PRODUCCIÓN
  const handleCardClick = (cardId: number) => {
    setGameState(prev => {
      // No hacer nada si el juego terminó o está procesando
      if (prev.gameOver || prev.flippedCards.length >= 2) return prev

      // Auto-iniciar juego con primer click
      if (!prev.gameStarted) {
        const newState = { ...prev, isPlaying: true, gameStarted: true }
        return processCardClick(newState, cardId)
      }

      if (!prev.isPlaying) return prev

      return processCardClick(prev, cardId)
    })
  }

  // 🎮 PROCESAR CLICK EN CARTA
  const processCardClick = (state: GameState, cardId: number) => {
    const clickedCard = state.cards[cardId]
    
    // No hacer nada si la carta ya está volteada o emparejada
    if (clickedCard.isFlipped || clickedCard.isMatched) return state

    const newCards = [...state.cards]
    newCards[cardId] = { ...clickedCard, isFlipped: true, isSelected: true }
    
    const newFlippedCards = [...state.flippedCards, cardId]
    let newMoves = state.moves

    // Si es la segunda carta volteada
    if (newFlippedCards.length === 2) {
      newMoves += 1
      const [firstCardId, secondCardId] = newFlippedCards
      const firstCard = newCards[firstCardId]
      const secondCard = newCards[secondCardId]

      // Verificar si hay match
      if (firstCard.emoji === secondCard.emoji) {
        // ¡Match encontrado!
        newCards[firstCardId] = { ...firstCard, isMatched: true, isSelected: false }
        newCards[secondCardId] = { ...secondCard, isMatched: true, isSelected: false }
        
        const newMatchedPairs = state.matchedPairs + 1
        const { pairs } = GRID_SIZES[state.level as keyof typeof GRID_SIZES]
        
        // Verificar si el juego terminó
        if (newMatchedPairs === pairs) {
          const finalScore = calculateScore(state.time, newMoves, state.level)
          return {
            ...state,
            cards: newCards,
            flippedCards: [],
            matchedPairs: newMatchedPairs,
            moves: newMoves,
            score: finalScore,
            gameOver: true,
            isPlaying: false,
            bestTime: state.bestTime === 0 ? state.time : Math.min(state.bestTime, state.time),
            bestMoves: state.bestMoves === 0 ? newMoves : Math.min(state.bestMoves, newMoves)
          }
        }

        return {
          ...state,
          cards: newCards,
          flippedCards: [],
          matchedPairs: newMatchedPairs,
          moves: newMoves
        }
      } else {
        // No hay match - programar voltear las cartas de vuelta
        setTimeout(() => {
          setGameState(prevState => {
            const resetCards = [...prevState.cards]
            resetCards[firstCardId] = { ...resetCards[firstCardId], isFlipped: false, isSelected: false }
            resetCards[secondCardId] = { ...resetCards[secondCardId], isFlipped: false, isSelected: false }
            
            return {
              ...prevState,
              cards: resetCards,
              flippedCards: []
            }
          })
        }, 1000)

        return {
          ...state,
          cards: newCards,
          flippedCards: newFlippedCards,
          moves: newMoves
        }
      }
    }

    return {
      ...state,
      cards: newCards,
      flippedCards: newFlippedCards,
      moves: newMoves
    }
  }

  // 🎮 CALCULAR PUNTUACIÓN
  const calculateScore = (time: number, moves: number, level: number) => {
    const timeBonus = Math.max(0, 300 - time) // Bonus por tiempo
    const moveBonus = Math.max(0, 100 - moves) // Bonus por pocos movimientos
    const levelBonus = level * 100 // Bonus por nivel
    
    return timeBonus + moveBonus + levelBonus
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
    
    toast.success('🧠 ¡Memorama iniciado! Encuentra las parejas')
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current)
    
    initializeGame()
    
    if (containerRef.current) {
      containerRef.current.focus()
    }
    
    toast.info('🔄 Juego reiniciado')
  }

  const endGame = () => {
    const rewards = {
      coins: Math.floor(gameState.score / 10) + 10,
      experience: gameState.score + 20,
      happiness: Math.min(40, Math.floor(gameState.score / 5) + 10)
    }
    
    onGameEnd(gameState.score, rewards)
    toast.success(`🎉 ¡Memorama completado! Puntuación: ${gameState.score}`)
  }

  // 🎮 MONTAJE DEL COMPONENTE
  useEffect(() => {
    setIsMounted(true)
    initializeGame()
    return () => setIsMounted(false)
  }, [])

  // 🎮 TIMER DEL JUEGO
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
      }, 1500)
    }
  }, [gameState.gameOver, gameState.gameStarted])

  // 🎮 FORMATEAR TIEMPO
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = time % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // 🎮 OBTENER CONFIGURACIÓN DE GRID
  const getGridConfig = () => {
    return GRID_SIZES[gameState.level as keyof typeof GRID_SIZES]
  }

  // No renderizar hasta estar montado
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white border-blue-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-2xl">🧠 Cargando Memorama...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const gridConfig = getGridConfig()

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 text-white border-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="text-4xl">🧠</div>
              Memorama
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
            <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold mb-2">📋 Instrucciones</h3>
              <p className="text-sm mb-2">
                🎯 <strong>Objetivo:</strong> Encuentra todas las parejas de cartas iguales
              </p>
              <p className="text-sm mb-2">
                🖱️ <strong>Controles:</strong> Haz click en las cartas para voltearlas
              </p>
              <p className="text-sm">
                🧠 <strong>Estrategia:</strong> Memoriza las posiciones para hacer menos movimientos
              </p>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-blue-400">{gameState.score}</div>
              <div className="text-sm opacity-80">Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">{gameState.moves}</div>
              <div className="text-sm opacity-80">Movimientos</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{formatTime(gameState.time)}</div>
              <div className="text-sm opacity-80">Tiempo</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-purple-400">{gameState.matchedPairs}/{gridConfig.pairs}</div>
              <div className="text-sm opacity-80">Parejas</div>
            </div>
          </div>

          {/* GRID DE CARTAS */}
          <div className="flex justify-center">
            <div 
              className="grid gap-3 p-4 bg-black/30 rounded-xl"
              style={{ 
                gridTemplateColumns: `repeat(${gridConfig.cols}, 1fr)`,
                gridTemplateRows: `repeat(${gridConfig.rows}, 1fr)`
              }}
            >
              {gameState.cards.map((card, index) => (
                <div
                  key={card.id}
                  className={`
                    w-16 h-16 cursor-pointer transform transition-all duration-300 rounded-lg
                    ${card.isFlipped || card.isMatched ? 'scale-105' : 'hover:scale-110'}
                    ${card.isMatched ? 'opacity-50' : ''}
                    ${card.isSelected && !card.isMatched ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  onClick={() => handleCardClick(index)}
                >
                  <div className={`
                    w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold
                    transition-all duration-300 transform-gpu
                    ${card.isFlipped || card.isMatched 
                      ? 'bg-gradient-to-br from-white to-gray-100 text-gray-800 rotate-0' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500'
                    }
                  `}>
                    {card.isFlipped || card.isMatched ? card.emoji : '?'}
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
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                🧠 ¡Comenzar Memorama!
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

          {/* PROGRESO */}
          {gameState.gameStarted && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progreso</span>
                <span>{gameState.matchedPairs}/{gridConfig.pairs} parejas</span>
              </div>
              <Progress 
                value={(gameState.matchedPairs / gridConfig.pairs) * 100} 
                className="h-3"
              />
            </div>
          )}

          {/* MENSAJE DE VICTORIA */}
          {gameState.gameOver && (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold mb-2">¡Felicitaciones!</h3>
              <p className="text-sm">
                Completaste el memorama en <strong>{formatTime(gameState.time)}</strong> con <strong>{gameState.moves}</strong> movimientos
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}