'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Palette, 
  Sun, 
  Moon,
  Sparkles,
  Crown,
  Heart,
  Zap,
  Flame,
  Snowflake,
  Waves
} from 'lucide-react'

interface ThemeData {
  id: string
  name: string
  description: string
  icon: any
  colors: {
    primary: string
    secondary: string
    background: string
    accent: string
    text: string
  }
  gradient: string
  mood: 'energetic' | 'calm' | 'mystical' | 'playful' | 'elegant'
  unlocked: boolean
  cost: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

interface ThemeSystemProps {
  currentTheme: string
  onThemeChange: (themeId: string) => void
  playerCoins: number
  onSpendCoins: (amount: number) => void
}

const THEMES_DATA: ThemeData[] = [
  {
    id: 'default',
    name: 'Aurora Mágica',
    description: 'El tema clásico con colores vibrantes y energía pura',
    icon: Sparkles,
    colors: {
      primary: '#8B5CF6',
      secondary: '#EC4899', 
      background: '#1F2937',
      accent: '#F59E0B',
      text: '#FFFFFF'
    },
    gradient: 'from-purple-600 via-pink-500 to-amber-500',
    mood: 'energetic',
    unlocked: true,
    cost: 0,
    rarity: 'common'
  },
  {
    id: 'solar',
    name: 'Resplandor Solar',
    description: 'Colores cálidos que irradian energía y felicidad',
    icon: Sun,
    colors: {
      primary: '#F59E0B',
      secondary: '#EF4444',
      background: '#451A03',
      accent: '#FBBF24',
      text: '#FEFCE8'
    },
    gradient: 'from-yellow-400 via-orange-500 to-red-600',
    mood: 'playful',
    unlocked: false,
    cost: 100,
    rarity: 'rare'
  },
  {
    id: 'lunar',
    name: 'Serenidad Lunar',
    description: 'Tonos fríos y místicos para una experiencia relajante',
    icon: Moon,
    colors: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      background: '#0F172A',
      accent: '#8B5CF6',
      text: '#E2E8F0'
    },
    gradient: 'from-blue-600 via-indigo-600 to-purple-600',
    mood: 'calm',
    unlocked: false,
    cost: 150,
    rarity: 'rare'
  },
  {
    id: 'forest',
    name: 'Bosque Encantado',
    description: 'Verde natural que conecta con la naturaleza',
    icon: Sparkles,
    colors: {
      primary: '#10B981',
      secondary: '#059669',
      background: '#064E3B',
      accent: '#34D399',
      text: '#ECFDF5'
    },
    gradient: 'from-emerald-500 via-green-600 to-teal-600',
    mood: 'calm',
    unlocked: false,
    cost: 200,
    rarity: 'epic'
  },
  {
    id: 'fire',
    name: 'Llama Épica',
    description: 'Poder del fuego para los verdaderos guerreros',
    icon: Flame,
    colors: {
      primary: '#DC2626',
      secondary: '#EA580C',
      background: '#7F1D1D',
      accent: '#F59E0B',
      text: '#FEF2F2'
    },
    gradient: 'from-red-600 via-orange-600 to-yellow-500',
    mood: 'energetic',
    unlocked: false,
    cost: 300,
    rarity: 'epic'
  },
  {
    id: 'ice',
    name: 'Cristal de Hielo',
    description: 'Elegancia helada con destellos cristalinos',
    icon: Snowflake,
    colors: {
      primary: '#06B6D4',
      secondary: '#0891B2',
      background: '#164E63',
      accent: '#67E8F9',
      text: '#F0F9FF'
    },
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    mood: 'elegant',
    unlocked: false,
    cost: 400,
    rarity: 'epic'
  },
  {
    id: 'cosmic',
    name: 'Poder Cósmico',
    description: 'El universo infinito en tus manos',
    icon: Crown,
    colors: {
      primary: '#7C3AED',
      secondary: '#A855F7',
      background: '#1E1B4B',
      accent: '#F472B6',
      text: '#FAF5FF'
    },
    gradient: 'from-violet-600 via-purple-600 to-pink-600',
    mood: 'mystical',
    unlocked: false,
    cost: 1000,
    rarity: 'legendary'
  }
]

