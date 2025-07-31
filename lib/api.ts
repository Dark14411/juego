// API completa y robusta para el juego de superhéroes
export interface Hero {
  id: string
  name: string
  level: number
  health: number
  energy: number
  strength: number
  happiness: number
  experience: number
  maxExperience: number

  // Apariencia de superhéroe
  superpower: string
  bodyColor: string
  capeColor: string
  maskColor: string
  symbol: string
  costume: string

  // Mascota asociada
  petId?: string

  // Inventario y economía
  coins: number
  items: InventoryItem[]
  achievements: Achievement[]

  // Metadatos
  lastActive: string
  totalPlayTime: number
  createdAt: string
}

export interface Pet {
  id: string
  name: string
  type: "dog" | "cat" | "rabbit" | "hamster" | "parrot" | "turtle"
  breed: string

  // Estadísticas
  happiness: number
  health: number
  energy: number
  hunger: number
  cleanliness: number
  level: number
  experience: number
  maxExperience: number

  // Apariencia
  primaryColor: string
  secondaryColor: string
  pattern?: string

  // Accesorios
  accessories: {
    collar?: string
    hat?: string
    glasses?: string
    toy?: string
    outfit?: string
  }

  // Estado
  mood: "ecstatic" | "happy" | "content" | "neutral" | "sad" | "tired" | "sick"
  isAdopted: boolean
  ownerId?: string

  // Metadatos
  lastFed: string
  lastPlayed: string
  lastCleaned: string
  adoptionDate?: string
  price: number
}

export interface GameItem {
  id: string
  name: string
  description: string
  type: "food" | "medicine" | "toy" | "accessory" | "potion" | "special"
  category: string
  price: number
  isFree: boolean

  // Efectos en la mascota
  effects: {
    health?: number
    energy?: number
    happiness?: number
    hunger?: number
    cleanliness?: number
    experience?: number
  }

  // Metadatos visuales
  icon: string
  rarity: "common" | "rare" | "epic" | "legendary"
  color: string

  // Restricciones
  usageLimit?: number
  cooldown?: number
  requiredLevel?: number
}

export interface InventoryItem {
  itemId: string
  quantity: number
  purchaseDate: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: "care" | "play" | "collection" | "special" | "mastery"
  reward: {
    coins?: number
    items?: string[]
    experience?: number
  }
  unlockedAt?: string
  progress: number
  maxProgress: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message: string
  error?: string
  effects?: Record<string, number>
}

// Base de datos simulada mejorada
const heroesDB: Hero[] = [
  {
    id: "hero-1",
    name: "Captain Thunder",
    level: 12,
    health: 95,
    energy: 88,
    strength: 92,
    happiness: 96,
    experience: 850,
    maxExperience: 1000,

    superpower: "Lightning Control",
    bodyColor: "#4F46E5",
    capeColor: "#DC2626",
    maskColor: "#1F2937",
    symbol: "⚡",
    costume: "classic",

    petId: "pet-1",

    coins: 2500,
    items: [
      { itemId: "premium-food", quantity: 5, purchaseDate: "2024-01-15" },
      { itemId: "energy-potion", quantity: 3, purchaseDate: "2024-01-14" },
      { itemId: "basic-food", quantity: 10, purchaseDate: "2024-01-15" },
      { itemId: "health-potion", quantity: 5, purchaseDate: "2024-01-15" },
      { itemId: "soap", quantity: 8, purchaseDate: "2024-01-15" },
    ],
    achievements: [],

    lastActive: "Ahora",
    totalPlayTime: 45,
    createdAt: "2024-01-01",
  },
]

