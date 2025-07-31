// Tipos para el motor del juego
export interface PouCharacter {
  id: string
  name: string
  level: number
  experience: number
  health: number
  maxHealth: number
  energy: number
  maxEnergy: number
  hunger: number
  maxHunger: number
  happiness: number
  maxHappiness: number
  cleanliness: number
  maxCleanliness: number
  mood: "ecstatic" | "happy" | "content" | "neutral" | "sad" | "tired" | "sick"
  accessories: string[]
  lastFed: Date
  lastPlayed: Date
  lastCleaned: Date
  lastSlept: Date
}

export interface Pet {
  id: string
  name: string
  type: string
  level: number
  health: number
  maxHealth: number
  happiness: number
  maxHappiness: number
  energy: number
  maxEnergy: number
  hunger: number
  maxHunger: number
  ownerId: string
  accessories: string[]
}

export interface GameState {
  pou: PouCharacter
  pets: Pet[]
  coins: number
  inventory: string[]
  achievements: string[]
  settings: {
    soundEnabled: boolean
    musicEnabled: boolean
    notificationsEnabled: boolean
  }
}

// Colores modernos para el juego
export const MODERN_COLORS = {
  primary: "#FFD700",
  secondary: "#FFA500",
  accent: "#FF6B35",
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#F44336",
  info: "#2196F3",
  background: "#FFF8E1",
  surface: "#FFFFFF",
  text: "#333333",
  textSecondary: "#666666",
}

// Accesorios disponibles
export const ACCESSORIES = [
  { id: "crown", name: "Corona", icon: "👑", price: 1000 },
  { id: "glasses", name: "Gafas", icon: "👓", price: 500 },
  { id: "hat", name: "Sombrero", icon: "🎩", price: 300 },
  { id: "bowtie", name: "Corbata", icon: "🎀", price: 200 },
  { id: "necklace", name: "Collar", icon: "📿", price: 400 },
  { id: "earrings", name: "Aretes", icon: "💎", price: 600 },
]

// Accesorios para mascotas
export const PET_ACCESSORIES = [
  { id: "pet-collar", name: "Collar", icon: "🦮", price: 150 },
  { id: "pet-hat", name: "Sombrero", icon: "🎩", price: 200 },
  { id: "pet-bow", name: "Lazo", icon: "🎀", price: 100 },
  { id: "pet-glasses", name: "Gafas", icon: "👓", price: 250 },
]

// Estado inicial de Pou
export const INITIAL_POU: PouCharacter = {
  id: "pou-1",
  name: "Pou",
  level: 1,
  experience: 0,
  health: 100,
  maxHealth: 100,
  energy: 100,
  maxEnergy: 100,
  hunger: 100,
  maxHunger: 100,
  happiness: 100,
  maxHappiness: 100,
  cleanliness: 100,
  maxCleanliness: 100,
  mood: "happy",
  accessories: [],
  lastFed: new Date(),
  lastPlayed: new Date(),
  lastCleaned: new Date(),
  lastSlept: new Date(),
}

// Estado inicial de mascota
export const INITIAL_PET: Pet = {
  id: "pet-1",
  name: "Mascota",
  type: "dog",
  level: 1,
  health: 100,
  maxHealth: 100,
  happiness: 100,
  maxHappiness: 100,
  energy: 100,
  maxEnergy: 100,
  hunger: 100,
  maxHunger: 100,
  ownerId: "pou-1",
  accessories: [],
}

// Motor principal del juego
export class GameEngine {
  private state: GameState

  constructor() {
    this.state = {
      pou: { ...INITIAL_POU },
      pets: [{ ...INITIAL_PET }],
      coins: 10000,
      inventory: [],
      achievements: [],
      settings: {
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
      },
    }
  }

  // Obtener estado actual
  getState(): GameState {
    return { ...this.state }
  }

  // Alimentar a Pou
  feedPou(): { success: boolean; message: string; coinsEarned?: number } {
    const pou = this.state.pou
    const timeSinceLastFed = Date.now() - pou.lastFed.getTime()
    const hoursSinceLastFed = timeSinceLastFed / (1000 * 60 * 60)

    if (hoursSinceLastFed < 1) {
      return { success: false, message: "Pou no tiene hambre ahora" }
    }

    const hungerGain = Math.min(30, pou.maxHunger - pou.hunger)
    const happinessGain = Math.min(10, pou.maxHappiness - pou.happiness)
    const coinsEarned = Math.floor(Math.random() * 10) + 5

    pou.hunger = Math.min(pou.maxHunger, pou.hunger + hungerGain)
    pou.happiness = Math.min(pou.maxHappiness, pou.happiness + happinessGain)
    pou.lastFed = new Date()
    this.state.coins += coinsEarned

    this.updatePouMood()

    return {
      success: true,
      message: `¡Pou está satisfecho! +${hungerGain} hambre, +${happinessGain} felicidad`,
      coinsEarned,
    }
  }

