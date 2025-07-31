'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Crown, 
  Star,
  Sparkles,
  Zap,
  Gift,
  Lock,
  Check,
  X,
  Coins,
  Gem,
  Package,
  Shirt,
  Palette,
  Home,
  Gamepad2
} from 'lucide-react'

// 🎮 INTERFACES PARA LA TIENDA
interface ShopItem {
  id: string
  name: string
  description: string
  category: 'accessory' | 'theme' | 'background' | 'special' | 'consumable'
  price: number
  currency: 'coins' | 'gems'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  image?: string
  icon: any
  owned: boolean
  limited?: boolean
  timeRemaining?: number
  effects?: string[]
  discount?: number
  new?: boolean
}

interface ShopCategory {
  id: string
  name: string
  icon: any
  color: string
}

interface EpicMarketplaceProps {
  playerCoins: number
  playerGems: number
  playerLevel: number
  ownedItems: string[]
  onPurchaseItem: (itemId: string, cost: number, currency: 'coins' | 'gems') => void
}

// 🎮 DATOS DE LA TIENDA
const SHOP_ITEMS: ShopItem[] = [
  // ACCESORIOS
  {
    id: 'crown_golden',
    name: 'Corona Dorada',
    description: 'Una corona real para los verdaderos campeones',
    category: 'accessory',
    price: 500,
    currency: 'coins',
    rarity: 'epic',
    icon: Crown,
    owned: false,
    effects: ['+20% monedas en minijuegos', '+10 felicidad permanente'],
    new: true
  },
  {
    id: 'cape_hero',
    name: 'Capa de Héroe',
    description: 'Una capa legendaria que ondea al viento',
    category: 'accessory',
    price: 50,
    currency: 'gems',
    rarity: 'legendary',
    icon: Sparkles,
    owned: false,
    effects: ['+50% experiencia', '+15% velocidad de recuperación'],
    limited: true,
    timeRemaining: 86400
  },
  {
    id: 'glasses_cool',
    name: 'Gafas Geniales',
    description: 'Para los Pous más cool del barrio',
    category: 'accessory',
    price: 200,
    currency: 'coins',
    rarity: 'rare',
    icon: Star,
    owned: false,
    effects: ['+5% puntuación en todos los juegos']
  },
  {
    id: 'hat_wizard',
    name: 'Sombrero de Mago',
    description: 'Un sombrero mágico lleno de misterio',
    category: 'accessory',
    price: 800,
    currency: 'coins',
    rarity: 'epic',
    icon: Sparkles,
    owned: false,
    effects: ['+30% chance de bonus sorpresa', 'Efectos mágicos especiales']
  },

  // TEMAS
  {
    id: 'theme_galaxy',
    name: 'Tema Galaxia',
    description: 'Un tema cósmico con estrellas brillantes',
    category: 'theme',
    price: 300,
    currency: 'coins',
    rarity: 'rare',
    icon: Sparkles,
    owned: false,
    effects: ['Fondo animado con estrellas', 'Sonidos espaciales']
  },
  {
    id: 'theme_ocean',
    name: 'Tema Océano',
    description: 'Sumérgete en las profundidades marinas',
    category: 'theme',
    price: 25,
    currency: 'gems',
    rarity: 'epic',
    icon: Sparkles,
    owned: false,
    effects: ['Animaciones de agua', 'Sonidos del océano']
  },

  // FONDOS
  {
    id: 'bg_castle',
    name: 'Castillo Encantado',
    description: 'Un majestuoso castillo medieval',
    category: 'background',
    price: 400,
    currency: 'coins',
    rarity: 'epic',
    icon: Home,
    owned: false,
    effects: ['+15% felicidad mientras esté activo']
  },
  {
    id: 'bg_space',
    name: 'Estación Espacial',
    description: 'Una moderna estación en el espacio',
    category: 'background',
    price: 35,
    currency: 'gems',
    rarity: 'legendary',
    icon: Home,
    owned: false,
    effects: ['+25% experiencia', 'Efectos de gravedad cero'],
    limited: true,
    timeRemaining: 172800
  },

  // CONSUMIBLES
  {
    id: 'potion_energy',
    name: 'Poción de Energía',
    description: 'Restaura completamente la energía',
    category: 'consumable',
    price: 50,
    currency: 'coins',
    rarity: 'common',
    icon: Zap,
    owned: false,
    effects: ['Restaura energía al 100%', 'Uso único']
  },
  {
    id: 'food_deluxe',
    name: 'Comida Deluxe',
    description: 'Un festín que satisface completamente',
    category: 'consumable',
    price: 75,
    currency: 'coins',
    rarity: 'rare',
    icon: Gift,
    owned: false,
    effects: ['Restaura hambre al 100%', '+20 felicidad temporal']
  },
  {
    id: 'boost_coins',
    name: 'Multiplicador de Monedas',
    description: 'Duplica las monedas por 1 hora',
    category: 'consumable',
    price: 10,
    currency: 'gems',
    rarity: 'epic',
    icon: Coins,
    owned: false,
    effects: ['x2 monedas por 1 hora'],
    discount: 20
  },

  // ESPECIALES
  {
    id: 'pet_companion',
    name: 'Compañero Legendario',
    description: 'Un compañero especial único y poderoso',
    category: 'special',
    price: 100,
    currency: 'gems',
    rarity: 'legendary',
    icon: Star,
    owned: false,
    effects: ['+50% en todos los bonuses', 'Habilidades únicas'],
    limited: true,
    timeRemaining: 259200
  }
]

