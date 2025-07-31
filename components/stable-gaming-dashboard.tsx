'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  Home, 
  Brain, 
  Heart, 
  Gamepad2, 
  Users, 
  ShoppingCart, 
  Trophy, 
  Star,
  Menu,
  X,
  Target,
  Zap,
  Crown,
  BarChart3,
  Plus,
  Minus,
  Gift,
  Sword,
  Shield,
  Coins,
  Gem
} from 'lucide-react'

// 🎮 INTERFACES SIMPLES
interface PlayerProfile {
  username: string
  level: number
  experience: number
  experienceToNext: number
  coins: number
  gems: number
  achievements: number
  totalPlayTime: number
  avatar: string
  rank: string
  health: number
  energy: number
  happiness: number
  statistics: {
    gamesPlayed: number
    gamesWon: number
    totalScore: number
    averageScore: number
    consecutiveDays: number
    favoritePet: string
    favoriteHero: string
  }
}

interface Game {
  id: string
  name: string
  description: string
  difficulty: number
  rewards: {
    experience: number
    coins: number
    gems: number
  }
  isUnlocked: boolean
  isCompleted: boolean
}

interface Pet {
  id: string
  name: string
  type: string
  rarity: string
  health: number
  happiness: number
  energy: number
  level: number
  isAdopted: boolean
  image: string
}

interface Hero {
  id: string
  name: string
  power: number
  defense: number
  speed: number
  special: string
  level: number
  isUnlocked: boolean
  image: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  isCompleted: boolean
  progress: number
  maxProgress: number
  rewards: {
    experience: number
    coins: number
    gems: number
  }
}

