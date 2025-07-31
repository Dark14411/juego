import { useState, useEffect, useCallback, useRef } from 'react'

interface CinematicScene {
  id: string
  name: string
  type: 'intro' | 'achievement' | 'transition' | 'special'
  duration: number
  elements: CinematicElement[]
  audio?: string
  skipable: boolean
}

interface CinematicElement {
  id: string
  type: 'text' | 'image' | 'animation' | 'particle'
  content: string
  position: { x: number; y: number }
  timing: { start: number; end: number }
  animation: 'fadeIn' | 'slideIn' | 'scaleIn' | 'bounce' | 'rotate'
  style?: any
}

interface CinematicState {
  isPlaying: boolean
  currentScene: string | null
  progress: number
  isSkipped: boolean
}

export const useCinematics = () => {
  const [state, setState] = useState<CinematicState>({
    isPlaying: false,
    currentScene: null,
    progress: 0,
    isSkipped: false
  })
  
  const [scenes, setScenes] = useState<CinematicScene[]>([])
  const [showIntro, setShowIntro] = useState(true)
  const animationRef = useRef<number>()
  const startTimeRef = useRef<number>()

  // Escenas predefinidas
  const predefinedScenes: CinematicScene[] = [
    {
      id: 'intro',
      name: 'Bienvenida a Mi Pou Virtual',
      type: 'intro',
      duration: 5000,
      skipable: true,
      audio: 'intro-music',
      elements: [
        {
          id: 'title',
          type: 'text',
          content: '🐾 Mi Pou Virtual',
          position: { x: 50, y: 30 },
          timing: { start: 0, end: 5000 },
          animation: 'fadeIn',
          style: { fontSize: '3rem', fontWeight: 'bold', color: '#f59e0b' }
        },
        {
          id: 'subtitle',
          type: 'text',
          content: 'Tu mascota virtual personalizable',
          position: { x: 50, y: 45 },
          timing: { start: 1000, end: 5000 },
          animation: 'slideIn',
          style: { fontSize: '1.5rem', color: '#6b7280' }
        },
        {
          id: 'pou-character',
          type: 'animation',
          content: '🐾',
          position: { x: 50, y: 60 },
          timing: { start: 2000, end: 5000 },
          animation: 'bounce',
          style: { fontSize: '8rem' }
        },
        {
          id: 'particles',
          type: 'particle',
          content: '✨',
          position: { x: 0, y: 0 },
          timing: { start: 0, end: 5000 },
          animation: 'fadeIn',
          style: { opacity: 0.7 }
        }
      ]
    },
    {
      id: 'achievement-epic',
      name: 'Logro Épico Desbloqueado',
      type: 'achievement',
      duration: 4000,
      skipable: true,
      audio: 'achievement-epic',
      elements: [
        {
          id: 'background',
          type: 'animation',
          content: '🌟',
          position: { x: 50, y: 50 },
          timing: { start: 0, end: 4000 },
          animation: 'scaleIn',
          style: { fontSize: '20rem', opacity: 0.3 }
        },
        {
          id: 'trophy',
          type: 'text',
          content: '🏆',
          position: { x: 50, y: 40 },
          timing: { start: 500, end: 4000 },
          animation: 'bounce',
          style: { fontSize: '6rem' }
        },
        {
          id: 'title',
          type: 'text',
          content: '¡LOGRO ÉPICO!',
          position: { x: 50, y: 55 },
          timing: { start: 1000, end: 4000 },
          animation: 'fadeIn',
          style: { fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }
        },
        {
          id: 'description',
          type: 'text',
          content: 'Has alcanzado un hito increíble',
          position: { x: 50, y: 65 },
          timing: { start: 1500, end: 4000 },
          animation: 'slideIn',
          style: { fontSize: '1.2rem', color: '#6b7280' }
        },
        {
          id: 'particles',
          type: 'particle',
          content: '✨🎉🎊',
          position: { x: 0, y: 0 },
          timing: { start: 0, end: 4000 },
          animation: 'fadeIn',
          style: { opacity: 0.8 }
        }
      ]
    },
    {
      id: 'level-up',
      name: '¡Subida de Nivel!',
      type: 'achievement',
      duration: 3000,
      skipable: true,
      audio: 'level-up',
      elements: [
        {
          id: 'background',
          type: 'animation',
          content: '⚡',
          position: { x: 50, y: 50 },
          timing: { start: 0, end: 3000 },
          animation: 'scaleIn',
          style: { fontSize: '15rem', opacity: 0.4, color: '#3b82f6' }
        },
        {
          id: 'level-icon',
          type: 'text',
          content: '📈',
          position: { x: 50, y: 45 },
          timing: { start: 300, end: 3000 },
          animation: 'bounce',
          style: { fontSize: '5rem' }
        },
        {
          id: 'title',
          type: 'text',
          content: '¡NIVEL AUMENTADO!',
          position: { x: 50, y: 60 },
          timing: { start: 600, end: 3000 },
          animation: 'fadeIn',
          style: { fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }
        },
        {
          id: 'particles',
          type: 'particle',
          content: '⚡💫',
          position: { x: 0, y: 0 },
          timing: { start: 0, end: 3000 },
          animation: 'fadeIn',
          style: { opacity: 0.7 }
        }
      ]
    },
    {
      id: 'event-start',
      name: '¡Evento Especial Iniciado!',
      type: 'special',
      duration: 3500,
      skipable: true,
      audio: 'event-start',
      elements: [
        {
          id: 'background',
          type: 'animation',
          content: '🎉',
          position: { x: 50, y: 50 },
          timing: { start: 0, end: 3500 },
          animation: 'scaleIn',
          style: { fontSize: '18rem', opacity: 0.3 }
        },
        {
          id: 'event-icon',
          type: 'text',
          content: '🎊',
          position: { x: 50, y: 40 },
          timing: { start: 400, end: 3500 },
          animation: 'bounce',
          style: { fontSize: '6rem' }
        },
        {
          id: 'title',
          type: 'text',
          content: '¡EVENTO ESPECIAL!',
          position: { x: 50, y: 55 },
          timing: { start: 800, end: 3500 },
          animation: 'fadeIn',
          style: { fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }
        },
        {
          id: 'description',
          type: 'text',
          content: 'Participa y obtén recompensas únicas',
          position: { x: 50, y: 65 },
          timing: { start: 1200, end: 3500 },
          animation: 'slideIn',
          style: { fontSize: '1.1rem', color: '#6b7280' }
        },
        {
          id: 'particles',
          type: 'particle',
          content: '🎊🎉✨',
          position: { x: 0, y: 0 },
          timing: { start: 0, end: 3500 },
          animation: 'fadeIn',
          style: { opacity: 0.8 }
        }
      ]
    }
  ]

  // Inicializar escenas
  useEffect(() => {
    setScenes(predefinedScenes)
    
    // Verificar si ya se mostró el intro
    if (typeof window !== 'undefined') {
      const hasSeenIntro = localStorage.getItem('has-seen-intro')
      if (hasSeenIntro) {
        setShowIntro(false)
      }
    }
  }, [])

  // Función para reproducir una escena
  const playScene = useCallback((sceneId: string) => {
    const scene = scenes.find(s => s.id === sceneId)
    if (!scene) return

    setState({
      isPlaying: true,
      currentScene: sceneId,
      progress: 0,
      isSkipped: false
    })

    startTimeRef.current = Date.now()

    const animate = () => {
      if (!startTimeRef.current) return

      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min((elapsed / scene.duration) * 100, 100)

      setState(prev => ({
        ...prev,
        progress
      }))

      if (progress < 100 && !state.isSkipped) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Escena terminada
        setState(prev => ({
          ...prev,
          isPlaying: false,
          currentScene: null,
          progress: 0
        }))
        
        // Marcar intro como visto
        if (sceneId === 'intro') {
          localStorage.setItem('has-seen-intro', 'true')
          setShowIntro(false)
        }
      }
    }

    animationRef.current = requestAnimationFrame(animate)
  }, [scenes, state.isSkipped])

  // Función para saltar escena
  const skipScene = useCallback(() => {
    setState(prev => ({
      ...prev,
      isSkipped: true
    }))
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    
    // Terminar inmediatamente
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentScene: null,
      progress: 0
    }))
  }, [])

  // Función para reproducir intro automáticamente
  const playIntro = useCallback(() => {
    if (showIntro) {
      playScene('intro')
    }
  }, [showIntro, playScene])

  // Función para reproducir animación de logro
  const playAchievement = useCallback((type: 'epic' | 'level-up' | 'event') => {
    const sceneMap = {
      'epic': 'achievement-epic',
      'level-up': 'level-up',
      'event': 'event-start'
    }
    
    const sceneId = sceneMap[type]
    if (sceneId) {
      playScene(sceneId)
    }
  }, [playScene])

  // Función para crear escena personalizada
  const createCustomScene = useCallback((scene: Omit<CinematicScene, 'id'>) => {
    const newScene: CinematicScene = {
      ...scene,
      id: `custom-${Date.now()}`
    }
    
    setScenes(prev => [...prev, newScene])
    return newScene.id
  }, [])

  // Limpiar animación al desmontar
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Obtener escena actual
  const getCurrentScene = useCallback(() => {
    return scenes.find(s => s.id === state.currentScene)
  }, [scenes, state.currentScene])

  // Obtener elementos visibles de la escena actual
  const getVisibleElements = useCallback(() => {
    const scene = getCurrentScene()
    if (!scene) return []

    const currentTime = (state.progress / 100) * scene.duration
    
    return scene.elements.filter(element => {
      return currentTime >= element.timing.start && currentTime <= element.timing.end
    })
  }, [getCurrentScene, state.progress])

  // Calcular opacidad de un elemento basado en su timing
  const getElementOpacity = useCallback((element: CinematicElement) => {
    const scene = getCurrentScene()
    if (!scene) return 0

    const currentTime = (state.progress / 100) * scene.duration
    const { start, end } = element.timing
    
    if (currentTime < start) return 0
    if (currentTime > end) return 1
    
    const fadeInDuration = 500 // 500ms para fade in/out
    const fadeInStart = start
    const fadeOutStart = end - fadeInDuration
    
    if (currentTime < fadeInStart + fadeInDuration) {
      // Fade in
      return (currentTime - fadeInStart) / fadeInDuration
    } else if (currentTime > fadeOutStart) {
      // Fade out
      return 1 - ((currentTime - fadeOutStart) / fadeInDuration)
    }
    
    return 1
  }, [getCurrentScene, state.progress])

  return {
    // Estado
    isPlaying: state.isPlaying,
    currentScene: state.currentScene,
    progress: state.progress,
    showIntro,
    
    // Funciones
    playScene,
    skipScene,
    playIntro,
    playAchievement,
    createCustomScene,
    
    // Utilidades
    getCurrentScene,
    getVisibleElements,
    getElementOpacity,
    
    // Escenas disponibles
    scenes
  }
} 