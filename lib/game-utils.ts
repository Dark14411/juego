'use client'

import React from 'react'

/**
 * 🎮 UTILIDADES PARA CORREGIR PROBLEMAS DE MINIJUEGOS
 * Soluciones para bugs de buggeo al ganar y problemas de movimiento
 */

export interface GameState {
  isPlaying: boolean
  gameOver: boolean
  gameStarted: boolean
  score: number
  level: number
  [key: string]: any
}

export interface GameCleanup {
  timeouts: NodeJS.Timeout[]
  intervals: NodeJS.Timeout[]
  eventListeners: Array<{
    element: EventTarget
    event: string
    handler: EventListener
    options?: boolean | AddEventListenerOptions
  }>
}

/**
 * 🎮 CLASE PARA GESTIONAR LIMPIEZA DE JUEGOS
 */
export class GameCleanupManager {
  private cleanup: GameCleanup = {
    timeouts: [],
    intervals: [],
    eventListeners: []
  }

  /**
   * 🎮 AGREGAR TIMEOUT CON LIMPIEZA AUTOMÁTICA
   */
  addTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timeout = setTimeout(callback, delay)
    this.cleanup.timeouts.push(timeout)
    return timeout
  }

  /**
   * 🎮 AGREGAR INTERVAL CON LIMPIEZA AUTOMÁTICA
   */
  addInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay)
    this.cleanup.intervals.push(interval)
    return interval
  }

  /**
   * 🎮 AGREGAR EVENT LISTENER CON LIMPIEZA AUTOMÁTICA
   */
  addEventListener(
    element: EventTarget,
    event: string,
    handler: EventListener,
    options?: boolean | AddEventListenerOptions
  ): void {
    element.addEventListener(event, handler, options)
    this.cleanup.eventListeners.push({
      element,
      event,
      handler,
      options
    })
  }

  /**
   * 🎮 LIMPIAR TODO
   */
  cleanupAll(): void {
    // Limpiar timeouts
    this.cleanup.timeouts.forEach(timeout => clearTimeout(timeout))
    this.cleanup.timeouts = []

    // Limpiar intervals
    this.cleanup.intervals.forEach(interval => clearInterval(interval))
    this.cleanup.intervals = []

    // Limpiar event listeners
    this.cleanup.eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options)
    })
    this.cleanup.eventListeners = []
  }

  /**
   * 🎮 LIMPIAR SOLO TIMEOUTS E INTERVALS
   */
  cleanupTimers(): void {
    this.cleanup.timeouts.forEach(timeout => clearTimeout(timeout))
    this.cleanup.timeouts = []
    this.cleanup.intervals.forEach(interval => clearInterval(interval))
    this.cleanup.intervals = []
  }
}

/**
 * 🎮 HOOK PARA GESTIONAR ESTADO DE JUEGO CON LIMPIEZA
 */
export function useGameState<T extends GameState>(
  initialState: T,
  onGameEnd?: (score: number, rewards: any) => void
) {
  const [gameState, setGameState] = React.useState<T>(initialState)
  const cleanupManager = React.useRef(new GameCleanupManager())
  const isMounted = React.useRef(true)

  // Limpiar al desmontar
  React.useEffect(() => {
    return () => {
      isMounted.current = false
      cleanupManager.current.cleanupAll()
    }
  }, [])

  // Función para actualizar estado de forma segura
  const updateGameState = React.useCallback((updater: (prev: T) => T) => {
    if (isMounted.current) {
      setGameState(updater)
    }
  }, [])

  // Función para finalizar juego de forma segura
  const endGame = React.useCallback((score: number, rewards: any) => {
    if (!isMounted.current) return

    // Limpiar timers inmediatamente
    cleanupManager.current.cleanupTimers()

    // Actualizar estado
    updateGameState(prev => ({
      ...prev,
      isPlaying: false,
      gameOver: true
    }))

    // Llamar callback después de un pequeño delay
    setTimeout(() => {
      if (isMounted.current && onGameEnd) {
        onGameEnd(score, rewards)
      }
    }, 100)
  }, [onGameEnd, updateGameState])

  // Función para reiniciar juego
  const resetGame = React.useCallback((newState: Partial<T>) => {
    if (!isMounted.current) return

    // Limpiar timers
    cleanupManager.current.cleanupTimers()

    // Resetear estado
    updateGameState(prev => ({
      ...prev,
      ...newState,
      isPlaying: false,
      gameOver: false,
      gameStarted: false
    }))
  }, [updateGameState])

  return {
    gameState,
    updateGameState,
    endGame,
    resetGame,
    cleanupManager: cleanupManager.current,
    isMounted: isMounted.current
  }
}

/**
 * 🎮 HOOK PARA GESTIONAR EVENT LISTENERS DE FORMA SEGURA
 */