const petsDB: Pet[] = [
  {
    id: "pet-1",
    name: "Thunder",
    type: "dog",
    breed: "Golden Retriever",

    happiness: 92,
    health: 95,
    energy: 88,
    hunger: 75,
    cleanliness: 90,
    level: 8,
    experience: 320,
    maxExperience: 400,

    primaryColor: "#D2691E",
    secondaryColor: "#F5DEB3",
    pattern: "solid",

    accessories: {
      collar: "lightning-collar",
      hat: "superhero-cap",
    },

    mood: "happy",
    isAdopted: true,
    ownerId: "hero-1",

    lastFed: "2024-01-15T10:30:00Z",
    lastPlayed: "2024-01-15T11:15:00Z",
    lastCleaned: "2024-01-15T09:00:00Z",
    adoptionDate: "2024-01-01T00:00:00Z",
    price: 0,
  },
  {
    id: "pet-2",
    name: "Whiskers",
    type: "cat",
    breed: "Persian",

    happiness: 85,
    health: 90,
    energy: 95,
    hunger: 60,
    cleanliness: 88,
    level: 5,
    experience: 180,
    maxExperience: 250,

    primaryColor: "#FFFFFF",
    secondaryColor: "#D3D3D3",
    pattern: "fluffy",

    accessories: {},

    mood: "content",
    isAdopted: false,
    price: 1500,

    lastFed: "2024-01-15T08:00:00Z",
    lastPlayed: "2024-01-15T07:30:00Z",
    lastCleaned: "2024-01-15T06:00:00Z",
  },
  {
    id: "pet-3",
    name: "Speedy",
    type: "rabbit",
    breed: "Holland Lop",

    happiness: 78,
    health: 85,
    energy: 92,
    hunger: 45,
    cleanliness: 82,
    level: 3,
    experience: 95,
    maxExperience: 150,

    primaryColor: "#8B4513",
    secondaryColor: "#FFFFFF",
    pattern: "spotted",

    accessories: {},

    mood: "happy",
    isAdopted: false,
    price: 800,

    lastFed: "2024-01-15T06:00:00Z",
    lastPlayed: "2024-01-15T05:30:00Z",
    lastCleaned: "2024-01-15T04:00:00Z",
  },
]

const itemsDB: GameItem[] = [
  // Comida - SIEMPRE disponible
  {
    id: "basic-food",
    name: "Comida Básica",
    description: "Alimento nutritivo para mascotas",
    type: "food",
    category: "Alimentación",
    price: 0,
    isFree: true,
    effects: { hunger: 20, health: 5, experience: 2 },
    icon: "🥘",
    rarity: "common",
    color: "#10B981",
  },
  {
    id: "premium-food",
    name: "Comida Premium",
    description: "Alimento gourmet que aumenta la felicidad",
    type: "food",
    category: "Alimentación",
    price: 50,
    isFree: false,
    effects: { hunger: 35, health: 10, happiness: 15, experience: 5 },
    icon: "🍖",
    rarity: "rare",
    color: "#8B5CF6",
  },
  {
    id: "super-treat",
    name: "Súper Premio",
    description: "Delicioso premio que vuelve loca a tu mascota",
    type: "food",
    category: "Alimentación",
    price: 100,
    isFree: false,
    effects: { hunger: 25, happiness: 30, energy: 15, experience: 8 },
    icon: "🦴",
    rarity: "epic",
    color: "#F59E0B",
  },

  // Medicina - SIEMPRE disponible
  {
    id: "health-potion",
    name: "Poción de Salud",
    description: "Restaura la salud de tu mascota",
    type: "medicine",
    category: "Medicina",
    price: 0,
    isFree: true,
    effects: { health: 25, experience: 3 },
    icon: "💊",
    rarity: "common",
    color: "#EF4444",
  },
  {
    id: "energy-potion",
    name: "Poción de Energía",
    description: "Restaura la energía completamente",
    type: "medicine",
    category: "Medicina",
    price: 75,
    isFree: false,
    effects: { energy: 40, health: 10, experience: 5 },
    icon: "⚡",
    rarity: "rare",
    color: "#3B82F6",
  },
  {
    id: "happiness-elixir",
    name: "Elixir de Felicidad",
    description: "Hace que tu mascota sea súper feliz",
    type: "medicine",
    category: "Medicina",
    price: 120,
    isFree: false,
    effects: { happiness: 50, health: 15, energy: 20, experience: 10 },
    icon: "✨",
    rarity: "epic",
    color: "#EC4899",
  },

  // Juguetes
  {
    id: "basic-ball",
    name: "Pelota Básica",
    description: "Pelota simple para jugar",
    type: "toy",
    category: "Juguetes",
    price: 0,
    isFree: true,
    effects: { happiness: 15, energy: -5, experience: 3 },
    icon: "⚽",
    rarity: "common",
    color: "#6B7280",
  },
  {
    id: "laser-pointer",
    name: "Puntero Láser",
    description: "Diversión garantizada para gatos",
    type: "toy",
    category: "Juguetes",
    price: 60,
    isFree: false,
    effects: { happiness: 25, energy: -10, experience: 6 },
    icon: "🔴",
    rarity: "rare",
    color: "#DC2626",
  },

  // Limpieza - SIEMPRE disponible
  {
    id: "soap",
    name: "Jabón",
    description: "Para mantener limpia a tu mascota",
    type: "special",
    category: "Limpieza",
    price: 0,
    isFree: true,
    effects: { cleanliness: 30, health: 5, happiness: 10 },
    icon: "🧼",
    rarity: "common",
    color: "#06B6D4",
  },
  {
    id: "premium-shampoo",
    name: "Champú Premium",
    description: "Deja el pelaje suave y brillante",
    type: "special",
    category: "Limpieza",
    price: 80,
    isFree: false,
    effects: { cleanliness: 50, health: 15, happiness: 20, experience: 8 },
    icon: "🧴",
    rarity: "rare",
    color: "#8B5CF6",
  },
]

