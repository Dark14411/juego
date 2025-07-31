'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useGameInput } from '@/hooks/useGameInput'

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
  level: number
}

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SNAKE = [{ x: 10, y: 10 }]
const INITIAL_FOOD = { x: 15, y: 15 }
const BASE_SPEED = 150

export default function AdvancedSnake() {
  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: INITIAL_FOOD,
    direction: 'RIGHT',
    gameOver: false,
    score: 0,
    isPlaying: false,
    level: 1
  })

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const lastDirectionRef = useRef<string>('RIGHT')

  // Game speed based on level
  const gameSpeed = BASE_SPEED - (gameState.level - 1) * 10

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
      let newLevel = prevState.level
      let finalSnake = newSnake

      if (head.x === prevState.food.x && head.y === prevState.food.y) {
        // Grow snake
        finalSnake = [...newSnake, newSnake[newSnake.length - 1]]
        newScore += 10
        
        // Level up every 50 points
        if (newScore % 50 === 0) {
          newLevel += 1
        }
        
        // Generate new food
        do {
          newFood = generateFood()
        } while (isPositionOccupied(newFood, finalSnake))
      }

      return {
        ...prevState,
        snake: finalSnake,
        food: newFood,
        score: newScore,
        level: newLevel
      }
    })
  }, [moveSnake, checkCollision, generateFood, isPositionOccupied])

  // Handle keyboard input using custom hook
  const handleKeyDown = useCallback((key: string) => {
    if (!gameState.isPlaying && !gameState.gameOver) return

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

  // Use custom game input hook
  useGameInput({
    onKeyDown: handleKeyDown,
    enabled: true,
    preventDefault: true
  })

  // Reset game
  const resetGame = useCallback(() => {
    setGameState({
      snake: INITIAL_SNAKE,
      food: INITIAL_FOOD,
      direction: 'RIGHT',
      gameOver: false,
      score: 0,
      isPlaying: false,
      level: 1
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
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE)

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Head
        ctx.fillStyle = '#22c55e'
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        )
        // Eyes
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(
          segment.x * CELL_SIZE + 4,
          segment.y * CELL_SIZE + 4,
          3,
          3
        )
        ctx.fillRect(
          segment.x * CELL_SIZE + 13,
          segment.y * CELL_SIZE + 4,
          3,
          3
        )
      } else {
        // Body
        ctx.fillStyle = '#4ade80'
        ctx.fillRect(
          segment.x * CELL_SIZE + 1,
          segment.y * CELL_SIZE + 1,
          CELL_SIZE - 2,
          CELL_SIZE - 2
        )
      }
    })

    // Draw food
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(
      gameState.food.x * CELL_SIZE + CELL_SIZE / 2,
      gameState.food.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 2 - 2,
      0,
      2 * Math.PI
    )
    ctx.fill()

    // Draw grid
    ctx.strokeStyle = '#1e293b'
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
      gameLoopRef.current = setInterval(gameLoop, gameSpeed)
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
  }, [gameState.isPlaying, gameState.gameOver, gameLoop, gameSpeed])

  // Draw game on every state change
  useEffect(() => {
    drawGame()
  }, [drawGame])

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 rounded-lg border border-slate-700">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Advanced Snake</h2>
        <div className="flex gap-8 text-gray-300 mb-4">
          <p>Score: {gameState.score}</p>
          <p>Level: {gameState.level}</p>
          <p>Speed: {Math.round(1000 / gameSpeed)} FPS</p>
        </div>
        
        {!gameState.isPlaying && !gameState.gameOver && (
          <div className="mb-4">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Game
            </button>
          </div>
        )}
        
        {gameState.gameOver && (
          <div className="mb-4">
            <p className="text-red-400 mb-2 text-lg">Game Over!</p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
          className="border-2 border-slate-600 rounded-lg shadow-lg"
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