export default function StableGamingDashboard() {
  // 🎮 ESTADO LOCAL SIMPLIFICADO
  const [activeTab, setActiveTab] = useState('home')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 🎮 DATOS SIMULADOS PARA PRUEBAS
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>({
    username: 'GamerPro',
    level: 15,
    experience: 7500,
    experienceToNext: 10000,
    coins: 2500,
    gems: 150,
    achievements: 8,
    totalPlayTime: 120,
    avatar: '/avatars/1.png',
    rank: 'Platino',
    health: 85,
    energy: 90,
    happiness: 95,
    statistics: {
      gamesPlayed: 45,
      gamesWon: 32,
      totalScore: 125000,
      averageScore: 2777,
      consecutiveDays: 7,
      favoritePet: 'Dragon',
      favoriteHero: 'Cyber Knight'
    }
  })

  const [games, setGames] = useState<Game[]>([
    {
      id: '1',
      name: 'Mario Bros Épico',
      description: 'Plataformas con física real y escenarios dinámicos',
      difficulty: 7,
      rewards: { experience: 150, coins: 100, gems: 5 },
      isUnlocked: true,
      isCompleted: false
    },
    {
      id: '2',
      name: 'Puzzle Master',
      description: 'Rompecabezas lógicos con IA avanzada',
      difficulty: 5,
      rewards: { experience: 120, coins: 80, gems: 3 },
      isUnlocked: true,
      isCompleted: true
    },
    {
      id: '3',
      name: 'Racing Legends',
      description: 'Carreras épicas con vehículos legendarios',
      difficulty: 8,
      rewards: { experience: 200, coins: 150, gems: 8 },
      isUnlocked: false,
      isCompleted: false
    }
  ])

  const [pets, setPets] = useState<Pet[]>([
    {
      id: '1',
      name: 'Dragon',
      type: 'Legendario',
      rarity: 'Épico',
      health: 100,
      happiness: 95,
      energy: 80,
      level: 5,
      isAdopted: true,
      image: '/pet/dragon.png'
    },
    {
      id: '2',
      name: 'Phoenix',
      type: 'Mítico',
      rarity: 'Legendario',
      health: 90,
      happiness: 85,
      energy: 70,
      level: 3,
      isAdopted: false,
      image: '/pet/phoenix.png'
    }
  ])

  const [heroes, setHeroes] = useState<Hero[]>([
    {
      id: '1',
      name: 'Cyber Knight',
      power: 85,
      defense: 90,
      speed: 75,
      special: 'Shield Bash',
      level: 10,
      isUnlocked: true,
      image: '/heroes/cyber-knight.png'
    },
    {
      id: '2',
      name: 'Fire Phoenix',
      power: 95,
      defense: 70,
      speed: 90,
      special: 'Flame Burst',
      level: 8,
      isUnlocked: false,
      image: '/heroes/fire-phoenix.png'
    }
  ])

  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'Primer Juego',
      description: 'Completa tu primer juego',
      icon: '🎮',
      isCompleted: true,
      progress: 1,
      maxProgress: 1,
      rewards: { experience: 50, coins: 25, gems: 1 }
    },
    {
      id: '2',
      name: 'Coleccionista',
      description: 'Adopta 3 mascotas',
      icon: '🐾',
      isCompleted: false,
      progress: 1,
      maxProgress: 3,
      rewards: { experience: 100, coins: 50, gems: 3 }
    }
  ])

  // 🎮 FUNCIONES DE ACCIÓN SIMPLIFICADAS
  const handleGamePlay = async (gameId: string) => {
    setIsLoading(true)
    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const game = games.find(g => g.id === gameId)
      if (game) {
        // Simular éxito/fallo
        const success = Math.random() > 0.3
        
        if (success) {
    setPlayerProfile(prev => ({
      ...prev,
            experience: prev.experience + game.rewards.experience,
            coins: prev.coins + game.rewards.coins,
            gems: prev.gems + game.rewards.gems
          }))
      
      setGames(prev => prev.map(g => 
        g.id === gameId ? { ...g, isCompleted: true } : g
      ))
      
          toast.success(`¡${game.name} completado! +${game.rewards.experience} XP`)
    } else {
      toast.error(`¡Fallaste en ${game.name}! Inténtalo de nuevo`)
        }
      }
    } catch (error) {
      toast.error('Error al iniciar juego')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePetAdopt = async (petId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      
    setPets(prev => prev.map(pet => 
      pet.id === petId ? { ...pet, isAdopted: true } : pet
    ))
    
    const pet = pets.find(p => p.id === petId)
    if (pet) {
        setPlayerProfile(prev => ({
          ...prev,
          experience: prev.experience + 50,
          coins: prev.coins + 25
        }))
        
      toast.success(`¡${pet.name} adoptado! +50 XP, +25 monedas`)
    }
    } catch (error) {
      toast.error('Error al adoptar mascota')
    } finally {
      setIsLoading(false)
    }
  }

  const handleHeroUnlock = async (heroId: string) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (playerProfile.coins >= 1000) {
      setHeroes(prev => prev.map(h => 
        h.id === heroId ? { ...h, isUnlocked: true } : h
      ))
      
        setPlayerProfile(prev => ({
          ...prev,
          coins: prev.coins - 1000,
          experience: prev.experience + 100
        }))
        
        const hero = heroes.find(h => h.id === heroId)
        toast.success(`¡${hero?.name} desbloqueado! -1000 monedas, +100 XP`)
    } else {
      toast.error('No tienes suficientes monedas (necesitas 1000)')
    }
    } catch (error) {
      toast.error('Error al desbloquear héroe')
    } finally {
      setIsLoading(false)
    }
  }

  // 🎮 NAVEGACIÓN SIMPLIFICADA
  const navigationItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'games', label: 'Juegos', icon: Gamepad2 },
    { id: 'pets', label: 'Mascotas', icon: Heart },
    { id: 'multiplayer', label: 'Multijugador', icon: Users },
    { id: 'marketplace', label: 'Tienda', icon: ShoppingCart },
    { id: 'achievements', label: 'Logros', icon: Trophy },
    { id: 'profile', label: 'Perfil', icon: Star }
  ]

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'home':
        return <DashboardHome />
      case 'games':
        return <GamesPanel />
      case 'pets':
        return <PetsPanel />
      case 'multiplayer':
        return <MultiplayerPanel />
      case 'marketplace':
        return <MarketplacePanel />
      case 'achievements':
        return <AchievementsPanel />
      case 'profile':
        return <ProfilePanel />
      default:
        return <DashboardHome />
    }
  }

  // 🎮 PANEL DE INICIO
  const DashboardHome = () => (
    <div className="space-y-6">
      {/* 🎯 PERFIL PRINCIPAL */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6" />
            Bienvenido, {playerProfile.username}!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{playerProfile.level}</div>
              <div className="text-sm opacity-80">Nivel</div>
              <Progress value={(playerProfile.experience / playerProfile.experienceToNext) * 100} className="mt-2" />
              </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{playerProfile.coins}</div>
              <div className="text-sm opacity-80">Monedas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{playerProfile.gems}</div>
              <div className="text-sm opacity-80">Gemas</div>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* 🎮 ESTADÍSTICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Gamepad2 className="w-4 h-4" />
              Juegos Jugados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerProfile.statistics.gamesPlayed}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Victorias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerProfile.statistics.gamesWon}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Puntuación Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerProfile.statistics.totalScore}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="w-4 h-4" />
              Logros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerProfile.achievements}</div>
          </CardContent>
        </Card>
      </div>

      {/* 🎮 ACCIONES RÁPIDAS */}
      <Card>
          <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline"
              onClick={() => setActiveTab('games')}
              className="flex items-center gap-2"
            >
              <Gamepad2 className="w-4 h-4" />
              Jugar
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setActiveTab('pets')}
              className="flex items-center gap-2"
            >
              <Heart className="w-4 h-4" />
              Mascotas
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('marketplace')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Tienda
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setActiveTab('achievements')}
              className="flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              Logros
            </Button>
            </div>
          </CardContent>
        </Card>
    </div>
  )

  // 🎮 PANEL DE JUEGOS
  const GamesPanel = () => (
    <div className="space-y-6">
      <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" />
            Juegos Disponibles
          </CardTitle>
            </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{game.name}</CardTitle>
                  <p className="text-sm text-gray-600">{game.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Dificultad:</span>
                    <Badge variant={game.difficulty > 7 ? 'destructive' : game.difficulty > 4 ? 'default' : 'secondary'}>
                      {game.difficulty}/10
                </Badge>
              </div>
              
                <div className="flex justify-between text-sm">
                  <span>Recompensas:</span>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="text-xs">
                        +{game.rewards.experience} XP
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        +{game.rewards.coins} 🪙
                      </Badge>
                </div>
              </div>
              
              <Button 
                onClick={() => handleGamePlay(game.id)}
                    disabled={!game.isUnlocked || isLoading}
                    className="w-full"
              >
                    {isLoading ? 'Cargando...' : game.isUnlocked ? 'Jugar Ahora' : 'Bloqueado'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
        </CardContent>
      </Card>
    </div>
  )

  // 🐾 PANEL DE MASCOTAS
  const PetsPanel = () => (
    <div className="space-y-6">
      <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Mascotas Disponibles
          </CardTitle>
            </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pets.map((pet) => (
              <Card key={pet.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{pet.name}</CardTitle>
                  <p className="text-sm text-gray-600">{pet.type} - {pet.rarity}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{pet.health}</div>
                      <div className="text-xs text-gray-500">Salud</div>
                </div>
                    <div className="text-center">
                      <div className="font-semibold">{pet.happiness}</div>
                      <div className="text-xs text-gray-500">Felicidad</div>
                </div>
                    <div className="text-center">
                      <div className="font-semibold">{pet.energy}</div>
                      <div className="text-xs text-gray-500">Energía</div>
                </div>
              </div>
              
                  <Button 
                  onClick={() => handlePetAdopt(pet.id)}
                    disabled={pet.isAdopted || isLoading}
                    variant={pet.isAdopted ? 'secondary' : 'default'}
                    className="w-full"
                >
                    {isLoading ? 'Procesando...' : pet.isAdopted ? 'Ya Adoptada' : 'Adoptar'}
                </Button>
            </CardContent>
          </Card>
        ))}
      </div>
        </CardContent>
      </Card>
    </div>
  )

  // 👥 PANEL MULTIJUGADOR
  const MultiplayerPanel = () => (
    <div className="space-y-6">
      <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-6 h-6" />
            Salas Multijugador
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-center py-8">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Multijugador Próximamente</h3>
            <p className="text-gray-600">Las salas multijugador estarán disponibles en la próxima actualización</p>
            </div>
          </CardContent>
        </Card>
    </div>
  )

  // 💰 PANEL DE MERCADO
  const MarketplacePanel = () => (
    <div className="space-y-6">
      <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-6 h-6" />
            Tienda
          </CardTitle>
          </CardHeader>
          <CardContent>
          <div className="text-center py-8">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Tienda Próximamente</h3>
            <p className="text-gray-600">El marketplace estará disponible en la próxima actualización</p>
            </div>
          </CardContent>
        </Card>
    </div>
  )

  // 🏆 PANEL DE LOGROS
  const AchievementsPanel = () => (
    <div className="space-y-6">
      <Card>
            <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Logros
          </CardTitle>
            </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-2xl">{achievement.icon}</span>
                    {achievement.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progreso:</span>
                      <span>{achievement.progress}/{achievement.maxProgress}</span>
                </div>
                <Progress value={(achievement.progress / achievement.maxProgress) * 100} />
              </div>
              
                  {achievement.isCompleted && (
                    <Badge className="w-full justify-center" variant="default">
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
      <Card>
          <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6" />
            Perfil del Jugador
          </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Información Básica</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Usuario:</span>
                    <span className="font-medium">{playerProfile.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Nivel:</span>
                    <span className="font-medium">{playerProfile.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rango:</span>
                    <span className="font-medium">{playerProfile.rank}</span>
                  </div>
              </div>
            </div>
            
              <div>
                <h3 className="font-semibold mb-2">Recursos</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                    <span>Monedas:</span>
                    <span className="font-medium">{playerProfile.coins}</span>
              </div>
              <div className="flex justify-between">
                    <span>Gemas:</span>
                    <span className="font-medium">{playerProfile.gems}</span>
              </div>
              <div className="flex justify-between">
                    <span>Logros:</span>
                    <span className="font-medium">{playerProfile.achievements}</span>
              </div>
            </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Estadísticas</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                    <span>Juegos Jugados:</span>
                    <span className="font-medium">{playerProfile.statistics.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                    <span>Victorias:</span>
                    <span className="font-medium">{playerProfile.statistics.gamesWon}</span>
              </div>
              <div className="flex justify-between">
                    <span>Puntuación Total:</span>
                    <span className="font-medium">{playerProfile.statistics.totalScore}</span>
              </div>
              <div className="flex justify-between">
                    <span>Días Consecutivos:</span>
                    <span className="font-medium">{playerProfile.statistics.consecutiveDays}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Estado</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Salud:</span>
                    <span className="font-medium">{playerProfile.health}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Energía:</span>
                    <span className="font-medium">{playerProfile.energy}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Felicidad:</span>
                    <span className="font-medium">{playerProfile.happiness}/100</span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* 🎮 HEADER */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎮</div>
              <div>
                <h1 className="text-xl font-bold text-white">Gaming Hub Ultimate</h1>
                <p className="text-sm text-gray-300">Tu universo gaming épico</p>
              </div>
          </div>
          
              <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 🎮 NAVEGACIÓN LATERAL */}
          <nav className={`
            lg:w-64 bg-black/20 backdrop-blur-sm rounded-lg p-4 border border-white/10
            ${isMobileMenuOpen ? 'block' : 'hidden lg:block'}
          `}>
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                return (
            <Button
                    key={item.id}
                    variant={activeTab === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-white hover:bg-white/10"
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
          <main className="flex-1">
          {renderActiveContent()}
        </main>
        </div>
      </div>
    </div>
  )
} 