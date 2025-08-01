'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface ProStorePanelProps {
  userData: UserData;
  onBuyItem: (itemId: string) => void;
}

export function ProStorePanel({ userData, onBuyItem }: ProStorePanelProps) {
  const items = [
    {
      id: 'color_blue',
      name: 'Color Azul',
      description: 'Cambia el color de tu mascota a azul',
      icon: '🎨',
      price: 100,
      type: 'color',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'color_red',
      name: 'Color Rojo',
      description: 'Cambia el color de tu mascota a rojo',
      icon: '🎨',
      price: 150,
      type: 'color',
      color: 'from-red-600 to-pink-600'
    },
    {
      id: 'color_green',
      name: 'Color Verde',
      description: 'Cambia el color de tu mascota a verde',
      icon: '🎨',
      price: 200,
      type: 'color',
      color: 'from-green-600 to-emerald-600'
    },
    {
      id: 'background_space',
      name: 'Fondo Espacial',
      description: 'Fondo con estrellas y galaxias',
      icon: '🌌',
      price: 300,
      type: 'background',
      color: 'from-indigo-600 to-purple-600'
    },
    {
      id: 'background_forest',
      name: 'Fondo Bosque',
      description: 'Fondo natural con árboles',
      icon: '🌲',
      price: 250,
      type: 'background',
      color: 'from-green-600 to-teal-600'
    },
    {
      id: 'crown',
      name: 'Corona Real',
      description: 'Accesorio exclusivo para tu mascota',
      icon: '👑',
      price: 500,
      type: 'accessory',
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'xp_boost',
      name: 'Boost XP',
      description: 'Duplica la experiencia ganada por 1 hora',
      icon: '⭐',
      price: 200,
      type: 'boost',
      color: 'from-purple-600 to-pink-600'
    }
  ];

  const isPurchased = (itemId: string) => {
    return userData.purchasedItems.includes(itemId);
  };

  const canAfford = (price: number) => {
    return userData.coins >= price;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="text-center text-2xl">🛒 Tienda Pro</CardTitle>
          <p className="text-center opacity-80">¡Compra mejoras para tu mascota!</p>
        </CardHeader>
      </Card>

      {/* 💰 BALANCE */}
      <Card className="bg-black/20">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg">
                💰 {userData.coins.toLocaleString()} monedas
              </Badge>
              <Badge variant="secondary" className="text-lg">
                💎 {userData.gems} gemas
              </Badge>
            </div>
            <div className="text-sm opacity-80">
              Nivel {userData.level}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🛒 GRID DE ITEMS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id} className={`bg-gradient-to-br ${item.color} border-2 border-white/20 hover:border-white/40 transition-all duration-300`}>
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-sm opacity-80 mb-4">{item.description}</p>
              
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="text-xs">
                  💰 {item.price} monedas
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {item.type.toUpperCase()}
                </Badge>
              </div>
              
              <Button 
                onClick={() => onBuyItem(item.id)}
                disabled={isPurchased(item.id) || !canAfford(item.price)}
                className={`w-full ${
                  isPurchased(item.id) 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : canAfford(item.price)
                    ? 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPurchased(item.id) ? '✅ Comprado' : canAfford(item.price) ? '🛒 Comprar' : '❌ Sin fondos'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 📊 INFORMACIÓN */}
      <Card className="bg-black/20">
        <CardHeader>
          <CardTitle>📊 Información de la Tienda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold mb-2">🎨 Tipos de Items:</h4>
              <ul className="space-y-1 text-sm">
                <li>• <strong>COLOR:</strong> Cambia el color de tu mascota</li>
                <li>• <strong>BACKGROUND:</strong> Cambia el fondo del juego</li>
                <li>• <strong>ACCESSORY:</strong> Agrega accesorios especiales</li>
                <li>• <strong>BOOST:</strong> Mejoras temporales</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">💰 Cómo Ganar Monedas:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Jugar minijuegos en Retro Arcade</li>
                <li>• Cuidar tu Tamagotchi</li>
                <li>• Completar logros</li>
                <li>• Subir de nivel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}