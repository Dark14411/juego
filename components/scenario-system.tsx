'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  MapPin, 
  Unlock,
  Star,
  Sparkles,
  Timer,
  Globe,
  Mountain,
  Waves,
  TreePine,
  Zap
} from 'lucide-react'

interface ScenarioData {
  id: number
  name: string
  description: string
  backgroundUrl: string
  backgroundType: 'static' | 'animated'
  theme: 'mystical' | 'nature' | 'cosmic' | 'adventure'
  unlocked: boolean
  unlockCondition: string
  requiredLevel: number
  mood: 'peaceful' | 'energetic' | 'mysterious' | 'exciting'
  effects: {
    statBonus: string
    moodBonus: number
    specialAbility?: string
  }
}

interface ScenarioSystemProps {
  currentScenarioId: number
  onScenarioChange: (scenarioId: number) => void
  playerLevel: number
  playerScore: number
}

const SCENARIOS_DATA: ScenarioData[] = [
  {
    id: 1,
    name: "Jardín Tranquilo",
    description: "Un lugar sereno donde tu Pou puede relajarse y meditar",
    backgroundUrl: "/escenarios/download.jpg",
    backgroundType: "static",
    theme: "nature",
    unlocked: true,
    unlockCondition: "Disponible desde el inicio",
    requiredLevel: 1,
    mood: "peaceful",
    effects: {
      statBonus: "Felicidad +10% por hora",
      moodBonus: 5,
      specialAbility: "Regeneración lenta de energía"
    }
  },
  {
    id: 2,
    name: "Portal Dimensional",
    description: "Un nexo entre mundos donde la magia fluye libremente",
    backgroundUrl: "/escenarios/46ac9e282d3c303934a72d941845785b.gif",
    backgroundType: "animated",
    theme: "mystical",
    unlocked: false,
    unlockCondition: "Alcanza nivel 3 y gana 100 puntos en minijuegos",
    requiredLevel: 3,
    mood: "mysterious",
    effects: {
      statBonus: "Experiencia +15% en minijuegos",
      moodBonus: 8,
      specialAbility: "Posibilidad de encontrar gemas especiales"
    }
  },
  {
    id: 3,
    name: "Tormenta Cósmica",
    description: "Un escenario épico lleno de energía y aventura infinita",
    backgroundUrl: "/escenarios/a98a1fe05019c395040c7872f7a26be4.gif",
    backgroundType: "animated",
    theme: "cosmic",
    unlocked: false,
    unlockCondition: "Alcanza nivel 5 y completa 50 minijuegos",
    requiredLevel: 5,
    mood: "exciting",
    effects: {
      statBonus: "Todas las stats +20%",
      moodBonus: 15,
      specialAbility: "Multiplicador x2 en recompensas"
    }
  },
  {
    id: 4,
    name: "Reino Flotante",
    description: "Un mundo mágico suspendido en las nubes eternas",
    backgroundUrl: "/escenarios/PruebaEscenario 2022-10-02 16-01-40-original.webp",
    backgroundType: "static",
    theme: "adventure",
    unlocked: false,
    unlockCondition: "Nivel 10 y poseer avatar épico",
    requiredLevel: 10,
    mood: "energetic",
    effects: {
      statBonus: "Velocidad de juego +25%",
      moodBonus: 12,
      specialAbility: "Acceso a minijuegos exclusivos"
    }
  }
]

const THEME_COLORS = {
  mystical: "from-purple-600 to-indigo-800",
  nature: "from-green-600 to-emerald-800", 
  cosmic: "from-blue-600 to-purple-800",
  adventure: "from-orange-600 to-red-800"
}

const THEME_ICONS = {
  mystical: Sparkles,
  nature: TreePine,
  cosmic: Zap,
  adventure: Mountain
}

