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

interface Piece {
  shape: number[][]
  color: string
  position: Position
}

interface TetrisGameState {
  board: string[][]
  currentPiece: Piece | null
  nextPiece: Piece | null
  score: number
  lines: number
  level: number
  isPlaying: boolean
  gameOver: boolean
  gameStarted: boolean
  dropCounter: number
  dropInterval: number
}

interface TetrisGameProps {
  onGameEnd: (score: number, rewards: any) => void
  onClose: () => void
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 25

// Formas de Tetris con colores
const TETRIS_PIECES = [
  {
    shape: [
      [1, 1, 1, 1]
    ],
    color: '#00f5ff' // I-piece (Cyan)
  },
  {
    shape: [
      [1, 1],
      [1, 1]
    ],
    color: '#ffff00' // O-piece (Yellow)
  },
  {
    shape: [
      [0, 1, 0],
      [1, 1, 1]
    ],
    color: '#800080' // T-piece (Purple)
  },
  {
    shape: [
      [0, 1, 1],
      [1, 1, 0]
    ],
    color: '#00ff00' // S-piece (Green)
  },
  {
    shape: [
      [1, 1, 0],
      [0, 1, 1]
    ],
    color: '#ff0000' // Z-piece (Red)
  },
  {
    shape: [
      [1, 0, 0],
      [1, 1, 1]
    ],
    color: '#ff7f00' // J-piece (Orange)
  },
  {
    shape: [
      [0, 0, 1],
      [1, 1, 1]
    ],
    color: '#0000ff' // L-piece (Blue)
  }
]

export default function TetrisGame({ onGameEnd, onClose }: TetrisGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastDropTime = useRef(Date.now())

  // 🎮 ESTADO DEL JUEGO CON LIMPIEZA AUTOMÁTICA
  const {
    gameState,
    updateGameState,
    endGame,
    resetGame,
    cleanupManager,
    isMounted
  } = useGameState<TetrisGameState>({
    board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')),
    currentPiece: null,
    nextPiece: null,
    score: 0,
    lines: 0,
    level: 1,
    isPlaying: false,
    gameOver: false,
    gameStarted: false,
    dropCounter: 0,
    dropInterval: 1000
  }, (score, rewards) => onGameEnd(score, rewards))

  // 🎮 FUNCIONES DEL JUEGO
  const createPiece = (): Piece => {
    const pieceData = TETRIS_PIECES[Math.floor(Math.random() * TETRIS_PIECES.length)]
    return {
      shape: pieceData.shape,
      color: pieceData.color,
      position: { x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceData.shape[0].length / 2), y: 0 }
    }
  }

  const rotatePiece = (piece: Piece): Piece => {
    const rotated = piece.shape[0].map((_, i) => piece.shape.map(row => row[i]).reverse())
    return { ...piece, shape: rotated }
  }

