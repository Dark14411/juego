// Cliente API unificado para toda la aplicación Pou
const API_BASE_URL = "https://api-superheroes-hkbl.onrender.com/api"

// Helper functions for safe localStorage usage with error handling
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    try {
      return localStorage.getItem(key)
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, value)
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }
}

// Tipos para la API
export interface User {
  id: string
  username: string
  email?: string
  createdAt: string
}

export interface Hero {
  _id: string
  heroId: number
  nombre: string
  poderes: string[]
  elemento: string
  equipoId?: string
  nivel: number
  salud: number
  energia: number
  fuerza: number
  velocidad: number
  felicidad: number
  experiencia: number
  mascotaId?: string
  userId: string
  monedas: number
  inventario: any[]
}

export interface Mascota {
  _id: string
  nombre: string
  tipo: string
  nivel: number
  experiencia: number
  salud: number
  energia: number
  felicidad: number
  hambre: number
  sed: number
  cansancio: number
  estres: number
  estado: string
  propietarioId?: string
  disponibleAdopcion: boolean
  fechaCreacion: string
  ultimaAlimentacion?: string
  ultimoPaseo?: string
}

export interface GameItem {
  _id: string
  nombre: string
  descripcion: string
  tipo: string
  categoria: string
  precio: number
  gratuito: boolean
  efectos: {
    salud?: number
    energia?: number
    felicidad?: number
    hambre?: number
    sed?: number
  }
  icono: string
  rareza: string
  color: string
}

export interface PouStats {
  health: number
  happiness: number
  energy: number
  hunger: number
  cleanliness: number
  level: number
  experience: number
  mood: string
}

export interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  rarity: string
  image: string
  stats?: any
  effects?: string[]
  available: boolean
}