// Simular delay de red más rápido para mejor UX
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// API de Héroes mejorada
export const heroAPI = {
  async getHeroes(): Promise<ApiResponse<Hero[]>> {
    await delay(200)
    return {
      success: true,
      data: heroesDB,
      message: "Héroes cargados exitosamente",
    }
  },

  async getHero(heroId: string): Promise<ApiResponse<Hero>> {
    await delay(100)
    const hero = heroesDB.find((h) => h.id === heroId)
    if (!hero) {
      return { success: false, message: "Héroe no encontrado" }
    }
    return {
      success: true,
      data: hero,
      message: "Héroe cargado exitosamente",
    }
  },

  async createHero(heroData: Partial<Hero>): Promise<ApiResponse<Hero>> {
    await delay(300)
    const newHero: Hero = {
      id: `hero-${Date.now()}`,
      name: heroData.name || "Nuevo Héroe",
      level: 1,
      health: 100,
      energy: 100,
      strength: 50,
      happiness: 80,
      experience: 0,
      maxExperience: 100,

      superpower: heroData.superpower || "Super Strength",
      bodyColor: heroData.bodyColor || "#4F46E5",
      capeColor: heroData.capeColor || "#DC2626",
      maskColor: heroData.maskColor || "#1F2937",
      symbol: heroData.symbol || "⭐",
      costume: heroData.costume || "classic",

      coins: 500,
      items: [
        { itemId: "basic-food", quantity: 10, purchaseDate: new Date().toISOString() },
        { itemId: "health-potion", quantity: 5, purchaseDate: new Date().toISOString() },
        { itemId: "soap", quantity: 5, purchaseDate: new Date().toISOString() },
      ],
      achievements: [],

      lastActive: "Ahora",
      totalPlayTime: 0,
      createdAt: new Date().toISOString(),
    }

    heroesDB.push(newHero)
    return {
      success: true,
      data: newHero,
      message: "¡Héroe creado exitosamente!",
    }
  },

  async updateHero(heroId: string, updates: Partial<Hero>): Promise<ApiResponse<Hero>> {
    await delay(150)
    const heroIndex = heroesDB.findIndex((h) => h.id === heroId)
    if (heroIndex === -1) {
      return { success: false, message: "Héroe no encontrado" }
    }

    heroesDB[heroIndex] = { ...heroesDB[heroIndex], ...updates, lastActive: "Ahora" }
    return {
      success: true,
      data: heroesDB[heroIndex],
      message: "Héroe actualizado exitosamente",
    }
  },

  async associatePet(heroId: string, petId: string): Promise<ApiResponse<Hero>> {
    await delay(200)
    const heroIndex = heroesDB.findIndex((h) => h.id === heroId)
    const petIndex = petsDB.findIndex((p) => p.id === petId)

    if (heroIndex === -1) return { success: false, message: "Héroe no encontrado" }
    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }

    heroesDB[heroIndex].petId = petId
    petsDB[petIndex].isAdopted = true
    petsDB[petIndex].ownerId = heroId
    petsDB[petIndex].adoptionDate = new Date().toISOString()

    return {
      success: true,
      data: heroesDB[heroIndex],
      message: `¡${petsDB[petIndex].name} ahora es tu compañero!`,
    }
  },
}

