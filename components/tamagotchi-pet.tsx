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
  Gamepad2, 
  Bed, 
  Sparkles,
  Zap,
  Star,
  Gift,
  Clock,
  Activity
} from 'lucide-react'

interface TamagotchiStats {
  hunger: number
  happiness: number
  energy: number
  health: number
  cleanliness: number
}

interface TamagotchiPet {
  name: string
  level: number
  experience: number
  experienceToNext: number
  stats: TamagotchiStats
  mood: 'happy' | 'hungry' | 'tired' | 'dirty' | 'sick'
  lastFed: number
  lastPlayed: number
  lastSlept: number
  lastCleaned: number
  evolutionStage: number
  isAlive: boolean
}

export default function TamagotchiPet() {
  const [tamagotchi, setTamagotchi] = useState<TamagotchiPet>({
    name: 'Tama',
    level: 1,
    experience: 0,
    experienceToNext: 100,
    stats: {
      hunger: 100,
      happiness: 100,
      energy: 100,
      health: 100,
      cleanliness: 100
    },
    mood: 'happy',
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    lastSlept: Date.now(),
    lastCleaned: Date.now(),
    evolutionStage: 1,
    isAlive: true
  })

  const [showActions, setShowActions] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)

  // 🎮 UPDATE TAMAGOTCHI STATS OVER TIME
  useEffect(() => {
    const interval = setInterval(() => {
      if (!tamagotchi.isAlive) return

      setTamagotchi(prev => {
        const now = Date.now()
        const timeDiff = (now - Math.max(prev.lastFed, prev.lastPlayed, prev.lastSlept, prev.lastCleaned)) / 1000 / 60 // minutes

        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - timeDiff * 2),
          happiness: Math.max(0, prev.stats.happiness - timeDiff * 1.5),
          energy: Math.max(0, prev.stats.energy - timeDiff * 1),
          health: Math.max(0, prev.stats.health - timeDiff * 0.5),
          cleanliness: Math.max(0, prev.stats.cleanliness - timeDiff * 1.2)
        }

        // 🎮 DETERMINE MOOD
        let newMood: TamagotchiPet['mood'] = 'happy'
        if (newStats.hunger < 30) newMood = 'hungry'
        if (newStats.energy < 20) newMood = 'tired'
        if (newStats.cleanliness < 25) newMood = 'dirty'
        if (newStats.health < 15) newMood = 'sick'

        // 🎮 CHECK IF TAMAGOTCHI IS ALIVE
        const isAlive = newStats.health > 0 && newStats.hunger > 0

        return {
          ...prev,
          stats: newStats,
          mood: newMood,
          isAlive
        }
      })
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [tamagotchi.isAlive])

  // 🎮 FEED TAMAGOTCHI
  const feedTamagotchi = () => {
    if (!tamagotchi.isAlive) {
      toast.error('Tu Tamagotchi necesita ser revivido primero')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: Math.min(100, prev.stats.hunger + 30),
        health: Math.min(100, prev.stats.health + 10)
      },
      lastFed: Date.now(),
      experience: prev.experience + 5
    }))
    toast.success('¡Tama está comiendo! 🍎')
  }

  // 🎮 PLAY WITH TAMAGOTCHI
  const playWithTamagotchi = () => {
    if (!tamagotchi.isAlive) {
      toast.error('Tu Tamagotchi necesita ser revivido primero')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 25),
        energy: Math.max(0, prev.stats.energy - 15)
      },
      lastPlayed: Date.now(),
      experience: prev.experience + 10
    }))
    toast.success('¡Tama está jugando! 🎮')
  }

  // 🎮 PUT TAMAGOTCHI TO SLEEP
  const sleepTamagotchi = () => {
    if (!tamagotchi.isAlive) {
      toast.error('Tu Tamagotchi necesita ser revivido primero')
      return
    }

    setIsSleeping(true)
    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 50),
        health: Math.min(100, prev.stats.health + 20)
      },
      lastSlept: Date.now(),
      experience: prev.experience + 8
    }))
    toast.success('¡Tama está durmiendo! 😴')

    setTimeout(() => {
      setIsSleeping(false)
    }, 5000)
  }

  // 🎮 CLEAN TAMAGOTCHI
  const cleanTamagotchi = () => {
    if (!tamagotchi.isAlive) {
      toast.error('Tu Tamagotchi necesita ser revivido primero')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        cleanliness: 100,
        happiness: Math.min(100, prev.stats.happiness + 15)
      },
      lastCleaned: Date.now(),
      experience: prev.experience + 7
    }))
    toast.success('¡Tama está limpio! 🧼')
  }

  // 🎮 REVIVE TAMAGOTCHI
  const reviveTamagotchi = () => {
    setTamagotchi(prev => ({
      ...prev,
      stats: {
        hunger: 100,
        happiness: 100,
        energy: 100,
        health: 100,
        cleanliness: 100
      },
      mood: 'happy',
      isAlive: true,
      lastFed: Date.now(),
      lastPlayed: Date.now(),
      lastSlept: Date.now(),
      lastCleaned: Date.now()
    }))
    toast.success('¡Tama ha sido revivido! ✨')
  }

  // 🎮 CHECK LEVEL UP
  useEffect(() => {
    if (tamagotchi.experience >= tamagotchi.experienceToNext) {
      setTamagotchi(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: Math.floor(prev.experienceToNext * 1.5),
        evolutionStage: Math.min(3, Math.floor(prev.level / 5) + 1)
      }))
      toast.success(`¡Tama subió al nivel ${tamagotchi.level + 1}! 🎉`)
    }
  }, [tamagotchi.experience, tamagotchi.experienceToNext])

  const getMoodIcon = () => {
    switch (tamagotchi.mood) {
      case 'happy': return '😊'
      case 'hungry': return '🍽️'
      case 'tired': return '😴'
      case 'dirty': return '🤢'
      case 'sick': return '🤒'
      default: return '😊'
    }
  }

  const getEvolutionStage = () => {
    switch (tamagotchi.evolutionStage) {
      case 1: return 'Huevo'
      case 2: return 'Bebé'
      case 3: return 'Adulto'
      default: return 'Huevo'
    }
  }

  return (
    <div className="space-y-6">
      {/* 🎮 TAMAGOTCHI MAIN CARD */}
      <Card className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Gamepad2 className="w-8 h-8 text-purple-300" />
            Tamagotchi Virtual
            <Badge variant="secondary" className="bg-white/20 text-white">
              Nivel {tamagotchi.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 🎮 TAMAGOTCHI DISPLAY */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-indigo-900 to-purple-900 rounded-full border-4 border-purple-400 shadow-2xl flex items-center justify-center">
                  {!tamagotchi.isAlive ? (
                    <div className="text-4xl">💀</div>
                  ) : isSleeping ? (
                    <div className="text-4xl">😴</div>
                  ) : (
                    <div className="text-4xl">{getMoodIcon()}</div>
                  )}
                </div>
                {tamagotchi.isAlive && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-xs font-bold">
                    {tamagotchi.evolutionStage}
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold mt-4">{tamagotchi.name}</h3>
              <p className="text-sm opacity-80">{getEvolutionStage()}</p>
              
              {!tamagotchi.isAlive && (
                <Button 
                  onClick={reviveTamagotchi}
                  className="mt-4 bg-red-500 hover:bg-red-600"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Revivir
                </Button>
              )}
            </div>

            {/* 🎮 STATS */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Hambre</span>
                  <span>{Math.round(tamagotchi.stats.hunger)}%</span>
                </div>
                <Progress 
                  value={tamagotchi.stats.hunger} 
                  className="h-2"
                  style={{
                    '--progress-background': 'rgba(255,255,255,0.2)',
                    '--progress-foreground': tamagotchi.stats.hunger < 30 ? '#ef4444' : '#10b981'
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Felicidad</span>
                  <span>{Math.round(tamagotchi.stats.happiness)}%</span>
                </div>
                <Progress 
                  value={tamagotchi.stats.happiness} 
                  className="h-2"
                  style={{
                    '--progress-background': 'rgba(255,255,255,0.2)',
                    '--progress-foreground': tamagotchi.stats.happiness < 30 ? '#ef4444' : '#f59e0b'
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Energía</span>
                  <span>{Math.round(tamagotchi.stats.energy)}%</span>
                </div>
                <Progress 
                  value={tamagotchi.stats.energy} 
                  className="h-2"
                  style={{
                    '--progress-background': 'rgba(255,255,255,0.2)',
                    '--progress-foreground': tamagotchi.stats.energy < 20 ? '#ef4444' : '#3b82f6'
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Salud</span>
                  <span>{Math.round(tamagotchi.stats.health)}%</span>
                </div>
                <Progress 
                  value={tamagotchi.stats.health} 
                  className="h-2"
                  style={{
                    '--progress-background': 'rgba(255,255,255,0.2)',
                    '--progress-foreground': tamagotchi.stats.health < 15 ? '#ef4444' : '#10b981'
                  } as React.CSSProperties}
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Limpieza</span>
                  <span>{Math.round(tamagotchi.stats.cleanliness)}%</span>
                </div>
                <Progress 
                  value={tamagotchi.stats.cleanliness} 
                  className="h-2"
                  style={{
                    '--progress-background': 'rgba(255,255,255,0.2)',
                    '--progress-foreground': tamagotchi.stats.cleanliness < 25 ? '#ef4444' : '#8b5cf6'
                  } as React.CSSProperties}
                />
              </div>

              {/* 🎮 EXPERIENCE */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Experiencia</span>
                  <span>{tamagotchi.experience}/{tamagotchi.experienceToNext}</span>
                </div>
                <Progress 
                  value={(tamagotchi.experience / tamagotchi.experienceToNext) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎮 ACTIONS */}
      {tamagotchi.isAlive && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Acciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={feedTamagotchi}
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isSleeping}
              >
                <Utensils className="w-4 h-4 mr-2" />
                Alimentar
              </Button>

              <Button
                onClick={playWithTamagotchi}
                className="bg-green-500 hover:bg-green-600 text-white"
                disabled={isSleeping}
              >
                <Gamepad2 className="w-4 h-4 mr-2" />
                Jugar
              </Button>

              <Button
                onClick={sleepTamagotchi}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isSleeping}
              >
                <Bed className="w-4 h-4 mr-2" />
                Dormir
              </Button>

              <Button
                onClick={cleanTamagotchi}
                className="bg-purple-500 hover:bg-purple-600 text-white"
                disabled={isSleeping}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Limpiar
              </Button>
            </div>

            {isSleeping && (
              <div className="mt-4 text-center text-yellow-300">
                <Clock className="w-4 h-4 inline mr-2" />
                Tama está durmiendo... 😴
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 🎮 INFO CARD */}
      <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6" />
            Información del Tamagotchi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">🎮 Cómo Cuidar tu Tamagotchi:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Alimentar:</strong> Mantén su hambre baja</li>
                <li>• <strong>Jugar:</strong> Aumenta su felicidad</li>
                <li>• <strong>Dormir:</strong> Recupera energía y salud</li>
                <li>• <strong>Limpiar:</strong> Mantén la higiene</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">📈 Evolución:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Etapa 1 (Huevo):</span>
                  <span>Nivel 1-4</span>
                </div>
                <div className="flex justify-between">
                  <span>Etapa 2 (Bebé):</span>
                  <span>Nivel 5-9</span>
                </div>
                <div className="flex justify-between">
                  <span>Etapa 3 (Adulto):</span>
                  <span>Nivel 10+</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 