const SHOP_CATEGORIES: ShopCategory[] = [
  { id: 'all', name: 'Todo', icon: Package, color: 'from-gray-500 to-gray-700' },
  { id: 'accessory', name: 'Accesorios', icon: Crown, color: 'from-yellow-500 to-orange-500' },
  { id: 'theme', name: 'Temas', icon: Palette, color: 'from-purple-500 to-pink-500' },
  { id: 'background', name: 'Fondos', icon: Home, color: 'from-blue-500 to-cyan-500' },
  { id: 'consumable', name: 'Consumibles', icon: Gift, color: 'from-green-500 to-emerald-500' },
  { id: 'special', name: 'Especiales', icon: Sparkles, color: 'from-pink-500 to-purple-500' }
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

export default function EpicMarketplace({ 
  playerCoins, 
  playerGems, 
  playerLevel, 
  ownedItems, 
  onPurchaseItem 
}: EpicMarketplaceProps) {
  const [items, setItems] = useState<ShopItem[]>(SHOP_ITEMS)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  // 🎮 ACTUALIZAR PROPIEDAD DE ITEMS
  useEffect(() => {
    setItems(prev => prev.map(item => ({
      ...item,
      owned: ownedItems.includes(item.id)
    })))
  }, [ownedItems])

  // 🎮 COUNTDOWN PARA ITEMS LIMITADOS
  useEffect(() => {
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => 
        item.limited && item.timeRemaining 
          ? { ...item, timeRemaining: Math.max(0, item.timeRemaining - 1) }
          : item
      ))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // 🎮 COMPRAR ITEM
  const handlePurchaseItem = (item: ShopItem) => {
    if (item.owned) {
      toast.info(`Ya posees ${item.name}`)
      return
    }

    const cost = item.discount 
      ? Math.floor(item.price * (1 - item.discount / 100))
      : item.price

    const canAfford = item.currency === 'coins' 
      ? playerCoins >= cost
      : playerGems >= cost

    if (!canAfford) {
      const needed = item.currency === 'coins' 
        ? cost - playerCoins
        : cost - playerGems
      
      toast.error(`Necesitas ${needed} ${item.currency === 'coins' ? 'monedas' : 'gemas'} más`)
      return
    }

    // Verificar si es un item limitado sin tiempo
    if (item.limited && item.timeRemaining === 0) {
      toast.error('Este item ya no está disponible')
      return
    }

    onPurchaseItem(item.id, cost, item.currency)
    
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, owned: true } : i
    ))

    toast.success(`¡${item.name} comprado!`, {
      description: `-${cost} ${item.currency === 'coins' ? '💰' : '💎'}`
    })
  }

  // 🎮 FILTRAR ITEMS POR CATEGORÍA
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory)

  // 🎮 FORMATEAR TIEMPO RESTANTE
  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) return `${hours}h ${minutes}m`
    if (minutes > 0) return `${minutes}m ${secs}s`
    return `${secs}s`
  }

  // 🎮 OBTENER PRECIO CON DESCUENTO
  const getDiscountedPrice = (item: ShopItem) => {
    if (!item.discount) return item.price
    return Math.floor(item.price * (1 - item.discount / 100))
  }

  return (
    <div className="space-y-6">
      {/* 🎮 HEADER */}
      <Card className="bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <ShoppingCart className="w-8 h-8 text-emerald-300" />
            Marketplace Épico
            <Badge variant="secondary" className="bg-white/20 text-white">
              {filteredItems.length} items
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold">{playerCoins}</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="font-bold">{playerGems}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 🎮 CATEGORÍAS */}
      <Card className="bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white border-0 shadow-xl">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {SHOP_CATEGORIES.map((category) => {
              const Icon = category.icon
              const isSelected = selectedCategory === category.id
              
              return (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 p-3 text-sm font-semibold transition-all duration-300
                    ${isSelected 
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                      : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 🎮 GRID DE ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isOwned = item.owned
          const isAffordable = item.currency === 'coins' 
            ? playerCoins >= getDiscountedPrice(item)
            : playerGems >= getDiscountedPrice(item)
          const isExpired = item.limited && item.timeRemaining === 0
          
          return (
            <Card 
              key={item.id} 
              className={`
                relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 cursor-pointer
                ${isOwned 
                  ? 'border-green-400 shadow-lg shadow-green-400/50 bg-green-900/20' 
                  : isExpired
                    ? 'border-gray-600 opacity-50 bg-gray-900/50'
                    : isAffordable 
                      ? `${RARITY_BORDER[item.rarity]} hover:shadow-lg hover:shadow-${item.rarity}-400/50` 
                      : 'border-red-600 bg-red-900/20'
                }
                bg-gradient-to-br from-gray-800 to-gray-900 text-white
              `}
              onClick={() => {
                setSelectedItem(item)
                setShowDetails(true)
              }}
            >
              {/* 🎮 RARITY HEADER */}
              <div 
                className={`h-3 w-full bg-gradient-to-r ${RARITY_COLORS[item.rarity]}`}
              />

              {/* 🎮 BADGES */}
              <div className="absolute top-4 right-4 flex flex-col gap-1">
                {item.new && (
                  <Badge className="bg-green-500 text-white text-xs">NEW</Badge>
                )}
                {item.limited && (
                  <Badge className="bg-red-500 text-white text-xs">LIMITED</Badge>
                )}
                {item.discount && (
                  <Badge className="bg-yellow-500 text-white text-xs">-{item.discount}%</Badge>
                )}
              </div>

              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* 🎮 ICON Y STATUS */}
                  <div className="relative text-center">
                    <div className="relative inline-block">
                      <div className={`
                        w-16 h-16 mx-auto rounded-full border-4 flex items-center justify-center
                        ${isOwned ? 'border-green-400 bg-green-500/20' : RARITY_BORDER[item.rarity]}
                        ${isExpired ? 'grayscale' : ''}
                      `}>
                        <Icon className="w-8 h-8" />
                      </div>
                      
                      {isOwned && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                      
                      {isExpired && (
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 🎮 INFO */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                    <Badge className={`bg-gradient-to-r ${RARITY_COLORS[item.rarity]} text-white mb-2`}>
                      {item.rarity.toUpperCase()}
                    </Badge>
                    <p className="text-sm opacity-80 mb-3 line-clamp-2">{item.description}</p>
                  </div>

                  {/* 🎮 EFECTOS */}
                  {item.effects && item.effects.length > 0 && (
                    <div className="space-y-1">
                      {item.effects.slice(0, 2).map((effect, index) => (
                        <div key={index} className="text-xs bg-white/10 rounded px-2 py-1">
                          ✨ {effect}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 🎮 TIMER PARA ITEMS LIMITADOS */}
                  {item.limited && item.timeRemaining && item.timeRemaining > 0 && (
                    <div className="bg-red-500/20 rounded p-2 text-center">
                      <div className="text-xs text-red-300">Tiempo restante:</div>
                      <div className="font-bold text-sm">{formatTimeRemaining(item.timeRemaining)}</div>
                    </div>
                  )}

                  {/* 🎮 PRECIO Y ACCIÓN */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      {item.discount && (
                        <span className="text-sm line-through opacity-60">
                          {item.price} {item.currency === 'coins' ? '💰' : '💎'}
                        </span>
                      )}
                      <span className="font-bold text-lg">
                        {getDiscountedPrice(item)} {item.currency === 'coins' ? '💰' : '💎'}
                      </span>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePurchaseItem(item)
                      }}
                      disabled={isOwned || !isAffordable || isExpired}
                      className={`
                        w-full text-sm
                        ${isOwned 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : isExpired
                            ? 'bg-gray-600 cursor-not-allowed'
                            : isAffordable 
                              ? 'bg-blue-600 hover:bg-blue-700' 
                              : 'bg-red-600 cursor-not-allowed'
                        }
                      `}
                    >
                      {isOwned ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Poseído
                        </>
                      ) : isExpired ? (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Expirado
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 🎮 MODAL DE DETALLES */}
      {showDetails && selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-purple-900 text-white border-0 shadow-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <selectedItem.icon className="w-8 h-8" />
                  {selectedItem.name}
                  <Badge className={`bg-gradient-to-r ${RARITY_COLORS[selectedItem.rarity]} text-white`}>
                    {selectedItem.rarity.toUpperCase()}
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
              {/* 🎮 DESCRIPCIÓN */}
              <div>
                <h3 className="font-bold mb-2">Descripción</h3>
                <p className="text-sm opacity-90">{selectedItem.description}</p>
              </div>

              {/* 🎮 EFECTOS */}
              {selectedItem.effects && (
                <div>
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Efectos Especiales
                  </h3>
                  <div className="space-y-2">
                    {selectedItem.effects.map((effect, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{effect}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🎮 PRECIO Y COMPRA */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold">Precio:</span>
                  <div className="flex items-center gap-2">
                    {selectedItem.discount && (
                      <span className="line-through opacity-60">
                        {selectedItem.price} {selectedItem.currency === 'coins' ? '💰' : '💎'}
                      </span>
                    )}
                    <span className="text-xl font-bold">
                      {getDiscountedPrice(selectedItem)} {selectedItem.currency === 'coins' ? '💰' : '💎'}
                    </span>
                  </div>
                </div>
                
                <Button
                  onClick={() => {
                    handlePurchaseItem(selectedItem)
                    setShowDetails(false)
                  }}
                  disabled={selectedItem.owned || 
                    (selectedItem.currency === 'coins' ? playerCoins < getDiscountedPrice(selectedItem) : playerGems < getDiscountedPrice(selectedItem)) ||
                    (selectedItem.limited && selectedItem.timeRemaining === 0)
                  }
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {selectedItem.owned ? 'Ya Poseído' : 'Comprar Ahora'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}