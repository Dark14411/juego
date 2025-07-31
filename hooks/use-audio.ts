import { useState, useEffect, useRef, useCallback } from 'react'

interface AudioSettings {
  musicEnabled: boolean
  soundEnabled: boolean
  musicVolume: number
  soundVolume: number
}

interface AudioTrack {
  id: string
  src: string
  type: 'music' | 'sound'
  loop?: boolean
}

export const useAudio = () => {
  const [settings, setSettings] = useState<AudioSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audio-settings')
      return saved ? JSON.parse(saved) : {
        musicEnabled: true,
        soundEnabled: true,
        musicVolume: 0.5,
        soundVolume: 0.7
      }
    }
    return {
      musicEnabled: true,
      soundEnabled: true,
      musicVolume: 0.5,
      soundVolume: 0.7
    }
  })

  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map())
  const currentMusic = useRef<string | null>(null)

  // Definir tracks de audio
  const audioTracks: AudioTrack[] = [
    // Música de fondo
    {
      id: 'background-music',
      src: '/audio/background-music.mp3',
      type: 'music',
      loop: true
    },
    {
      id: 'happy-music',
      src: '/audio/happy-music.mp3',
      type: 'music',
      loop: true
    },
    {
      id: 'sleep-music',
      src: '/audio/sleep-music.mp3',
      type: 'music',
      loop: true
    },
    
    // Efectos de sonido
    {
      id: 'click',
      src: '/audio/click.mp3',
      type: 'sound'
    },
    {
      id: 'coin',
      src: '/audio/coin.mp3',
      type: 'sound'
    },
    {
      id: 'feed',
      src: '/audio/feed.mp3',
      type: 'sound'
    },
    {
      id: 'play',
      src: '/audio/play.mp3',
      type: 'sound'
    },
    {
      id: 'clean',
      src: '/audio/clean.mp3',
      type: 'sound'
    },
    {
      id: 'achievement',
      src: '/audio/achievement.mp3',
      type: 'sound'
    },
    {
      id: 'purchase',
      src: '/audio/purchase.mp3',
      type: 'sound'
    },
    {
      id: 'notification',
      src: '/audio/notification.mp3',
      type: 'sound'
    }
  ]

  // Inicializar audio elements
  useEffect(() => {
    audioTracks.forEach(track => {
      const audio = new Audio(track.src)
      audio.preload = 'auto'
      audio.volume = track.type === 'music' ? settings.musicVolume : settings.soundVolume
      if (track.loop) {
        audio.loop = true
      }
      audioRefs.current.set(track.id, audio)
    })

    return () => {
      audioRefs.current.forEach(audio => {
        audio.pause()
        audio.src = ''
      })
      audioRefs.current.clear()
    }
  }, [])

  // Guardar configuración
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audio-settings', JSON.stringify(settings))
    }
  }, [settings])

  // Actualizar volúmenes
  useEffect(() => {
    audioRefs.current.forEach((audio, id) => {
      const track = audioTracks.find(t => t.id === id)
      if (track) {
        audio.volume = track.type === 'music' ? settings.musicVolume : settings.soundVolume
      }
    })
  }, [settings.musicVolume, settings.soundVolume])

  // Reproducir música de fondo
  const playMusic = useCallback((musicId: string) => {
    if (!settings.musicEnabled) return

    const audio = audioRefs.current.get(musicId)
    if (audio) {
      // Detener música actual
      if (currentMusic.current && currentMusic.current !== musicId) {
        const currentAudio = audioRefs.current.get(currentMusic.current)
        if (currentAudio) {
          currentAudio.pause()
          currentAudio.currentTime = 0
        }
      }

      audio.play().catch(() => {
        // Silenciar error si el usuario no ha interactuado
        console.log('Audio requires user interaction')
      })
      currentMusic.current = musicId
    }
  }, [settings.musicEnabled])

  // Reproducir efecto de sonido
  const playSound = useCallback((soundId: string) => {
    if (!settings.soundEnabled) return

    const audio = audioRefs.current.get(soundId)
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {
        // Silenciar error si el usuario no ha interactuado
        console.log('Audio requires user interaction')
      })
    }
  }, [settings.soundEnabled])

  // Detener música
  const stopMusic = useCallback(() => {
    if (currentMusic.current) {
      const audio = audioRefs.current.get(currentMusic.current)
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
      currentMusic.current = null
    }
  }, [])

  // Pausar música
  const pauseMusic = useCallback(() => {
    if (currentMusic.current) {
      const audio = audioRefs.current.get(currentMusic.current)
      if (audio) {
        audio.pause()
      }
    }
  }, [])

  // Reanudar música
  const resumeMusic = useCallback(() => {
    if (currentMusic.current && settings.musicEnabled) {
      const audio = audioRefs.current.get(currentMusic.current)
      if (audio) {
        audio.play().catch(() => {
          console.log('Audio requires user interaction')
        })
      }
    }
  }, [settings.musicEnabled])

  // Actualizar configuración
  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      
      // Si se desactiva la música, detenerla
      if (!updated.musicEnabled) {
        stopMusic()
      }
      
      return updated
    })
  }, [stopMusic])

  // Efectos de sonido específicos del juego
  const playGameSounds = {
    click: () => playSound('click'),
    coin: () => playSound('coin'),
    feed: () => playSound('feed'),
    play: () => playSound('play'),
    clean: () => playSound('clean'),
    achievement: () => playSound('achievement'),
    purchase: () => playSound('purchase'),
    notification: () => playSound('notification')
  }

  // Música específica del juego
  const playGameMusic = {
    background: () => playMusic('background-music'),
    happy: () => playMusic('happy-music'),
    sleep: () => playMusic('sleep-music')
  }

  return {
    settings,
    updateSettings,
    playSound,
    playMusic,
    stopMusic,
    pauseMusic,
    resumeMusic,
    playGameSounds,
    playGameMusic,
    isMusicPlaying: !!currentMusic.current
  }
} 