// Clase principal del cliente API
class UnifiedApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    this.token = safeLocalStorage.getItem("auth_token")
  }

  // Headers para las peticiones
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }
    
    return headers
  }

  // Manejo de errores
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
      throw new Error(errorData.message || `Error ${response.status}`)
    }
    return response.json()
  }

  // =====================================
  // AUTENTICACIÓN
  // =====================================

  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password }),
    })

    const data = await this.handleResponse<{ user: User; token: string }>(response)
    this.token = data.token
    safeLocalStorage.setItem("auth_token", data.token)
    return data
  }

  async register(username: string, password: string, email?: string): Promise<{ user: User; token: string }> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ username, password, email }),
    })

    const data = await this.handleResponse<{ user: User; token: string }>(response)
    this.token = data.token
    safeLocalStorage.setItem("auth_token", data.token)
    return data
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${this.baseURL}/auth/profile`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<User>(response)
  }

  logout(): void {
    this.token = null
    safeLocalStorage.removeItem("auth_token")
    safeLocalStorage.removeItem("user_data")
  }

  // =====================================
  // HÉROES
  // =====================================

  async getHeroes(): Promise<Hero[]> {
    const response = await fetch(`${this.baseURL}/heroes`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Hero[]>(response)
  }

  async getHero(id: string): Promise<Hero> {
    const response = await fetch(`${this.baseURL}/heroes/${id}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Hero>(response)
  }

  async createHero(heroData: Partial<Hero>): Promise<Hero> {
    const response = await fetch(`${this.baseURL}/heroes`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(heroData),
    })
    return this.handleResponse<Hero>(response)
  }

  async updateHero(id: string, heroData: Partial<Hero>): Promise<Hero> {
    const response = await fetch(`${this.baseURL}/heroes/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(heroData),
    })
    return this.handleResponse<Hero>(response)
  }

  async deleteHero(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/heroes/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  async getNextHeroId(): Promise<{ nextId: number }> {
    const response = await fetch(`${this.baseURL}/heroes/next-id`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ nextId: number }>(response)
  }

  // =====================================
  // MASCOTAS
  // =====================================

  async getMascotas(): Promise<Mascota[]> {
    const response = await fetch(`${this.baseURL}/mascotas`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Mascota[]>(response)
  }

  async getMascota(id: string): Promise<Mascota> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Mascota>(response)
  }

  async createMascota(mascotaData: Partial<Mascota>): Promise<Mascota> {
    const response = await fetch(`${this.baseURL}/mascotas`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(mascotaData),
    })
    return this.handleResponse<Mascota>(response)
  }

  async updateMascota(id: string, mascotaData: Partial<Mascota>): Promise<Mascota> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(mascotaData),
    })
    return this.handleResponse<Mascota>(response)
  }

  async deleteMascota(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  // Acciones específicas de mascotas
  async alimentarMascota(id: string): Promise<{ mensaje: string; mascota: Mascota }> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}/alimentar`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ mensaje: string; mascota: Mascota }>(response)
  }

  async pasearMascota(id: string): Promise<{ mensaje: string; mascota: Mascota }> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}/pasear`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ mensaje: string; mascota: Mascota }>(response)
  }

  async curarMascota(id: string): Promise<{ mensaje: string; mascota: Mascota }> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}/curar`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ mensaje: string; mascota: Mascota }>(response)
  }

  async enfermarMascota(id: string): Promise<{ mensaje: string; mascota: Mascota }> {
    const response = await fetch(`${this.baseURL}/mascotas/${id}/enfermar`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ mensaje: string; mascota: Mascota }>(response)
  }

  // =====================================
  // ITEMS
  // =====================================

  async getItems(): Promise<GameItem[]> {
    const response = await fetch(`${this.baseURL}/items`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<GameItem[]>(response)
  }

  async getItem(id: string): Promise<GameItem> {
    const response = await fetch(`${this.baseURL}/items/${id}`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<GameItem>(response)
  }

  async createItem(itemData: Partial<GameItem>): Promise<GameItem> {
    const response = await fetch(`${this.baseURL}/items`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    })
    return this.handleResponse<GameItem>(response)
  }

  async updateItem(id: string, itemData: Partial<GameItem>): Promise<GameItem> {
    const response = await fetch(`${this.baseURL}/items/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(itemData),
    })
    return this.handleResponse<GameItem>(response)
  }

  async deleteItem(id: string): Promise<void> {
    const response = await fetch(`${this.baseURL}/items/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    })
    await this.handleResponse<void>(response)
  }

  // =====================================
  // ADOPCIÓN
  // =====================================

  async getMascotasDisponibles(): Promise<Mascota[]> {
    const response = await fetch(`${this.baseURL}/adopcion/disponibles`, {
      headers: this.getHeaders(),
    })
    return this.handleResponse<Mascota[]>(response)
  }

  async adoptarMascota(heroId: string, mascotaId: string): Promise<{ mensaje: string }> {
    const response = await fetch(`${this.baseURL}/heroes/${heroId}/adoptar`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ mascotaId }),
    })
    return this.handleResponse<{ mensaje: string }>(response)
  }

  async abandonarMascota(mascotaId: string): Promise<{ mensaje: string }> {
    const response = await fetch(`${this.baseURL}/adopcion/abandonar/${mascotaId}`, {
      method: "POST",
      headers: this.getHeaders(),
    })
    return this.handleResponse<{ mensaje: string }>(response)
  }

  // =====================================
  // FUNCIONALIDADES ESPECÍFICAS DE POU
  // =====================================

  // Simular datos de Pou basados en mascotas
  async getPouStats(): Promise<PouStats> {
    try {
      const mascotas = await this.getMascotas()
      
      if (mascotas.length === 0) {
        // Crear Pou por defecto si no hay mascotas
        const defaultPou = await this.createMascota({
          nombre: "Mi Pou",
          tipo: "Pou",
          salud: 85,
          energia: 75,
          felicidad: 90,
          hambre: 60,
          nivel: 1,
          experiencia: 0,
        })
        
        return this.mascotaToPouStats(defaultPou)
      }
      
      // Usar la primera mascota como Pou principal
      const mainPou = mascotas[0]
      return this.mascotaToPouStats(mainPou)
    } catch (error) {
      // Datos por defecto en caso de error
      return {
        health: 85,
        happiness: 90,
        energy: 75,
        hunger: 60,
        cleanliness: 80,
        level: 1,
        experience: 0,
        mood: "happy",
      }
    }
  }

  private mascotaToPouStats(mascota: Mascota): PouStats {
    const avgStats = (mascota.salud + mascota.felicidad + mascota.energia) / 3
    let mood = "neutral"
    
    if (avgStats >= 80) mood = "happy"
    else if (avgStats >= 60) mood = "content"
    else if (avgStats <= 40) mood = "sad"
    
    return {
      health: mascota.salud,
      happiness: mascota.felicidad,
      energy: mascota.energia,
      hunger: mascota.hambre || 60,
      cleanliness: 80, // No está en la API, valor por defecto
      level: mascota.nivel,
      experience: mascota.experiencia,
      mood,
    }
  }

  // Acciones de Pou que interactúan con la API
  async feedPou(): Promise<{ success: boolean; message: string; stats: PouStats }> {
    try {
      const mascotas = await this.getMascotas()
      if (mascotas.length === 0) {
        throw new Error("No hay Pou para alimentar")
      }
      
      const result = await this.alimentarMascota(mascotas[0]._id)
      const newStats = this.mascotaToPouStats(result.mascota)
      
      return {
        success: true,
        message: result.mensaje,
        stats: newStats,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al alimentar",
        stats: await this.getPouStats(),
      }
    }
  }

  async playWithPou(): Promise<{ success: boolean; message: string; stats: PouStats }> {
    try {
      const mascotas = await this.getMascotas()
      if (mascotas.length === 0) {
        throw new Error("No hay Pou para jugar")
      }
      
      const result = await this.pasearMascota(mascotas[0]._id)
      const newStats = this.mascotaToPouStats(result.mascota)
      
      return {
        success: true,
        message: "¡Pou se divirtió mucho jugando!",
        stats: newStats,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al jugar",
        stats: await this.getPouStats(),
      }
    }
  }

  async healPou(): Promise<{ success: boolean; message: string; stats: PouStats }> {
    try {
      const mascotas = await this.getMascotas()
      if (mascotas.length === 0) {
        throw new Error("No hay Pou para curar")
      }
      
      const result = await this.curarMascota(mascotas[0]._id)
      const newStats = this.mascotaToPouStats(result.mascota)
      
      return {
        success: true,
        message: result.mensaje,
        stats: newStats,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error al curar",
        stats: await this.getPouStats(),
      }
    }
  }

  // =====================================
  // TIENDA Y ECONOMÍA
  // =====================================

  async getStoreItems(): Promise<StoreItem[]> {
    try {
      const items = await this.getItems()
      return items.map(item => ({
        id: item._id,
        name: item.nombre,
        description: item.descripcion,
        price: item.precio,
        category: item.categoria,
        rarity: item.rareza,
        image: item.icono,
        stats: item.efectos,
        effects: Object.keys(item.efectos).map(key => `+${item.efectos[key as keyof typeof item.efectos]} ${key}`),
        available: true,
      }))
    } catch (error) {
      // Items por defecto en caso de error
      return [
        {
          id: "default-food",
          name: "Comida para Pou",
          description: "Alimenta a tu Pou y aumenta su felicidad",
          price: 50,
          category: "food",
          rarity: "common",
          image: "🍎",
          effects: ["+20 hambre", "+10 felicidad"],
          available: true,
        },
        {
          id: "default-toy",
          name: "Pelota de Juego",
          description: "Juguete divertido para tu Pou",
          price: 100,
          category: "toy",
          rarity: "common",
          image: "⚽",
          effects: ["+15 felicidad", "+5 energía"],
          available: true,
        },
      ]
    }
  }

  async purchaseItem(itemId: string, quantity: number = 1): Promise<{ success: boolean; message: string }> {
    try {
      // Aquí podrías implementar la lógica de compra en el backend
      // Por ahora simulamos la compra
      return {
        success: true,
        message: `¡Has comprado ${quantity} item(s) exitosamente!`,
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Error en la compra",
      }
    }
  }

  // =====================================
  // UTILIDADES
  // =====================================

  isAuthenticated(): boolean {
    return !!this.token
  }

  setToken(token: string): void {
    this.token = token
    safeLocalStorage.setItem("auth_token", token)
  }

  clearToken(): void {
    this.token = null
    safeLocalStorage.removeItem("auth_token")
  }
}

// Instancia singleton del cliente API
export const unifiedApiClient = new UnifiedApiClient()

// Export por defecto
export default unifiedApiClient 