'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  User, 
  Crown, 
  Star, 
  Sparkles,
  Lock,
  Check,
  Shuffle
} from 'lucide-react'

interface AvatarData {
  id: number
  name: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlocked: boolean
  cost: number
  description: string
  svgPath: string
}

interface AvatarSystemProps {
  currentAvatarId: number
  onAvatarChange: (avatarId: number) => void
  playerCoins: number
  onSpendCoins: (amount: number) => void
}

const AVATARS_DATA: AvatarData[] = [
  {
    id: 1,
    name: "Aventurero Místico",
    rarity: "common",
    unlocked: true,
    cost: 0,
    description: "Tu primer compañero de aventuras",
    svgPath: "/avatars/1.svg"
  },
  {
    id: 2,
    name: "Guardián Celestial",
    rarity: "rare",
    unlocked: false,
    cost: 150,
    description: "Protector de los reinos superiores",
    svgPath: "/avatars/2.svg"
  },
  {
    id: 3,
    name: "Maestro Dimensional",
    rarity: "epic",
    unlocked: false,
    cost: 500,
    description: "Viajero entre mundos infinitos",
    svgPath: "/avatars/3.svg"
  }
]

const RARITY_COLORS = {
  common: "bg-gray-500",
  rare: "bg-blue-500", 
  epic: "bg-purple-500",
  legendary: "bg-yellow-500"
}

const RARITY_EMOJIS = {
  common: "⚪",
  rare: "🔵",
  epic: "🟣", 
  legendary: "🟡"
}

