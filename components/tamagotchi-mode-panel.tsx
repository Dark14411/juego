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
  Droplets,
  Activity,
  Star,
  Gift
} from 'lucide-react'

interface TamagotchiStats {
  hunger: number
  happiness: number
  energy: number
  health: number
  cleanliness: number
}

interface TamagotchiData {
  name: string
  level: number
  experience: number
  experienceToNext: number
  stats: TamagotchiStats
  mood: 'happy' | 'hungry' | 'tired' | 'dirty' | 'sick'
  lastUpdate: number
  isAlive: boolean
  coins: number
}

export default function TamagotchiModePanel() {
  const [tamagotchi, setTamagotchi] = useState<TamagotchiData>({
    name: 'Tama Pro',
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
    lastUpdate: Date.now(),
    isAlive: true,
    coins: 0
  })

  const [actionCooldowns, setActionCooldowns] = useState({
    feed: 0,
    play: 0,
    sleep: 0,
    clean: 0
  })

  // 🎮 DEGRADACIÓN AUTOMÁTICA DE STATS (CADA MINUTO)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!tamagotchi.isAlive) return

      setTamagotchi(prev => {
        const now = Date.now()
        const timeDiff = (now - prev.lastUpdate) / 1000 / 60 // minutos

        const degradationRate = 1 // puntos por minuto
        const newStats = {
          hunger: Math.max(0, prev.stats.hunger - degradationRate),
          happiness: Math.max(0, prev.stats.happiness - degradationRate * 0.8),
          energy: Math.max(0, prev.stats.energy - degradationRate * 0.6),
          health: Math.max(0, prev.stats.health - (prev.stats.hunger < 20 ? degradationRate * 2 : degradationRate * 0.3)),
          cleanliness: Math.max(0, prev.stats.cleanliness - degradationRate * 0.7)
        }

        // Determinar estado de ánimo
        let newMood: TamagotchiData['mood'] = 'happy'
        if (newStats.hunger < 30) newMood = 'hungry'
        if (newStats.energy < 20) newMood = 'tired'
        if (newStats.cleanliness < 25) newMood = 'dirty'
        if (newStats.health < 15) newMood = 'sick'

        // Verificar si está vivo
        const isAlive = newStats.health > 0 && newStats.hunger > 0

        if (!isAlive && prev.isAlive) {
          toast.error('💀 ¡Tu Tamagotchi necesita cuidados urgentes!')
        }

        return {
          ...prev,
          stats: newStats,
          mood: newMood,
          isAlive,
          lastUpdate: now
        }
      })
    }, 60000) // Cada minuto

    return () => clearInterval(interval)
  }, [tamagotchi.isAlive])

  // 🎮 COOLDOWNS
  useEffect(() => {
    const interval = setInterval(() => {
      setActionCooldowns(prev => ({
        feed: Math.max(0, prev.feed - 1),
        play: Math.max(0, prev.play - 1),
        sleep: Math.max(0, prev.sleep - 1),
        clean: Math.max(0, prev.clean - 1)
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 🎮 ACCIONES CON FEEDBACK VISUAL
  const feedTamagotchi = () => {
    if (actionCooldowns.feed > 0) {
      toast.warning(`Espera ${actionCooldowns.feed}s antes de alimentar otra vez`)
      return
    }

    if (!tamagotchi.isAlive) {
      toast.error('¡Primero necesitas revivir a tu Tamagotchi!')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        hunger: Math.min(100, prev.stats.hunger + 25),
        health: Math.min(100, prev.stats.health + 5)
      },
      experience: prev.experience + 5,
      coins: prev.coins + 1
    }))

    setActionCooldowns(prev => ({ ...prev, feed: 10 }))
    toast.success('🍎 ¡Alimentado! +1 moneda')
  }

  const playWithTamagotchi = () => {
    if (actionCooldowns.play > 0) {
      toast.warning(`Espera ${actionCooldowns.play}s antes de jugar otra vez`)
      return
    }

    if (!tamagotchi.isAlive) {
      toast.error('¡Primero necesitas revivir a tu Tamagotchi!')
      return
    }

    if (tamagotchi.stats.energy < 15) {
      toast.warning('¡Tu Tamagotchi está muy cansado para jugar!')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        happiness: Math.min(100, prev.stats.happiness + 30),
        energy: Math.max(0, prev.stats.energy - 10)
      },
      experience: prev.experience + 10,
      coins: prev.coins + 2
    }))

    setActionCooldowns(prev => ({ ...prev, play: 15 }))
    toast.success('🎮 ¡Jugando! +2 monedas')
  }

  const sleepTamagotchi = () => {
    if (actionCooldowns.sleep > 0) {
      toast.warning(`Espera ${actionCooldowns.sleep}s antes de dormir otra vez`)
      return
    }

    if (!tamagotchi.isAlive) {
      toast.error('¡Primero necesitas revivir a tu Tamagotchi!')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        energy: Math.min(100, prev.stats.energy + 40),
        health: Math.min(100, prev.stats.health + 10)
      },
      experience: prev.experience + 8,
      coins: prev.coins + 1
    }))

    setActionCooldowns(prev => ({ ...prev, sleep: 20 }))
    toast.success('😴 ¡Descansando! +1 moneda')
  }

  const cleanTamagotchi = () => {
    if (actionCooldowns.clean > 0) {
      toast.warning(`Espera ${actionCooldowns.clean}s antes de limpiar otra vez`)
      return
    }

    if (!tamagotchi.isAlive) {
      toast.error('¡Primero necesitas revivir a tu Tamagotchi!')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        cleanliness: 100,
        happiness: Math.min(100, prev.stats.happiness + 15)
      },
      experience: prev.experience + 7,
      coins: prev.coins + 1
    }))

    setActionCooldowns(prev => ({ ...prev, clean: 12 }))
    toast.success('🧼 ¡Limpio! +1 moneda')
  }

  const reviveTamagotchi = () => {
    if (tamagotchi.coins < 10) {
      toast.error('Necesitas 10 monedas para revivir')
      return
    }

    setTamagotchi(prev => ({
      ...prev,
      stats: {
        hunger: 80,
        happiness: 80,
        energy: 80,
        health: 80,
        cleanliness: 80
      },
      mood: 'happy',
      isAlive: true,
      coins: prev.coins - 10
    }))

    toast.success('✨ ¡Tamagotchi revivido! -10 monedas')
  }

  // 🎮 LEVEL UP
  useEffect(() => {
    if (tamagotchi.experience >= tamagotchi.experienceToNext) {
      setTamagotchi(prev => ({
        ...prev,
        level: prev.level + 1,
        experience: prev.experience - prev.experienceToNext,
        experienceToNext: Math.floor(prev.experienceToNext * 1.5),
        coins: prev.coins + prev.level * 5
      }))
      toast.success(`🎉 ¡Nivel ${tamagotchi.level + 1}! +${(tamagotchi.level + 1) * 5} monedas`)
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

  const getStatColor = (value: number) => {
    if (value >= 70) return '#10b981' // verde
    if (value >= 40) return '#f59e0b' // amarillo
    return '#ef4444' // rojo
  }

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto">
      {/* 🎮 HEADER */}
      <Card className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <Gamepad2 className="w-10 h-10 text-purple-300" />
            🐾 Modo Tamagotchi Pro
            <Badge variant="secondary" className="bg-white/20 text-white">
              Nivel {tamagotchi.level}
            </Badge>
          </CardTitle>
          <p className="text-lg opacity-90">
            Cuida de tu mascota digital profesional
          </p>
        </CardHeader>
      </Card>

      {/* 🎮 TAMAGOTCHI PRINCIPAL */}
      <Card className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white border-0 shadow-2xl">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* VISUALIZACIÓN */}
            <div className="text-center">
              <div className="relative inline-block mb-6">
                <div className="w-48 h-48 bg-gradient-to-br from-indigo-800 to-purple-800 rounded-full border-4 border-purple-400 shadow-2xl flex items-center justify-center">
                  {!tamagotchi.isAlive ? (
                    <div className="text-6xl">💀</div>
                  ) : (
                    <div className="text-6xl animate-bounce">{getMoodIcon()}</div>
                  )}
                </div>
                {tamagotchi.isAlive && (
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-lg font-bold">
                    {tamagotchi.level}
                  </div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-2">{tamagotchi.name}</h2>
              <div className="flex items-center justify-center gap-4 mb-4">
                <Badge className="bg-yellow-500/20 text-yellow-300">
                  💰 {tamagotchi.coins} monedas
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-300">
                  ⭐ {tamagotchi.experience}/{tamagotchi.experienceToNext} XP
                </Badge>
              </div>

              {!tamagotchi.isAlive && (
                <Button 
                  onClick={reviveTamagotchi}
                  disabled={tamagotchi.coins < 10}
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Revivir (10 💰)
                </Button>
              )}
            </div>

            {/* ESTADÍSTICAS */}
            <div className="space-y-6">
              {Object.entries(tamagotchi.stats).map(([stat, value]) => (
                <div key={stat} className="bg-white/10 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold capitalize flex items-center gap-2">
                      {stat === 'hunger' && <Utensils className="w-4 h-4" />}
                      {stat === 'happiness' && <Heart className="w-4 h-4" />}
                      {stat === 'energy' && <Activity className="w-4 h-4" />}
                      {stat === 'health' && <Star className="w-4 h-4" />}
                      {stat === 'cleanliness' && <Droplets className="w-4 h-4" />}
                      {stat === 'hunger' ? 'Hambre' : 
                       stat === 'happiness' ? 'Felicidad' :
                       stat === 'energy' ? 'Energía' :
                       stat === 'health' ? 'Salud' : 'Limpieza'}
                    </span>
                    <span className="font-bold">{Math.round(value)}%</span>
                  </div>
                  <Progress 
                    value={value} 
                    className="h-3"
                    style={{
                      '--progress-background': 'rgba(255,255,255,0.2)',
                      '--progress-foreground': getStatColor(value)
                    } as React.CSSProperties}
                  />
                </div>
              ))}

              {/* BARRA DE EXPERIENCIA */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">🎯 Experiencia</span>
                  <span className="font-bold">{tamagotchi.experience}/{tamagotchi.experienceToNext}</span>
                </div>
                <Progress 
                  value={(tamagotchi.experience / tamagotchi.experienceToNext) * 100} 
                  className="h-3"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🎮 ACCIONES */}
      {tamagotchi.isAlive && (
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Acciones de Cuidado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={feedTamagotchi}
                disabled={actionCooldowns.feed > 0}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 transition-all"
              >
                <Utensils className="w-5 h-5 mr-2" />
                Alimentar
                {actionCooldowns.feed > 0 && (
                  <div className="ml-2 text-xs">({actionCooldowns.feed}s)</div>
                )}
              </Button>

              <Button
                onClick={playWithTamagotchi}
                disabled={actionCooldowns.play > 0 || tamagotchi.stats.energy < 15}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 transition-all"
              >
                <Gamepad2 className="w-5 h-5 mr-2" />
                Jugar
                {actionCooldowns.play > 0 && (
                  <div className="ml-2 text-xs">({actionCooldowns.play}s)</div>
                )}
              </Button>

              <Button
                onClick={sleepTamagotchi}
                disabled={actionCooldowns.sleep > 0}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 transition-all"
              >
                <Bed className="w-5 h-5 mr-2" />
                Dormir
                {actionCooldowns.sleep > 0 && (
                  <div className="ml-2 text-xs">({actionCooldowns.sleep}s)</div>
                )}
              </Button>

              <Button
                onClick={cleanTamagotchi}
                disabled={actionCooldowns.clean > 0}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 px-6 transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Limpiar
                {actionCooldowns.clean > 0 && (
                  <div className="ml-2 text-xs">({actionCooldowns.clean}s)</div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎮 INFORMACIÓN */}
      <Card className="bg-gradient-to-br from-emerald-900 to-teal-900 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle>📖 Guía del Tamagotchi Pro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3">🎯 Cómo Cuidar:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Alimentar:</strong> Reduce hambre, da salud (+1 💰)</li>
                <li>• <strong>Jugar:</strong> Aumenta felicidad, consume energía (+2 💰)</li>
                <li>• <strong>Dormir:</strong> Recupera energía y salud (+1 💰)</li>
                <li>• <strong>Limpiar:</strong> Restaura limpieza al 100% (+1 💰)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3">⚡ Sistema Automático:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Las estadísticas <strong>bajan cada minuto</strong></li>
                <li>• Ganás experiencia con cada acción</li>
                <li>• Al subir de nivel ganás monedas bonus</li>
                <li>• Revivir cuesta 10 monedas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}