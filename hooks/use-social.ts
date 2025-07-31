import { useState, useCallback } from 'react'

interface ShareableContent {
  id: string
  type: 'achievement' | 'screenshot' | 'milestone' | 'event'
  title: string
  description: string
  image?: string
  data: any
  timestamp: string
}

interface SocialPlatform {
  id: string
  name: string
  icon: string
  color: string
  shareUrl: string
  enabled: boolean
}

export const useSocial = () => {
  const [shareHistory, setShareHistory] = useState<ShareableContent[]>([])
  const [isSharing, setIsSharing] = useState(false)

  // Plataformas sociales disponibles
  const socialPlatforms: SocialPlatform[] = [
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: '#1DA1F2',
      shareUrl: 'https://twitter.com/intent/tweet',
      enabled: true
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: '#4267B2',
      shareUrl: 'https://www.facebook.com/sharer/sharer.php',
      enabled: true
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      shareUrl: 'https://wa.me',
      enabled: true
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '📱',
      color: '#0088cc',
      shareUrl: 'https://t.me/share/url',
      enabled: true
    },
    {
      id: 'discord',
      name: 'Discord',
      icon: '🎮',
      color: '#7289DA',
      shareUrl: 'https://discord.com/api/oauth2/authorize',
      enabled: true
    },
    {
      id: 'reddit',
      name: 'Reddit',
      icon: '🤖',
      color: '#FF4500',
      shareUrl: 'https://reddit.com/submit',
      enabled: true
    }
  ]

  // Función para generar contenido compartible
  const generateShareableContent = useCallback((type: string, data: any): ShareableContent => {
    const timestamp = new Date().toISOString()
    
    switch (type) {
      case 'achievement':
        return {
          id: `achievement-${timestamp}`,
          type: 'achievement',
          title: `¡Logro Desbloqueado: ${data.name}!`,
          description: `He desbloqueado el logro "${data.name}" en Mi Pou Virtual! ${data.description}`,
          data,
          timestamp
        }
      
      case 'milestone':
        return {
          id: `milestone-${timestamp}`,
          type: 'milestone',
          title: `¡Hito Alcanzado: ${data.title}!`,
          description: `He alcanzado ${data.title} en Mi Pou Virtual! ${data.description}`,
          data,
          timestamp
        }
      
      case 'event':
        return {
          id: `event-${timestamp}`,
          type: 'event',
          title: `¡Participando en ${data.name}!`,
          description: `¡Estoy participando en el evento ${data.name} en Mi Pou Virtual! ${data.description}`,
          data,
          timestamp
        }
      
      case 'screenshot':
        return {
          id: `screenshot-${timestamp}`,
          type: 'screenshot',
          title: 'Mi Pou Virtual',
          description: '¡Mira mi Pou virtual! Estoy jugando Mi Pou Virtual.',
          image: data.imageUrl,
          data,
          timestamp
        }
      
      default:
        return {
          id: `custom-${timestamp}`,
          type: 'achievement',
          title: 'Mi Pou Virtual',
          description: '¡Estoy jugando Mi Pou Virtual!',
          data,
          timestamp
        }
    }
  }, [])

  // Función para compartir en plataforma específica
  const shareToPlatform = useCallback(async (platform: SocialPlatform, content: ShareableContent) => {
    setIsSharing(true)
    
    try {
      const shareData = {
        title: content.title,
        text: content.description,
        url: window.location.href
      }

      let shareUrl = platform.shareUrl
      const params = new URLSearchParams()

      switch (platform.id) {
        case 'twitter':
          params.append('text', `${content.title}\n\n${content.description}\n\n¡Juega Mi Pou Virtual!`)
          params.append('url', window.location.href)
          params.append('hashtags', 'MiPouVirtual,JuegoVirtual,MascotaVirtual')
          break
        
        case 'facebook':
          params.append('u', window.location.href)
          params.append('quote', `${content.title}\n\n${content.description}`)
          break
        
        case 'whatsapp':
          params.append('text', `${content.title}\n\n${content.description}\n\n${window.location.href}`)
          break
        
        case 'telegram':
          params.append('url', window.location.href)
          params.append('text', `${content.title}\n\n${content.description}`)
          break
        
        case 'reddit':
          params.append('url', window.location.href)
          params.append('title', content.title)
          break
        
        default:
          // Usar Web Share API si está disponible
          if (navigator.share) {
            await navigator.share(shareData)
            return { success: true }
          }
          break
      }

      // Abrir ventana de compartir
      const finalUrl = `${shareUrl}?${params.toString()}`
      window.open(finalUrl, '_blank', 'width=600,height=400')

      // Agregar a historial
      setShareHistory(prev => [content, ...prev.slice(0, 9)]) // Mantener solo los últimos 10

      return { success: true }
    } catch (error) {
      console.error('Error al compartir:', error)
      return { success: false, error }
    } finally {
      setIsSharing(false)
    }
  }, [])

  // Función para compartir logro
  const shareAchievement = useCallback(async (achievement: any, platformId?: string) => {
    const content = generateShareableContent('achievement', achievement)
    
    if (platformId) {
      const platform = socialPlatforms.find(p => p.id === platformId)
      if (platform) {
        return await shareToPlatform(platform, content)
      }
    } else {
      // Mostrar selector de plataformas
      return { content, platforms: socialPlatforms }
    }
  }, [generateShareableContent, shareToPlatform, socialPlatforms])

  // Función para compartir hito
  const shareMilestone = useCallback(async (milestone: any, platformId?: string) => {
    const content = generateShareableContent('milestone', milestone)
    
    if (platformId) {
      const platform = socialPlatforms.find(p => p.id === platformId)
      if (platform) {
        return await shareToPlatform(platform, content)
      }
    } else {
      return { content, platforms: socialPlatforms }
    }
  }, [generateShareableContent, shareToPlatform, socialPlatforms])

  // Función para compartir evento
  const shareEvent = useCallback(async (event: any, platformId?: string) => {
    const content = generateShareableContent('event', event)
    
    if (platformId) {
      const platform = socialPlatforms.find(p => p.id === platformId)
      if (platform) {
        return await shareToPlatform(platform, content)
      }
    } else {
      return { content, platforms: socialPlatforms }
    }
  }, [generateShareableContent, shareToPlatform, socialPlatforms])

  // Función para capturar y compartir screenshot
  const captureAndShare = useCallback(async (platformId?: string) => {
    try {
      // Simular captura de pantalla (en un entorno real usarías html2canvas)
      const screenshotData = {
        imageUrl: '/placeholder-screenshot.jpg', // Placeholder
        timestamp: new Date().toISOString(),
        gameState: 'current-game-state'
      }
      
      const content = generateShareableContent('screenshot', screenshotData)
      
      if (platformId) {
        const platform = socialPlatforms.find(p => p.id === platformId)
        if (platform) {
          return await shareToPlatform(platform, content)
        }
      } else {
        return { content, platforms: socialPlatforms }
      }
    } catch (error) {
      console.error('Error al capturar screenshot:', error)
      return { success: false, error }
    }
  }, [generateShareableContent, shareToPlatform, socialPlatforms])

  // Función para generar imagen para compartir
  const generateShareImage = useCallback(async (content: ShareableContent) => {
    // En un entorno real, usarías una librería como html2canvas o canvas
    // para generar una imagen del contenido del juego
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return null
    
    // Configurar canvas
    canvas.width = 1200
    canvas.height = 630
    
    // Fondo
    ctx.fillStyle = '#f59e0b'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Gradiente
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, '#f59e0b')
    gradient.addColorStop(1, '#f97316')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Título
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Mi Pou Virtual', canvas.width / 2, 150)
    
    // Contenido
    ctx.font = '24px Arial'
    ctx.fillText(content.title, canvas.width / 2, 250)
    
    // Descripción
    ctx.font = '18px Arial'
    const words = content.description.split(' ')
    let line = ''
    let y = 300
    
    for (let word of words) {
      const testLine = line + word + ' '
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > canvas.width - 100) {
        ctx.fillText(line, canvas.width / 2, y)
        line = word + ' '
        y += 30
      } else {
        line = testLine
      }
    }
    ctx.fillText(line, canvas.width / 2, y)
    
    // Logo/emoji
    ctx.font = '72px Arial'
    ctx.fillText('🐾', canvas.width / 2, 500)
    
    // URL
    ctx.font = '16px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('mipouvirtual.com', canvas.width / 2, 580)
    
    return canvas.toDataURL('image/png')
  }, [])

  // Función para obtener estadísticas de compartir
  const getShareStats = useCallback(() => {
    const totalShares = shareHistory.length
    const sharesByType = shareHistory.reduce((acc, content) => {
      acc[content.type] = (acc[content.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const recentShares = shareHistory.slice(0, 5)
    
    return {
      totalShares,
      sharesByType,
      recentShares
    }
  }, [shareHistory])

  // Función para limpiar historial
  const clearShareHistory = useCallback(() => {
    setShareHistory([])
  }, [])

  return {
    // Estado
    shareHistory,
    isSharing,
    socialPlatforms,
    
    // Funciones principales
    shareAchievement,
    shareMilestone,
    shareEvent,
    captureAndShare,
    generateShareImage,
    
    // Utilidades
    getShareStats,
    clearShareHistory,
    generateShareableContent
  }
} 