export default function ScenarioSystem({ 
  currentScenarioId, 
  onScenarioChange, 
  playerLevel,
  playerScore 
}: ScenarioSystemProps) {
  const [scenarios, setScenarios] = useState<ScenarioData[]>(SCENARIOS_DATA)
  const [selectedScenario, setSelectedScenario] = useState(currentScenarioId)

  // 🎮 VERIFICAR DESBLOQUEOS AUTOMÁTICOS
  useEffect(() => {
    setScenarios(prev => prev.map(scenario => {
      if (!scenario.unlocked && playerLevel >= scenario.requiredLevel) {
        // Verificar condiciones adicionales
        if (scenario.id === 2 && playerScore >= 100) {
          toast.success(`¡Escenario "${scenario.name}" desbloqueado!`)
          return { ...scenario, unlocked: true }
        }
        if (scenario.id === 3 && playerScore >= 500) {
          toast.success(`¡Escenario épico "${scenario.name}" desbloqueado!`)
          return { ...scenario, unlocked: true }
        }
      }
      return scenario
    }))
  }, [playerLevel, playerScore])

  // 🎮 CAMBIAR ESCENARIO
  const changeScenario = (scenarioId: number) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    if (!scenario || !scenario.unlocked) {
      toast.error("Escenario no disponible", {
        description: scenario?.unlockCondition || "Requisitos no cumplidos"
      })
      return
    }

    setSelectedScenario(scenarioId)
    onScenarioChange(scenarioId)
    toast.success(`Escenario cambiado a "${scenario.name}"`, {
      description: scenario.effects.statBonus
    })
  }

  const currentScenario = scenarios.find(s => s.id === selectedScenario)

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-gray-900 to-zinc-900 text-white border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <Globe className="w-8 h-8 text-blue-400" />
          Escenarios Mágicos
          <Badge variant="secondary" className="bg-blue-600 text-white">
            {scenarios.filter(s => s.unlocked).length}/{scenarios.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 🎮 ESCENARIO ACTUAL */}
        <div className={`bg-gradient-to-r ${THEME_COLORS[currentScenario?.theme || 'mystical']} rounded-lg p-4 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            {currentScenario?.backgroundType === 'animated' ? (
              <img 
                src={currentScenario.backgroundUrl} 
                alt="Background"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-transparent to-black/30" />
            )}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-6 h-6 text-white" />
              <h3 className="font-bold text-xl">{currentScenario?.name}</h3>
              <Badge className="bg-white/20 text-white">
                {currentScenario?.backgroundType === 'animated' ? '🎬 ANIMADO' : '🖼️ ESTÁTICO'}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mb-3">{currentScenario?.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div>💫 {currentScenario?.effects.statBonus}</div>
              <div>😊 Estado de ánimo: +{currentScenario?.effects.moodBonus}</div>
              {currentScenario?.effects.specialAbility && (
                <div className="md:col-span-2">
                  ✨ {currentScenario.effects.specialAbility}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🎮 GALERÍA DE ESCENARIOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarios.map((scenario) => {
            const ThemeIcon = THEME_ICONS[scenario.theme]
            const isUnlocked = scenario.unlocked
            const isCurrent = selectedScenario === scenario.id

            return (
              <Card 
                key={scenario.id} 
                className={`
                  relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                  ${isCurrent 
                    ? 'border-blue-400 shadow-lg shadow-blue-400/50' 
                    : isUnlocked 
                      ? 'border-gray-600 hover:border-blue-300' 
                      : 'border-gray-800 opacity-75'
                  }
                `}
                onClick={() => changeScenario(scenario.id)}
              >
                {/* 🎮 BACKGROUND PREVIEW */}
                <div className="h-32 relative overflow-hidden">
                  <img 
                    src={scenario.backgroundUrl} 
                    alt={scenario.name}
                    className={`
                      w-full h-full object-cover transition-all duration-300
                      ${isUnlocked ? 'opacity-100' : 'opacity-50 grayscale'}
                    `}
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${THEME_COLORS[scenario.theme]} opacity-60`} />
                  
                  {/* 🎮 STATUS INDICATORS */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {scenario.backgroundType === 'animated' && (
                      <Badge className="bg-red-500 text-white text-xs">LIVE</Badge>
                    )}
                    {!isUnlocked && (
                      <Badge className="bg-gray-800 text-white text-xs">
                        <Unlock className="w-3 h-3 mr-1" />
                        LV.{scenario.requiredLevel}
                      </Badge>
                    )}
                    {isCurrent && (
                      <Badge className="bg-green-500 text-white text-xs">ACTIVO</Badge>
                    )}
                  </div>

                  {/* 🎮 THEME ICON */}
                  <div className="absolute bottom-2 left-2">
                    <ThemeIcon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      {scenario.name}
                      <Badge variant="outline" className="text-xs">
                        {scenario.theme.toUpperCase()}
                      </Badge>
                    </h3>
                    
                    <p className="text-sm opacity-80 h-10 overflow-hidden">
                      {scenario.description}
                    </p>

                    {/* 🎮 EFFECTS PREVIEW */}
                    <div className="space-y-1 text-xs">
                      <div className="text-blue-400">
                        💫 {scenario.effects.statBonus}
                      </div>
                      <div className="text-green-400">
                        😊 Mood: +{scenario.effects.moodBonus}
                      </div>
                    </div>

                    {/* 🎮 UNLOCK PROGRESS */}
                    {!isUnlocked && (
                      <div className="space-y-1">
                        <div className="text-xs opacity-70">
                          Progreso de desbloqueo:
                        </div>
                        <Progress 
                          value={Math.min(100, (playerLevel / scenario.requiredLevel) * 100)} 
                          className="h-2"
                        />
                        <div className="text-xs opacity-70">
                          Nivel {playerLevel}/{scenario.requiredLevel}
                        </div>
                      </div>
                    )}

                    {/* 🎮 ACTION BUTTON */}
                    <Button
                      className={`
                        w-full text-xs
                        ${isCurrent 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : isUnlocked 
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-gray-600 cursor-not-allowed'
                        }
                      `}
                      size="sm"
                      disabled={!isUnlocked}
                    >
                      {isCurrent ? '✅ Escenario Activo' : isUnlocked ? '🌟 Seleccionar' : '🔒 Bloqueado'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 🎮 EFECTOS DEL ESCENARIO ACTUAL */}
        <div className="bg-black/30 rounded-lg p-4">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Efectos Activos del Escenario
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-500/20 rounded-lg p-3 text-center">
              <div className="text-blue-400 font-bold">Bonificación</div>
              <div>{currentScenario?.effects.statBonus}</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 text-center">
              <div className="text-green-400 font-bold">Estado</div>
              <div>+{currentScenario?.effects.moodBonus} felicidad</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 text-center">
              <div className="text-purple-400 font-bold">Especial</div>
              <div>{currentScenario?.effects.specialAbility || 'Ninguno'}</div>
            </div>
          </div>
        </div>

        {/* 🎮 PRÓXIMAS CARACTERÍSTICAS */}
        <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg p-4 border border-cyan-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold">Próximamente</h3>
          </div>
          <div className="text-sm opacity-80 space-y-1">
            <div>• Escenarios con clima dinámico</div>
            <div>• Eventos temporales en escenarios</div>
            <div>• Mascotas especiales por escenario</div>
            <div>• Editor de escenarios personalizado</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}