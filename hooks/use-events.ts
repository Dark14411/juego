import { useState, useEffect, useCallback } from 'react'

interface EventItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'cosmetic' | 'food' | 'care' | 'special'
  eventType: string
  isEventExclusive: boolean
  effects?: {
    health?: number
    happiness?: number
    energy?: number
    hunger?: number
    cleanliness?: number
  }
}

interface GameEvent {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  theme: string
  icon: string
  color: string
  items: EventItem[]
  challenges: EventChallenge[]
  rewards: EventReward[]
  backgroundMusic?: string
  specialEffects?: string[]
}

interface EventChallenge {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly' | 'event'
  requirement: {
    type: 'pouClicks' | 'gamesPlayed' | 'itemsPurchased' | 'coinsEarned' | 'customizationChanges'
    target: number
  }
  reward: {
    coins: number
    items?: string[]
    experience?: number
  }
  completed: boolean
  progress: number
}

interface EventReward {
  id: string
  name: string
  description: string
  type: 'item' | 'coins' | 'experience' | 'special'
  value: number | string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  claimed: boolean
}

interface EventProgress {
  eventId: string
  challengesCompleted: number
  totalChallenges: number
  itemsPurchased: number
  coinsSpent: number
  lastLogin: string
  streak: number
}

export const useEvents = () => {
  const [currentEvents, setCurrentEvents] = useState<GameEvent[]>([])
  const [eventProgress, setEventProgress] = useState<EventProgress[]>([])
  const [notifications, setNotifications] = useState<string[]>([])

  // Eventos predefinidos
  const predefinedEvents: GameEvent[] = [
    {
      id: 'halloween-2024',
      name: '🎃 Halloween Spooky',
      description: '¡Celebra Halloween con tu Pou! Items espeluznantes y recompensas terroríficas.',
      startDate: '2024-10-25T00:00:00Z',
      endDate: '2024-11-01T23:59:59Z',
      isActive: false,
      theme: 'halloween',
      icon: '🎃',
      color: '#FF6B35',
      backgroundMusic: 'halloween-music',
      specialEffects: ['fog', 'sparkles'],
      items: [
        {
          id: 'pumpkin-hat',
          name: 'Sombrero de Calabaza',
          description: 'Sombrero espeluznante de Halloween',
          price: 150,
          originalPrice: 300,
          discount: 50,
          icon: '🎃',
          rarity: 'rare',
          category: 'cosmetic',
          eventType: 'halloween',
          isEventExclusive: true,
          effects: { happiness: 15 }
        },
        {
          id: 'ghost-costume',
          name: 'Disfraz de Fantasma',
          description: 'Disfraz completo de fantasma',
          price: 500,
          originalPrice: 800,
          discount: 37,
          icon: '👻',
          rarity: 'epic',
          category: 'cosmetic',
          eventType: 'halloween',
          isEventExclusive: true,
          effects: { happiness: 25, energy: 10 }
        },
        {
          id: 'candy-bag',
          name: 'Bolsa de Dulces',
          description: 'Dulces especiales de Halloween',
          price: 75,
          originalPrice: 120,
          discount: 37,
          icon: '🍬',
          rarity: 'common',
          category: 'food',
          eventType: 'halloween',
          isEventExclusive: true,
          effects: { hunger: 30, happiness: 20 }
        }
      ],
      challenges: [
        {
          id: 'halloween-clicks',
          name: 'Truco o Trato',
          description: 'Interactúa con tu Pou 50 veces durante Halloween',
          type: 'event',
          requirement: { type: 'pouClicks', target: 50 },
          reward: { coins: 200, items: ['pumpkin-hat'] },
          completed: false,
          progress: 0
        },
        {
          id: 'halloween-games',
          name: 'Juegos Espeluznantes',
          description: 'Juega 10 mini-juegos durante el evento',
          type: 'event',
          requirement: { type: 'gamesPlayed', target: 10 },
          reward: { coins: 300, experience: 50 },
          completed: false,
          progress: 0
        }
      ],
      rewards: [
        {
          id: 'halloween-completion',
          name: 'Maestro de Halloween',
          description: 'Completa todos los desafíos de Halloween',
          type: 'special',
          value: 'ghost-costume',
          icon: '🏆',
          rarity: 'legendary',
          claimed: false
        }
      ]
    },
    {
      id: 'christmas-2024',
      name: '🎄 Navidad Mágica',
      description: '¡Celebra la Navidad con tu Pou! Regalos especiales y decoraciones festivas.',
      startDate: '2024-12-20T00:00:00Z',
      endDate: '2024-12-27T23:59:59Z',
      isActive: false,
      theme: 'christmas',
      icon: '🎄',
      color: '#DC2626',
      backgroundMusic: 'christmas-music',
      specialEffects: ['snow', 'lights'],
      items: [
        {
          id: 'santa-hat',
          name: 'Gorro de Santa',
          description: 'Gorro festivo de Navidad',
          price: 200,
          originalPrice: 350,
          discount: 43,
          icon: '🎅',
          rarity: 'rare',
          category: 'cosmetic',
          eventType: 'christmas',
          isEventExclusive: true,
          effects: { happiness: 20 }
        },
        {
          id: 'christmas-tree',
          name: 'Árbol de Navidad',
          description: 'Decoración navideña para el fondo',
          price: 400,
          originalPrice: 600,
          discount: 33,
          icon: '🎄',
          rarity: 'epic',
          category: 'cosmetic',
          eventType: 'christmas',
          isEventExclusive: true,
          effects: { happiness: 30, energy: 15 }
        },
        {
          id: 'hot-chocolate',
          name: 'Chocolate Caliente',
          description: 'Bebida caliente navideña',
          price: 100,
          originalPrice: 150,
          discount: 33,
          icon: '☕',
          rarity: 'common',
          category: 'food',
          eventType: 'christmas',
          isEventExclusive: true,
          effects: { hunger: 25, happiness: 15, energy: 10 }
        }
      ],
      challenges: [
        {
          id: 'christmas-spirit',
          name: 'Espíritu Navideño',
          description: 'Mantén tu Pou feliz por 7 días consecutivos',
          type: 'event',
          requirement: { type: 'pouClicks', target: 100 },
          reward: { coins: 500, items: ['santa-hat'] },
          completed: false,
          progress: 0
        },
        {
          id: 'christmas-generosity',
          name: 'Generosidad Navideña',
          description: 'Gasta 1000 monedas en la tienda durante el evento',
          type: 'event',
          requirement: { type: 'coinsEarned', target: 1000 },
          reward: { coins: 400, experience: 75 },
          completed: false,
          progress: 0
        }
      ],
      rewards: [
        {
          id: 'christmas-completion',
          name: 'Santa Pou',
          description: 'Completa todos los desafíos navideños',
          type: 'special',
          value: 'christmas-tree',
          icon: '🎁',
          rarity: 'legendary',
          claimed: false
        }
      ]
    },
    {
      id: 'summer-2024',
      name: '☀️ Verano Caluroso',
      description: '¡Disfruta del verano con tu Pou! Items refrescantes y actividades veraniegas.',
      startDate: '2024-07-01T00:00:00Z',
      endDate: '2024-07-31T23:59:59Z',
      isActive: false,
      theme: 'summer',
      icon: '☀️',
      color: '#F59E0B',
      backgroundMusic: 'summer-music',
      specialEffects: ['waves', 'sunshine'],
      items: [
        {
          id: 'sunglasses',
          name: 'Gafas de Sol',
          description: 'Gafas cool para el verano',
          price: 120,
          originalPrice: 200,
          discount: 40,
          icon: '🕶️',
          rarity: 'common',
          category: 'cosmetic',
          eventType: 'summer',
          isEventExclusive: true,
          effects: { happiness: 10 }
        },
        {
          id: 'beach-ball',
          name: 'Pelota de Playa',
          description: 'Pelota para jugar en la playa',
          price: 80,
          originalPrice: 120,
          discount: 33,
          icon: '🏐',
          rarity: 'common',
          category: 'cosmetic',
          eventType: 'summer',
          isEventExclusive: true,
          effects: { happiness: 15, energy: 10 }
        },
        {
          id: 'ice-cream',
          name: 'Helado',
          description: 'Helado refrescante de verano',
          price: 60,
          originalPrice: 100,
          discount: 40,
          icon: '🍦',
          rarity: 'common',
          category: 'food',
          eventType: 'summer',
          isEventExclusive: true,
          effects: { hunger: 20, happiness: 25, energy: 5 }
        }
      ],
      challenges: [
        {
          id: 'summer-fun',
          name: 'Diversión Veraniega',
          description: 'Juega 20 mini-juegos durante el verano',
          type: 'event',
          requirement: { type: 'gamesPlayed', target: 20 },
          reward: { coins: 400, items: ['sunglasses'] },
          completed: false,
          progress: 0
        },
        {
          id: 'summer-customization',
          name: 'Estilo Veraniego',
          description: 'Cambia la personalización 10 veces',
          type: 'event',
          requirement: { type: 'customizationChanges', target: 10 },
          reward: { coins: 300, experience: 60 },
          completed: false,
          progress: 0
        }
      ],
      rewards: [
        {
          id: 'summer-completion',
          name: 'Reina del Verano',
          description: 'Completa todos los desafíos veraniegos',
          type: 'special',
          value: 'beach-ball',
          icon: '🏖️',
          rarity: 'epic',
          claimed: false
        }
      ]
    }
  ]

  // Inicializar eventos y progreso
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProgress = localStorage.getItem('event-progress')
      const savedNotifications = localStorage.getItem('event-notifications')
      
      if (savedProgress) {
        setEventProgress(JSON.parse(savedProgress))
      }
      
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications))
      }
    }
  }, [])

  // Guardar progreso en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('event-progress', JSON.stringify(eventProgress))
    }
  }, [eventProgress])

  // Guardar notificaciones en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('event-notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  // Verificar eventos activos
  useEffect(() => {
    const now = new Date()
    const activeEvents = predefinedEvents.map(event => ({
      ...event,
      isActive: new Date(event.startDate) <= now && new Date(event.endDate) >= now
    }))
    
    setCurrentEvents(activeEvents)
    
    // Verificar si hay eventos nuevos activos
    activeEvents.forEach(event => {
      if (event.isActive) {
        const existingProgress = eventProgress.find(p => p.eventId === event.id)
        if (!existingProgress) {
          // Nuevo evento activo
          setEventProgress(prev => [...prev, {
            eventId: event.id,
            challengesCompleted: 0,
            totalChallenges: event.challenges.length,
            itemsPurchased: 0,
            coinsSpent: 0,
            lastLogin: now.toISOString(),
            streak: 1
          }])
          
          // Agregar notificación
          addNotification(`🎉 ¡Nuevo evento activo: ${event.name}!`)
        }
      }
    })
  }, [])

  // Función para agregar notificación
  const addNotification = useCallback((message: string) => {
    setNotifications(prev => {
      const newNotifications = [...prev, message]
      // Mantener solo las últimas 10 notificaciones
      return newNotifications.slice(-10)
    })
  }, [])

  // Función para limpiar notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  // Función para actualizar progreso de desafío
  const updateChallengeProgress = useCallback((eventId: string, challengeId: string, progress: number) => {
    setEventProgress(prev => {
      const updated = prev.map(p => {
        if (p.eventId === eventId) {
          return {
            ...p,
            challengesCompleted: progress >= 100 ? p.challengesCompleted + 1 : p.challengesCompleted
          }
        }
        return p
      })
      return updated
    })
  }, [])

  // Función para reclamar recompensa
  const claimReward = useCallback((eventId: string, rewardId: string) => {
    const event = currentEvents.find(e => e.id === eventId)
    const reward = event?.rewards.find(r => r.id === rewardId)
    
    if (reward && !reward.claimed) {
      addNotification(`🎁 ¡Recompensa reclamada: ${reward.name}!`)
      return {
        coins: reward.type === 'coins' ? reward.value as number : 0,
        items: reward.type === 'item' ? [reward.value as string] : [],
        experience: reward.type === 'experience' ? reward.value as number : 0
      }
    }
    
    return null
  }, [currentEvents, addNotification])

  // Función para obtener items de eventos activos
  const getActiveEventItems = useCallback(() => {
    return currentEvents
      .filter(event => event.isActive)
      .flatMap(event => event.items)
  }, [currentEvents])

  // Función para obtener desafíos activos
  const getActiveChallenges = useCallback(() => {
    return currentEvents
      .filter(event => event.isActive)
      .flatMap(event => event.challenges)
  }, [currentEvents])

  // Función para verificar si hay eventos próximos
  const getUpcomingEvents = useCallback(() => {
    const now = new Date()
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return predefinedEvents.filter(event => {
      const startDate = new Date(event.startDate)
      return startDate > now && startDate <= oneWeekFromNow
    })
  }, [])

  return {
    currentEvents,
    eventProgress,
    notifications,
    addNotification,
    clearNotifications,
    updateChallengeProgress,
    claimReward,
    getActiveEventItems,
    getActiveChallenges,
    getUpcomingEvents,
    predefinedEvents
  }
} 