  // Jugar con Pou
  playWithPou(): { success: boolean; message: string; coinsEarned?: number } {
    const pou = this.state.pou
    const timeSinceLastPlayed = Date.now() - pou.lastPlayed.getTime()
    const hoursSinceLastPlayed = timeSinceLastPlayed / (1000 * 60 * 60)

    if (hoursSinceLastPlayed < 2) {
      return { success: false, message: "Pou está cansado de jugar" }
    }

    if (pou.energy < 20) {
      return { success: false, message: "Pou necesita descansar" }
    }

    const happinessGain = Math.min(25, pou.maxHappiness - pou.happiness)
    const energyLoss = Math.min(15, pou.energy)
    const coinsEarned = Math.floor(Math.random() * 15) + 10

    pou.happiness = Math.min(pou.maxHappiness, pou.happiness + happinessGain)
    pou.energy = Math.max(0, pou.energy - energyLoss)
    pou.lastPlayed = new Date()
    this.state.coins += coinsEarned

    this.updatePouMood()

    return {
      success: true,
      message: `¡Pou se divirtió mucho! +${happinessGain} felicidad, -${energyLoss} energía`,
      coinsEarned,
    }
  }

  // Limpiar a Pou
  cleanPou(): { success: boolean; message: string; coinsEarned?: number } {
    const pou = this.state.pou
    const timeSinceLastCleaned = Date.now() - pou.lastCleaned.getTime()
    const hoursSinceLastCleaned = timeSinceLastCleaned / (1000 * 60 * 60)

    if (hoursSinceLastCleaned < 3) {
      return { success: false, message: "Pou está limpio" }
    }

    const cleanlinessGain = Math.min(40, pou.maxCleanliness - pou.cleanliness)
    const happinessGain = Math.min(5, pou.maxHappiness - pou.happiness)
    const coinsEarned = Math.floor(Math.random() * 8) + 3

    pou.cleanliness = Math.min(pou.maxCleanliness, pou.cleanliness + cleanlinessGain)
    pou.happiness = Math.min(pou.maxHappiness, pou.happiness + happinessGain)
    pou.lastCleaned = new Date()
    this.state.coins += coinsEarned

    this.updatePouMood()

    return {
      success: true,
      message: `¡Pou está brillante! +${cleanlinessGain} limpieza, +${happinessGain} felicidad`,
      coinsEarned,
    }
  }

  // Hacer dormir a Pou
  sleepPou(): { success: boolean; message: string; coinsEarned?: number } {
    const pou = this.state.pou
    const timeSinceLastSlept = Date.now() - pou.lastSlept.getTime()
    const hoursSinceLastSlept = timeSinceLastSlept / (1000 * 60 * 60)

    if (hoursSinceLastSlept < 4) {
      return { success: false, message: "Pou no tiene sueño" }
    }

    const energyGain = Math.min(50, pou.maxEnergy - pou.energy)
    const healthGain = Math.min(10, pou.maxHealth - pou.health)
    const coinsEarned = Math.floor(Math.random() * 5) + 2

    pou.energy = Math.min(pou.maxEnergy, pou.energy + energyGain)
    pou.health = Math.min(pou.maxHealth, pou.health + healthGain)
    pou.lastSlept = new Date()
    this.state.coins += coinsEarned

    this.updatePouMood()

    return {
      success: true,
      message: `¡Pou descansó bien! +${energyGain} energía, +${healthGain} salud`,
      coinsEarned,
    }
  }

  // Jugar con mascota
  playWithPet(petId: string): { success: boolean; message: string; coinsEarned?: number } {
    const pet = this.state.pets.find(p => p.id === petId)
    if (!pet) {
      return { success: false, message: "Mascota no encontrada" }
    }

    if (pet.energy < 15) {
      return { success: false, message: "La mascota está cansada" }
    }

    const happinessGain = Math.min(20, pet.maxHappiness - pet.happiness)
    const energyLoss = Math.min(10, pet.energy)
    const coinsEarned = Math.floor(Math.random() * 12) + 8

    pet.happiness = Math.min(pet.maxHappiness, pet.happiness + happinessGain)
    pet.energy = Math.max(0, pet.energy - energyLoss)
    this.state.coins += coinsEarned

    return {
      success: true,
      message: `¡La mascota se divirtió! +${happinessGain} felicidad, -${energyLoss} energía`,
      coinsEarned,
    }
  }