// API de Mascotas mejorada
export const petAPI = {
  async getPets(): Promise<ApiResponse<Pet[]>> {
    await delay(150)
    return {
      success: true,
      data: petsDB,
      message: "Mascotas cargadas exitosamente",
    }
  },

  async getAvailablePets(): Promise<ApiResponse<Pet[]>> {
    await delay(150)
    const available = petsDB.filter((pet) => !pet.isAdopted)
    return {
      success: true,
      data: available,
      message: "Mascotas disponibles para adopción",
    }
  },

  async getHeroPets(heroId: string): Promise<ApiResponse<Pet[]>> {
    await delay(100)
    const heroPets = petsDB.filter((pet) => pet.ownerId === heroId)
    return {
      success: true,
      data: heroPets,
      message: "Mascotas del héroe cargadas",
    }
  },

  // Acciones SIEMPRE disponibles con lógica inteligente
  async feedPet(petId: string, itemId = "basic-food"): Promise<ApiResponse<Pet>> {
    await delay(300)
    const petIndex = petsDB.findIndex((p) => p.id === petId)
    const item = itemsDB.find((i) => i.id === itemId)

    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }
    if (!item || item.type !== "food") return { success: false, message: "Item de comida no válido" }

    const pet = petsDB[petIndex]

    // Aplicar efectos SIEMPRE, pero con mensajes contextuales
    const oldHunger = pet.hunger
    const oldHealth = pet.health
    const oldHappiness = pet.happiness

    if (item.effects.hunger) pet.hunger = Math.min(100, pet.hunger + item.effects.hunger)
    if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
    if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)
    if (item.effects.experience) {
      pet.experience += item.effects.experience
      if (pet.experience >= pet.maxExperience) {
        pet.level += 1
        pet.experience = 0
        pet.maxExperience = Math.floor(pet.maxExperience * 1.3)
      }
    }

    pet.lastFed = new Date().toISOString()
    pet.mood =
      pet.happiness > 90 ? "ecstatic" : pet.happiness > 75 ? "happy" : pet.happiness > 60 ? "content" : "neutral"

    // Mensaje contextual
    let message = `¡${pet.name} disfrutó su ${item.name}!`
    if (oldHunger >= 95) message += " (Ya estaba muy satisfecho, pero siempre disfruta la comida)"
    if (pet.level > 1 && pet.experience === 0) message += ` ¡Y subió al nivel ${pet.level}!`

    return {
      success: true,
      data: pet,
      message,
      effects: {
        hunger: pet.hunger - oldHunger,
        health: pet.health - oldHealth,
        happiness: pet.happiness - oldHappiness,
      },
    }
  },

  async playWithPet(petId: string, itemId?: string): Promise<ApiResponse<Pet>> {
    await delay(400)
    const petIndex = petsDB.findIndex((p) => p.id === petId)
    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }

    const pet = petsDB[petIndex]
    const item = itemId ? itemsDB.find((i) => i.id === itemId) : null

    let effects = { happiness: 20, energy: -10, experience: 5 }

    if (item && item.type === "toy") {
      effects = {
        happiness: item.effects.happiness || 20,
        energy: item.effects.energy || -10,
        experience: item.effects.experience || 5,
      }
    }

    const oldHappiness = pet.happiness
    const oldEnergy = pet.energy

    pet.happiness = Math.min(100, pet.happiness + effects.happiness)
    pet.energy = Math.max(0, pet.energy + effects.energy)
    pet.experience += effects.experience

    if (pet.experience >= pet.maxExperience) {
      pet.level += 1
      pet.experience = 0
      pet.maxExperience = Math.floor(pet.maxExperience * 1.3)
    }

    pet.lastPlayed = new Date().toISOString()
    pet.mood = pet.happiness > 90 ? "ecstatic" : pet.happiness > 70 ? "happy" : "content"

    let message = `¡${pet.name} se divirtió muchísimo jugando!`
    if (oldEnergy <= 10) message += " (Estaba cansado, pero siempre tiene energía para jugar contigo)"

    return {
      success: true,
      data: pet,
      message,
      effects: {
        happiness: pet.happiness - oldHappiness,
        energy: pet.energy - oldEnergy,
        experience: effects.experience,
      },
    }
  },

  async healPet(petId: string, itemId = "health-potion"): Promise<ApiResponse<Pet>> {
    await delay(250)
    const petIndex = petsDB.findIndex((p) => p.id === petId)
    const item = itemsDB.find((i) => i.id === itemId)

    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }
    if (!item || item.type !== "medicine") return { success: false, message: "Item de medicina no válido" }

    const pet = petsDB[petIndex]
    const oldHealth = pet.health
    const oldEnergy = pet.energy
    const oldHappiness = pet.happiness

    if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
    if (item.effects.energy) pet.energy = Math.min(100, pet.energy + item.effects.energy)
    if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)
    if (item.effects.experience) pet.experience += item.effects.experience

    pet.mood = pet.health > 90 ? "happy" : pet.health > 70 ? "content" : "neutral"

    let message = `¡${pet.name} se siente mucho mejor!`
    if (oldHealth >= 95) message += " (Ya estaba muy sano, pero el cuidado extra siempre es bueno)"

    return {
      success: true,
      data: pet,
      message,
      effects: {
        health: pet.health - oldHealth,
        energy: pet.energy - oldEnergy,
        happiness: pet.happiness - oldHappiness,
      },
    }
  },

  async cleanPet(petId: string, itemId = "soap"): Promise<ApiResponse<Pet>> {
    await delay(350)
    const petIndex = petsDB.findIndex((p) => p.id === petId)
    const item = itemsDB.find((i) => i.id === itemId)

    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }
    if (!item || item.category !== "Limpieza") return { success: false, message: "Item de limpieza no válido" }

    const pet = petsDB[petIndex]
    const oldCleanliness = pet.cleanliness
    const oldHealth = pet.health
    const oldHappiness = pet.happiness

    if (item.effects.cleanliness) pet.cleanliness = Math.min(100, pet.cleanliness + item.effects.cleanliness)
    if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
    if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)

    pet.lastCleaned = new Date().toISOString()
    pet.mood = pet.cleanliness > 90 ? "happy" : "content"

    let message = `¡${pet.name} está súper limpio y feliz!`
    if (oldCleanliness >= 95) message += " (Ya estaba muy limpio, pero disfruta el baño)"

    return {
      success: true,
      data: pet,
      message,
      effects: {
        cleanliness: pet.cleanliness - oldCleanliness,
        health: pet.health - oldHealth,
        happiness: pet.happiness - oldHappiness,
      },
    }
  },

  async adoptPet(heroId: string, petId: string): Promise<ApiResponse<Pet>> {
    await delay(400)
    const heroIndex = heroesDB.findIndex((h) => h.id === heroId)
    const petIndex = petsDB.findIndex((p) => p.id === petId)

    if (heroIndex === -1) return { success: false, message: "Héroe no encontrado" }
    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }

    const hero = heroesDB[heroIndex]
    const pet = petsDB[petIndex]

    if (pet.isAdopted) return { success: false, message: "Esta mascota ya tiene dueño" }
    if (hero.coins < pet.price) return { success: false, message: "No tienes suficientes monedas" }

    // Procesar adopción
    hero.coins -= pet.price
    hero.petId = petId
    pet.isAdopted = true
    pet.ownerId = heroId
    pet.adoptionDate = new Date().toISOString()

    return {
      success: true,
      data: pet,
      message: `¡Felicidades! ${pet.name} ahora es parte de tu familia heroica!`,
    }
  },
}