export default function AvatarSystem({ 
  currentAvatarId, 
  onAvatarChange, 
  playerCoins, 
  onSpendCoins 
}: AvatarSystemProps) {
  const [avatars, setAvatars] = useState<AvatarData[]>(AVATARS_DATA)
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarId)

  // 🎮 DESBLOQUEAR AVATAR
  const unlockAvatar = (avatarId: number) => {
    const avatar = avatars.find(a => a.id === avatarId)
    if (!avatar || avatar.unlocked) return

    if (playerCoins >= avatar.cost) {
      setAvatars(prev => prev.map(a => 
        a.id === avatarId ? { ...a, unlocked: true } : a
      ))
      onSpendCoins(avatar.cost)
      toast.success(`¡${avatar.name} desbloqueado!`, {
        description: `Gastaste ${avatar.cost} monedas`
      })
    } else {
      toast.error("No tienes suficientes monedas", {
        description: `Necesitas ${avatar.cost - playerCoins} monedas más`
      })
    }
  }

  // 🎮 SELECCIONAR AVATAR
  const selectAvatar = (avatarId: number) => {
    const avatar = avatars.find(a => a.id === avatarId)
    if (!avatar || !avatar.unlocked) return

    setSelectedAvatar(avatarId)
    onAvatarChange(avatarId)
    toast.success(`Avatar cambiado a ${avatar.name}`)
  }

  // 🎮 AVATAR ALEATORIO
  const randomAvatar = () => {
    const unlockedAvatars = avatars.filter(a => a.unlocked)
    if (unlockedAvatars.length === 0) return

    const randomIndex = Math.floor(Math.random() * unlockedAvatars.length)
    const randomAvatarId = unlockedAvatars[randomIndex].id
    selectAvatar(randomAvatarId)
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white border-0 shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-2xl font-bold">
          <User className="w-8 h-8 text-purple-400" />
          Sistema de Avatares
          <Badge variant="secondary" className="bg-purple-600 text-white">
            {avatars.filter(a => a.unlocked).length}/{avatars.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 🎮 AVATAR ACTUAL */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={avatars.find(a => a.id === selectedAvatar)?.svgPath} 
                alt="Avatar actual"
                className="w-16 h-16 rounded-full border-4 border-purple-400 shadow-lg"
              />
              <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">
                {avatars.find(a => a.id === selectedAvatar)?.name}
              </h3>
              <p className="text-sm opacity-80">
                {avatars.find(a => a.id === selectedAvatar)?.description}
              </p>
            </div>
            <Button
              onClick={randomAvatar}
              className="bg-purple-600 hover:bg-purple-700"
              size="sm"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Aleatorio
            </Button>
          </div>
        </div>

        {/* 🎮 GALERÍA DE AVATARES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatars.map((avatar) => (
            <Card key={avatar.id} className={`
              relative bg-black/40 border-2 transition-all duration-300 hover:scale-105
              ${selectedAvatar === avatar.id 
                ? 'border-purple-400 shadow-lg shadow-purple-400/50' 
                : 'border-gray-600 hover:border-purple-300'
              }
            `}>
              <CardContent className="p-4">
                {/* 🎮 RARITY BADGE */}
                <div className="absolute top-2 right-2">
                  <Badge className={`${RARITY_COLORS[avatar.rarity]} text-white text-xs`}>
                    {RARITY_EMOJIS[avatar.rarity]} {avatar.rarity.toUpperCase()}
                  </Badge>
                </div>

                {/* 🎮 AVATAR IMAGE */}
                <div className="relative mb-3">
                  <img 
                    src={avatar.svgPath} 
                    alt={avatar.name}
                    className={`
                      w-20 h-20 mx-auto rounded-full border-4 transition-all duration-300
                      ${avatar.unlocked 
                        ? 'border-purple-400 opacity-100' 
                        : 'border-gray-500 opacity-50 grayscale'
                      }
                    `}
                  />
                  {!avatar.unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  {selectedAvatar === avatar.id && avatar.unlocked && (
                    <div className="absolute -top-2 -right-2">
                      <Check className="w-6 h-6 text-green-400 bg-green-800 rounded-full p-1" />
                    </div>
                  )}
                </div>

                {/* 🎮 AVATAR INFO */}
                <div className="text-center space-y-2">
                  <h3 className="font-bold text-sm">{avatar.name}</h3>
                  <p className="text-xs opacity-80 h-8">{avatar.description}</p>

                  {/* 🎮 ACTION BUTTON */}
                  {avatar.unlocked ? (
                    <Button
                      onClick={() => selectAvatar(avatar.id)}
                      className={`
                        w-full text-xs
                        ${selectedAvatar === avatar.id 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-purple-600 hover:bg-purple-700'
                        }
                      `}
                      size="sm"
                    >
                      {selectedAvatar === avatar.id ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Seleccionado
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          Seleccionar
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => unlockAvatar(avatar.id)}
                      className={`
                        w-full text-xs
                        ${playerCoins >= avatar.cost 
                          ? 'bg-yellow-600 hover:bg-yellow-700' 
                          : 'bg-gray-600 cursor-not-allowed'
                        }
                      `}
                      size="sm"
                      disabled={playerCoins < avatar.cost}
                    >
                      <Star className="w-3 h-3 mr-1" />
                      {avatar.cost} 💰
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 🎮 ESTADÍSTICAS */}
        <div className="bg-black/30 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {avatars.filter(a => a.unlocked).length}
              </div>
              <div className="text-xs opacity-80">Desbloqueados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {avatars.filter(a => a.rarity === 'rare' && a.unlocked).length}
              </div>
              <div className="text-xs opacity-80">Raros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {avatars.filter(a => a.rarity === 'epic' && a.unlocked).length}
              </div>
              <div className="text-xs opacity-80">Épicos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {avatars.filter(a => a.rarity === 'legendary' && a.unlocked).length}
              </div>
              <div className="text-xs opacity-80">Legendarios</div>
            </div>
          </div>
        </div>

        {/* 🎮 PRÓXIMAS CARACTERÍSTICAS */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg p-4 border border-purple-400/30">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold">Próximamente</h3>
          </div>
          <div className="text-sm opacity-80 space-y-1">
            <div>• Avatares animados con emociones</div>
            <div>• Sistema de accesorios personalizables</div>
            <div>• Avatares especiales por logros</div>
            <div>• Modo foto con poses especiales</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}