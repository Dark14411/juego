'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 🎮 INTERFACE PARA EFECTOS DE PARTÍCULAS
interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  emoji?: string
}

interface ParticleSystemProps {
  active: boolean
  type: 'coins' | 'hearts' | 'stars' | 'confetti' | 'sparkles'
  duration?: number
  intensity?: number
  position?: { x: number; y: number }
}

// 🎮 SISTEMA DE PARTÍCULAS AVANZADO
export function ParticleSystem({ 
  active, 
  type, 
  duration = 2000, 
  intensity = 20,
  position = { x: 50, y: 50 }
}: ParticleSystemProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number>()

  const particleConfigs = {
    coins: {
      colors: ['#FFD700', '#FFA500', '#FF8C00'],
      emojis: ['💰', '🪙', '💸'],
      gravity: 0.3
    },
    hearts: {
      colors: ['#FF69B4', '#FF1493', '#DC143C'],
      emojis: ['❤️', '💖', '💕'],
      gravity: 0.1
    },
    stars: {
      colors: ['#FFD700', '#FFFF00', '#FFF8DC'],
      emojis: ['⭐', '✨', '🌟'],
      gravity: 0.05
    },
    confetti: {
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
      emojis: ['🎉', '🎊', '🎈'],
      gravity: 0.4
    },
    sparkles: {
      colors: ['#E6E6FA', '#DDA0DD', '#DA70D6'],
      emojis: ['✨', '💫', '⚡'],
      gravity: 0.0
    }
  }

  useEffect(() => {
    if (!active) {
      setParticles([])
      return
    }

    const config = particleConfigs[type]
    const newParticles: Particle[] = []

    // Crear partículas iniciales
    for (let i = 0; i < intensity; i++) {
      newParticles.push({
        id: `${type}-${i}-${Date.now()}`,
        x: position.x + (Math.random() - 0.5) * 20,
        y: position.y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: duration,
        maxLife: duration,
        color: config.colors[Math.floor(Math.random() * config.colors.length)],
        size: Math.random() * 20 + 10,
        emoji: config.emojis[Math.floor(Math.random() * config.emojis.length)]
      })
    }

    setParticles(newParticles)

    // Animar partículas
    const animate = () => {
      setParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + config.gravity,
          life: particle.life - 16,
          size: particle.size * 0.995
        })).filter(particle => particle.life > 0)

        if (updated.length > 0) {
          animationRef.current = requestAnimationFrame(animate)
        }
        
        return updated
      })
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [active, type, intensity, duration])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute text-2xl animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.life / particle.maxLife,
            fontSize: `${particle.size}px`,
            transform: `scale(${particle.life / particle.maxLife})`,
            transition: 'all 0.1s ease-out'
          }}
        >
          {particle.emoji}
        </div>
      ))}
    </div>
  )
}

// 🎮 COMPONENTE DE FEEDBACK VISUAL
interface VisualFeedbackProps {
  show: boolean
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  value?: number
  position?: { x: number; y: number }
  duration?: number
}

export function VisualFeedback({ 
  show, 
  type, 
  message, 
  value, 
  position = { x: 50, y: 30 },
  duration = 2000 
}: VisualFeedbackProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => setVisible(false), duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration])

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return { 
          bg: 'bg-green-500', 
          text: 'text-white',
          icon: '✅',
          prefix: value ? '+' : ''
        }
      case 'error':
        return { 
          bg: 'bg-red-500', 
          text: 'text-white',
          icon: '❌',
          prefix: value ? '-' : ''
        }
      case 'warning':
        return { 
          bg: 'bg-yellow-500', 
          text: 'text-black',
          icon: '⚠️',
          prefix: ''
        }
      case 'info':
        return { 
          bg: 'bg-blue-500', 
          text: 'text-white',
          icon: 'ℹ️',
          prefix: ''
        }
      default:
        return { 
          bg: 'bg-gray-500', 
          text: 'text-white',
          icon: '',
          prefix: ''
        }
    }
  }

  const config = getTypeConfig()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 20 
          }}
          className={`fixed z-50 px-6 py-3 rounded-xl shadow-2xl ${config.bg} ${config.text} font-bold text-lg backdrop-blur-md border border-white/20`}
          style={{
            left: `${position.x}%`,
            top: `${position.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{config.icon}</span>
            <span>
              {config.prefix}{value && value !== 0 ? value : ''} {message}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 🎮 BARRA DE STATS ANIMADA
interface AnimatedStatBarProps {
  label: string
  value: number
  maxValue: number
  color: string
  icon: React.ReactNode
  showChange?: number
  animate?: boolean
}

export function AnimatedStatBar({ 
  label, 
  value, 
  maxValue, 
  color, 
  icon, 
  showChange = 0,
  animate = true 
}: AnimatedStatBarProps) {
  const percentage = (value / maxValue) * 100
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (!animate) {
      setDisplayValue(value)
      return
    }

    const start = displayValue
    const end = value
    const duration = 1000
    const startTime = Date.now()

    const updateValue = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = start + (end - start) * easeOut
      
      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    requestAnimationFrame(updateValue)
  }, [value, animate])

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-2">
          {showChange !== 0 && (
            <motion.span
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`text-sm font-bold ${
                showChange > 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {showChange > 0 ? '+' : ''}{Math.round(showChange)}
            </motion.span>
          )}
          <span className="text-sm font-medium">
            {Math.round(displayValue)}/{maxValue}
          </span>
        </div>
      </div>
      
      <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full relative ${color}`}
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}aa)`
          }}
        >
          {/* Efecto de brillo */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: 'shimmer 2s infinite'
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}

// 🎮 BOTÓN CON EFECTOS AVANZADOS
interface AnimatedButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AnimatedButton({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'md',
  className = ''
}: AnimatedButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const variants = {
    primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    secondary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    warning: 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${className}
        relative overflow-hidden
        text-white font-bold rounded-xl
        shadow-lg transform transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-purple-300
      `}
    >
      {/* Efecto de ondas */}
      <div className="absolute inset-0 -top-[10px] -bottom-[10px] opacity-30">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent transform skew-x-12 animate-pulse" />
      </div>
      
      {/* Contenido */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
          />
        )}
        {children}
      </div>
      
      {/* Efecto de click */}
      {isPressed && (
        <motion.div
          initial={{ scale: 0, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-white rounded-xl"
        />
      )}
    </motion.button>
  )
}

// 🎮 CSS PARA ANIMACIONES PERSONALIZADAS
export const AnimationStyles = () => (
  <style jsx global>{`
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes pulse-glow {
      0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5); }
      50% { box-shadow: 0 0 40px rgba(139, 92, 246, 0.8); }
    }
    
    @keyframes bounce-in {
      0% { transform: scale(0.3) rotate(-10deg); opacity: 0; }
      50% { transform: scale(1.1) rotate(5deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    .animate-float {
      animation: float 3s ease-in-out infinite;
    }
    
    .animate-pulse-glow {
      animation: pulse-glow 2s ease-in-out infinite;
    }
    
    .animate-bounce-in {
      animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }
  `}</style>
)