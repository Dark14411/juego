'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Position {
  x: number
  y: number
}

interface GameState {
  snake: Position[]
  food: Position
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
  gameOver: boolean
  score: number
  isPlaying: boolean
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const GAME_SPEED = 150

export default function WorkingSnake() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT',
    gameOver: false,
    score: 0,
    isPlaying: false
  })

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastDirectionRef = useRef<string>('RIGHT')

  // Generate random food position
  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE)
    const y = Math.floor(Math.random() * GRID_SIZE)
    return { x, y }
  }, [])

  // Check if position is occupied by snake
  const isPositionOccupied = useCallback((pos: Position, snake: Position[]): boolean => {
    return snake.some(segment => segment.x === pos.x && segment.y === pos.y)
  }, [])

  // Move snake
  const moveSnake = useCallback((snake: Position[], direction: string): Position[] => {
    const head = { ...snake[0] }
    
    switch (direction) {
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
    
    return [head, ...snake.slice(0, -1)]
  }, [])

  // Check collision
  const checkCollision = useCallback((snake: Position[]): boolean => {
    const head = snake[0]
    return snake.slice(1).some(segment => 
      segment.x === head.x && segment.y === head.y
    )
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.isPlaying) return prevState

      const newSnake = moveSnake(prevState.snake, prevState.direction)
      
      // Check collision
      if (checkCollision(newSnake)) {
        return { ...prevState, gameOver: true, isPlaying: false }
      }

      // Check if food eaten
      const head = newSnake[0]
      let newFood = prevState.food
      let newScore = prevState.score
      let finalSnake = newSnake

      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        // Grow snake
        finalSnake = [...newSnake, newSnake[newSnake.length - 1]]
        newScore += 10
        
        // Generate new food
        do {
          newFood = generateFood()
        } while (isPositionOccupied(newFood, finalSnake))
      }

      return {
        ...prevState,
        snake: finalSnake,
        food: newFood,
        score: newScore
      }
    })
  }, [moveSnake, checkCollision, generateFood, isPositionOccupied])

  // Handle keyboard input
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!gameState.isPlaying && !gameState.gameOver) return

    const key = event.key.toLowerCase()
    const currentDirection = gameState.direction
    const lastDirection = lastDirectionRef.current

    let newDirection = currentDirection

    switch (key) {
      case 'arrowup':
      case 'w':
        if (lastDirection !== 'DOWN') newDirection = 'UP'
        break
      case 'arrowdown':
      case 's':
        if (lastDirection !== 'UP') newDirection = 'DOWN'
        break
      case 'arrowleft':
      case 'a':
        if (lastDirection !== 'RIGHT') newDirection = 'LEFT'
        break
      case 'arrowright':
      case 'd':
        if (lastDirection !== 'LEFT') newDirection = 'RIGHT'
        break
      case ' ':
        if (gameState.gameOver) {
          resetGame()
        }
        break
    }

    if (newDirection !== currentDirection) {
      setGameState(prev => ({ ...prev, direction: newDirection }))
      lastDirectionRef.current = newDirection
    }
  }, [gameState.isPlaying, gameState.gameOver, gameState.direction])

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT',
      gameOver: false,
      score: 0,
      isPlaying: false
    })
    lastDirectionRef.current = 'RIGHT'
  }, [])

  // Start game
  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, isPlaying: true }))
  }, [])

  // Draw game
  const drawGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

    // Draw snake
    ctx.fillStyle = '#4ade80'
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#22c55e'
      } else {
        // Body
        ctx.fillStyle = '#4ade80'
      }
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      )
    })

    // Draw food
    ctx.fillStyle = '#ef4444'
    ctx.fillRect(
      gameState.food.x * CELL_SIZE,
      gameState.food.y * CELL_SIZE,
      CELL_SIZE - 1,
      CELL_SIZE - 1
    )

    // Draw grid
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL_SIZE, 0)
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE)
      ctx.stroke()
      
      ctx.beginPath()
      ctx.moveTo(0, i * CELL_SIZE)
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE)
      ctx.stroke()
    }
  }, [gameState.snake, gameState.food])

  // Set up game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.gameOver) {
      gameLoopRef.current = setInterval(gameLoop, GAME_SPEED)
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [gameState.isPlaying, gameState.gameOver, gameLoop])

  // Set up keyboard listener
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault()
      handleKeyPress(event)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  // Draw game on every state change
  useEffect(() => {
    drawGame()
  }, [drawGame])

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-gray-900 rounded-lg">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Snake Game</h2>
        <p className="text-gray-300 mb-4">Score: {gameState.score}</p>
        
        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="mb-4">
            <button
              onClick={startGame}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameState.gameOver && (
          <div className="mb-4">
            <p className="text-red-400 mb-2">Game Over!</p>
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={GRID_SIZE * CELL_SIZE}
          height={GRID_SIZE * CELL_SIZE}
          className="border-2 border-gray-600 rounded"
          tabIndex={0}
        />
        
        {gameState.isPlaying && !gameState.gameOver && (
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Use Arrow Keys or WASD to move</p>
            <p>Press SPACE to restart when game over</p>
          </div>
        )}
      </div>
    </div>
  )
} 