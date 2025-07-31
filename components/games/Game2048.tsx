'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Play, Pause, RotateCcw, X, Undo } from 'lucide-react'

interface GameState {
  board: number[][]
  score: number
  bestScore: number
  isPlaying: boolean
  gameOver: boolean
  gameWon: boolean
  gameStarted: boolean
  moves: number
  canUndo: boolean
  previousState: {
    board: number[][]
    score: number
  } | null
}

interface Game2048Props {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const GRID_SIZE = 4
const INITIAL_TILES = 2

// Colores para cada número
const TILE_COLORS: { [key: number]: { bg: string; text: string } } = {
  2: { bg: '#eee4da', text: '#776e65' },
  4: { bg: '#ede0c8', text: '#776e65' },
  8: { bg: '#f2b179', text: '#f9f6f2' },
  16: { bg: '#f59563', text: '#f9f6f2' },
  32: { bg: '#f67c5f', text: '#f9f6f2' },
  64: { bg: '#f65e3b', text: '#f9f6f2' },
  128: { bg: '#edcf72', text: '#f9f6f2' },
  256: { bg: '#edcc61', text: '#f9f6f2' },
  512: { bg: '#edc850', text: '#f9f6f2' },
  1024: { bg: '#edc53f', text: '#f9f6f2' },
  2048: { bg: '#edc22e', text: '#f9f6f2' },
  4096: { bg: '#ff0000', text: '#f9f6f2' },
  8192: { bg: '#ff4500', text: '#f9f6f2' }
}

export default function Game2048({ onGameEnd, onClose }: Game2048Props) {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0)),
    score: 0,
    bestScore: 0,
    isPlaying: false,
    gameOver: false,
    gameWon: false,
    gameStarted: false,
    moves: 0,
    canUndo: false,
    previousState: null
  })

  const [isMounted, setIsMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // 🎮 CREAR BOARD VACÍO
  const createEmptyBoard = (): number[][] => {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  }

  // 🎮 OBTENER CELDAS VACÍAS
  const getEmptyCells = (board: number[][]): { row: number; col: number }[] => {
    const emptyCells: { row: number; col: number }[] = []
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 0) {
          emptyCells.push({ row, col })
        }
      }
    }
    return emptyCells
  }

  // 🎮 AGREGAR TILE ALEATORIO
  const addRandomTile = (board: number[][]): number[][] => {
    const emptyCells = getEmptyCells(board)
    if (emptyCells.length === 0) return board

    const newBoard = board.map(row => [...row])
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    const value = Math.random() < 0.9 ? 2 : 4 // 90% probabilidad de 2, 10% de 4
    
    newBoard[randomCell.row][randomCell.col] = value
    return newBoard
  }

  // 🎮 ROTAR BOARD 90 GRADOS (para simplificar direcciones)
  const rotateBoard = (board: number[][]): number[][] => {
    const newBoard = createEmptyBoard()
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newBoard[col][GRID_SIZE - 1 - row] = board[row][col]
      }
    }
    return newBoard
  }

  // 🎮 MOVER TILES A LA IZQUIERDA
  const moveLeft = (board: number[][]): { newBoard: number[][]; score: number; moved: boolean } => {
    const newBoard = createEmptyBoard()
    let totalScore = 0
    let moved = false

    for (let row = 0; row < GRID_SIZE; row++) {
      let col = 0
      let lastMergedCol = -1

      for (let originalCol = 0; originalCol < GRID_SIZE; originalCol++) {
        if (board[row][originalCol] !== 0) {
          if (col > 0 && 
              newBoard[row][col - 1] === board[row][originalCol] && 
              lastMergedCol !== col - 1) {
            // Merge
            newBoard[row][col - 1] *= 2
            totalScore += newBoard[row][col - 1]
            lastMergedCol = col - 1
            moved = true
          } else {
            // Move
            newBoard[row][col] = board[row][originalCol]
            if (col !== originalCol) moved = true
            col++
          }
        }
      }
    }

    return { newBoard, score: totalScore, moved }
  }

  // 🎮 MOVER EN CUALQUIER DIRECCIÓN
  const move = (direction: 'left' | 'right' | 'up' | 'down', board: number[][]): { newBoard: number[][]; score: number; moved: boolean } => {
    let workingBoard = board

    // Rotar el board según la dirección
    switch (direction) {
      case 'right':
        workingBoard = rotateBoard(rotateBoard(board))
        break
      case 'up':
        workingBoard = rotateBoard(rotateBoard(rotateBoard(board)))
        break
      case 'down':
        workingBoard = rotateBoard(board)
        break
    }

    // Mover a la izquierda
    const result = moveLeft(workingBoard)

    // Rotar de vuelta a la posición original
    switch (direction) {
      case 'right':
        result.newBoard = rotateBoard(rotateBoard(result.newBoard))
        break
      case 'up':
        result.newBoard = rotateBoard(result.newBoard)
        break
      case 'down':
        result.newBoard = rotateBoard(rotateBoard(rotateBoard(result.newBoard)))
        break
    }

    return result
  }

  // 🎮 VERIFICAR SI HAY MOVIMIENTOS DISPONIBLES
  const hasMovesAvailable = (board: number[][]): boolean => {
    // Verificar celdas vacías
    if (getEmptyCells(board).length > 0) return true

    // Verificar si se pueden combinar tiles adyacentes
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const current = board[row][col]
        // Verificar derecha
        if (col < GRID_SIZE - 1 && board[row][col + 1] === current) return true
        // Verificar abajo
        if (row < GRID_SIZE - 1 && board[row + 1][col] === current) return true
      }
    }

    return false
  }

  // 🎮 VERIFICAR SI GANÓ
  const hasWon = (board: number[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 2048) return true
      }
    }
    return false
  }

  // 🎮 MANEJAR TECLAS - SOLUCIÓN PARA PRODUCCIÓN
  const handleKeyPress = (event: KeyboardEvent) => {
    const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D', ' ', 'u', 'U']
    if (!gameKeys.includes(event.key)) return

    event.preventDefault()
    event.stopPropagation()

    // Auto-iniciar con primera tecla
    if (!gameState.gameStarted) {
      setGameState(prev => ({ ...prev, isPlaying: true, gameStarted: true }))
      return
    }

    if (!gameState.isPlaying || gameState.gameOver) {
      if (event.key === ' ') {
        setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
      }
      return
    }

    // Undo
    if ((event.key === 'u' || event.key === 'U') && gameState.canUndo && gameState.previousState) {
      setGameState(prev => ({
        ...prev,
        board: prev.previousState!.board,
        score: prev.previousState!.score,
        canUndo: false,
        previousState: null
      }))
      return
    }

    // Pausar
    if (event.key === ' ') {
      setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
      return
    }

    // Determinar dirección
    let direction: 'left' | 'right' | 'up' | 'down' | null = null

    switch (event.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        direction = 'left'
        break
      case 'ArrowRight':
      case 'd':
      case 'D':
        direction = 'right'
        break
      case 'ArrowUp':
      case 'w':
      case 'W':
        direction = 'up'
        break
      case 'ArrowDown':
      case 's':
      case 'S':
        direction = 'down'
        break
    }

    if (direction) {
      makeMove(direction)
    }
  }

  // 🎮 HACER MOVIMIENTO
  const makeMove = (direction: 'left' | 'right' | 'up' | 'down') => {
    setGameState(prev => {
      const result = move(direction, prev.board)
      
      if (!result.moved) return prev // No hubo cambios

      // Guardar estado anterior para undo
      const previousState = {
        board: prev.board.map(row => [...row]),
        score: prev.score
      }

      // Agregar nuevo tile
      const newBoardWithTile = addRandomTile(result.newBoard)
      const newScore = prev.score + result.score
      const newMoves = prev.moves + 1

      // Verificar condiciones de fin de juego
      const won = hasWon(newBoardWithTile)
      const movesAvailable = hasMovesAvailable(newBoardWithTile)

      return {
        ...prev,
        board: newBoardWithTile,
        score: newScore,
        bestScore: Math.max(prev.bestScore, newScore),
        moves: newMoves,
        gameWon: won && !prev.gameWon, // Solo ganar una vez
        gameOver: !movesAvailable,
        canUndo: true,
        previousState
      }
    })
  }

  // 🎮 CONTROLES DEL JUEGO
  const startGame = () => {
    let newBoard = createEmptyBoard()
    
    // Agregar tiles iniciales
    for (let i = 0; i < INITIAL_TILES; i++) {
      newBoard = addRandomTile(newBoard)
    }

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      score: 0,
      isPlaying: true,
      gameOver: false,
      gameWon: false,
      gameStarted: true,
      moves: 0,
      canUndo: false,
      previousState: null
    }))

    if (containerRef.current) {
      containerRef.current.focus()
    }

    toast.success('🔢 ¡2048 iniciado! Usa flechas o WASD para mover')
  }

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      board: createEmptyBoard(),
      score: 0,
      isPlaying: false,
      gameOver: false,
      gameWon: false,
      gameStarted: false,
      moves: 0,
      canUndo: false,
      previousState: null
    }))

    if (containerRef.current) {
      containerRef.current.focus()
    }

    toast.info('🔄 Juego reiniciado')
  }

  const undoMove = () => {
    if (gameState.canUndo && gameState.previousState) {
      setGameState(prev => ({
        ...prev,
        board: prev.previousState!.board,
        score: prev.previousState!.score,
        canUndo: false,
        previousState: null
      }))
      toast.info('↶ Movimiento deshecho')
    }
  }

  const endGame = () => {
    const isWinner = gameState.gameWon
    const efficiencyBonus = gameState.moves > 0 ? Math.floor(gameState.score / gameState.moves) : 0
    const finalScore = gameState.score + (isWinner ? 1000 : 0) + efficiencyBonus

    const rewards = {
      coins: Math.floor(finalScore / 30) + (isWinner ? 50 : 15),
      experience: finalScore + (isWinner ? 100 : 20),
      happiness: Math.min(80, Math.floor(finalScore / 25) + (isWinner ? 40 : 15))
    }

    onGameEnd(finalScore, rewards)
    toast.success(`🎉 ¡2048 ${isWinner ? 'completado' : 'terminado'}! Puntuación: ${finalScore}`)
  }

  // 🎮 MONTAJE DEL COMPONENTE
  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  // 🎮 EVENT LISTENERS PARA PRODUCCIÓN
  useEffect(() => {
    if (!isMounted) return

    const keyHandler = (e: KeyboardEvent) => handleKeyPress(e)

    document.addEventListener('keydown', keyHandler, true)
    window.addEventListener('keydown', keyHandler, true)

    const container = containerRef.current
    if (container) {
      container.tabIndex = 0
      container.style.outline = 'none'
      container.focus()

      container.addEventListener('keydown', keyHandler)

      const handleClick = () => container.focus()
      container.addEventListener('click', handleClick)

      return () => {
        document.removeEventListener('keydown', keyHandler, true)
        window.removeEventListener('keydown', keyHandler, true)
        container.removeEventListener('keydown', keyHandler)
        container.removeEventListener('click', handleClick)
      }
    }

    return () => {
      document.removeEventListener('keydown', keyHandler, true)
      window.removeEventListener('keydown', keyHandler, true)
    }
  }, [isMounted])

  // 🎮 DETECTAR GAME OVER/WIN
  useEffect(() => {
    if ((gameState.gameOver || gameState.gameWon) && gameState.gameStarted) {
      setTimeout(() => {
        endGame()
      }, gameState.gameWon ? 3000 : 2000) // Más tiempo si ganó
    }
  }, [gameState.gameOver, gameState.gameWon, gameState.gameStarted])

  // 🎮 OBTENER ESTILO DEL TILE
  const getTileStyle = (value: number) => {
    if (value === 0) return { backgroundColor: '#cdc1b4', color: 'transparent' }
    
    const colors = TILE_COLORS[value] || { bg: '#3c3a32', text: '#f9f6f2' }
    return {
      backgroundColor: colors.bg,
      color: colors.text,
      fontSize: value >= 1024 ? '2rem' : value >= 128 ? '2.5rem' : '3rem'
    }
  }

  // No renderizar hasta estar montado
  if (!isMounted) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900 text-white border-yellow-500">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-2xl">🔢 Cargando 2048...</div>
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
      <Card className="w-full max-w-4xl mx-4 bg-gradient-to-br from-yellow-900 via-orange-800 to-red-900 text-white border-yellow-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <div className="text-4xl">🔢</div>
              2048
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
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
              <h3 className="text-lg font-bold mb-2">📋 Instrucciones</h3>
              <p className="text-sm mb-2">
                🎯 <strong>Objetivo:</strong> Combina tiles con el mismo número para llegar al 2048
              </p>
              <p className="text-sm mb-2">
                🎮 <strong>Controles:</strong> Flechas ↑↓←→ o WASD para mover tiles
              </p>
              <p className="text-sm">
                🧠 <strong>Estrategia:</strong> Mantén los números altos en una esquina
              </p>
            </div>
          )}

          {/* ESTADÍSTICAS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-400">{gameState.score}</div>
              <div className="text-sm opacity-80">Puntuación</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-orange-400">{gameState.bestScore}</div>
              <div className="text-sm opacity-80">Mejor</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-red-400">{gameState.moves}</div>
              <div className="text-sm opacity-80">Movimientos</div>
            </div>
            
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-2xl font-bold text-green-400">
                {Math.max(...gameState.board.flat())}
              </div>
              <div className="text-sm opacity-80">Mejor Tile</div>
            </div>
          </div>

          {/* TABLERO DEL JUEGO */}
          <div className="flex justify-center">
            <div className="relative">
              <div 
                className="grid gap-2 p-4 bg-gray-600 rounded-xl"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                  gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
                }}
              >
                {gameState.board.flat().map((value, index) => {
                  const style = getTileStyle(value)
                  return (
                    <div
                      key={index}
                      className="w-20 h-20 flex items-center justify-center font-bold rounded-lg transition-all duration-150 transform hover:scale-105"
                      style={style}
                    >
                      {value !== 0 && value}
                    </div>
                  )
                })}
              </div>

              {/* OVERLAY GAME OVER */}
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl mb-4">💀</div>
                    <div className="text-2xl font-bold mb-2">¡Game Over!</div>
                    <div className="text-lg mb-4">Puntuación: {gameState.score}</div>
                    <Button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-700">
                      🔄 Jugar de nuevo
                    </Button>
                  </div>
                </div>
              )}

              {/* OVERLAY VICTORIA */}
              {gameState.gameWon && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-xl">
                  <div className="text-center">
                    <div className="text-4xl mb-4">🏆</div>
                    <div className="text-2xl font-bold mb-2">¡Llegaste al 2048!</div>
                    <div className="text-lg mb-4">Puntuación: {gameState.score}</div>
                    <div className="flex gap-2">
                      <Button onClick={() => setGameState(prev => ({ ...prev, gameWon: false }))} className="bg-green-600 hover:bg-green-700">
                        🎯 Continuar jugando
                      </Button>
                      <Button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-700">
                        🔄 Nuevo juego
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* OVERLAY PAUSA */}
              {!gameState.isPlaying && !gameState.gameOver && !gameState.gameWon && gameState.gameStarted && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
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
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 text-lg"
              >
                <Play className="w-6 h-6 mr-2" />
                🔢 ¡Comenzar 2048!
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  onClick={pauseGame}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4"
                >
                  {gameState.isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                  {gameState.isPlaying ? 'Pausar' : 'Continuar'}
                </Button>
                
                <Button
                  onClick={undoMove}
                  disabled={!gameState.canUndo}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 disabled:opacity-50"
                >
                  <Undo className="w-5 h-5 mr-2" />
                  Deshacer
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
              <p>🎮 Controles: <span className="font-bold">↑↓←→</span> o <span className="font-bold">WASD</span> mover | <span className="font-bold">U</span> deshacer | <span className="font-bold">ESPACIO</span> pausar</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}