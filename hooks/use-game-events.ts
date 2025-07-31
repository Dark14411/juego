'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseGameEventsOptions {
  onKeyDown?: (event: KeyboardEvent) => void
  onKeyUp?: (event: KeyboardEvent) => void
  onMouseDown?: (event: MouseEvent) => void
  onMouseUp?: (event: MouseEvent) => void
  onMouseMove?: (event: MouseEvent) => void
  onTouchStart?: (event: TouchEvent) => void
  onTouchEnd?: (event: TouchEvent) => void
  onTouchMove?: (event: TouchEvent) => void
  enabled?: boolean
  target?: HTMLElement | null
}

export function useGameEvents({
  onKeyDown,
  onKeyUp,
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  enabled = true,
  target = null
}: UseGameEventsOptions) {
  const isClient = useRef(false)
  const listenersAttached = useRef(false)

  // Detectar si estamos en el cliente
  useEffect(() => {
    isClient.current = true
  }, [])

  // Función para adjuntar listeners
  const attachListeners = useCallback(() => {
    if (!isClient.current || listenersAttached.current) return

    const targetElement = target || window

    if (onKeyDown) {
      targetElement.addEventListener('keydown', onKeyDown as EventListener, { passive: false })
    }
    if (onKeyUp) {
      targetElement.addEventListener('keyup', onKeyUp as EventListener, { passive: false })
    }
    if (onMouseDown) {
      targetElement.addEventListener('mousedown', onMouseDown as EventListener, { passive: false })
    }
    if (onMouseUp) {
      targetElement.addEventListener('mouseup', onMouseUp as EventListener, { passive: false })
    }
    if (onMouseMove) {
      targetElement.addEventListener('mousemove', onMouseMove as EventListener, { passive: false })
    }
    if (onTouchStart) {
      targetElement.addEventListener('touchstart', onTouchStart as EventListener, { passive: false })
    }
    if (onTouchEnd) {
      targetElement.addEventListener('touchend', onTouchEnd as EventListener, { passive: false })
    }
    if (onTouchMove) {
      targetElement.addEventListener('touchmove', onTouchMove as EventListener, { passive: false })
    }

    listenersAttached.current = true
  }, [onKeyDown, onKeyUp, onMouseDown, onMouseUp, onMouseMove, onTouchStart, onTouchEnd, onTouchMove, target])

  // Función para desadjuntar listeners
  const detachListeners = useCallback(() => {
    if (!isClient.current || !listenersAttached.current) return

    const targetElement = target || window

    if (onKeyDown) {
      targetElement.removeEventListener('keydown', onKeyDown as EventListener)
    }
    if (onKeyUp) {
      targetElement.removeEventListener('keyup', onKeyUp as EventListener)
    }
    if (onMouseDown) {
      targetElement.removeEventListener('mousedown', onMouseDown as EventListener)
    }
    if (onMouseUp) {
      targetElement.removeEventListener('mouseup', onMouseUp as EventListener)
    }
    if (onMouseMove) {
      targetElement.removeEventListener('mousemove', onMouseMove as EventListener)
    }
    if (onTouchStart) {
      targetElement.removeEventListener('touchstart', onTouchStart as EventListener)
    }
    if (onTouchEnd) {
      targetElement.removeEventListener('touchend', onTouchEnd as EventListener)
    }
    if (onTouchMove) {
      targetElement.removeEventListener('touchmove', onTouchMove as EventListener)
    }

    listenersAttached.current = false
  }, [onKeyDown, onKeyUp, onMouseDown, onMouseUp, onMouseMove, onTouchStart, onTouchEnd, onTouchMove, target])

  // Adjuntar/desadjuntar listeners cuando cambia enabled
  useEffect(() => {
    if (enabled) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(attachListeners, 0)
      return () => {
        clearTimeout(timer)
        detachListeners()
      }
    } else {
      detachListeners()
    }
  }, [enabled, attachListeners, detachListeners])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      detachListeners()
    }
  }, [detachListeners])

  return {
    attachListeners,
    detachListeners,
    isAttached: listenersAttached.current
  }
} 