// API de Items mejorada
export const itemAPI = {
  async getItems(): Promise<ApiResponse<GameItem[]>> {
    await delay(100)
    return {
      success: true,
      data: itemsDB,
      message: "Items cargados exitosamente",
    }
  },

  async getItemsByCategory(category: string): Promise<ApiResponse<GameItem[]>> {
    await delay(80)
    const items = itemsDB.filter((item) => item.category === category)
    return {
      success: true,
      data: items,
      message: `Items de ${category} cargados`,
    }
  },

  async purchaseItem(heroId: string, itemId: string, quantity = 1): Promise<ApiResponse<Hero>> {
    await delay(200)
    const heroIndex = heroesDB.findIndex((h) => h.id === heroId)
    const item = itemsDB.find((i) => i.id === itemId)

    if (heroIndex === -1) return { success: false, message: "Héroe no encontrado" }
    if (!item) return { success: false, message: "Item no encontrado" }

    const hero = heroesDB[heroIndex]
    const totalCost = item.price * quantity

    if (!item.isFree && hero.coins < totalCost) {
      return { success: false, message: "No tienes suficientes monedas" }
    }

    // Procesar compra
    if (!item.isFree) {
      hero.coins -= totalCost
    }

    // Agregar al inventario
    const existingItem = hero.items.find((i) => i.itemId === itemId)
    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      hero.items.push({
        itemId,
        quantity,
        purchaseDate: new Date().toISOString(),
      })
    }

    hero.lastActive = "Ahora"

    return {
      success: true,
      data: hero,
      message: item.isFree
        ? `¡Obtuviste ${quantity}x ${item.name} gratis!`
        : `¡Compraste ${quantity}x ${item.name} por ${totalCost} monedas!`,
    }
  },

  async useItem(heroId: string, petId: string, itemId: string): Promise<ApiResponse<{ hero: Hero; pet: Pet }>> {
    await delay(250)
    const heroIndex = heroesDB.findIndex((h) => h.id === heroId)
    const petIndex = petsDB.findIndex((p) => p.id === petId)
    const item = itemsDB.find((i) => i.id === itemId)

    if (heroIndex === -1) return { success: false, message: "Héroe no encontrado" }
    if (petIndex === -1) return { success: false, message: "Mascota no encontrada" }
    if (!item) return { success: false, message: "Item no encontrado" }

    const hero = heroesDB[heroIndex]
    const pet = petsDB[petIndex]

    // Verificar que el héroe tiene el item
    const inventoryItem = hero.items.find((i) => i.itemId === itemId)
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      return { success: false, message: "No tienes este item en tu inventario" }
    }

    // Usar el item
    inventoryItem.quantity -= 1
    if (inventoryItem.quantity <= 0) {
      hero.items = hero.items.filter((i) => i.itemId !== itemId)
    }

    // Aplicar efectos según el tipo de item
    let message = ""
    const oldStats = {
      hunger: pet.hunger,
      health: pet.health,
      happiness: pet.happiness,
      energy: pet.energy,
      cleanliness: pet.cleanliness,
    }

    switch (item.type) {
      case "food":
        if (item.effects.hunger) pet.hunger = Math.min(100, pet.hunger + item.effects.hunger)
        if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
        if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)
        pet.lastFed = new Date().toISOString()
        message = `¡${pet.name} disfrutó mucho su ${item.name}!`
        break

      case "medicine":
        if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
        if (item.effects.energy) pet.energy = Math.min(100, pet.energy + item.effects.energy)
        if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)
        message = `¡${pet.name} se siente mucho mejor!`
        break

      case "special":
        if (item.effects.cleanliness) pet.cleanliness = Math.min(100, pet.cleanliness + item.effects.cleanliness)
        if (item.effects.health) pet.health = Math.min(100, pet.health + item.effects.health)
        if (item.effects.happiness) pet.happiness = Math.min(100, pet.happiness + item.effects.happiness)
        pet.lastCleaned = new Date().toISOString()
        message = `¡${pet.name} está súper limpio!`
        break
    }

    // Aplicar experiencia
    if (item.effects.experience) {
      pet.experience += item.effects.experience
      if (pet.experience >= pet.maxExperience) {
        pet.level += 1
        pet.experience = 0
        pet.maxExperience = Math.floor(pet.maxExperience * 1.3)
        message += ` ¡Y subió al nivel ${pet.level}!`
      }
    }

    // Actualizar estado de ánimo
    if (pet.happiness > 90) pet.mood = "ecstatic"
    else if (pet.happiness > 75) pet.mood = "happy"
    else if (pet.happiness > 60) pet.mood = "content"
    else pet.mood = "neutral"

    hero.lastActive = "Ahora"

    return {
      success: true,
      data: { hero, pet },
      message,
      effects: {
        hunger: pet.hunger - oldStats.hunger,
        health: pet.health - oldStats.health,
        happiness: pet.happiness - oldStats.happiness,
        energy: pet.energy - oldStats.energy,
        cleanliness: pet.cleanliness - oldStats.cleanliness,
      },
    }
  },
}

