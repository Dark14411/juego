"use client"

import { motion } from "framer-motion"
import type { Hero } from "@/lib/api"

interface SuperheroAvatarProps {
  hero: Hero
  size?: "small" | "medium" | "large"
  isAnimating?: boolean
  onClick?: () => void
}

export const SuperheroAvatar = ({ hero, size = "medium", isAnimating = false, onClick }: SuperheroAvatarProps) => {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-24 h-24",
    large: "w-32 h-32",
  }

  const getSuperSymbol = () => {
    switch (hero.symbol) {
      case "⚡":
        return "⚡"
      case "🔥":
        return "🔥"
      case "❄️":
        return "❄️"
      case "🌟":
        return "🌟"
      case "💎":
        return "💎"
      case "🛡️":
        return "🛡️"
      default:
        return "⭐"
    }
  }

  return (
    <motion.div
      className={`${sizeClasses[size]} relative cursor-pointer select-none`}
      animate={
        isAnimating
          ? {
              scale: [1, 1.1, 1],
              y: [0, -5, 0],
            }
          : {}
      }
      transition={{ duration: 0.6 }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Sombra heroica */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-4 bg-black/20 rounded-full blur-md" />

      {/* SVG del superhéroe completo */}
      <div className="relative w-full h-full">
        <motion.svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          {/* Capa heroica */}
          <motion.path
            d="M 25 35 Q 15 40 20 60 Q 25 80 35 85 Q 45 90 50 85 Q 55 90 65 85 Q 75 80 80 60 Q 85 40 75 35"
            fill={hero.capeColor}
            stroke="#fff"
            strokeWidth="1"
            className="drop-shadow-lg"
            animate={{
              d: [
                "M 25 35 Q 15 40 20 60 Q 25 80 35 85 Q 45 90 50 85 Q 55 90 65 85 Q 75 80 80 60 Q 85 40 75 35",
                "M 25 35 Q 12 42 18 62 Q 23 82 33 87 Q 43 92 50 87 Q 57 92 67 87 Q 77 82 82 62 Q 88 42 75 35",
                "M 25 35 Q 15 40 20 60 Q 25 80 35 85 Q 45 90 50 85 Q 55 90 65 85 Q 75 80 80 60 Q 85 40 75 35",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />

          {/* Cuerpo del superhéroe */}
          <ellipse
            cx="50"
            cy="65"
            rx="18"
            ry="22"
            fill={hero.bodyColor}
            stroke="#fff"
            strokeWidth="2"
            className="drop-shadow-lg"
          />

          {/* Símbolo en el pecho */}
          <circle cx="50" cy="60" r="8" fill="#fff" stroke={hero.bodyColor} strokeWidth="2" opacity="0.9" />

          {/* Cabeza */}
          <circle cx="50" cy="35" r="16" fill="#FBBF24" stroke="#fff" strokeWidth="2" className="drop-shadow-lg" />

          {/* Antifaz heroico */}
          <ellipse cx="50" cy="32" rx="20" ry="8" fill={hero.maskColor} opacity="0.9" />

          {/* Agujeros del antifaz para los ojos */}
          <ellipse cx="44" cy="32" rx="4" ry="3" fill="#FBBF24" />
          <ellipse cx="56" cy="32" rx="4" ry="3" fill="#FBBF24" />

          {/* Ojos heroicos */}
          <circle cx="44" cy="32" r="3" fill="#fff" />
          <circle cx="44" cy="32" r="2" fill="#2563EB" />
          <circle cx="45" cy="31" r="0.8" fill="#fff" opacity="0.8" />

          <circle cx="56" cy="32" r="3" fill="#fff" />
          <circle cx="56" cy="32" r="2" fill="#2563EB" />
          <circle cx="57" cy="31" r="0.8" fill="#fff" opacity="0.8" />

          {/* Sonrisa heroica */}
          <path d="M 45 40 Q 50 44 55 40" stroke="#DC2626" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Brazos musculosos */}
          <ellipse cx="30" cy="55" rx="6" ry="15" fill="#FBBF24" transform="rotate(-20 30 55)" />
          <ellipse cx="70" cy="55" rx="6" ry="15" fill="#FBBF24" transform="rotate(20 70 55)" />

          {/* Guantes heroicos */}
          <circle cx="25" cy="65" r="5" fill={hero.bodyColor} stroke="#fff" strokeWidth="1" />
          <circle cx="75" cy="65" r="5" fill={hero.bodyColor} stroke="#fff" strokeWidth="1" />

          {/* Piernas */}
          <ellipse cx="42" cy="85" rx="5" ry="12" fill={hero.bodyColor} />
          <ellipse cx="58" cy="85" rx="5" ry="12" fill={hero.bodyColor} />

          {/* Botas heroicas */}
          <ellipse cx="42" cy="95" rx="6" ry="4" fill={hero.maskColor} />
          <ellipse cx="58" cy="95" rx="6" ry="4" fill={hero.maskColor} />

          {/* Cinturón */}
          <rect x="35" y="72" width="30" height="4" fill={hero.maskColor} rx="2" />
          <circle cx="50" cy="74" r="3" fill="#FBBF24" stroke={hero.maskColor} strokeWidth="1" />
        </motion.svg>

        {/* Símbolo del superhéroe flotante */}
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          {getSuperSymbol()}
        </motion.div>

        {/* Efectos de poder */}
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 40,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 40,
                }}
                transition={{
                  duration: 1.5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.1,
                }}
                style={{
                  left: "50%",
                  top: "50%",
                }}
              />
            ))}
          </>
        )}

        {/* Aura de poder */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${hero.bodyColor}20 0%, transparent 70%)`,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Indicador de nivel */}
      <div className="absolute -top-2 -right-2 z-30">
        <motion.div
          className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          {hero.level}
        </motion.div>
      </div>

      {/* Nombre del héroe */}
      {size === "large" && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm font-bold text-gray-800">{hero.name}</p>
          <p className="text-xs text-gray-600">{hero.superpower}</p>
        </div>
      )}
    </motion.div>
  )
}
