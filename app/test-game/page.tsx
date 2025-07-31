'use client'

import WorkingSnake from '@/components/games/WorkingSnake'
import AdvancedSnake from '@/components/games/AdvancedSnake'

export default function TestGamePage() {
  return (
    <div className="min-h-screen bg-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Test Games - 100% Funcionales en Next.js
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              Snake Básico
            </h2>
            <WorkingSnake />
          </div>
          
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4 text-center">
              Snake Avanzado
            </h2>
            <AdvancedSnake />
          </div>
        </div>
        
        <div className="mt-12 text-center text-gray-300">
          <h2 className="text-xl font-semibold mb-4">Características implementadas:</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">✅ Input de Teclado:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Arrow Keys (↑↓←→)</li>
                <li>• WASD keys</li>
                <li>• SPACE para restart</li>
                <li>• Prevención de repetición rápida</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">✅ Game Loop:</h3>
              <ul className="space-y-1 text-sm">
                <li>• setInterval optimizado</li>
                <li>• Cleanup automático</li>
                <li>• Velocidad variable por nivel</li>
                <li>• FPS controlado</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">✅ Canvas Rendering:</h3>
              <ul className="space-y-1 text-sm">
                <li>• 2D Context optimizado</li>
                <li>• Grid system</li>
                <li>• Colisiones precisas</li>
                <li>• Visual feedback</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-purple-400 mb-2">✅ Estado del Juego:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Score tracking</li>
                <li>• Level progression</li>
                <li>• Game over detection</li>
                <li>• Reset functionality</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold text-white mb-2">🔧 Workarounds para Next.js:</h3>
            <ul className="text-sm space-y-1">
              <li>• <code className="bg-gray-600 px-1 rounded">'use client'</code> para interactividad</li>
              <li>• <code className="bg-gray-600 px-1 rounded">useCallback</code> para optimización</li>
              <li>• <code className="bg-gray-600 px-1 rounded">useRef</code> para referencias persistentes</li>
              <li>• <code className="bg-gray-600 px-1 rounded">useEffect</code> para cleanup</li>
              <li>• Hook personalizado <code className="bg-gray-600 px-1 rounded">useGameInput</code> para input robusto</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 