import { useState, useEffect, useCallback } from 'react'

interface PlayerProfile {
  id: string
  username: string
  avatar: string
  level: number
  experience: number
  totalCoins: number
  achievements: number
  gamesPlayed: number
  winRate: number
  rank: string
  rankPoints: number
  joinDate: string
  lastActive: string
  stats: {
    pouClicks: number
    itemsPurchased: number
    customizationChanges: number
    eventsParticipated: number
    totalPlayTime: number
  }
  badges: string[]
  isOnline: boolean
}

interface LeaderboardEntry {
  rank: number
  player: PlayerProfile
  points: number
  change: 'up' | 'down' | 'same' | 'new'
}

interface Tournament {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  type: 'daily' | 'weekly' | 'monthly' | 'special'
  rewards: {
    first: { coins: number; items: string[] }
    second: { coins: number; items: string[] }
    third: { coins: number; items: string[] }
    participation: { coins: number }
  }
  participants: string[]
  leaderboard: LeaderboardEntry[]
}

export const useCompetitive = () => {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [currentPlayer, setCurrentPlayer] = useState<PlayerProfile | null>(null)

  // Datos de ejemplo para demostración
  const sampleProfiles: PlayerProfile[] = [
    {
      id: 'player-1',
      username: 'PouMaster',
      avatar: '🐾',
      level: 25,
      experience: 12500,
      totalCoins: 15000,
      achievements: 15,
      gamesPlayed: 150,
      winRate: 85.5,
      rank: 'Diamante',
      rankPoints: 2500,
      joinDate: '2024-01-15T10:00:00Z',
      lastActive: new Date().toISOString(),
      stats: {
        pouClicks: 5000,
        itemsPurchased: 45,
        customizationChanges: 30,
        eventsParticipated: 8,
        totalPlayTime: 36000
      },
      badges: ['first-achievement', 'event-master', 'customization-expert'],
      isOnline: true
    },
    {
      id: 'player-2',
      username: 'VirtualPetLover',
      avatar: '🌟',
      level: 18,
      experience: 8900,
      totalCoins: 12000,
      achievements: 12,
      gamesPlayed: 120,
      winRate: 78.3,
      rank: 'Platino',
      rankPoints: 1800,
      joinDate: '2024-02-01T14:30:00Z',
      lastActive: new Date(Date.now() - 3600000).toISOString(),
      stats: {
        pouClicks: 3800,
        itemsPurchased: 38,
        customizationChanges: 25,
        eventsParticipated: 6,
        totalPlayTime: 28000
      },
      badges: ['dedicated-player', 'mini-game-champion'],
      isOnline: false
    },
    {
      id: 'player-3',
      username: 'PouChampion',
      avatar: '🏆',
      level: 32,
      experience: 18000,
      totalCoins: 25000,
      achievements: 20,
      gamesPlayed: 200,
      winRate: 92.1,
      rank: 'Maestro',
      rankPoints: 3200,
      joinDate: '2024-01-01T09:00:00Z',
      lastActive: new Date().toISOString(),
      stats: {
        pouClicks: 8000,
        itemsPurchased: 60,
        customizationChanges: 45,
        eventsParticipated: 12,
        totalPlayTime: 50000
      },
      badges: ['legendary-player', 'tournament-winner', 'achievement-hunter'],
      isOnline: true
    },
    {
      id: 'player-4',
      username: 'NewPouPlayer',
      avatar: '🌱',
      level: 5,
      experience: 1200,
      totalCoins: 3000,
      achievements: 3,
      gamesPlayed: 25,
      winRate: 65.0,
      rank: 'Bronce',
      rankPoints: 450,
      joinDate: '2024-03-01T16:00:00Z',
      lastActive: new Date().toISOString(),
      stats: {
        pouClicks: 800,
        itemsPurchased: 8,
        customizationChanges: 5,
        eventsParticipated: 1,
        totalPlayTime: 5000
      },
      badges: ['newcomer'],
      isOnline: true
    },
    {
      id: 'player-5',
      username: 'PouCollector',
      avatar: '💎',
      level: 28,
      experience: 15000,
      totalCoins: 20000,
      achievements: 18,
      gamesPlayed: 180,
      winRate: 88.7,
      rank: 'Diamante',
      rankPoints: 2800,
      joinDate: '2024-01-20T11:15:00Z',
      lastActive: new Date(Date.now() - 7200000).toISOString(),
      stats: {
        pouClicks: 6500,
        itemsPurchased: 55,
        customizationChanges: 40,
        eventsParticipated: 10,
        totalPlayTime: 42000
      },
      badges: ['item-collector', 'event-participant', 'consistent-player'],
      isOnline: false
    }
  ]

  const sampleTournaments: Tournament[] = [
    {
      id: 'daily-1',
      name: 'Desafío Diario',
      description: 'Compite por el mejor puntaje diario',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      type: 'daily',
      rewards: {
        first: { coins: 500, items: ['daily-champion-badge'] },
        second: { coins: 300, items: [] },
        third: { coins: 150, items: [] },
        participation: { coins: 50 }
      },
      participants: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
      leaderboard: []
    },
    {
      id: 'weekly-1',
      name: 'Torneo Semanal',
      description: 'El torneo más importante de la semana',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true,
      type: 'weekly',
      rewards: {
        first: { coins: 2000, items: ['weekly-champion-trophy', 'exclusive-avatar'] },
        second: { coins: 1200, items: ['weekly-runner-up-badge'] },
        third: { coins: 800, items: ['weekly-third-place-badge'] },
        participation: { coins: 200 }
      },
      participants: ['player-1', 'player-2', 'player-3', 'player-4', 'player-5'],
      leaderboard: []
    }
  ]

  // Inicializar datos
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProfiles = localStorage.getItem('competitive-profiles')
      const savedLeaderboard = localStorage.getItem('competitive-leaderboard')
      const savedTournaments = localStorage.getItem('competitive-tournaments')
      
      if (savedProfiles) {
        setProfiles(JSON.parse(savedProfiles))
      } else {
        setProfiles(sampleProfiles)
      }
      
      if (savedLeaderboard) {
        setLeaderboard(JSON.parse(savedLeaderboard))
      } else {
        // Generar leaderboard inicial
        const initialLeaderboard = sampleProfiles
          .map((player, index) => ({
            rank: index + 1,
            player,
            points: player.rankPoints,
            change: 'same' as const
          }))
          .sort((a, b) => b.points - a.points)
        
        setLeaderboard(initialLeaderboard)
      }
      
      if (savedTournaments) {
        setTournaments(JSON.parse(savedTournaments))
      } else {
        setTournaments(sampleTournaments)
      }
    }
  }, [])

  // Guardar datos en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('competitive-profiles', JSON.stringify(profiles))
      localStorage.setItem('competitive-leaderboard', JSON.stringify(leaderboard))
      localStorage.setItem('competitive-tournaments', JSON.stringify(tournaments))
    }
  }, [profiles, leaderboard, tournaments])

  // Función para actualizar perfil del jugador actual
  const updateCurrentPlayer = useCallback((updates: Partial<PlayerProfile>) => {
    if (currentPlayer) {
      const updatedPlayer = { ...currentPlayer, ...updates }
      setCurrentPlayer(updatedPlayer)
      
      // Actualizar en la lista de perfiles
      setProfiles(prev => prev.map(p => 
        p.id === currentPlayer.id ? updatedPlayer : p
      ))
      
      // Actualizar leaderboard
      setLeaderboard(prev => {
        const updated = prev.map(entry => 
          entry.player.id === currentPlayer.id 
            ? { ...entry, player: updatedPlayer, points: updatedPlayer.rankPoints }
            : entry
        )
        return updated.sort((a, b) => b.points - a.points)
      })
    }
  }, [currentPlayer])

  // Función para calcular rango basado en puntos
  const calculateRank = useCallback((points: number): string => {
    if (points >= 3000) return 'Maestro'
    if (points >= 2500) return 'Diamante'
    if (points >= 2000) return 'Platino'
    if (points >= 1500) return 'Oro'
    if (points >= 1000) return 'Plata'
    return 'Bronce'
  }, [])

  // Función para obtener jugador por ID
  const getPlayerById = useCallback((id: string) => {
    return profiles.find(p => p.id === id)
  }, [profiles])

  // Función para obtener top jugadores
  const getTopPlayers = useCallback((limit: number = 10) => {
    return leaderboard.slice(0, limit)
  }, [leaderboard])

  // Función para obtener jugadores por rango
  const getPlayersByRank = useCallback((rank: string) => {
    return profiles.filter(p => p.rank === rank)
  }, [profiles])

  // Función para obtener torneos activos
  const getActiveTournaments = useCallback(() => {
    return tournaments.filter(t => t.isActive)
  }, [tournaments])

  // Función para participar en torneo
  const joinTournament = useCallback((tournamentId: string, playerId: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId && !t.participants.includes(playerId)) {
        return {
          ...t,
          participants: [...t.participants, playerId]
        }
      }
      return t
    }))
  }, [])

  // Función para actualizar puntuación en torneo
  const updateTournamentScore = useCallback((tournamentId: string, playerId: string, score: number) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        const updatedLeaderboard = [...t.leaderboard]
        const existingEntry = updatedLeaderboard.find(entry => entry.player.id === playerId)
        
        if (existingEntry) {
          existingEntry.points = score
        } else {
          const player = getPlayerById(playerId)
          if (player) {
            updatedLeaderboard.push({
              rank: 0,
              player,
              points: score,
              change: 'new'
            })
          }
        }
        
        // Reordenar y actualizar rankings
        updatedLeaderboard.sort((a, b) => b.points - a.points)
        updatedLeaderboard.forEach((entry, index) => {
          entry.rank = index + 1
        })
        
        return {
          ...t,
          leaderboard: updatedLeaderboard
        }
      }
      return t
    }))
  }, [getPlayerById])

  // Función para obtener estadísticas globales
  const getGlobalStats = useCallback(() => {
    const totalPlayers = profiles.length
    const onlinePlayers = profiles.filter(p => p.isOnline).length
    const totalExperience = profiles.reduce((sum, p) => sum + p.experience, 0)
    const totalCoins = profiles.reduce((sum, p) => sum + p.totalCoins, 0)
    const totalGames = profiles.reduce((sum, p) => sum + p.gamesPlayed, 0)
    
    return {
      totalPlayers,
      onlinePlayers,
      averageLevel: Math.round(profiles.reduce((sum, p) => sum + p.level, 0) / totalPlayers),
      averageExperience: Math.round(totalExperience / totalPlayers),
      averageCoins: Math.round(totalCoins / totalPlayers),
      totalGames,
      averageWinRate: Math.round(profiles.reduce((sum, p) => sum + p.winRate, 0) / totalPlayers * 10) / 10
    }
  }, [profiles])

  // Función para simular actividad de otros jugadores
  const simulatePlayerActivity = useCallback(() => {
    setProfiles(prev => prev.map(player => {
      if (player.id === currentPlayer?.id) return player
      
      // Simular cambios aleatorios
      const shouldUpdate = Math.random() > 0.7
      if (!shouldUpdate) return player
      
      return {
        ...player,
        lastActive: new Date().toISOString(),
        isOnline: Math.random() > 0.3,
        stats: {
          ...player.stats,
          pouClicks: player.stats.pouClicks + Math.floor(Math.random() * 10),
          totalPlayTime: player.stats.totalPlayTime + Math.floor(Math.random() * 300)
        }
      }
    }))
  }, [currentPlayer])

  return {
    // Estado
    profiles,
    leaderboard,
    tournaments,
    currentPlayer,
    
    // Funciones
    setCurrentPlayer,
    updateCurrentPlayer,
    calculateRank,
    getPlayerById,
    getTopPlayers,
    getPlayersByRank,
    getActiveTournaments,
    joinTournament,
    updateTournamentScore,
    getGlobalStats,
    simulatePlayerActivity
  }
} 