// API Service para conectar con el backend de juegos
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Tipos de datos que coinciden con el backend
export interface Game {
  _id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'puzzle' | 'arcade' | 'estrategia' | 'adivinanza' | 'memoria' | 'velocidad' | 'coordinacion' | 'logica' | 'matematicas' | 'palabras';
  dificultad: 'facil' | 'medio' | 'dificil' | 'experto';
  configuracion: {
    tiempoLimite: number;
    intentosMaximos: number;
    puntuacionMaxima: number;
    niveles: number;
    requisitos: {
      nivelMinimo: number;
      itemsRequeridos: string[];
    };
  };
  recompensas: {
    experiencia: number;
    monedas: number;
    items: string[];
    logros: string[];
  };
  estado: 'activo' | 'inactivo' | 'mantenimiento';
  estadisticas?: {
    sesionesTotales: number;
    puntuacionPromedio: number;
    completionRate: string;
  };
  topScores?: Array<{
    usuario: { username: string };
    puntuacion: number;
    fechaInicio: string;
  }>;
  actividadReciente?: Array<{
    usuario: { username: string };
    estado: string;
    fechaInicio: string;
  }>;
}

export interface GameSession {
  _id: string;
  usuario: string;
  juego: string;
  puntuacion: number;
  tiempoJugado: number;
  nivel: number;
  intentos: number;
  estado: 'en_progreso' | 'completado' | 'fallido' | 'abandonado';
  progreso: {
    porcentaje: number;
    pasosCompletados: number;
    pasosTotales: number;
  };
  datosJuego: any;
  recompensasObtenidas?: {
    experiencia: number;
    monedas: number;
    items: string[];
    logros: string[];
  };
  fechaInicio: string;
  fechaFin?: string;
}