  // Comprar item
  buyItem(itemId: string, price: number): { success: boolean; message: string } {
    if (this.state.coins < price) {
      return { success: false, message: "No tienes suficientes monedas" }
    }

    this.state.coins -= price
    this.state.inventory.push(itemId)

    return { success: true, message: "¡Item comprado exitosamente!" }
  }

  // Usar item
  useItem(itemId: string): { success: boolean; message: string } {
    const itemIndex = this.state.inventory.indexOf(itemId)
    if (itemIndex === -1) {
      return { success: false, message: "No tienes este item" }
    }

    // Remover item del inventario
    this.state.inventory.splice(itemIndex, 1)

    // Aplicar efectos del item
    switch (itemId) {
      case "potion-1":
        this.state.pou.health = this.state.pou.maxHealth
        return { success: true, message: "¡Salud restaurada completamente!" }
      
      case "food-1":
        this.state.pou.hunger = Math.min(this.state.pou.maxHunger, this.state.pou.hunger + 50)
        this.state.pou.happiness = Math.min(this.state.pou.maxHappiness, this.state.pou.happiness + 20)
        return { success: true, message: "¡Pou se siente más fuerte!" }
      
      default:
        return { success: true, message: "Item usado" }
    }
  }

  // Actualizar estado de ánimo de Pou
  private updatePouMood(): void {
    const pou = this.state.pou
    const avgStats = (pou.health + pou.hunger + pou.happiness + pou.cleanliness) / 4

    if (avgStats >= 90) {
      pou.mood = "ecstatic"
    } else if (avgStats >= 75) {
      pou.mood = "happy"
    } else if (avgStats >= 60) {
      pou.mood = "content"
    } else if (avgStats >= 40) {
      pou.mood = "neutral"
    } else if (avgStats >= 25) {
      pou.mood = "sad"
    } else if (avgStats >= 10) {
      pou.mood = "tired"
    } else {
      pou.mood = "sick"
    }
  }

  // Degradación natural de estadísticas
  updateStats(): void {
    const pou = this.state.pou
    const now = Date.now()

    // Degradación por tiempo
    const hoursSinceLastFed = (now - pou.lastFed.getTime()) / (1000 * 60 * 60)
    const hoursSinceLastPlayed = (now - pou.lastPlayed.getTime()) / (1000 * 60 * 60)
    const hoursSinceLastCleaned = (now - pou.lastCleaned.getTime()) / (1000 * 60 * 60)

    if (hoursSinceLastFed > 6) {
      pou.hunger = Math.max(0, pou.hunger - 5)
    }
    if (hoursSinceLastPlayed > 8) {
      pou.happiness = Math.max(0, pou.happiness - 3)
    }
    if (hoursSinceLastCleaned > 12) {
      pou.cleanliness = Math.max(0, pou.cleanliness - 2)
    }

    // Degradación de energía
    pou.energy = Math.max(0, pou.energy - 1)

    this.updatePouMood()
  }

  // Ganar experiencia
  gainExperience(amount: number): void {
    const pou = this.state.pou
    pou.experience += amount

    // Subir de nivel
    const experienceNeeded = pou.level * 100
    if (pou.experience >= experienceNeeded) {
      pou.level += 1
      pou.experience -= experienceNeeded
      pou.maxHealth += 10
      pou.maxEnergy += 5
      pou.maxHunger += 5
      pou.maxHappiness += 5
      pou.maxCleanliness += 5
      
      // Restaurar estadísticas al subir de nivel
      pou.health = pou.maxHealth
      pou.energy = pou.maxEnergy
      pou.hunger = pou.maxHunger
      pou.happiness = pou.maxHappiness
      pou.cleanliness = pou.maxCleanliness
    }
  }

  // Obtener estadísticas de color
  getStatColor(value: number, maxValue: number): string {
    const percentage = (value / maxValue) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    if (percentage >= 40) return "text-orange-600"
    return "text-red-600"
  }

  // Obtener emoji de estado de ánimo
  getMoodEmoji(mood: string): string {
    switch (mood) {
      case "ecstatic": return "🤩"
      case "happy": return "😊"
      case "content": return "😌"
      case "neutral": return "😐"
      case "sad": return "😢"
      case "tired": return "😴"
      case "sick": return "🤒"
      default: return "😊"
    }
  }
}
