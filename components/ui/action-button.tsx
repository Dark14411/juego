// 🎮 BOTÓN DE ACCIÓN CON LOADING
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ButtonSpinner } from '@/components/ui/loading-spinner'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  children: React.ReactNode
  onClick: () => Promise<void> | void
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loadingText?: string
  successMessage?: string
  errorMessage?: string
  className?: string
  icon?: React.ReactNode
}

export const ActionButton = ({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  loadingText = 'Procesando...',
  successMessage,
  errorMessage,
  className,
  icon
}: ActionButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    
    try {
      await onClick()
      
      if (successMessage) {
        toast.success(successMessage)
      }
    } catch (error) {
      const errorMsg = errorMessage || (error instanceof Error ? error.message : 'Error desconocido')
      toast.error(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={cn('relative', className)}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <ButtonSpinner size="sm" />
        </div>
      )}
      
      <div className={cn('flex items-center gap-2', isLoading && 'opacity-0')}>
        {icon && icon}
        {isLoading ? loadingText : children}
      </div>
    </Button>
  )
}

// 🎮 BOTÓN DE JUEGO
export const GameButton = ({ 
  gameId, 
  onPlay, 
  isUnlocked = true,
  ...props 
}: {
  gameId: string
  onPlay: (gameId: string) => Promise<void>
  isUnlocked?: boolean
} & Omit<ActionButtonProps, 'onClick' | 'children'>) => {
  return (
    <ActionButton
      onClick={() => onPlay(gameId)}
      disabled={!isUnlocked}
      successMessage="¡Juego iniciado!"
      errorMessage="Error al iniciar juego"
      {...props}
    >
      {isUnlocked ? 'Jugar Ahora' : 'Bloqueado'}
    </ActionButton>
  )
}

// 🎮 BOTÓN DE ADOPCIÓN
export const AdoptButton = ({ 
  petId, 
  onAdopt, 
  isAdopted = false,
  ...props 
}: {
  petId: string
  onAdopt: (petId: string) => Promise<void>
  isAdopted?: boolean
} & Omit<ActionButtonProps, 'onClick' | 'children'>) => {
  return (
    <ActionButton
      onClick={() => onAdopt(petId)}
      disabled={isAdopted}
      successMessage="¡Mascota adoptada!"
      errorMessage="Error al adoptar mascota"
      variant={isAdopted ? 'secondary' : 'default'}
      {...props}
    >
      {isAdopted ? 'Ya Adoptada' : 'Adoptar'}
    </ActionButton>
  )
}

// 🎮 BOTÓN DE COMPRA
export const BuyButton = ({ 
  itemId, 
  onBuy, 
  price,
  canAfford = true,
  ...props 
}: {
  itemId: string
  onBuy: (itemId: string) => Promise<void>
  price: number
  canAfford?: boolean
} & Omit<ActionButtonProps, 'onClick' | 'children'>) => {
  return (
    <ActionButton
      onClick={() => onBuy(itemId)}
      disabled={!canAfford}
      successMessage="¡Item comprado!"
      errorMessage="Error al comprar item"
      variant={canAfford ? 'default' : 'secondary'}
      {...props}
    >
      {canAfford ? `Comprar (${price})` : 'Sin fondos'}
    </ActionButton>
  )
}

// 🎮 BOTÓN DE DESBLOQUEO
export const UnlockButton = ({ 
  heroId, 
  onUnlock, 
  isUnlocked = false,
  cost = 1000,
  canAfford = true,
  ...props 
}: {
  heroId: string
  onUnlock: (heroId: string) => Promise<void>
  isUnlocked?: boolean
  cost?: number
  canAfford?: boolean
} & Omit<ActionButtonProps, 'onClick' | 'children'>) => {
  return (
    <ActionButton
      onClick={() => onUnlock(heroId)}
      disabled={isUnlocked || !canAfford}
      successMessage="¡Héroe desbloqueado!"
      errorMessage="Error al desbloquear héroe"
      variant={isUnlocked ? 'secondary' : canAfford ? 'default' : 'outline'}
      {...props}
    >
      {isUnlocked ? 'Desbloqueado' : canAfford ? `Desbloquear (${cost})` : 'Sin fondos'}
    </ActionButton>
  )
} 