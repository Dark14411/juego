import { useState, useEffect, useCallback } from 'react'

interface TutorialStep {
  id: string
  title: string
  description: string
  target: string // Selector CSS del elemento objetivo
  position: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'scroll' | 'none'
  required: boolean
  completed: boolean
  order: number
}

interface Tutorial {
  id: string
  name: string
  description: string
  steps: TutorialStep[]
  isActive: boolean
  currentStep: number
  completed: boolean
  skipable: boolean
}

export const useTutorial = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([])
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipData, setTooltipData] = useState<any>(null)

  // Tutoriales predefinidos
  const predefinedTutorials: Tutorial[] = [
    {
      id: 'welcome',
      name: 'Bienvenida a Mi Pou Virtual',
      description: 'Aprende los conceptos básicos del juego',
      isActive: false,
      currentStep: 0,
      completed: false,
      skipable: true,
      steps: [
        {
          id: 'welcome-1',
          title: '¡Bienvenido!',
          description: 'Bienvenido a Mi Pou Virtual. Te guiaré a través de las funciones básicas del juego.',
          target: 'body',
          position: 'top',
          action: 'none',
          required: true,
          completed: false,
          order: 1
        },
        {
          id: 'welcome-2',
          title: 'Tu Pou',
          description: 'Este es tu Pou virtual. Haz clic en él para interactuar y ganar monedas.',
          target: '.pou-character',
          position: 'bottom',
          action: 'click',
          required: true,
          completed: false,
          order: 2
        },
        {
          id: 'welcome-3',
          title: 'Menú Principal',
          description: 'Usa este menú para navegar entre las diferentes secciones del juego.',
          target: '.side-menu',
          position: 'right',
          action: 'click',
          required: true,
          completed: false,
          order: 3
        },
        {
          id: 'welcome-4',
          title: 'Estadísticas',
          description: 'Aquí puedes ver las estadísticas de tu Pou: salud, felicidad, energía, hambre y limpieza.',
          target: '.stats-section',
          position: 'top',
          action: 'hover',
          required: true,
          completed: false,
          order: 4
        },
        {
          id: 'welcome-5',
          title: 'Acciones Rápidas',
          description: 'Usa estos botones para alimentar, jugar, limpiar y dormir con tu Pou.',
          target: '.quick-actions',
          position: 'bottom',
          action: 'click',
          required: true,
          completed: false,
          order: 5
        }
      ]
    },
    {
      id: 'store',
      name: 'Guía de la Tienda',
      description: 'Aprende a usar la tienda y comprar items',
      isActive: false,
      currentStep: 0,
      completed: false,
      skipable: true,
      steps: [
        {
          id: 'store-1',
          title: 'Tienda',
          description: 'En la tienda puedes comprar items para tu Pou usando las monedas que ganas.',
          target: '.store-section',
          position: 'top',
          action: 'click',
          required: true,
          completed: false,
          order: 1
        },
        {
          id: 'store-2',
          title: 'Categorías',
          description: 'Los items están organizados en categorías: cosméticos, comida y cuidado.',
          target: '.store-categories',
          position: 'bottom',
          action: 'hover',
          required: true,
          completed: false,
          order: 2
        },
        {
          id: 'store-3',
          title: 'Comprar Items',
          description: 'Haz clic en un item para ver sus detalles y comprarlo.',
          target: '.store-item',
          position: 'left',
          action: 'click',
          required: true,
          completed: false,
          order: 3
        }
      ]
    },
    {
      id: 'minigames',
      name: 'Mini-Juegos',
      description: 'Aprende a jugar los mini-juegos',
      isActive: false,
      currentStep: 0,
      completed: false,
      skipable: true,
      steps: [
        {
          id: 'minigames-1',
          title: 'Mini-Juegos',
          description: 'Los mini-juegos te permiten ganar monedas extra y divertirte con tu Pou.',
          target: '.minigames-section',
          position: 'top',
          action: 'click',
          required: true,
          completed: false,
          order: 1
        },
        {
          id: 'minigames-2',
          title: 'Tipos de Juegos',
          description: 'Hay tres tipos de juegos: Memoria, Saltos y Velocidad. Cada uno tiene diferentes mecánicas.',
          target: '.game-types',
          position: 'bottom',
          action: 'hover',
          required: true,
          completed: false,
          order: 2
        },
        {
          id: 'minigames-3',
          title: 'Recompensas',
          description: 'Completa los juegos para ganar monedas. Mejor puntuación = más monedas.',
          target: '.game-rewards',
          position: 'right',
          action: 'click',
          required: true,
          completed: false,
          order: 3
        }
      ]
    },
    {
      id: 'customization',
      name: 'Personalización',
      description: 'Aprende a personalizar tu Pou',
      isActive: false,
      currentStep: 0,
      completed: false,
      skipable: true,
      steps: [
        {
          id: 'customization-1',
          title: 'Personalización',
          description: 'Personaliza la apariencia de tu Pou con diferentes colores, patrones y accesorios.',
          target: '.customization-section',
          position: 'top',
          action: 'click',
          required: true,
          completed: false,
          order: 1
        },
        {
          id: 'customization-2',
          title: 'Colores',
          description: 'Cambia el color del cuerpo y ojos de tu Pou.',
          target: '.color-options',
          position: 'bottom',
          action: 'click',
          required: true,
          completed: false,
          order: 2
        },
        {
          id: 'customization-3',
          title: 'Accesorios',
          description: 'Agrega accesorios como sombreros, gafas y más para hacer tu Pou único.',
          target: '.accessories-section',
          position: 'right',
          action: 'hover',
          required: true,
          completed: false,
          order: 3
        }
      ]
    },
    {
      id: 'achievements',
      name: 'Sistema de Logros',
      description: 'Aprende sobre los logros y recompensas',
      isActive: false,
      currentStep: 0,
      completed: false,
      skipable: true,
      steps: [
        {
          id: 'achievements-1',
          title: 'Logros',
          description: 'Los logros son metas que puedes alcanzar jugando. Desbloquéalos para ganar recompensas.',
          target: '.achievements-section',
          position: 'top',
          action: 'click',
          required: true,
          completed: false,
          order: 1
        },
        {
          id: 'achievements-2',
          title: 'Progreso',
          description: 'Ve tu progreso en cada logro y las recompensas que puedes obtener.',
          target: '.achievement-progress',
          position: 'bottom',
          action: 'hover',
          required: true,
          completed: false,
          order: 2
        },
        {
          id: 'achievements-3',
          title: 'Reclamar Recompensas',
          description: 'Cuando completes un logro, haz clic para reclamar tu recompensa.',
          target: '.claim-reward',
          position: 'left',
          action: 'click',
          required: true,
          completed: false,
          order: 3
        }
      ]
    }
  ]

  // Inicializar tutoriales
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTutorials = localStorage.getItem('tutorials')
      if (savedTutorials) {
        setTutorials(JSON.parse(savedTutorials))
      } else {
        setTutorials(predefinedTutorials)
      }
    }
  }, [])

  // Guardar tutoriales en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tutorials', JSON.stringify(tutorials))
    }
  }, [tutorials])

  // Función para iniciar un tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (tutorial) {
      const updatedTutorial = { ...tutorial, isActive: true, currentStep: 0 }
      setActiveTutorial(updatedTutorial)
      setTutorials(prev => prev.map(t => t.id === tutorialId ? updatedTutorial : t))
    }
  }, [tutorials])

  // Función para completar un paso del tutorial
  const completeStep = useCallback((tutorialId: string, stepId: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.id === tutorialId) {
        const updatedSteps = tutorial.steps.map(step => 
          step.id === stepId ? { ...step, completed: true } : step
        )
        
        const currentStepIndex = updatedSteps.findIndex(step => step.id === stepId)
        const nextStep = currentStepIndex + 1
        
        return {
          ...tutorial,
          steps: updatedSteps,
          currentStep: nextStep < updatedSteps.length ? nextStep : tutorial.steps.length - 1,
          completed: updatedSteps.every(step => step.completed)
        }
      }
      return tutorial
    }))
  }, [])

  // Función para saltar tutorial
  const skipTutorial = useCallback((tutorialId: string) => {
    setTutorials(prev => prev.map(tutorial => 
      tutorial.id === tutorialId 
        ? { ...tutorial, isActive: false, completed: true }
        : tutorial
    ))
    setActiveTutorial(null)
  }, [])

  // Función para mostrar tooltip
  const showTooltipFor = useCallback((element: string, content: any) => {
    setTooltipData(content)
    setShowTooltip(true)
  }, [])

  // Función para ocultar tooltip
  const hideTooltip = useCallback(() => {
    setShowTooltip(false)
    setTooltipData(null)
  }, [])

  // Función para verificar si un tutorial está completado
  const isTutorialCompleted = useCallback((tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    return tutorial?.completed || false
  }, [tutorials])

  // Función para reiniciar un tutorial
  const resetTutorial = useCallback((tutorialId: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.id === tutorialId) {
        return {
          ...tutorial,
          isActive: false,
          currentStep: 0,
          completed: false,
          steps: tutorial.steps.map(step => ({ ...step, completed: false }))
        }
      }
      return tutorial
    }))
  }, [])

  // Función para obtener el progreso de un tutorial
  const getTutorialProgress = useCallback((tutorialId: string) => {
    const tutorial = tutorials.find(t => t.id === tutorialId)
    if (!tutorial) return 0
    
    const completedSteps = tutorial.steps.filter(step => step.completed).length
    return Math.round((completedSteps / tutorial.steps.length) * 100)
  }, [tutorials])

  // Función para obtener tutoriales disponibles
  const getAvailableTutorials = useCallback(() => {
    return tutorials.filter(tutorial => !tutorial.completed)
  }, [tutorials])

  // Función para obtener tutoriales completados
  const getCompletedTutorials = useCallback(() => {
    return tutorials.filter(tutorial => tutorial.completed)
  }, [tutorials])

  // Función para verificar si hay tutoriales activos
  const hasActiveTutorial = useCallback(() => {
    return tutorials.some(tutorial => tutorial.isActive)
  }, [tutorials])

  // Función para obtener el siguiente paso del tutorial activo
  const getCurrentStep = useCallback(() => {
    if (!activeTutorial) return null
    
    const currentStep = activeTutorial.steps[activeTutorial.currentStep]
    return currentStep || null
  }, [activeTutorial])

  // Función para avanzar al siguiente paso
  const nextStep = useCallback(() => {
    if (!activeTutorial) return
    
    const nextStepIndex = activeTutorial.currentStep + 1
    if (nextStepIndex < activeTutorial.steps.length) {
      setActiveTutorial(prev => prev ? { ...prev, currentStep: nextStepIndex } : null)
      setTutorials(prev => prev.map(t => 
        t.id === activeTutorial.id 
          ? { ...t, currentStep: nextStepIndex }
          : t
      ))
    } else {
      // Tutorial completado
      setActiveTutorial(null)
      setTutorials(prev => prev.map(t => 
        t.id === activeTutorial.id 
          ? { ...t, isActive: false, completed: true }
          : t
      ))
    }
  }, [activeTutorial])

  // Función para retroceder al paso anterior
  const previousStep = useCallback(() => {
    if (!activeTutorial) return
    
    const prevStepIndex = Math.max(0, activeTutorial.currentStep - 1)
    setActiveTutorial(prev => prev ? { ...prev, currentStep: prevStepIndex } : null)
    setTutorials(prev => prev.map(t => 
      t.id === activeTutorial.id 
        ? { ...t, currentStep: prevStepIndex }
        : t
    ))
  }, [activeTutorial])

  return {
    // Estado
    tutorials,
    activeTutorial,
    showTooltip,
    tooltipData,
    
    // Funciones principales
    startTutorial,
    completeStep,
    skipTutorial,
    showTooltipFor,
    hideTooltip,
    nextStep,
    previousStep,
    
    // Utilidades
    isTutorialCompleted,
    resetTutorial,
    getTutorialProgress,
    getAvailableTutorials,
    getCompletedTutorials,
    hasActiveTutorial,
    getCurrentStep
  }
} 