'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ArcadeModePanelProps {
  onGameComplete: (game: string, score: number) => void;
}

export function ArcadeModePanel({ onGameComplete }: ArcadeModePanelProps) {
  const games = [
    {
      id: 'pong',
      name: 'PONG',
      description: 'Clásico juego de paletas con IA rival',
      icon: '🏓',
      color: 'from-blue-600 to-cyan-600',
      controls: 'W/S o Flechas'
    },
    {
      id: 'tetris',
      name: 'TETRIS',
      description: 'Piezas que caen, forma líneas',
      icon: '🧩',
      color: 'from-purple-600 to-pink-600',
      controls: 'Flechas'
    },
    {
      id: 'memory',
      name: 'MEMORY',
      description: 'Encuentra las parejas de cartas',
      icon: '🧠',
      color: 'from-green-600 to-emerald-600',
      controls: 'Click'
    },
    {
      id: 'simon',
      name: 'SIMON',
      description: 'Repite la secuencia de colores',
      icon: '🎵',
      color: 'from-yellow-600 to-orange-600',
      controls: 'Click'
    },
    {
      id: 'breakout',
      name: 'BREAKOUT',
      description: 'Rompe bloques con la pelota',
      icon: '🏀',
      color: 'from-red-600 to-pink-600',
      controls: '←/→'
    },
    {
      id: '2048',
      name: '2048',
      description: 'Combina números hasta 2048',
      icon: '🔢',
      color: 'from-indigo-600 to-purple-600',
      controls: 'Flechas'
    }
  ];

  const startGame = (gameId: string) => {
    // Simular inicio de juego
    console.log(`🎮 Iniciando ${gameId}...`);
    
    // Simular score después de jugar
    setTimeout(() => {
      const score = Math.floor(Math.random() * 1000) + 100;
      onGameComplete(gameId, score);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-2 border-purple-400">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🕹️ Retro Arcade</CardTitle>
          <p className="text-center opacity-80">¡Juega y gana monedas!</p>
        </CardHeader>
      </Card>

      {/* 🎮 GRID DE JUEGOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Card key={game.id} className={`bg-gradient-to-br ${game.color} border-2 border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer`}>
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">{game.icon}</div>
              <h3 className="text-xl font-bold mb-2">{game.name}</h3>
              <p className="text-sm opacity-80 mb-4">{game.description}</p>
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="text-xs">
                  🎮 {game.controls}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  💰 +Monedas
                </Badge>
              </div>
              <Button 
                onClick={() => startGame(game.id)}
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30"
              >
                🎮 JUGAR
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📊 INFORMACIÓN */}
      <Card className="bg-black/20">
        <CardHeader>
          <CardTitle>📊 Sistema de Recompensas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">💰 Monedas por Juego:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>PONG:</strong> score / 10 monedas</li>
                <li>• <strong>TETRIS:</strong> score / 100 monedas</li>
                <li>• <strong>MEMORY:</strong> score / 50 monedas</li>
                <li>• <strong>SIMON:</strong> score / 50 monedas</li>
                <li>• <strong>BREAKOUT:</strong> score / 100 monedas</li>
                <li>• <strong>2048:</strong> score / 100 monedas</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">⭐ Experiencia:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Cada juego suma experiencia</li>
                <li>• Al llegar a 1000 XP subes de nivel</li>
                <li>• Los niveles dan bonificaciones</li>
                <li>• ¡Juega más para progresar!</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}