export interface UserStats {
  general: {
    totalSessions: number;
    completedGames: number;
    totalScore: number;
    averageScore: number;
    totalPlayTime: number;
    highestScore: number;
  };
  porTipoJuego: Array<{
    _id: string;
    count: number;
    avgScore: number;
    maxScore: number;
    completed: number;
  }>;
  sesionesRecientes: GameSession[];
  logros: any[];
  nivel: {
    actual: number;
    experiencia: number;
    siguienteNivel: number;
    progreso: string;
  };
}

export interface Leaderboard {
  juego: Game;
  tipo: 'global' | 'semanal' | 'mensual';
  clasificaciones: Array<{
    posicion: number;
    usuario: {
      id: string;
      username: string;
    };
    puntuacion: number;
    tiempo: number;
    partidasJugadas: number;
  }>;
}

// Clase para manejar la API
class GameAPI {
  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('gameToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Métodos de autenticación
  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();
      
      if (data.success && data.data?.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('gameToken', data.data.token);
          localStorage.setItem('gameUser', JSON.stringify(data.data.user));
        }
        return { success: true, token: data.data.token, user: data.data.user };
      }
      
      return { success: false, message: data.message || 'Error en login' };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async register(username: string, email: string, password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Métodos de juegos
  async getGames(filters?: {
    tipo?: string;
    dificultad?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ success: boolean; data?: Game[]; pagination?: any; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) params.append(key, value.toString());
        });
      }
      
      const response = await fetch(`${API_BASE_URL}/games?${params}`, {
        headers: this.getAuthHeaders(),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener juegos:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async getGame(gameId: string): Promise<{ success: boolean; data?: Game; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
        headers: this.getAuthHeaders(),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener juego:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async startGame(gameId: string): Promise<{ success: boolean; data?: GameSession; gameInfo?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/start`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ juegoId: gameId }),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al iniciar juego:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async updateGameSession(sessionId: string, updateData: {
    puntuacion?: number;
    progreso?: Partial<GameSession['progreso']>;
    nivel?: number;
    datosJuego?: any;
  }): Promise<{ success: boolean; data?: GameSession; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/session/${sessionId}/update`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async finishGameSession(sessionId: string, finalData: {
    puntuacion: number;
    tiempoJugado: number;
    estado: 'completado' | 'fallido' | 'abandonado';
  }): Promise<{ success: boolean; data?: GameSession; recompensas?: any; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/session/${sessionId}/finish`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(finalData),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al finalizar sesión:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async getUserStats(): Promise<{ success: boolean; data?: UserStats; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/stats/user`, {
        headers: this.getAuthHeaders(),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async getLeaderboard(gameId: string, tipo: 'global' | 'semanal' | 'mensual' = 'global'): Promise<{ success: boolean; data?: Leaderboard; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/games/leaderboard/${gameId}?tipo=${tipo}`, {
        headers: this.getAuthHeaders(),
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener leaderboard:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Utilidades
  getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('gameUser');
    return user ? JSON.parse(user) : null;
  }

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('gameToken');
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gameToken');
      localStorage.removeItem('gameUser');
    }
  }
}

// Instancia singleton de la API
export const gameAPI = new GameAPI();

// Hook personalizado para usar la API
export function useGameAPI() {
  return gameAPI;
}