export function useGameEventListeners(
  handlers: Array<{
    element: EventTarget
    event: string
    handler: (event: Event) => void
    options?: boolean | AddEventListenerOptions
  }>,
  dependencies: any[] = []
) {
  const cleanupManager = React.useRef(new GameCleanupManager())

  React.useEffect(() => {
    // Agregar todos los event listeners
    handlers.forEach(({ element, event, handler, options }) => {
      cleanupManager.current.addEventListener(element, event, handler, options)
    })

    // Limpiar al desmontar o cuando cambien las dependencias
    return () => {
      cleanupManager.current.cleanupAll()
    }
  }, dependencies)

  return cleanupManager.current
}

/**
 * 🎮 FUNCIÓN PARA VALIDAR ESTADO DE JUEGO
 */
export function validateGameState(state: GameState): boolean {
  return (
    state !== null &&
    typeof state === 'object' &&
    typeof state.isPlaying === 'boolean' &&
    typeof state.gameOver === 'boolean' &&
    typeof state.gameStarted === 'boolean' &&
    typeof state.score === 'number' &&
    typeof state.level === 'number'
  )
}

/**
 * 🎮 FUNCIÓN PARA CALCULAR RECOMPENSAS BASADAS EN SCORE
 */
export function calculateGameRewards(
  score: number,
  gameType: string,
  isWinner: boolean = false
): {
  coins: number
  experience: number
  happiness: number
} {
  const baseCoins = Math.floor(score / 50) + 10
  const baseExperience = score + 20
  const baseHappiness = Math.min(50, Math.floor(score / 20) + 10)

  const winnerBonus = isWinner ? 1.5 : 1
  const gameTypeMultiplier = {
    'snake': 1.0,
    'tetris': 1.2,
    'pong': 1.1,
    'memory': 1.3,
    'simon': 1.4,
    'breakout': 1.1,
    '2048': 1.5
  }[gameType] || 1.0

  return {
    coins: Math.floor(baseCoins * winnerBonus * gameTypeMultiplier),
    experience: Math.floor(baseExperience * winnerBonus * gameTypeMultiplier),
    happiness: Math.floor(baseHappiness * winnerBonus)
  }
}

/**
 * 🎮 FUNCIÓN PARA PREVENIR BUGGEO DE CONTROLES
 */
export function createSafeKeyHandler(
  handler: (event: KeyboardEvent) => void,
  allowedKeys: string[] = []
): (event: KeyboardEvent) => void {
  return (event: KeyboardEvent) => {
    // Prevenir comportamiento por defecto para teclas de juego
    const gameKeys = [
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      ' ', 'w', 'W', 'a', 'A', 's', 'S', 'd', 'D',
      'Enter', 'Escape'
    ]

    if (gameKeys.includes(event.key) || allowedKeys.includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
    }

    handler(event)
  }
}

/**
 * 🎮 FUNCIÓN PARA LIMPIAR FOCUS Y CONTROLES
 */
export function cleanupGameControls(containerRef: React.RefObject<HTMLElement>): void {
  if (containerRef.current) {
    // Remover focus
    containerRef.current.blur()
    
    // Remover tabIndex si existe
    if (containerRef.current.hasAttribute('tabIndex')) {
      containerRef.current.removeAttribute('tabIndex')
    }
  }
}

/**
 * 🎮 FUNCIÓN PARA REINICIAR FOCUS Y CONTROLES
 */
export function resetGameControls(containerRef: React.RefObject<HTMLElement>): void {
  if (containerRef.current) {
    // Restaurar tabIndex
    containerRef.current.tabIndex = 0
    containerRef.current.style.outline = 'none'
    
    // Enfocar después de un pequeño delay
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.focus()
      }
    }, 100)
  }
}

/**
 * 🎮 CONSTANTES PARA JUEGOS
 */
export const GAME_CONSTANTS = {
  INITIAL_SPEED: 200,
  MIN_SPEED: 80,
  SPEED_INCREMENT: 20,
  GRID_SIZE: 20,
  CANVAS_SIZE: 400,
  BALL_RADIUS: 5,
  PADDLE_HEIGHT: 60,
  PADDLE_WIDTH: 10
} as const

/**
 * 🎮 TIPOS DE JUEGO
 */
export type GameType = 'snake' | 'tetris' | 'pong' | 'memory' | 'simon' | 'breakout' | '2048'

/**
 * 🎮 INTERFACES PARA RECOMPENSAS
 */
export interface GameRewards {
  coins: number
  experience: number
  happiness: number
}

/**
 * 🎮 INTERFACES PARA CALLBACKS DE JUEGO
 */
export interface GameCallbacks {
  onGameEnd: (score: number, rewards: GameRewards) => void
  onClose: () => void
  onPause?: () => void
  onResume?: () => void
} 