  const checkCollision = (piece: Piece, board: string[][], offset: Position = { x: 0, y: 0 }): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.position.x + x + offset.x
          const newY = piece.position.y + y + offset.y
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return true
          if (newY >= 0 && board[newY][newX]) return true
        }
      }
    }
    return false
  }

  const placePiece = (piece: Piece, board: string[][]): string[][] => {
    const newBoard = board.map(row => [...row])
    
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardX = piece.position.x + x
          const boardY = piece.position.y + y
          if (boardY >= 0) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    
    return newBoard
  }

  const clearLines = (board: string[][]): { newBoard: string[][], linesCleared: number } => {
    let linesCleared = 0
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== '')) {
        linesCleared++
        return false
      }
      return true
    })
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(''))
    }
    
    return { newBoard, linesCleared }
  }

  const movePiece = (direction: 'left' | 'right' | 'down' | 'rotate') => {
    if (!gameState.currentPiece || !isMounted) return

    let newPiece = { ...gameState.currentPiece }
    let offset = { x: 0, y: 0 }

    switch (direction) {
      case 'left':
        offset.x = -1
        break
      case 'right':
        offset.x = 1
        break
      case 'down':
        offset.y = 1
        break
      case 'rotate':
        newPiece = rotatePiece(newPiece)
        break
    }

    if (!checkCollision(newPiece, gameState.board, offset)) {
      updateGameState(prev => ({
        ...prev,
        currentPiece: {
          ...newPiece,
          position: {
            x: newPiece.position.x + offset.x,
            y: newPiece.position.y + offset.y
          }
        }
      }))
    } else if (direction === 'down') {
      // Colocar pieza y crear nueva
      const newBoard = placePiece(gameState.currentPiece, gameState.board)
      const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard)
      
      const newScore = gameState.score + (linesCleared * 100 * gameState.level)
      const newLines = gameState.lines + linesCleared
      const newLevel = Math.floor(newLines / 10) + 1
      const newDropInterval = Math.max(100, 1000 - (newLevel - 1) * 100)

      const nextPiece = gameState.nextPiece || createPiece()
      const currentPiece = createPiece()

      // Verificar game over
      if (checkCollision(currentPiece, clearedBoard)) {
        cleanupGameControls(containerRef)
        const rewards = calculateGameRewards(gameState.score, 'tetris', false)
        endGame(gameState.score, rewards)
        return
      }

      updateGameState(prev => ({
        ...prev,
        board: clearedBoard,
        currentPiece,
        nextPiece,
        score: newScore,
        lines: newLines,
        level: newLevel,
        dropInterval: newDropInterval
      }))
    }
  }

  const calculateScore = (linesCleared: number, level: number): number => {
    return linesCleared * 100 * level
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

      switch (event.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePiece('left')
          break
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePiece('right')
          break
        case 'ArrowDown':
        case 's':
        case 'S':
          movePiece('down')
          break
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePiece('rotate')
          break
      }

      return prev
    })
  })

  // 🎮 CONTROLES DEL JUEGO CON LIMPIEZA
  const startGame = () => {
    resetGameControls(containerRef)
    
    const currentPiece = createPiece()
    const nextPiece = createPiece()
    
    updateGameState(prev => ({
      ...prev,
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')),
      currentPiece,
      nextPiece,
      isPlaying: true,
      gameStarted: true,
      gameOver: false,
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: 1000
    }))
    
    toast.success('🧩 ¡Tetris iniciado! Usa WASD o flechas para moverte')
  }

  const pauseGame = () => {
    updateGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const resetGameState = () => {
    cleanupGameControls(containerRef)
    
    resetGame({
      board: Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill('')),
      currentPiece: null,
      nextPiece: null,
      score: 0,
      lines: 0,
      level: 1,
      dropInterval: 1000
    })
    
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

  // 🎮 GAME LOOP CON AUTO-DROP
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver && isMounted && gameState.currentPiece) {
      const timeout = cleanupManager.addTimeout(() => {
        const now = Date.now()
        if (now - lastDropTime.current > gameState.dropInterval) {
          movePiece('down')
          lastDropTime.current = now
        }
      }, 50)
      
      return () => {
        if (timeout) clearTimeout(timeout)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, isMounted, gameState.currentPiece, gameState.dropInterval])

  // 🎮 RENDERIZADO DEL CANVAS
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !isMounted) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Limpiar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Fondo del tablero
    ctx.fillStyle = '#000011'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Dibujar grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      ctx.beginPath()
      ctx.moveTo(x * CELL_SIZE, 0)
      ctx.lineTo(x * CELL_SIZE, canvas.height)
      ctx.stroke()
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * CELL_SIZE)
      ctx.lineTo(canvas.width, y * CELL_SIZE)
      ctx.stroke()
    }

    // Dibujar tablero
    gameState.board.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell) {
          ctx.fillStyle = cell
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
          
          // Borde
          ctx.strokeStyle = '#fff'
          ctx.lineWidth = 1
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
        }
      })
    })

    // Dibujar pieza actual
    if (gameState.currentPiece) {
      ctx.fillStyle = gameState.currentPiece.color
      gameState.currentPiece.shape.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell) {
            const boardX = gameState.currentPiece!.position.x + x
            const boardY = gameState.currentPiece!.position.y + y
            if (boardY >= 0) {
              ctx.fillRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
              
              // Borde
              ctx.strokeStyle = '#fff'
              ctx.lineWidth = 1
              ctx.strokeRect(boardX * CELL_SIZE, boardY * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            }
          }
        })
      })
    }
  }, [gameState.board, gameState.currentPiece, isMounted])

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
          🧩 Tetris Épico
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
              <span className="text-sm text-white/70">Líneas:</span>
              <div className="text-xl font-bold text-blue-400">{gameState.lines}</div>
            </div>
            <div>
              <span className="text-sm text-white/70">Nivel:</span>
              <div className="text-xl font-bold text-purple-400">{gameState.level}</div>
            </div>
          </div>
        </div>

        {/* 🎮 CANVAS DEL JUEGO */}
        <div 
          ref={containerRef}
          className="relative bg-black rounded-lg overflow-hidden border-2 border-white/20"
          style={{ width: '250px', height: '500px' }}
        >
          <canvas
            ref={canvasRef}
            width={250}
            height={500}
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
          <div>Usa WASD o flechas para mover y rotar las piezas</div>
          <div>Completa líneas para ganar puntos</div>
          <div>¡No dejes que lleguen arriba!</div>
        </div>
      </CardContent>
    </Card>
  )
}