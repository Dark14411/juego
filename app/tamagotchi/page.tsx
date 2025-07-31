import TamagotchiPet from '@/components/tamagotchi-pet'

export default function TamagotchiPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            🎮 Tamagotchi Virtual
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Cuida de tu mascota digital como en los clásicos Tamagotchi
          </p>
        </div>
        
        <TamagotchiPet />
      </div>
    </div>
  )
} 