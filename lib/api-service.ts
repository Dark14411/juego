// 🎮 API SERVICE - Centralizado para Gaming Hub
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// 🎯 TIPOS DE RESPUESTA
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// 🎮 CLASE PRINCIPAL DE API
class ApiService {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Recuperar token del localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  // 🔐 Configurar token de autenticación
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  // 🚫 Limpiar token
  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  // 📡 Método base para requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>,
      }

      // Agregar token si existe
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`)
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  // 🎮 JUEGOS
  async getGames(params?: {
    tipo?: string
    dificultad?: string
    page?: number
    limit?: number
    search?: string
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString())
      })
    }
    
    return this.request(`/games?${queryParams.toString()}`)
  }

  async getGameById(id: string) {
    return this.request(`/games/${id}`)
  }

  async startGame(gameId: string) {
    return this.request(`/games/${gameId}/start`, {
      method: 'POST'
    })
  }

  async finishGame(sessionId: string, data: {
    puntuacion: number
    tiempoJugado: number
    estado: 'completado' | 'fallido' | 'abandonado'
  }) {
    return this.request(`/games/sessions/${sessionId}/finish`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getLeaderboard(gameId?: string) {
    const endpoint = gameId ? `/games/${gameId}/leaderboard` : '/games/leaderboard'
    return this.request(endpoint)
  }

  // 🐾 MASCOTAS
  async getPets() {
    return this.request('/mascotas')
  }

  async adoptPet(petId: string) {
    return this.request(`/mascotas/${petId}/adopt`, {
      method: 'POST'
    })
  }

  async carePet(petId: string, action: 'feed' | 'play' | 'heal') {
    return this.request(`/mascotas/${petId}/care`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
  }

  // 🦸 HÉROES
  async getHeroes() {
    return this.request('/heroes')
  }

  async unlockHero(heroId: string) {
    return this.request(`/heroes/${heroId}/unlock`, {
      method: 'POST'
    })
  }

  async upgradeHero(heroId: string) {
    return this.request(`/heroes/${heroId}/upgrade`, {
      method: 'POST'
    })
  }

  // 🏆 LOGROS
  async getAchievements() {
    return this.request('/achievements')
  }

  async checkAchievements() {
    return this.request('/achievements/check', {
      method: 'POST'
    })
  }

  // 💰 MERCADO
  async getMarketplace() {
    return this.request('/items/marketplace')
  }

  async buyItem(itemId: string) {
    return this.request(`/items/${itemId}/buy`, {
      method: 'POST'
    })
  }

  async sellItem(itemId: string) {
    return this.request(`/items/${itemId}/sell`, {
      method: 'POST'
    })
  }

  // 👥 MULTIJUGADOR
  async getMultiplayerRooms() {
    return this.request('/social/rooms')
  }

  async joinRoom(roomId: string) {
    return this.request(`/social/rooms/${roomId}/join`, {
      method: 'POST'
    })
  }

  async leaveRoom(roomId: string) {
    return this.request(`/social/rooms/${roomId}/leave`, {
      method: 'POST'
    })
  }

  // 👤 PERFIL
  async getProfile() {
    return this.request('/users/profile')
  }

  async updateProfile(data: {
    username?: string
    avatar?: string
    preferences?: any
  }) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async getStatistics() {
    return this.request('/analytics/user-stats')
  }

  // 🔐 AUTENTICACIÓN
  async login(credentials: { email: string; password: string }) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    })

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token)
    }

    return response
  }

  async register(userData: {
    username: string
    email: string
    password: string
  }) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    })

    if (response.success && response.data && typeof response.data === 'object' && 'token' in response.data) {
      this.setToken((response.data as any).token)
    }

    return response
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' })
    this.clearToken()
  }
}

// 🎯 INSTANCIA GLOBAL
export const apiService = new ApiService(API_BASE_URL)

// 🎮 HOOKS PERSONALIZADOS
export const useApi = () => {
  return {
    games: {
      getAll: apiService.getGames.bind(apiService),
      getById: apiService.getGameById.bind(apiService),
      start: apiService.startGame.bind(apiService),
      finish: apiService.finishGame.bind(apiService),
      leaderboard: apiService.getLeaderboard.bind(apiService)
    },
    pets: {
      getAll: apiService.getPets.bind(apiService),
      adopt: apiService.adoptPet.bind(apiService),
      care: apiService.carePet.bind(apiService)
    },
    heroes: {
      getAll: apiService.getHeroes.bind(apiService),
      unlock: apiService.unlockHero.bind(apiService),
      upgrade: apiService.upgradeHero.bind(apiService)
    },
    achievements: {
      getAll: apiService.getAchievements.bind(apiService),
      check: apiService.checkAchievements.bind(apiService)
    },
    marketplace: {
      getItems: apiService.getMarketplace.bind(apiService),
      buy: apiService.buyItem.bind(apiService),
      sell: apiService.sellItem.bind(apiService)
    },
    multiplayer: {
      getRooms: apiService.getMultiplayerRooms.bind(apiService),
      join: apiService.joinRoom.bind(apiService),
      leave: apiService.leaveRoom.bind(apiService)
    },
    profile: {
      get: apiService.getProfile.bind(apiService),
      update: apiService.updateProfile.bind(apiService),
      stats: apiService.getStatistics.bind(apiService)
    },
    auth: {
      login: apiService.login.bind(apiService),
      register: apiService.register.bind(apiService),
      logout: apiService.logout.bind(apiService)
    }
  }
} 