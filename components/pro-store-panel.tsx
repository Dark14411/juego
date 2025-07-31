'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Palette, 
  Gem,
  Star,
  Sparkles,
  Crown,
  Gift,
  Coins
} from 'lucide-react'

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  currency: 'coins' | 'gems'
  category: 'colors' | 'backgrounds' | 'accessories' | 'special'
  preview: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  owned: boolean
  discount?: number
}

interface ProStoreProps {
  playerCoins?: number
  playerGems?: number
  onPurchase?: (item: StoreItem) => void
}

export default function ProStorePanel({ 
  playerCoins = 100, 
  playerGems = 10,
  onPurchase 
}: ProStoreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('colors')
  const [coins, setCoins] = useState(playerCoins)
  const [gems, setGems] = useState(playerGems)

  const storeItems: StoreItem[] = [
    // COLORES
    {
      id: 'color-red',
      name: '🔴 Rojo Fuego',
      description: 'Dale a tu Tamagotchi un color rojo ardiente',
      price: 15,
      currency: 'coins',
      category: 'colors',
      preview: '#ef4444',
      rarity: 'common',
      owned: false
    },
    {
      id: 'color-blue',
      name: '🔵 Azul Océano',
      description: 'Color azul profundo como el océano',
      price: 15,
      currency: 'coins',
      category: 'colors',
      preview: '#3b82f6',
      rarity: 'common',
      owned: false
    },
    {
      id: 'color-gold',
      name: '🟡 Dorado Imperial',
      description: 'Color dorado exclusivo para campeones',
      price: 3,
      currency: 'gems',
      category: 'colors',
      preview: '#fbbf24',
      rarity: 'epic',
      owned: false
    },
    {
      id: 'color-rainbow',
      name: '🌈 Arcoíris Mágico',
      description: 'Color que cambia dinámicamente como un arcoíris',
      price: 8,
      currency: 'gems',
      category: 'colors',
      preview: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)',
      rarity: 'legendary',
      owned: false
    },

    // FONDOS
    {
      id: 'bg-stars',
      name: '⭐ Campo de Estrellas',
      description: 'Fondo retro con estrellas parpadeantes',
      price: 25,
      currency: 'coins',
      category: 'backgrounds',
      preview: '🌟',
      rarity: 'rare',
      owned: false
    },
    {
      id: 'bg-neon',
      name: '💫 Neón Retro',
      description: 'Fondo cyberpunk con luces neón',
      price: 5,
      currency: 'gems',
      category: 'backgrounds',
      preview: '🌈',
      rarity: 'epic',
      owned: false
    },
    {
      id: 'bg-matrix',
      name: '🔢 Matrix Digital',
      description: 'Código verde cayendo como en Matrix',
      price: 10,
      currency: 'gems',
      category: 'backgrounds',
      preview: '💻',
      rarity: 'legendary',
      owned: false
    },

    // ACCESORIOS
    {
      id: 'acc-crown',
      name: '👑 Corona Real',
      description: 'Corona dorada para el rey de los Tamagotchis',
      price: 40,
      currency: 'coins',
      category: 'accessories',
      preview: '👑',
      rarity: 'rare',
      owned: false
    },
    {
      id: 'acc-sunglasses',
      name: '🕶️ Lentes Cool',
      description: 'Lentes de sol para un look genial',
      price: 20,
      currency: 'coins',
      category: 'accessories',
      preview: '🕶️',
      rarity: 'common',
      owned: false
    },
    {
      id: 'acc-wings',
      name: '🦋 Alas Mágicas',
      description: 'Alas que brillan con magia antigua',
      price: 7,
      currency: 'gems',
      category: 'accessories',
      preview: '🦋',
      rarity: 'legendary',
      owned: false
    },

    // ESPECIALES
    {
      id: 'special-double-coins',
      name: '💰 Duplicador de Monedas',
      description: 'Duplica las monedas ganadas por 24 horas',
      price: 15,
      currency: 'gems',
      category: 'special',
      preview: '💰',
      rarity: 'legendary',
      owned: false
    },
    {
      id: 'special-auto-care',
      name: '🤖 Cuidado Automático',
      description: 'Tu Tamagotchi se cuida solo por 12 horas',
      price: 12,
      currency: 'gems',
      category: 'special',
      preview: '🤖',
      rarity: 'epic',
      owned: false
    }
  ]

  const [items, setItems] = useState(storeItems)

  const categories = [
    { id: 'colors', name: '🎨 Colores', icon: Palette },
    { id: 'backgrounds', name: '🖼️ Fondos', icon: Star },
    { id: 'accessories', name: '👑 Accesorios', icon: Crown },
    { id: 'special', name: '✨ Especiales', icon: Sparkles }
  ]

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-500 bg-gray-500/20'
      case 'rare': return 'border-blue-500 bg-blue-500/20'
      case 'epic': return 'border-purple-500 bg-purple-500/20'
      case 'legendary': return 'border-yellow-500 bg-yellow-500/20'
      default: return 'border-gray-500 bg-gray-500/20'
    }
  }

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/50'
      case 'rare': return 'shadow-blue-500/50'
      case 'epic': return 'shadow-purple-500/50'
      case 'legendary': return 'shadow-yellow-500/50 animate-pulse'
      default: return 'shadow-gray-500/50'
    }
  }

  const handlePurchase = (item: StoreItem) => {
    const canAfford = item.currency === 'coins' 
      ? coins >= item.price 
      : gems >= item.price

    if (!canAfford) {
      toast.error(`No tienes suficientes ${item.currency === 'coins' ? 'monedas' : 'gemas'}`)
      return
    }

    if (item.owned) {
      toast.warning('Ya posees este artículo')
      return
    }

    // Aplicar compra
    if (item.currency === 'coins') {
      setCoins(prev => prev - item.price)
    } else {
      setGems(prev => prev - item.price)
    }

    // Marcar como comprado
    setItems(prev => prev.map(i => 
      i.id === item.id ? { ...i, owned: true } : i
    ))

    // Feedback visual
    toast.success(`🎉 ¡${item.name} adquirido! Cambio aplicado instantáneamente`)
    
    if (onPurchase) {
      onPurchase({ ...item, owned: true })
    }
  }

  const filteredItems = items.filter(item => item.category === selectedCategory)

  return (
    <div className="space-y-6 max-h-screen overflow-y-auto">
      {/* 🎮 HEADER */}
      <Card className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white border-0 shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-3xl font-bold">
            <ShoppingCart className="w-10 h-10 text-emerald-300" />
            🛒 Tienda Pro
            <Badge variant="secondary" className="bg-white/20 text-white">
              {items.filter(i => !i.owned).length} Disponibles
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="font-bold text-lg">{coins}</span>
              <span className="text-sm opacity-80">monedas</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="font-bold text-lg">{gems}</span>
              <span className="text-sm opacity-80">gemas</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* 🎮 CATEGORÍAS */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  className={`h-16 font-bold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                      : 'border-gray-600 text-gray-300 hover:border-emerald-400 hover:text-white'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="w-6 h-6" />
                    <span className="text-xs">{category.name}</span>
                  </div>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 🎮 PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card 
            key={item.id}
            className={`
              relative overflow-hidden border-2 transition-all duration-300 hover:scale-105
              ${getRarityColor(item.rarity)} ${getRarityGlow(item.rarity)}
              ${item.owned ? 'opacity-75' : ''}
              bg-gradient-to-br from-gray-900 to-gray-800
            `}
          >
            {/* RARITY HEADER */}
            <div className={`h-2 w-full bg-gradient-to-r ${
              item.rarity === 'common' ? 'from-gray-400 to-gray-600' :
              item.rarity === 'rare' ? 'from-blue-400 to-blue-600' :
              item.rarity === 'epic' ? 'from-purple-400 to-purple-600' :
              'from-yellow-400 to-yellow-600'
            }`} />

            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {/* PREVIEW */}
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl bg-gray-800 border-4 border-gray-600">
                  {item.category === 'colors' ? (
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-white"
                      style={{ 
                        background: item.preview.includes('gradient') ? item.preview : item.preview 
                      }}
                    />
                  ) : (
                    item.preview
                  )}
                </div>

                {/* INFO */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                  <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* RARITY BADGE */}
                <Badge className={`${
                  item.rarity === 'common' ? 'bg-gray-500' :
                  item.rarity === 'rare' ? 'bg-blue-500' :
                  item.rarity === 'epic' ? 'bg-purple-500' :
                  'bg-yellow-500'
                } text-white font-semibold`}>
                  {item.rarity.toUpperCase()}
                </Badge>

                {/* PRICE & BUY */}
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2">
                    {item.currency === 'coins' ? (
                      <Coins className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <Gem className="w-5 h-5 text-purple-400" />
                    )}
                    <span className="text-xl font-bold text-white">
                      {item.price}
                    </span>
                    <span className="text-sm text-gray-400">
                      {item.currency === 'coins' ? 'monedas' : 'gemas'}
                    </span>
                  </div>

                  {item.owned ? (
                    <Button 
                      disabled 
                      className="w-full bg-green-600 text-white font-bold"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      ¡Ya es tuyo!
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={
                        item.currency === 'coins' ? coins < item.price : gems < item.price
                      }
                      className={`w-full font-bold transition-all ${
                        item.currency === 'coins' ? coins >= item.price : gems >= item.price
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {item.currency === 'coins' ? coins >= item.price : gems >= item.price
                        ? '¡Comprar Ahora!'
                        : 'Insuficiente'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>

            {/* OWNED OVERLAY */}
            {item.owned && (
              <div className="absolute top-4 right-4 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* 🎮 INFORMACIÓN */}
      <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Información de la Tienda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold mb-3 text-cyan-300">💰 Cómo Ganar Monedas:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Cuidar Tamagotchi:</strong> Cada acción da monedas</li>
                <li>• <strong>Subir de Nivel:</strong> Bonus por level up</li>
                <li>• <strong>Jugar Arcade:</strong> Puntuaciones altas dan recompensas</li>
                <li>• <strong>Logros:</strong> Desbloquear achievements</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-3 text-purple-300">💎 Cómo Ganar Gemas:</h4>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Eventos Especiales:</strong> Participación en eventos</li>
                <li>• <strong>Logros Épicos:</strong> Achievements difíciles</li>
                <li>• <strong>Racha Diaria:</strong> Jugar varios días seguidos</li>
                <li>• <strong>Perfection:</strong> Puntuaciones perfectas</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}