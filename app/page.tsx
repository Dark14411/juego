'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Heart, 
  Utensils, 
  Bath, 
  Bed, 
  Gamepad2, 
  Star,
  ShoppingCart,
  Trophy,
  User,
  Home,
  Menu,
  X,
  Plus,
  Minus,
  Zap,
  Droplets,
  Sun,
  Moon,
  Crown,
  Target,
  Coins,
  Gem,
  Sparkles,
  Palette,
  Settings,
  Play,
  Award,
  Gift,
  Smartphone
} from 'lucide-react'

// 🎮 IMPORTAR MINIJUEGOS RETRO ARCADE
import MemoryGame from '@/components/games/Memory'
import PongGame from '@/components/games/Pong'
import SimonGame from '@/components/games/Simon'
import TetrisGame from '@/components/games/Tetris'
import BreakoutGame from '@/components/games/Breakout'
import Game2048 from '@/components/games/Game2048'

// 🎮 IMPORTAR HOOKS SEGUROS
import { useLocalStorage, useRealTime, usePageVisibility } from '@/hooks/use-hydration-safe'

// 🎮 IMPORTAR SISTEMAS AVANZADOS
import TamagotchiModePanel from '@/components/tamagotchi-mode-panel'
import ArcadeModePanel from '@/components/arcade-mode-panel'
import ProStorePanel from '@/components/pro-store-panel'
import { 
  ParticleSystem, 
  VisualFeedback, 
  AnimatedStatBar, 
  AnimatedButton,
  AnimationStyles 
} from '@/components/ui/animations'


// 🎮 INTERFACES DEL JUEGO
interface PetStats {
  hunger: number
  happiness: number
  energy: number
  cleanliness: number
  health: number
}

interface Pet {
  name: string
  color: string
  level: number
  experience: number
  experienceToNext: number
  coins: number
  gems: number
  accessories: string[]
  background: string
  stats: PetStats
  mood: 'ecstatic' | 'happy' | 'content' | 'neutral' | 'sad' | 'tired' | 'sick'
  personality: string
  lastPlayed: string
  achievements: string[]
}

interface GameScore {
  game: string
  score: number
  date: string
  rewards: {
    coins: number
    experience: number
    happiness: number
  }
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  isCompleted: boolean
  progress: number
  maxProgress: number
  reward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export default function EpicPouGame() {
  // 🎮 ESTADO PRINCIPAL
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showNameModal, setShowNameModal] = useState(false)
  const [petName, setPetName] = useState('')
  const [showCustomization, setShowCustomization] = useState(false)
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  const [showGame, setShowGame] = useState<string | null>(null)

  // 🎮 ESTADO DE LA MASCOTA CON LOCALSTORAGE SEGURO
  const [pet, setPet] = useLocalStorage<Pet>('epic-pou-pet', {
    name: 'Mi Pou Épico',
    color: '#FF6B9D',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    coins: 1000,
    gems: 50,
    accessories: ['crown'],
    background: 'gradient-1',
    stats: {
      hunger: 100,
      happiness: 100,
      energy: 100,
      cleanliness: 100,
      health: 100
    },
    mood: 'happy',
    personality: 'playful',
    lastPlayed: new Date().toISOString(),
    achievements: []
  })

  // 🎮 ESTADO DE PUNTUACIONES CON LOCALSTORAGE SEGURO
  const [gameScores, setGameScores] = useLocalStorage<GameScore[]>('epic-pou-scores', [])

  // 🎮 NUEVOS ESTADOS PARA SISTEMAS AVANZADOS
  const [currentAvatarId, setCurrentAvatarId] = useLocalStorage<number>('epic-pou-avatar', 1)
  const [currentScenarioId, setCurrentScenarioId] = useLocalStorage<number>('epic-pou-scenario', 1)
  const [currentTheme, setCurrentTheme] = useLocalStorage<string>('epic-pou-theme', 'default')
  const [companionPets, setCompanionPets] = useLocalStorage<string[]>('epic-pou-companions', ['perro'])
  const [unlockedPets, setUnlockedPets] = useLocalStorage<string[]>('epic-pou-unlocked-pets', ['perro'])
  const [ownedItems, setOwnedItems] = useLocalStorage<string[]>('epic-pou-owned-items', ['basic_food'])
  const [playerInventory, setPlayerInventory] = useLocalStorage<any[]>('epic-pou-inventory', [])

  // 🎮 ESTADOS PARA ANIMACIONES Y EFECTOS VISUALES
  const [showParticles, setShowParticles] = useState<{active: boolean, type: 'coins' | 'hearts' | 'stars' | 'confetti' | 'sparkles'}>({
    active: false,
    type: 'hearts'
  })
  const [showFeedback, setShowFeedback] = useState<{
    show: boolean
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    value?: number
  }>({
    show: false,
    type: 'success',
    message: ''
  })
  const [statChanges, setStatChanges] = useState<{[key: string]: number}>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // 🎮 SISTEMA DE TIEMPO REAL
  const { getTimeDifference, updateLastPlayed } = useRealTime('epic-pou-last-played')
  const isPageVisible = usePageVisibility()

