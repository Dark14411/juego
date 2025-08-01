'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface UserData {
  coins: number;
  gems: number;
  level: number;
  experience: number;
  purchasedItems: string[];
  stats: {
    hunger: number;
    happiness: number;
    energy: number;
  };
}

interface TamagotchiModePanelProps {
  userData: UserData;
  onAction: () => void;
}

export function TamagotchiModePanel({ userData, onAction }: TamagotchiModePanelProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-2 border-green-400">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🐾 Modo Tamagotchi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <div className="text-8xl mb-4">🐾</div>
            <h3 className="text-xl font-bold mb-2">Tu mascota virtual</h3>
            <p className="text-sm opacity-80">Nivel {userData.level} - Experiencia {userData.experience}/1000</p>
          </div>

          {/* 🎮 BOTONES DE ACCIÓN */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Button onClick={onAction} className="bg-green-600 hover:bg-green-700">
              🍽️ Alimentar
            </Button>
            <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
              🎾 Jugar
            </Button>
            <Button onClick={onAction} className="bg-purple-600 hover:bg-purple-700">
              🛁 Limpiar
            </Button>
            <Button onClick={onAction} className="bg-indigo-600 hover:bg-indigo-700">
              😴 Dormir
            </Button>
          </div>

          {/* 📊 ESTADÍSTICAS */}
          <Card className="bg-black/20">
            <CardHeader>
              <CardTitle>📊 Estadísticas del Tamagotchi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span>🍽️ Hambre</span>
                  <span>{userData.stats.hunger}%</span>
                </div>
                <Progress value={userData.stats.hunger} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>😊 Felicidad</span>
                  <span>{userData.stats.happiness}%</span>
                </div>
                <Progress value={userData.stats.happiness} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span>⚡ Energía</span>
                  <span>{userData.stats.energy}%</span>
                </div>
                <Progress value={userData.stats.energy} className="h-3" />
              </div>
              
              <div className="flex justify-between items-center">
                <span>💰 Monedas</span>
                <Badge variant="secondary">{userData.coins.toLocaleString()}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>💎 Gemas</span>
                <Badge variant="secondary">{userData.gems}</Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}