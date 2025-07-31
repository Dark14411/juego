// 🎮 LOADING SPINNER REUTILIZABLE
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  text?: string
  className?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  primary: 'text-blue-500',
  secondary: 'text-gray-500',
  success: 'text-green-500',
  warning: 'text-yellow-500',
  error: 'text-red-500'
}

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text,
  className 
}: LoadingSpinnerProps) => {
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2', className)}>
      <div className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        sizeClasses[size],
        colorClasses[color]
      )} />
      {text && (
        <p className={cn('text-sm text-gray-600', colorClasses[color])}>
          {text}
        </p>
      )}
    </div>
  )
}

// 🎮 LOADING SPINNER PARA BOTONES
export const ButtonSpinner = ({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) => {
  return (
    <div className={cn(
      'animate-spin rounded-full border-2 border-white border-t-transparent',
      sizeClasses[size]
    )} />
  )
}

// 🎮 LOADING SPINNER PARA CARDS
export const CardSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" text="Cargando..." />
    </div>
  )
}

// 🎮 LOADING SPINNER PARA PÁGINAS
export const PageSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" text="Cargando Gaming Hub..." />
        <div className="text-sm text-gray-500">
          Preparando tu experiencia épica...
        </div>
      </div>
    </div>
  )
} 