  // 🎮 ESTADO DE LOGROS
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'Primer Cuidado',
      description: 'Alimenta a tu mascota por primera vez',
      icon: '🍽️',
      isCompleted: true,
      progress: 1,
      maxProgress: 1,
      reward: 10,
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Limpieza Perfecta',
      description: 'Mantén la limpieza al 100% por 1 día',
      icon: '🧼',
      isCompleted: false,
      progress: 0,
      maxProgress: 1,
      reward: 15,
      rarity: 'rare'
    },
    {
      id: '3',
      name: 'Jugador Experto',
      description: 'Juega 10 veces con tu mascota',
      icon: '🎮',
      isCompleted: false,
      progress: 2,
      maxProgress: 10,
      reward: 25,
      rarity: 'epic'
    },
    {
      id: '4',
      name: 'Coleccionista',
      description: 'Adquiere 5 accesorios diferentes',
      icon: '👑',
      isCompleted: false,
      progress: 1,
      maxProgress: 5,
      reward: 50,
      rarity: 'legendary'
    },
    {
      id: '5',
      name: 'Gamer Pro',
      description: 'Consigue 1000 puntos en cualquier minijuego',
      icon: '🏆',
      isCompleted: false,
      progress: 0,
      maxProgress: 1000,
      reward: 100,
      rarity: 'epic'
    }
  ])

  // 🎮 OBTENER BONUSES DE MASCOTAS COMPAÑERAS
  const getCompanionBonuses = () => {
    // Datos básicos de bonuses por mascota
    const petBonuses = {
      perro: { coins: 2, experience: 5, happiness: 10 },
      gato: { coins: 3, experience: 8, happiness: 15 },
      conejo: { coins: 2, experience: 6, happiness: 12 },
      pajaro: { coins: 5, experience: 12, happiness: 20 },
      hamster: { coins: 1, experience: 4, happiness: 8 },
      pez: { coins: 3, experience: 7, happiness: 10 },
      chinchilla: { coins: 8, experience: 15, happiness: 25 }
    }
    
    return companionPets.reduce((total, petId) => {
      const bonus = petBonuses[petId as keyof typeof petBonuses] || { coins: 0, experience: 0, happiness: 0 }
      return {
        coins: total.coins + bonus.coins,
        experience: total.experience + bonus.experience,
        happiness: total.happiness + bonus.happiness
      }
    }, { coins: 0, experience: 0, happiness: 0 })
  }

  // 🎮 APLICAR DECAIMIENTO DE STATS POR TIEMPO REAL
  const applyRealTimeDecay = () => {
    const timeDiff = getTimeDifference()
    const minutesAway = Math.floor(timeDiff / 60)
    
    if (minutesAway > 0) {
      setPet(prev => {
        const decayRate = Math.min(minutesAway * 0.5, 50) // Max 50% decay
        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - decayRate),
          happiness: Math.max(0, prev.stats.happiness - decayRate * 0.8),
          energy: Math.max(0, prev.stats.energy - decayRate * 0.6),
          cleanliness: Math.max(0, prev.stats.cleanliness - decayRate * 0.9),
          health: Math.max(0, prev.stats.health - decayRate * 0.3)
        }
        
        // Determinar mood basado en stats
        let newMood: Pet['mood'] = 'neutral'
        const avgHappiness = (newStats.happiness + newStats.energy) / 2
        
        if (avgHappiness >= 80) newMood = 'ecstatic'
        else if (avgHappiness >= 60) newMood = 'happy'
        else if (avgHappiness >= 40) newMood = 'content'
        else if (avgHappiness >= 20) newMood = 'sad'
        else newMood = 'sick'
        
        if (minutesAway > 5) {
          toast.info(`Tu mascota te extrañó durante ${minutesAway} minutos. Sus stats han bajado un poco.`)
        }
        
        return {
          ...prev,
          stats: newStats,
          mood: newMood
        }
      })
    }
    
    updateLastPlayed()
  }

  // 🎮 TRIGGER PARA EFECTOS VISUALES
  const triggerVisualFeedback = (type: 'success' | 'error' | 'warning' | 'info', message: string, value?: number) => {
    setShowFeedback({ show: true, type, message, value })
    setTimeout(() => setShowFeedback(prev => ({ ...prev, show: false })), 100)
  }

  const triggerParticleEffect = (type: 'coins' | 'hearts' | 'stars' | 'confetti' | 'sparkles') => {
    setShowParticles({ active: true, type })
    setTimeout(() => setShowParticles(prev => ({ ...prev, active: false })), 100)
  }

  const updateStatChange = (stat: string, change: number) => {
    setStatChanges(prev => ({ ...prev, [stat]: change }))
    setTimeout(() => setStatChanges(prev => ({ ...prev, [stat]: 0 })), 2000)
  }

  // 🎮 FUNCIONES DE ACCIÓN CON ANIMACIONES
  const handleFeed = async () => {
    setActionLoading('feed')
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const companionBonus = getCompanionBonuses()
      const hungerIncrease = 30
      const happinessIncrease = 10 + companionBonus.happiness
      const healthIncrease = 5
      const expGain = 5 + companionBonus.experience
      const coinGain = 2 + companionBonus.coins
      
      setPet(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          hunger: Math.min(100, prev.stats.hunger + hungerIncrease),
          happiness: Math.min(100, prev.stats.happiness + happinessIncrease),
          health: Math.min(100, prev.stats.health + healthIncrease)
        },
        experience: prev.experience + expGain,
        coins: prev.coins + coinGain,
        mood: 'happy'
      }))
      
      // Efectos visuales
      triggerParticleEffect('hearts')
      triggerVisualFeedback('success', '¡Alimentado!', expGain)
      updateStatChange('hunger', hungerIncrease)
      updateStatChange('happiness', happinessIncrease)
      
      toast.success(`¡Tu mascota está más feliz! +${expGain} XP, +${coinGain} monedas${companionPets.length > 0 ? ' (con bonus de compañeros)' : ''}`)
    } catch (error) {
      triggerVisualFeedback('error', 'Error al alimentar')
      toast.error('Error al alimentar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleClean = async () => {
    setActionLoading('clean')
    try {
      await new Promise(resolve => setTimeout(resolve, 600))
      
      const companionBonus = getCompanionBonuses()
      const cleanlinessIncrease = 100 - pet.stats.cleanliness
      const happinessIncrease = 15 + companionBonus.happiness
      const healthIncrease = 10
      const expGain = 8 + companionBonus.experience
      const coinGain = 3 + companionBonus.coins
      
      setPet(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          cleanliness: 100,
          happiness: Math.min(100, prev.stats.happiness + happinessIncrease),
          health: Math.min(100, prev.stats.health + healthIncrease)
        },
        experience: prev.experience + expGain,
        coins: prev.coins + coinGain,
        mood: 'content'
      }))
      
      // Efectos visuales
      triggerParticleEffect('sparkles')
      triggerVisualFeedback('success', '¡Limpieza!', expGain)
      updateStatChange('cleanliness', cleanlinessIncrease)
      updateStatChange('happiness', happinessIncrease)
      
      toast.success(`¡Tu mascota está limpia! +${expGain} XP, +${coinGain} monedas${companionPets.length > 0 ? ' (con bonus de compañeros)' : ''}`)
    } catch (error) {
      triggerVisualFeedback('error', 'Error al limpiar')
      toast.error('Error al limpiar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleSleep = async () => {
    setActionLoading('sleep')
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const companionBonus = getCompanionBonuses()
      const energyIncrease = 100 - pet.stats.energy
      const healthIncrease = 15
      const hungerDecrease = 10
      const expGain = 10 + companionBonus.experience
      const coinGain = 5 + companionBonus.coins
      
      setPet(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          energy: 100,
          hunger: Math.max(0, prev.stats.hunger - hungerDecrease),
          health: Math.min(100, prev.stats.health + healthIncrease)
        },
        experience: prev.experience + expGain,
        coins: prev.coins + coinGain,
        mood: 'content'
      }))
      
      // Efectos visuales
      triggerParticleEffect('stars')
      triggerVisualFeedback('success', '¡Descansado!', expGain)
      updateStatChange('energy', energyIncrease)
      updateStatChange('health', healthIncrease)
      
      toast.success(`¡Tu mascota descansó bien! +${expGain} XP, +${coinGain} monedas${companionPets.length > 0 ? ' (con bonus de compañeros)' : ''}`)
    } catch (error) {
      triggerVisualFeedback('error', 'Error al dormir')
      toast.error('Error al dormir')
    } finally {
      setActionLoading(null)
    }
  }

  const handlePlay = async () => {
    setActionLoading('play')
    try {
      await new Promise(resolve => setTimeout(resolve, 1200))
      
      const companionBonus = getCompanionBonuses()
      const happinessIncrease = 25 + companionBonus.happiness
      const energyDecrease = 15
      const hungerDecrease = 5
      const expGain = 15 + companionBonus.experience
      const coinGain = 8 + companionBonus.coins
      
      setPet(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          happiness: Math.min(100, prev.stats.happiness + happinessIncrease),
          energy: Math.max(0, prev.stats.energy - energyDecrease),
          hunger: Math.max(0, prev.stats.hunger - hungerDecrease)
        },
        experience: prev.experience + expGain,
        coins: prev.coins + coinGain,
        mood: 'ecstatic'
      }))
      
      // Efectos visuales
      triggerParticleEffect('confetti')
      triggerVisualFeedback('success', '¡Diversión!', expGain)
      updateStatChange('happiness', happinessIncrease)
      
      toast.success(`¡Jugaste con tu mascota! +${expGain} XP, +${coinGain} monedas${companionPets.length > 0 ? ' (con bonus de compañeros)' : ''}`)
    } catch (error) {
      triggerVisualFeedback('error', 'Error al jugar')
      toast.error('Error al jugar')
    } finally {
      setActionLoading(null)
    }
  }

  const handleGameReward = (gameName: string, score: number, rewards: any) => {
    setPet(prev => ({
      ...prev,
      experience: prev.experience + rewards.experience,
      coins: prev.coins + rewards.coins,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + rewards.happiness)
      },
      lastPlayed: new Date().toISOString(),
      mood: score > 500 ? 'ecstatic' : 'happy'
    }))

    setGameScores(prev => [...prev, {
      game: gameName,
      score,
      date: new Date().toISOString(),
      rewards
    }])

    // Efectos visuales basados en el score
    if (score > 1000) {
      // Score épico
      triggerParticleEffect('confetti')
      setTimeout(() => triggerParticleEffect('stars'), 200)
      setTimeout(() => triggerParticleEffect('sparkles'), 400)
      triggerVisualFeedback('success', '¡ÉPICO!', rewards.experience)
    } else if (score > 500) {
      // Score excelente
      triggerParticleEffect('stars')
      setTimeout(() => triggerParticleEffect('hearts'), 300)
      triggerVisualFeedback('success', '¡Excelente!', rewards.experience)
    } else {
      // Score normal
      triggerParticleEffect('hearts')
      triggerVisualFeedback('success', '¡Bien hecho!', rewards.experience)
    }

    // Actualizar cambios de stats
    updateStatChange('happiness', rewards.happiness)

    setShowGame(null)
    toast.success(`🎮 ¡${gameName} completado! 🎮`, {
      description: `Puntuación: ${score} | +${rewards.experience} XP, +${rewards.coins} monedas`,
      duration: 4000
    })
  }

  // 🎮 MANEJAR INICIO DE JUEGO
  const handleStartGame = (gameId: string) => {
    setShowGame(gameId)
    toast.info(`Iniciando ${gameId}...`)
  }

  // 🎮 MANEJAR CIERRE DE JUEGO
  const handleCloseGame = () => {
    setShowGame(null)
  }

  const handleChangeName = () => {
    if (petName.trim()) {
      setPet(prev => ({ ...prev, name: petName.trim() }))
      setShowNameModal(false)
      setPetName('')
      toast.success('¡Nombre cambiado!')
    }
  }

  // 🎮 FUNCIONES DE MASCOTAS COMPAÑERAS
  const handleAdoptPet = (petId: string, cost: number) => {
    setPet(prev => ({ ...prev, coins: Math.max(0, prev.coins - cost) }))
    setUnlockedPets(prev => [...prev, petId])
  }

  const handleSelectCompanion = (petId: string) => {
    setCompanionPets(prev => [...prev, petId])
  }

  const handleRemoveCompanion = (petId: string) => {
    setCompanionPets(prev => prev.filter(id => id !== petId))
  }

  // 🎮 FUNCIONES DE TIENDA CON ANIMACIONES
  const handlePurchaseItem = (itemId: string, cost: number, currency: 'coins' | 'gems') => {
    const canAfford = currency === 'coins' 
      ? pet.coins >= cost 
      : pet.gems >= cost

    if (!canAfford) {
      triggerVisualFeedback('error', `No tienes suficientes ${currency === 'coins' ? 'monedas' : 'gemas'}`)
      toast.error(`No tienes suficientes ${currency === 'coins' ? 'monedas' : 'gemas'}`)
      return
    }

    // Procesar compra
    setPet(prev => ({
      ...prev,
      coins: currency === 'coins' ? prev.coins - cost : prev.coins,
      gems: currency === 'gems' ? prev.gems - cost : prev.gems
    }))

    // Agregar item al inventario
    setOwnedItems(prev => [...prev, itemId])
    setPlayerInventory(prev => [...prev, { id: itemId, purchaseDate: new Date().toISOString() }])

    // Efectos visuales
    triggerParticleEffect('coins')
    triggerVisualFeedback('success', '¡Comprado!', -cost)

    toast.success(`¡Item comprado exitosamente!`, {
      description: `Has gastado ${cost} ${currency === 'coins' ? '💰' : '💎'}`
    })
  }

  // 🎮 APLICAR DECAIMIENTO BASADO EN TIEMPO REAL AL CARGAR
  useEffect(() => {
    applyRealTimeDecay()
  }, [])

  // 🎮 ACTUALIZAR TIEMPO CUANDO LA PÁGINA SE HACE VISIBLE
  useEffect(() => {
    if (isPageVisible) {
      applyRealTimeDecay()
    } else {
      updateLastPlayed()
    }
  }, [isPageVisible])

  // 🎮 DECREMENTAR STATS AUTOMÁTICAMENTE (SOLO CUANDO ESTÁ ACTIVO)
  useEffect(() => {
    if (!isPageVisible) return

    const interval = setInterval(() => {
      setPet(prev => {
        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - 0.5),
          happiness: Math.max(0, prev.stats.happiness - 0.3),
          energy: Math.max(0, prev.stats.energy - 0.2),
          cleanliness: Math.max(0, prev.stats.cleanliness - 0.4),
          health: Math.max(0, prev.stats.health - 0.1)
        }
        
        // Determinar mood basado en stats
        let newMood: Pet['mood'] = 'neutral'
        const avgHappiness = (newStats.happiness + newStats.energy) / 2
        
        if (avgHappiness >= 80) newMood = 'ecstatic'
        else if (avgHappiness >= 60) newMood = 'happy'
        else if (avgHappiness >= 40) newMood = 'content'
        else if (avgHappiness >= 20) newMood = 'sad'
        else newMood = 'sick'
        
        return {
          ...prev,
          stats: newStats,
          mood: newMood
        }
      })
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [isPageVisible])

  // 🎮 VERIFICAR NIVEL CON EFECTOS ESPECIALES
  useEffect(() => {
    if (pet.experience >= pet.experienceToNext) {
      const newLevel = pet.level + 1
      
      setPet(prev => ({
        ...prev,
        level: newLevel,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: Math.round(prev.experienceToNext * 1.5),
        coins: prev.coins + 20,
        gems: prev.gems + 2,
        mood: 'ecstatic'
      }))
      
      // Efectos visuales espectaculares para el nivel up
      triggerParticleEffect('confetti')
      setTimeout(() => triggerParticleEffect('stars'), 300)
      setTimeout(() => triggerParticleEffect('sparkles'), 600)
      
      triggerVisualFeedback('success', `¡NIVEL ${newLevel}!`, 20)
      
      toast.success(`🎉 ¡NIVEL ${newLevel} ALCANZADO! 🎉`, {
        description: '+20 monedas, +2 gemas, +Stats boost!',
        duration: 5000
      })
      
      // Boost temporal de stats al subir de nivel
      setTimeout(() => {
        setPet(prev => ({
          ...prev,
          stats: {
            hunger: Math.min(100, prev.stats.hunger + 10),
            happiness: 100, // Felicidad al máximo
            energy: Math.min(100, prev.stats.energy + 15),
            cleanliness: Math.min(100, prev.stats.cleanliness + 10),
            health: 100 // Salud al máximo
          }
        }))
      }, 1000)
    }
  }, [pet.experience, pet.experienceToNext])

  // 🎮 NAVEGACIÓN PRINCIPAL - DOS MODOS SEPARADOS
  const navigationItems = [
    { id: 'home', label: '🏠 Inicio', icon: Home },
    { id: 'tamagotchi-mode', label: '🐾 Modo Tamagotchi', icon: Smartphone },
    { id: 'arcade-mode', label: '🕹️ Modo Retro Arcade', icon: Gamepad2 },
    { id: 'store', label: '🛒 Tienda Pro', icon: ShoppingCart },
    { id: 'achievements', label: '🏆 Logros', icon: Trophy },
    { id: 'profile', label: '⚙️ Perfil', icon: Settings }
  ]

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePanel />
      case 'tamagotchi-mode':
        return <TamagotchiModePanel />
      case 'arcade-mode':
        return <ArcadeModePanel />
      case 'store':
        return <ProStorePanel 
          playerCoins={pet.coins}
          playerGems={pet.gems}
          onPurchase={(item) => {
            // Aplicar el cambio de color al Tamagotchi
            if (item.category === 'colors') {
              setPet(prev => ({
                ...prev,
                color: item.preview,
                coins: item.currency === 'coins' ? prev.coins - item.price : prev.coins,
                gems: item.currency === 'gems' ? prev.gems - item.price : prev.gems
              }))
              toast.success(`🎨 Color aplicado: ${item.name}`)
            }
          }}
        />
      case 'achievements':
        return <AchievementsPanel />
      case 'profile':
        return <ProfilePanel />
      default:
        return <HomePanel />
    }
  }

  // 🎮 FUNCIONES AUXILIARES
  const getBackgroundClass = (background: string) => {
    switch (background) {
      case 'gradient-1':
        return 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500'
      case 'gradient-2':
        return 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500'
      case 'gradient-3':
        return 'bg-gradient-to-br from-green-500 via-yellow-500 to-orange-500'
      default:
        return 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500'
    }
  }

  const getAccessoryIcon = (accessory: string) => {
    switch (accessory) {
      case 'Corona Real':
        return '👑'
      case 'Sombrero de Chef':
        return '👨‍🍳'
      case 'Traje de Superhéroe':
        return '🦸'
      default:
        return '🎩'
    }
  }

  const getMoodIcon = (mood: Pet['mood']) => {
    switch (mood) {
      case 'ecstatic':
        return '🤩'
      case 'happy':
        return '😊'
      case 'content':
        return '🙂'
      case 'neutral':
        return '😐'
      case 'sad':
        return '😕'
      case 'sick':
        return '🤒'
      default:
        return '😊'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-500'
      case 'rare':
        return 'bg-blue-500'
      case 'epic':
        return 'bg-purple-500'
      case 'legendary':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  // 🎮 PANEL PRINCIPAL
  const HomePanel = () => (
    <div className="space-y-6">
      {/* 🎯 MASCOTA PRINCIPAL */}
      <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white border-0 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold">
            <span className="text-5xl">🐾</span>
            {pet.name}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNameModal(true)}
              className="ml-2 text-white hover:bg-white/20"
            >
              ✏️
            </Button>
          </CardTitle>
          <div className="flex items-center justify-center gap-3">
            <Badge variant="secondary" className="bg-white/20 text-white">
              <Crown className="w-4 h-4 mr-1" />
              Nivel {pet.level}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              <Coins className="w-4 h-4 mr-1" />
              {pet.coins}
            </Badge>
            <Badge variant="outline" className="border-white/30 text-white">
              <Gem className="w-4 h-4 mr-1" />
              {pet.gems}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* 🎮 MASCOTA VISUAL CON COMPAÑEROS */}
          <div className="flex justify-center mb-8">
            <div className="relative w-60 h-60">
              {/* POU PRINCIPAL EN EL CENTRO */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                {/* FONDO */}
                <div className={`w-40 h-40 rounded-full ${getBackgroundClass(pet.background)} flex items-center justify-center shadow-2xl`}>
                  {/* CUERPO PRINCIPAL ANIMADO */}
                  <div 
                    className="w-32 h-32 rounded-full flex items-center justify-center relative shadow-inner animate-float"
                    style={{ 
                      backgroundColor: pet.color,
                      animation: `float 4s ease-in-out infinite, ${pet.mood === 'ecstatic' ? 'pulse-glow 1s ease-in-out infinite' : 'none'}`
                    }}
                  >
                    {/* OJOS EXPRESIVOS */}
                    <div className={`absolute top-6 left-6 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${pet.mood === 'happy' || pet.mood === 'ecstatic' ? 'transform -translate-y-1' : ''}`}></div>
                    <div className={`absolute top-6 right-6 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${pet.mood === 'happy' || pet.mood === 'ecstatic' ? 'transform -translate-y-1' : ''}`}></div>
                    
                    {/* PUPILAS DINÁMICAS */}
                    <div className={`absolute top-7 left-6 w-2 h-2 bg-black rounded-full transition-all duration-500 ${pet.mood === 'ecstatic' ? 'animate-pulse' : ''}`}></div>
                    <div className={`absolute top-7 right-6 w-2 h-2 bg-black rounded-full transition-all duration-500 ${pet.mood === 'ecstatic' ? 'animate-pulse' : ''}`}></div>
                    
                    {/* BOCA EXPRESIVA */}
                    <div className={`absolute bottom-8 bg-black rounded-full transition-all duration-300 ${
                      pet.mood === 'ecstatic' ? 'w-8 h-3 transform rotate-6' :
                      pet.mood === 'happy' ? 'w-6 h-2 transform rotate-3' :
                      pet.mood === 'sad' ? 'w-4 h-1 transform rotate-180' :
                      'w-6 h-1'
                    }`}></div>
                    
                    {/* ACCESORIOS CON ANIMACIÓN */}
                    {pet.accessories.map((accessory, index) => (
                      <div key={index} className="absolute text-2xl animate-bounce-in" style={{
                        animationDelay: `${index * 0.2}s`
                      }}>
                        {getAccessoryIcon(accessory)}
                      </div>
                    ))}
                    
                    {/* EFECTOS ESPECIALES BASADOS EN MOOD */}
                    {pet.mood === 'ecstatic' && (
                      <div className="absolute inset-0 rounded-full border-4 border-yellow-300 animate-ping opacity-75"></div>
                    )}
                    
                    {pet.mood === 'sick' && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs">😵‍💫</div>
                    )}
                  </div>
                </div>
                
                {/* ESTADO EMOCIONAL */}
                <div className="absolute -top-4 -right-4 text-4xl animate-bounce">
                  {getMoodIcon(pet.mood)}
                </div>
              </div>

              {/* MASCOTAS COMPAÑERAS ORBITANDO CON ANIMACIONES MEJORADAS */}
              {companionPets.map((companionId, index) => {
                const angle = (360 / companionPets.length) * index
                const radius = 100
                const x = Math.cos((angle * Math.PI) / 180) * radius
                const y = Math.sin((angle * Math.PI) / 180) * radius
                
                return (
                  <div
                    key={companionId}
                    className="absolute w-16 h-16 animate-float"
                    style={{
                      left: `calc(50% + ${x}px - 32px)`,
                      top: `calc(50% + ${y}px - 32px)`,
                      animation: `orbit ${8 + index * 2}s linear infinite, float 3s ease-in-out infinite`,
                      animationDelay: `${index * 0.5}s`
                    }}
                  >
                    <div className="relative animate-bounce-in">
                      <img 
                        src={`/pet/mascota_${companionId}.png`}
                        alt={`Companion ${companionId}`}
                        className="w-16 h-16 rounded-full border-2 border-white/60 shadow-lg hover:scale-110 transition-transform animate-pulse-glow"
                        onError={(e) => {
                          e.currentTarget.src = '/pet/mascota_perro.png'
                        }}
                      />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs">❤️</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              {/* BONUSES ACTIVOS */}
              {companionPets.length > 0 && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/50 rounded-lg px-3 py-1">
                  <div className="flex gap-2 text-sm">
                    <span className="text-yellow-400">+{getCompanionBonuses().coins}💰</span>
                    <span className="text-blue-400">+{getCompanionBonuses().experience}⭐</span>
                    <span className="text-pink-400">+{getCompanionBonuses().happiness}❤️</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CSS PARA ANIMACIÓN DE ÓRBITA */}
          <style jsx>{`
            @keyframes orbit {
              from {
                transform: rotate(0deg) translateX(100px) rotate(0deg);
              }
              to {
                transform: rotate(360deg) translateX(100px) rotate(-360deg);
              }
            }
          `}</style>

          {/* 📊 ESTADÍSTICAS */}
          <div className="space-y-4">
            <AnimatedStatBar
              label="Hambre"
              value={pet.stats.hunger}
              maxValue={100}
              color="bg-gradient-to-r from-green-400 to-green-600"
              icon={<Utensils className="w-4 h-4" />}
              showChange={statChanges.hunger}
              animate={true}
            />

            <AnimatedStatBar
              label="Felicidad"
              value={pet.stats.happiness}
              maxValue={100}
              color="bg-gradient-to-r from-pink-400 to-pink-600"
              icon={<Heart className="w-4 h-4" />}
              showChange={statChanges.happiness}
              animate={true}
            />

            <AnimatedStatBar
              label="Energía"
              value={pet.stats.energy}
              maxValue={100}
              color="bg-gradient-to-r from-yellow-400 to-yellow-600"
              icon={<Zap className="w-4 h-4" />}
              showChange={statChanges.energy}
              animate={true}
            />

            <AnimatedStatBar
              label="Limpieza"
              value={pet.stats.cleanliness}
              maxValue={100}
              color="bg-gradient-to-r from-blue-400 to-blue-600"
              icon={<Droplets className="w-4 h-4" />}
              showChange={statChanges.cleanliness}
              animate={true}
            />

            <AnimatedStatBar
              label="Salud"
              value={pet.stats.health}
              maxValue={100}
              color="bg-gradient-to-r from-red-400 to-red-600"
              icon={<Heart className="w-4 h-4" />}
              showChange={statChanges.health}
              animate={true}
            />
          </div>

          {/* 🎮 BOTONES DE ACCIÓN ANIMADOS */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <AnimatedButton
              onClick={handleFeed}
              loading={actionLoading === 'feed'}
              variant="success"
              size="lg"
              className="py-3"
            >
              <Utensils className="w-5 h-5" />
              {actionLoading === 'feed' ? 'Alimentando...' : 'Alimentar'}
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handleClean}
              loading={actionLoading === 'clean'}
              variant="secondary"
              size="lg"
              className="py-3"
            >
              <Bath className="w-5 h-5" />
              {actionLoading === 'clean' ? 'Limpiando...' : 'Limpiar'}
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handleSleep}
              loading={actionLoading === 'sleep'}
              variant="primary"
              size="lg"
              className="py-3"
            >
              <Bed className="w-5 h-5" />
              {actionLoading === 'sleep' ? 'Durmiendo...' : 'Dormir'}
            </AnimatedButton>
            
            <AnimatedButton
              onClick={handlePlay}
              loading={actionLoading === 'play'}
              variant="warning"
              size="lg"
              className="py-3"
            >
              <Gamepad2 className="w-5 h-5" />
              {actionLoading === 'play' ? 'Jugando...' : 'Jugar'}
            </AnimatedButton>
          </div>
        </CardContent>
      </Card>

      {/* 🎯 PROGRESO DE NIVEL */}
      <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold">
            <Star className="w-6 h-6" />
            Progreso de Nivel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm font-semibold">
              <span>Experiencia</span>
              <span>{pet.experience}/{Math.round(pet.experienceToNext)} XP</span>
            </div>
            <Progress value={(pet.experience / pet.experienceToNext) * 100} className="h-4 bg-white/20" />
            <div className="text-center text-sm opacity-90">
              ¡Sigue cuidando a tu mascota para subir de nivel!
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 🎮 PANEL DE MINIJUEGOS
  const GamesPanel = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Gamepad2 className="w-6 h-6" />
            Minijuegos Épicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { id: 'memory', name: 'Memorama', icon: '🧠', description: 'Encuentra las parejas', color: 'from-blue-500 to-cyan-600' },
              { id: 'pong', name: 'Pong', icon: '🏓', description: 'Juego clásico de ping pong', color: 'from-red-500 to-pink-600' },
              { id: 'simon', name: 'Simon Dice', icon: '🎯', description: 'Repite la secuencia', color: 'from-purple-500 to-indigo-600' },
              { id: 'tetris', name: 'Tetris', icon: '🧩', description: 'Completa líneas con bloques', color: 'from-cyan-500 to-blue-600' },
              { id: 'breakout', name: 'Breakout', icon: '🎯', description: 'Rompe ladrillos con la pelota', color: 'from-orange-500 to-red-600' },
              { id: '2048', name: '2048', icon: '🔢', description: 'Combina números hasta 2048', color: 'from-yellow-500 to-orange-600' }
            ].map((game) => (
              <Card key={game.id} className={`bg-gradient-to-br ${game.color} text-white hover:shadow-xl transition-all transform hover:scale-105 border-0`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-3xl">{game.icon}</span>
                    {game.name}
                  </CardTitle>
                  <p className="text-sm opacity-90">{game.description}</p>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => handleStartGame(game.id)}
                    className="w-full bg-white/20 hover:bg-white/30 text-white font-bold"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Jugar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 🎨 PANEL DE PERSONALIZACIÓN
  const CustomizePanel = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-pink-500 to-purple-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Palette className="w-6 h-6" />
            Personalizar Mascota
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* COLORES */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Color de la Mascota</h3>
            <div className="grid grid-cols-6 gap-3">
              {['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'].map((color) => (
                <button
                  key={color}
                  onClick={() => setPet(prev => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${
                    pet.color === color ? 'border-white shadow-lg scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* ACCESORIOS */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Accesorios</h3>
            <div className="grid grid-cols-4 gap-3">
              {pet.accessories.map((accessory, index) => (
                <div key={index} className="text-center p-3 bg-white/20 rounded-lg">
                  <div className="text-2xl mb-2">{getAccessoryIcon(accessory)}</div>
                  <div className="text-sm font-medium">{accessory}</div>
                </div>
              ))}
            </div>
          </div>

          {/* FONDOS */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Fondos</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'gradient-1', name: 'Arcoíris', class: 'bg-gradient-to-br from-purple-500 via-pink-500 to-red-500' },
                { id: 'gradient-2', name: 'Océano', class: 'bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500' },
                { id: 'gradient-3', name: 'Bosque', class: 'bg-gradient-to-br from-green-500 via-yellow-500 to-orange-500' }
              ].map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setPet(prev => ({ ...prev, background: bg.id }))}
                  className={`h-16 rounded-lg transition-all ${
                    pet.background === bg.id ? 'ring-4 ring-white scale-105' : ''
                  } ${bg.class}`}
                >
                  <span className="text-white font-semibold">{bg.name}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 🏆 PANEL DE LOGROS
  const AchievementsPanel = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="w-6 h-6" />
            Logros Épicos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-xl transition-all transform hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-3xl">{achievement.icon}</span>
                    {achievement.name}
                    <Badge className={`${getRarityColor(achievement.rarity)} text-white`}>
                      {achievement.rarity}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm opacity-90">{achievement.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso:</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                    </div>
                    <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-3 bg-white/20" />
                  </div>
                  
                  {achievement.isCompleted && (
                    <Badge className="w-full justify-center bg-green-500 text-white">
                      ✅ Completado
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 👤 PANEL DE PERFIL
  const ProfilePanel = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-bold">
            <User className="w-6 h-6" />
            Perfil de la Mascota
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Información Básica</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Nombre:</span>
                    <span className="font-medium">{pet.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nivel:</span>
                    <span className="font-medium">{pet.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Personalidad:</span>
                    <span className="font-medium capitalize">{pet.personality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado de ánimo:</span>
                    <span className="font-medium">{getMoodIcon(pet.mood)} {pet.mood}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">Recursos</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Monedas:</span>
                    <span className="font-medium">{pet.coins}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gemas:</span>
                    <span className="font-medium">{pet.gems}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-lg">Estadísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Experiencia Total:</span>
                    <span className="font-medium">{pet.experience} XP</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Próximo Nivel:</span>
                    <span className="font-medium">{Math.round(pet.experienceToNext)} XP</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-lg">Estado Actual</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Hambre:</span>
                    <span className="font-medium">{Math.round(pet.stats.hunger)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Felicidad:</span>
                    <span className="font-medium">{Math.round(pet.stats.happiness)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energía:</span>
                    <span className="font-medium">{Math.round(pet.stats.energy)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Limpieza:</span>
                    <span className="font-medium">{Math.round(pet.stats.cleanliness)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Salud:</span>
                    <span className="font-medium">{Math.round(pet.stats.health)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // 🎮 RENDERIZAR MINIJUEGOS
  const renderGame = () => {
    switch (showGame) {

      case 'memory':
        return (
          <MemoryGame
            onGameEnd={(score, rewards) => handleGameReward('Memorama', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      case 'pong':
        return (
          <PongGame
            onGameEnd={(score, rewards) => handleGameReward('Pong', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      case 'simon':
        return (
          <SimonGame
            onGameEnd={(score, rewards) => handleGameReward('Simon Dice', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      case 'tetris':
        return (
          <TetrisGame
            onGameEnd={(score, rewards) => handleGameReward('Tetris', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      case 'breakout':
        return (
          <BreakoutGame
            onGameEnd={(score, rewards) => handleGameReward('Breakout', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      case '2048':
        return (
          <Game2048
            onGameEnd={(score, rewards) => handleGameReward('2048', score, rewards)}
            onClose={handleCloseGame}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 overflow-x-hidden ${showGame ? 'game-active' : ''}`}>
      {/* 🎮 HEADER */}
      <header className="bg-black/30 backdrop-blur-md border-b border-white/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-pulse">🎮</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Tamagotchi Pro & Retro Arcade</h1>
                <p className="text-sm text-white/80">Experiencia gaming profesional completa</p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-6 min-h-0">
          {/* 🎮 NAVEGACIÓN LATERAL */}
          <nav className={`
            lg:w-64 bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/20 lg:sticky lg:top-6 lg:self-start
            ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    className={`w-full justify-start text-white font-semibold ${
                      activeTab === item.id 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : 'hover:bg-white/20'
                    }`}
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </Button>
                )
              })}
            </div>
          </nav>

          {/* 🎮 CONTENIDO PRINCIPAL */}
          <main className="flex-1 min-w-0 overflow-auto">
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-purple-900/20">
              {renderActiveContent()}
            </div>
          </main>
        </div>
      </div>

      {/* 🎮 MODAL DE NOMBRE */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96 bg-gradient-to-br from-purple-600 to-pink-600 text-white border-0 shadow-2xl">
            <CardHeader>
              <CardTitle>Cambiar Nombre</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="Nuevo nombre"
                className="w-full p-3 border rounded-lg bg-white/20 text-white placeholder-white/70"
                onKeyPress={(e) => e.key === 'Enter' && handleChangeName()}
              />
              <div className="flex gap-2">
                <Button onClick={handleChangeName} className="flex-1 bg-green-500 hover:bg-green-600">
                  Cambiar
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowNameModal(false)
                    setPetName('')
                  }}
                  className="flex-1 border-white/30 text-white hover:bg-white/20"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 🎮 RENDERIZAR MINIJUEGOS */}
      {renderGame()}

      {/* 🎮 SISTEMAS DE ANIMACIÓN Y EFECTOS VISUALES */}
      <ParticleSystem
        active={showParticles.active}
        type={showParticles.type}
        duration={2000}
        intensity={20}
        position={{ x: 50, y: 40 }}
      />
      
      <VisualFeedback
        show={showFeedback.show}
        type={showFeedback.type}
        message={showFeedback.message}
        value={showFeedback.value}
        position={{ x: 50, y: 20 }}
        duration={2000}
      />

      {/* 🎮 ESTILOS DE ANIMACIÓN PERSONALIZADOS */}
      <AnimationStyles />
    </div>
  )
}
