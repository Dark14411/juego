import { useState, useEffect, useCallback } from 'react'

interface GameMetrics {
  timePlayed: number
  actionsPerformed: number
  coinsEarned: number
  coinsSpent: number
  itemsPurchased: number
  gamesPlayed: number
  achievementsUnlocked: number
  pouInteractions: number
  storeVisits: number
  customizationChanges: number
  lastSessionStart: Date
  totalSessions: number
}

interface ActionLog {
  id: string
  action: string
  timestamp: Date
  details?: any
}

export const useAnalytics = () => {
  const [metrics, setMetrics] = useState<GameMetrics>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('game-metrics')
      return saved ? JSON.parse(saved) : {
        timePlayed: 0,
        actionsPerformed: 0,
        coinsEarned: 0,
        coinsSpent: 0,
        itemsPurchased: 0,
        gamesPlayed: 0,
        achievementsUnlocked: 0,
        pouInteractions: 0,
        storeVisits: 0,
        customizationChanges: 0,
        lastSessionStart: new Date().toISOString(),
        totalSessions: 1
      }
    }
    return {
      timePlayed: 0,
      actionsPerformed: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      itemsPurchased: 0,
      gamesPlayed: 0,
      achievementsUnlocked: 0,
      pouInteractions: 0,
      storeVisits: 0,
      customizationChanges: 0,
      lastSessionStart: new Date().toISOString(),
      totalSessions: 1
    }
  })

  const [actionLog, setActionLog] = useState<ActionLog[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('action-log')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [sessionStart] = useState<Date>(new Date())

  // Guardar métricas en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('game-metrics', JSON.stringify(metrics))
    }
  }, [metrics])

  // Guardar log de acciones en localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('action-log', JSON.stringify(actionLog))
    }
  }, [actionLog])

  // Actualizar tiempo jugado
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        timePlayed: prev.timePlayed + 1
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Registrar acción
  const logAction = useCallback((action: string, details?: any) => {
    const newAction: ActionLog = {
      id: Date.now().toString(),
      action,
      timestamp: new Date(),
      details
    }

    setActionLog(prev => [...prev.slice(-99), newAction]) // Mantener solo las últimas 100 acciones
    setMetrics(prev => ({
      ...prev,
      actionsPerformed: prev.actionsPerformed + 1
    }))
  }, [])

  // Métricas específicas del juego
  const trackGameAction = {
    pouClick: () => {
      logAction('pou_click')
      setMetrics(prev => ({
        ...prev,
        pouInteractions: prev.pouInteractions + 1
      }))
    },

    storeVisit: () => {
      logAction('store_visit')
      setMetrics(prev => ({
        ...prev,
        storeVisits: prev.storeVisits + 1
      }))
    },

    purchase: (itemId: string, price: number) => {
      logAction('purchase', { itemId, price })
      setMetrics(prev => ({
        ...prev,
        coinsSpent: prev.coinsSpent + price,
        itemsPurchased: prev.itemsPurchased + 1
      }))
    },

    coinEarned: (amount: number, source: string) => {
      logAction('coin_earned', { amount, source })
      setMetrics(prev => ({
        ...prev,
        coinsEarned: prev.coinsEarned + amount
      }))
    },

    gamePlayed: (gameType: string, score: number) => {
      logAction('game_played', { gameType, score })
      setMetrics(prev => ({
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1
      }))
    },

    achievementUnlocked: (achievementId: string) => {
      logAction('achievement_unlocked', { achievementId })
      setMetrics(prev => ({
        ...prev,
        achievementsUnlocked: prev.achievementsUnlocked + 1
      }))
    },

    customizationChange: (type: string) => {
      logAction('customization_change', { type })
      setMetrics(prev => ({
        ...prev,
        customizationChanges: prev.customizationChanges + 1
      }))
    }
  }

  // Obtener estadísticas
  const getStats = useCallback(() => {
    const now = new Date()
    const sessionStart = new Date(metrics.lastSessionStart)
    const sessionDuration = Math.floor((now.getTime() - sessionStart.getTime()) / 1000)

    return {
      ...metrics,
      sessionDuration,
      averageSessionTime: metrics.totalSessions > 0 ? metrics.timePlayed / metrics.totalSessions : 0,
      actionsPerMinute: sessionDuration > 0 ? (metrics.actionsPerformed / sessionDuration) * 60 : 0,
      coinsPerHour: sessionDuration > 0 ? (metrics.coinsEarned / sessionDuration) * 3600 : 0
    }
  }, [metrics])

  // Obtener acciones recientes
  const getRecentActions = useCallback((limit: number = 10) => {
    return actionLog.slice(-limit).reverse()
  }, [actionLog])

  // Obtener acciones por tipo
  const getActionsByType = useCallback((actionType: string) => {
    return actionLog.filter(action => action.action === actionType)
  }, [actionLog])

  // Reiniciar métricas (para testing)
  const resetMetrics = useCallback(() => {
    setMetrics({
      timePlayed: 0,
      actionsPerformed: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      itemsPurchased: 0,
      gamesPlayed: 0,
      achievementsUnlocked: 0,
      pouInteractions: 0,
      storeVisits: 0,
      customizationChanges: 0,
      lastSessionStart: new Date(),
      totalSessions: 1
    })
    setActionLog([])
  }, [])

  return {
    metrics,
    trackGameAction,
    getStats,
    getRecentActions,
    getActionsByType,
    resetMetrics,
    logAction
  }
} 