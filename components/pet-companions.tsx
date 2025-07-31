'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Heart, 
  Crown, 
  Star,
  ShoppingCart,
  Sparkles,
  Zap,
  Gift,
  Lock,
  Check,
  X
} from 'lucide-react'

// 🎮 INTERFACES PARA MASCOTAS COMPAÑERAS
interface CompanionPet {
  id: string
  name: string
  image: string
  type: 'chinchilla' | 'pez' | 'hamster' | 'pajaro' | 'conejo' | 'gato' | 'perro'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  stats: {
    loyalty: number
    happiness: number
    energy: number
  }
  level: number
  experience: number
  experienceToNext: number
  cost: number
  unlocked: boolean
  abilities: string[]
  personality: string
  bonuses: {
    coins: number
    experience: number
    happiness: number
  }
}

interface PetCompanionsProps {
  playerCoins: number
  playerLevel: number
  currentCompanions: string[]
  onAdoptPet: (petId: string, cost: number) => void
  onSelectCompanion: (petId: string) => void
  onRemoveCompanion: (petId: string) => void
}

// 🎮 DATOS DE MASCOTAS DISPONIBLES
const AVAILABLE_PETS: CompanionPet[] = [
  {
    id: 'perro',
    name: 'Buddy el Leal',
    image: '/pet/mascota_perro.png',
    type: 'perro',
    rarity: 'common',
    stats: { loyalty: 95, happiness: 85, energy: 80 },
    level: 1,
    experience: 0,
    experienceToNext: 100,
    cost: 50,
    unlocked: true,
    abilities: ['Lealtad Infinita', 'Protección'],
    personality: 'Leal y protector',
    bonuses: { coins: 2, experience: 5, happiness: 10 }
  },
  {
    id: 'gato',
    name: 'Misty la Misteriosa',
    image: '/pet/mascota_gato.png',
    type: 'gato',
    rarity: 'rare',
    stats: { loyalty: 70, happiness: 90, energy: 85 },
    level: 1,
    experience: 0,
    experienceToNext: 150,
    cost: 120,
    unlocked: false,
    abilities: ['Agilidad', 'Intuición Felina'],
    personality: 'Independiente y curiosa',
    bonuses: { coins: 3, experience: 8, happiness: 15 }
  },
  {
    id: 'conejo',
    name: 'Hop el Saltarín',
    image: '/pet/mascota_conejo.png',
    type: 'conejo',
    rarity: 'common',
    stats: { loyalty: 80, happiness: 95, energy: 90 },
    level: 1,
    experience: 0,
    experienceToNext: 120,
    cost: 80,
    unlocked: false,
    abilities: ['Velocidad', 'Salto Alto'],
    personality: 'Juguetón y energético',
    bonuses: { coins: 2, experience: 6, happiness: 12 }
  },
  {
    id: 'pajaro',
    name: 'Sky el Volador',
    image: '/pet/mascota_pajaro.png',
    type: 'pajaro',
    rarity: 'epic',
    stats: { loyalty: 85, happiness: 88, energy: 95 },
    level: 1,
    experience: 0,
    experienceToNext: 200,
    cost: 250,
    unlocked: false,
    abilities: ['Vuelo', 'Vista Aguda'],
    personality: 'Libre y aventurero',
    bonuses: { coins: 5, experience: 12, happiness: 20 }
  },
  {
    id: 'hamster',
    name: 'Nugget el Pequeño',
    image: '/pet/mascota_hamster.png',
    type: 'hamster',
    rarity: 'common',
    stats: { loyalty: 75, happiness: 92, energy: 85 },
    level: 1,
    experience: 0,
    experienceToNext: 80,
    cost: 40,
    unlocked: false,
    abilities: ['Almacenamiento', 'Rapidez'],
    personality: 'Activo y acumulador',
    bonuses: { coins: 1, experience: 4, happiness: 8 }
  },
  {
    id: 'pez',
    name: 'Splash el Nadador',
    image: '/pet/mascota_pez.png',
    type: 'pez',
    rarity: 'rare',
    stats: { loyalty: 60, happiness: 80, energy: 70 },
    level: 1,
    experience: 0,
    experienceToNext: 180,
    cost: 150,
    unlocked: false,
    abilities: ['Natación', 'Tranquilidad'],
    personality: 'Calmado y pacífico',
    bonuses: { coins: 3, experience: 7, happiness: 10 }
  },
  {
    id: 'chinchilla',
    name: 'Fluffy la Suave',
    image: '/pet/mascota_chinchilla.png',
    type: 'chinchilla',
    rarity: 'legendary',
    stats: { loyalty: 90, happiness: 95, energy: 88 },
    level: 1,
    experience: 0,
    experienceToNext: 300,
    cost: 500,
    unlocked: false,
    abilities: ['Suavidad', 'Salto Acrobático'],
    personality: 'Adorable y acrobática',
    bonuses: { coins: 8, experience: 15, happiness: 25 }
  }
]

