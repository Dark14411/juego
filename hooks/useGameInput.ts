import { useEffect, useRef, useCallback } from 'react'

interface GameInputOptions {
  onKeyDown?: (key: string) => void
  onKeyUp?: (key: string) => void
  preventDefault?: boolean
  enabled?: boolean
}

export function useGameInput(options: GameInputOptions = {}) {
  const {
    onKeyDown,
    onKeyUp,
    preventDefault = true,
    enabled = true
  } = options

  const keysPressed = useRef<Set<string>>(new Set())
  const lastKeyTime = useRef<number>(0)

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    const key = event.key.toLowerCase()
    const now = Date.now()
    
    // Prevent rapid key repeats
    if (now - lastKeyTime.current < 50) return
    lastKeyTime.current = now
    
    if (preventDefault) {
      event.preventDefault()
    }
    
    if (!keysPressed.current.has(key)) {
      keysPressed.current.add(key)
      onKeyDown?.(key)
    }
  }, [enabled, preventDefault, onKeyDown])

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (!enabled) return
    
    const key = event.key.toLowerCase()
    
    if (preventDefault) {
      event.preventDefault()
    }
    
    keysPressed.current.delete(key)
    onKeyUp?.(key)
  }, [enabled, preventDefault, onKeyUp])

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      keysPressed.current.clear()
    }
  }, [enabled, handleKeyDown, handleKeyUp])

  const isKeyPressed = useCallback((key: string): boolean => {
    return keysPressed.current.has(key.toLowerCase())
  }, [])

  const getPressedKeys = useCallback((): string[] => {
    return Array.from(keysPressed.current)
  }, [])

  return {
    isKeyPressed,
    getPressedKeys,
    keysPressed: keysPressed.current
  }
} 