const RARITY_COLORS = {
  common: 'border-gray-500 bg-gray-500/20',
  rare: 'border-blue-500 bg-blue-500/20',
  epic: 'border-purple-500 bg-purple-500/20',
  legendary: 'border-yellow-500 bg-yellow-500/20'
}

export default function ThemeSystem({ 
  currentTheme, 
  onThemeChange, 
  playerCoins, 
  onSpendCoins 
}: ThemeSystemProps) {
  const [themes, setThemes] = useState<ThemeData[]>(THEMES_DATA)
  const [previewTheme, setPreviewTheme] = useState<string | null>(null)

  // 🎮 DESBLOQUEAR TEMA
  const unlockTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme || theme.unlocked) return

    if (playerCoins >= theme.cost) {
      setThemes(prev => prev.map(t => 
        t.id === themeId ? { ...t, unlocked: true } : t
      ))
      onSpendCoins(theme.cost)
      toast.success(`¡Tema "${theme.name}" desbloqueado!`, {
        description: `Gastaste ${theme.cost} monedas`
      })
    } else {
      toast.error("No tienes suficientes monedas", {
        description: `Necesitas ${theme.cost - playerCoins} monedas más`
      })
    }
  }

  // 🎮 CAMBIAR TEMA
  const changeTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme || !theme.unlocked) return

    onThemeChange(themeId)
    toast.success(`Tema cambiado a "${theme.name}"`, {
      description: theme.description
    })
  }

  // 🎮 PREVIEW TEMA
  const previewThemeColors = (themeId: string | null) => {
    setPreviewTheme(themeId)
  }

  const activeTheme = themes.find(t => t.id === currentTheme)
  const displayTheme = previewTheme 
    ? themes.find(t => t.id === previewTheme) 
    : activeTheme

  return (
    <div 
      className="transition-all duration-500"
      style={{
        background: previewTheme 
          ? `linear-gradient(135deg, ${themes.find(t => t.id === previewTheme)?.colors.background}cc, ${themes.find(t => t.id === previewTheme)?.colors.primary}22)`
          : undefined
      }}
    >
      <Card className="bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-zinc-900/90 text-white border-0 shadow-2xl backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Palette className="w-8 h-8 text-pink-400" />
            Temas Personalizados
            <Badge variant="secondary" className="bg-pink-600 text-white">
              {themes.filter(t => t.unlocked).length}/{themes.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* 🎮 TEMA ACTUAL/PREVIEW */}
          <div 
            className={`bg-gradient-to-r ${displayTheme?.gradient} rounded-lg p-6 relative overflow-hidden transition-all duration-500`}
            style={{
              background: displayTheme ? `linear-gradient(135deg, ${displayTheme.colors.primary}, ${displayTheme.colors.secondary})` : undefined
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                {displayTheme?.icon && <displayTheme.icon className="w-8 h-8 text-white" />}
                <div>
                  <h3 className="font-bold text-2xl">{displayTheme?.name}</h3>
                  <p className="text-sm opacity-90">
                    {previewTheme ? '👁️ Vista Previa' : '✅ Tema Activo'}
                  </p>
                </div>
                <Badge className="bg-white/20 text-white ml-auto">
                  {displayTheme?.mood.toUpperCase()}
                </Badge>
              </div>
              
              <p className="text-white/90 mb-4">{displayTheme?.description}</p>
              
              {/* 🎮 PALETA DE COLORES */}
              <div className="flex gap-2 mb-4">
                {displayTheme && Object.entries(displayTheme.colors).map(([key, color]) => (
                  <div key={key} className="text-center">
                    <div 
                      className="w-8 h-8 rounded-full border-2 border-white/50 shadow-lg"
                      style={{ backgroundColor: color }}
                    />
                    <div className="text-xs mt-1 opacity-80 capitalize">{key}</div>
                  </div>
                ))}
              </div>

              {previewTheme && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => changeTheme(previewTheme)}
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                    size="sm"
                  >
                    ✅ Aplicar Tema
                  </Button>
                  <Button
                    onClick={() => previewThemeColors(null)}
                    className="bg-black/20 hover:bg-black/30 text-white border border-white/30"
                    size="sm"
                    variant="outline"
                  >
                    ❌ Cancelar
                  </Button>
                </div>
              )}
            </div>

            {/* 🎮 PATRÓN DECORATIVO */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
              <div className="w-full h-full bg-white rounded-full animate-pulse" />
            </div>
          </div>

          {/* 🎮 GALERÍA DE TEMAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {themes.map((theme) => {
              const ThemeIcon = theme.icon
              const isUnlocked = theme.unlocked
              const isCurrent = currentTheme === theme.id
              const isPreview = previewTheme === theme.id

              return (
                <Card 
                  key={theme.id} 
                  className={`
                    relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                    ${isCurrent 
                      ? 'border-green-400 shadow-lg shadow-green-400/50' 
                      : isPreview
                        ? 'border-yellow-400 shadow-lg shadow-yellow-400/50'
                        : isUnlocked 
                          ? 'border-gray-600 hover:border-purple-300' 
                          : 'border-gray-800 opacity-75'
                    }
                    ${RARITY_COLORS[theme.rarity]}
                  `}
                  onMouseEnter={() => isUnlocked && previewThemeColors(theme.id)}
                  onMouseLeave={() => previewThemeColors(null)}
                  onClick={() => isUnlocked && changeTheme(theme.id)}
                >
                  {/* 🎮 THEME PREVIEW BAR */}
                  <div 
                    className="h-3 w-full"
                    style={{
                      background: `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.accent})`
                    }}
                  />

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* 🎮 HEADER */}
                      <div className="flex items-center gap-2">
                        <ThemeIcon className="w-6 h-6 text-purple-400" />
                        <div className="flex-1">
                          <h3 className="font-bold text-sm">{theme.name}</h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {theme.rarity.toUpperCase()}
                          </Badge>
                        </div>
                        {isCurrent && (
                          <Badge className="bg-green-500 text-white text-xs">ACTIVO</Badge>
                        )}
                      </div>

                      {/* 🎮 DESCRIPTION */}
                      <p className="text-xs opacity-80 h-8 overflow-hidden">
                        {theme.description}
                      </p>

                      {/* 🎮 COLOR PALETTE MINI */}
                      <div className="flex gap-1">
                        {Object.values(theme.colors).slice(0, 4).map((color, i) => (
                          <div 
                            key={i}
                            className="w-4 h-4 rounded-full border border-white/30"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>

                      {/* 🎮 ACTION BUTTON */}
                      {isUnlocked ? (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            changeTheme(theme.id)
                          }}
                          className={`
                            w-full text-xs
                            ${isCurrent 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-purple-600 hover:bg-purple-700'
                            }
                          `}
                          size="sm"
                        >
                          {isCurrent ? '✅ Tema Actual' : '🎨 Aplicar Tema'}
                        </Button>
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            unlockTheme(theme.id)
                          }}
                          className={`
                            w-full text-xs
                            ${playerCoins >= theme.cost 
                              ? 'bg-yellow-600 hover:bg-yellow-700' 
                              : 'bg-gray-600 cursor-not-allowed'
                            }
                          `}
                          size="sm"
                          disabled={playerCoins < theme.cost}
                        >
                          <Crown className="w-3 h-3 mr-1" />
                          {theme.cost} 💰
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* 🎮 ESTADÍSTICAS DE COLECCIÓN */}
          <div className="bg-black/30 rounded-lg p-4">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-400" />
              Colección de Temas
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {themes.filter(t => t.unlocked).length}
                </div>
                <div className="text-xs opacity-80">Desbloqueados</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {themes.filter(t => t.rarity === 'rare' && t.unlocked).length}
                </div>
                <div className="text-xs opacity-80">Raros</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">
                  {themes.filter(t => t.rarity === 'epic' && t.unlocked).length}
                </div>
                <div className="text-xs opacity-80">Épicos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {themes.filter(t => t.rarity === 'legendary' && t.unlocked).length}
                </div>
                <div className="text-xs opacity-80">Legendarios</div>
              </div>
            </div>
          </div>

          {/* 🎮 PRÓXIMAS CARACTERÍSTICAS */}
          <div className="bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-lg p-4 border border-pink-400/30">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <h3 className="font-bold">Próximamente</h3>
            </div>
            <div className="text-sm opacity-80 space-y-1">
              <div>• Temas animados con partículas</div>
              <div>• Editor de temas personalizado</div>
              <div>• Temas temporales de eventos</div>
              <div>• Modo día/noche automático</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}