const RARITY_COLORS = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600'
}

const RARITY_BORDER = {
  common: 'border-gray-500',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500'
}

export default function PetCompanions({ 
  playerCoins, 
  playerLevel, 
  currentCompanions, 
  onAdoptPet, 
  onSelectCompanion, 
  onRemoveCompanion 
}: PetCompanionsProps) {
  const [pets, setPets] = useState<CompanionPet[]>(AVAILABLE_PETS)
  const [selectedPet, setSelectedPet] = useState<CompanionPet | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // 🎮 ADOPTAR MASCOTA
  const handleAdoptPet = (pet: CompanionPet) => {
    if (playerCoins >= pet.cost) {
      setPets(prev => prev.map(p => 
        p.id === pet.id ? { ...p, unlocked: true } : p
      ))
      onAdoptPet(pet.id, pet.cost)
      toast.success(`¡${pet.name} adoptado! Te acompañará en tus aventuras`)
    } else {
      toast.error(`Necesitas ${pet.cost - playerCoins} monedas más para adoptar a ${pet.name}`)
    }
  }

  // 🎮 SELECCIONAR COMPAÑERO
  const handleSelectCompanion = (pet: CompanionPet) => {
    if (currentCompanions.length >= 3) {
      toast.warning('Solo puedes tener 3 compañeros activos a la vez')
      return
    }
    
    if (currentCompanions.includes(pet.id)) {
      toast.info(`${pet.name} ya está en tu equipo`)
      return
    }
    
    onSelectCompanion(pet.id)
    toast.success(`¡${pet.name} se unió a tu equipo!`)
  }

  // 🎮 REMOVER COMPAÑERO
  const handleRemoveCompanion = (pet: CompanionPet) => {
    onRemoveCompanion(pet.id)
    toast.info(`${pet.name} regresó a descansar`)
  }

  // 🎮 VERIFICAR SI LA MASCOTA ESTÁ DESBLOQUEADA
  const isPetUnlocked = (pet: CompanionPet) => {
    return pet.unlocked || pet.id === 'perro' // Perro desbloqueado por defecto
  }

  // 🎮 VERIFICAR SI LA MASCOTA ES COMPAÑERA ACTIVA
  const isActiveCompanion = (petId: string) => {
    return currentCompanions.includes(petId)
  }

  return (
    <div className="space-y-6">
      {/* 🎮 HEADER */}
      <Card className="bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <Heart className="w-8 h-8 text-pink-300" />
            Mascotas Compañeras
            <Badge variant="secondary" className="bg-white/20 text-white">
              {currentCompanions.length}/3
            </Badge>
          </CardTitle>
          <p className="text-sm opacity-90">
            Las mascotas compañeras te acompañan y otorgan bonuses especiales
          </p>
        </CardHeader>
      </Card>

      {/* 🎮 COMPAÑEROS ACTIVOS */}
      {currentCompanions.length > 0 && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              Equipo Activo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentCompanions.map(companionId => {
                const pet = pets.find(p => p.id === companionId)
                if (!pet) return null
                
                return (
                  <div key={pet.id} className="bg-white/20 rounded-lg p-4 text-center">
                    <img 
                      src={pet.image} 
                      alt={pet.name}
                      className="w-16 h-16 mx-auto mb-2 rounded-full border-2 border-white/50"
                    />
                    <h3 className="font-bold text-sm">{pet.name}</h3>
                    <p className="text-xs opacity-80 mb-2">{pet.personality}</p>
                    <div className="flex justify-center gap-1 text-xs">
                      <span>+{pet.bonuses.coins}💰</span>
                      <span>+{pet.bonuses.experience}⭐</span>
                      <span>+{pet.bonuses.happiness}❤️</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveCompanion(pet)}
                      className="mt-2 border-white/30 text-white hover:bg-white/20"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Descansar
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 🎮 GALERÍA DE MASCOTAS */}
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Tienda de Mascotas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => {
              const isUnlocked = isPetUnlocked(pet)
              const isActive = isActiveCompanion(pet.id)
              const canAfford = playerCoins >= pet.cost
              
              return (
                <Card 
                  key={pet.id} 
                  className={`
                    relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                    ${isActive 
                      ? 'border-green-400 shadow-lg shadow-green-400/50' 
                      : isUnlocked 
                        ? `${RARITY_BORDER[pet.rarity]} hover:shadow-lg hover:shadow-${pet.rarity}-400/50` 
                        : 'border-gray-600 opacity-75'
                    }
                    bg-gradient-to-br from-gray-800 to-gray-900
                  `}
                  onClick={() => {
                    setSelectedPet(pet)
                    setShowDetails(true)
                  }}
                >
                  {/* 🎮 RARITY HEADER */}
                  <div 
                    className={`h-2 w-full bg-gradient-to-r ${RARITY_COLORS[pet.rarity]}`}
                  />

                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* 🎮 IMAGE Y STATUS */}
                      <div className="relative text-center">
                        <div className="relative inline-block">
                          <img 
                            src={pet.image} 
                            alt={pet.name}
                            className={`w-20 h-20 mx-auto rounded-full border-4 ${
                              isUnlocked ? RARITY_BORDER[pet.rarity] : 'border-gray-600 grayscale'
                            } shadow-lg`}
                          />
                          {isActive && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {!isUnlocked && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <Lock className="w-6 h-6 text-white" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 🎮 INFO */}
                      <div className="text-center">
                        <h3 className="font-bold text-lg">{pet.name}</h3>
                        <Badge className={`bg-gradient-to-r ${RARITY_COLORS[pet.rarity]} text-white mb-2`}>
                          {pet.rarity.toUpperCase()}
                        </Badge>
                        <p className="text-sm opacity-80 mb-2">{pet.personality}</p>
                        
                        {/* 🎮 BONUSES */}
                        <div className="flex justify-center gap-2 text-xs mb-3">
                          <span className="bg-yellow-500/20 px-2 py-1 rounded">+{pet.bonuses.coins}💰</span>
                          <span className="bg-blue-500/20 px-2 py-1 rounded">+{pet.bonuses.experience}⭐</span>
                          <span className="bg-pink-500/20 px-2 py-1 rounded">+{pet.bonuses.happiness}❤️</span>
                        </div>
                      </div>

                      {/* 🎮 ACTIONS */}
                      {isUnlocked ? (
                        isActive ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveCompanion(pet)
                            }}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            size="sm"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Descansar
                          </Button>
                        ) : (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSelectCompanion(pet)
                            }}
                            className="w-full bg-green-500 hover:bg-green-600"
                            size="sm"
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Unir al Equipo
                          </Button>
                        )
                      ) : (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAdoptPet(pet)
                          }}
                          disabled={!canAfford}
                          className={`w-full ${
                            canAfford 
                              ? 'bg-purple-500 hover:bg-purple-600' 
                              : 'bg-gray-600 cursor-not-allowed'
                          }`}
                          size="sm"
                        >
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          {pet.cost} 💰
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 🎮 MODAL DE DETALLES */}
      {showDetails && selectedPet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-purple-900 text-white border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <img 
                    src={selectedPet.image} 
                    alt={selectedPet.name}
                    className="w-12 h-12 rounded-full border-2 border-purple-400"
                  />
                  {selectedPet.name}
                  <Badge className={`bg-gradient-to-r ${RARITY_COLORS[selectedPet.rarity]} text-white`}>
                    {selectedPet.rarity.toUpperCase()}
                  </Badge>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:bg-white/20"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 🎮 STATS */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Estadísticas
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm opacity-80">Lealtad</div>
                    <Progress value={selectedPet.stats.loyalty} className="h-2 mt-1" />
                    <div className="text-xs text-center mt-1">{selectedPet.stats.loyalty}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Felicidad</div>
                    <Progress value={selectedPet.stats.happiness} className="h-2 mt-1" />
                    <div className="text-xs text-center mt-1">{selectedPet.stats.happiness}%</div>
                  </div>
                  <div>
                    <div className="text-sm opacity-80">Energía</div>
                    <Progress value={selectedPet.stats.energy} className="h-2 mt-1" />
                    <div className="text-xs text-center mt-1">{selectedPet.stats.energy}%</div>
                  </div>
                </div>
              </div>

              {/* 🎮 ABILITIES */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Habilidades Especiales
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedPet.abilities.map((ability, index) => (
                    <Badge key={index} variant="outline" className="border-white/30 text-white">
                      {ability}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 🎮 BONUSES */}
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Bonuses por Compañía
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-yellow-500/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold">+{selectedPet.bonuses.coins}</div>
                    <div className="text-sm opacity-80">Monedas</div>
                  </div>
                  <div className="bg-blue-500/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold">+{selectedPet.bonuses.experience}</div>
                    <div className="text-sm opacity-80">Experiencia</div>
                  </div>
                  <div className="bg-pink-500/20 p-3 rounded-lg">
                    <div className="text-2xl font-bold">+{selectedPet.bonuses.happiness}</div>
                    <div className="text-sm opacity-80">Felicidad</div>
                  </div>
                </div>
              </div>

              {/* 🎮 DESCRIPTION */}
              <div className="bg-white/10 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Personalidad:</h4>
                <p className="text-sm opacity-90">{selectedPet.personality}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}