'use client'

/**
 * 🎮 SERVICIO DE PERSISTENCIA ROBUSTO PARA POU ÉPICO
 * Sistema de guardado automático con recuperación de errores
 */

interface GameData {
  version: string
  timestamp: number
  pet: any
  gameScores: any[]
  companionPets: string[]
  unlockedPets: string[]
  currentAvatarId: number
  currentScenarioId: number
  currentTheme: string
  achievements: any[]
  ownedItems: string[]
  playerInventory: any[]
  lastPlayedTimestamp: number
}

interface BackupData {
  primary: GameData | null
  backup1: GameData | null
  backup2: GameData | null
  backup3: GameData | null
}

class PersistenceService {
  private static instance: PersistenceService
  private readonly CURRENT_VERSION = '1.0.0'
  private readonly PRIMARY_KEY = 'epic-pou-game-data'
  private readonly BACKUP_KEY = 'epic-pou-backup-data'
  private readonly AUTOSAVE_INTERVAL = 30000 // 30 segundos

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService()
    }
    return PersistenceService.instance
  }

  /**
   * 🎮 GUARDAR DATOS CON SISTEMA DE BACKUP
   */
  public async saveGameData(data: Partial<GameData>): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      const currentData = this.loadGameData()
      const gameData: GameData = {
        version: this.CURRENT_VERSION,
        timestamp: Date.now(),
        pet: data.pet || currentData.pet,
        gameScores: data.gameScores || currentData.gameScores,
        companionPets: data.companionPets || currentData.companionPets,
        unlockedPets: data.unlockedPets || currentData.unlockedPets,
        currentAvatarId: data.currentAvatarId || currentData.currentAvatarId,
        currentScenarioId: data.currentScenarioId || currentData.currentScenarioId,
        currentTheme: data.currentTheme || currentData.currentTheme,
        achievements: data.achievements || currentData.achievements,
        ownedItems: data.ownedItems || currentData.ownedItems,
        playerInventory: data.playerInventory || currentData.playerInventory,
        lastPlayedTimestamp: Date.now()
      }

      // Validar datos antes de guardar
      if (!this.validateGameData(gameData)) {
        console.error('❌ Datos de juego inválidos, no se guardaron')
        return false
      }

      // Guardar en slot principal
      localStorage.setItem(this.PRIMARY_KEY, JSON.stringify(gameData))

      // Crear/actualizar backups
      this.createBackup(gameData)

      console.log('✅ Datos guardados correctamente')
      return true
    } catch (error) {
      console.error('❌ Error al guardar datos:', error)
      return false
    }
  }

  /**
   * 🎮 CARGAR DATOS CON RECUPERACIÓN AUTOMÁTICA
   */
  public loadGameData(): GameData {
    if (typeof window === 'undefined') {
      return this.getDefaultGameData()
    }

    try {
      // Intentar cargar datos principales
      const primaryData = localStorage.getItem(this.PRIMARY_KEY)
      if (primaryData) {
        const parsed = JSON.parse(primaryData)
        if (this.validateGameData(parsed)) {
          console.log('✅ Datos principales cargados correctamente')
          return parsed
        } else {
          console.warn('⚠️ Datos principales corruptos, intentando backup...')
        }
      }

      // Si fallan los datos principales, intentar backups
      const recoveredData = this.recoverFromBackup()
      if (recoveredData) {
        console.log('✅ Datos recuperados desde backup')
        // Restaurar datos principales
        localStorage.setItem(this.PRIMARY_KEY, JSON.stringify(recoveredData))
        return recoveredData
      }

      console.warn('⚠️ No se pudieron recuperar datos, usando valores por defecto')
      return this.getDefaultGameData()
    } catch (error) {
      console.error('❌ Error al cargar datos:', error)
      return this.getDefaultGameData()
    }
  }

  /**
   * 🎮 CREAR BACKUP ROTATIVO (mantiene 3 backups)
   */
  private createBackup(gameData: GameData): void {
    try {
      const backupDataString = localStorage.getItem(this.BACKUP_KEY)
      let backupData: BackupData = {
        primary: null,
        backup1: null,
        backup2: null,
        backup3: null
      }

      if (backupDataString) {
        backupData = JSON.parse(backupDataString)
      }

      // Rotar backups (3 -> 2 -> 1 -> primary)
      backupData.backup3 = backupData.backup2
      backupData.backup2 = backupData.backup1
      backupData.backup1 = backupData.primary
      backupData.primary = gameData

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData))
    } catch (error) {
      console.error('❌ Error al crear backup:', error)
    }
  }

  /**
   * 🎮 RECUPERAR DESDE BACKUP
   */
  private recoverFromBackup(): GameData | null {
    try {
      const backupDataString = localStorage.getItem(this.BACKUP_KEY)
      if (!backupDataString) return null

      const backupData: BackupData = JSON.parse(backupDataString)
      
      // Intentar cada backup en orden
      const backups = [backupData.primary, backupData.backup1, backupData.backup2, backupData.backup3]
      
      for (const backup of backups) {
        if (backup && this.validateGameData(backup)) {
          return backup
        }
      }

      return null
    } catch (error) {
      console.error('❌ Error al recuperar backup:', error)
      return null
    }
  }

  /**
   * 🎮 VALIDAR INTEGRIDAD DE DATOS
   */
  private validateGameData(data: any): boolean {
    try {
      if (!data || typeof data !== 'object') return false
      
      // Verificar campos obligatorios
      const requiredFields = ['version', 'timestamp', 'pet']
      for (const field of requiredFields) {
        if (!(field in data)) return false
      }

      // Verificar estructura del pet
      if (!data.pet || typeof data.pet !== 'object') return false
      if (!data.pet.name || !data.pet.stats) return false

      // Verificar que los stats sean números válidos
      const stats = data.pet.stats
      const statFields = ['hunger', 'happiness', 'energy', 'cleanliness', 'health']
      for (const stat of statFields) {
        if (typeof stats[stat] !== 'number' || stats[stat] < 0 || stats[stat] > 100) {
          return false
        }
      }

      // Verificar arrays
      if (!Array.isArray(data.gameScores)) return false
      if (!Array.isArray(data.companionPets)) return false
      if (!Array.isArray(data.unlockedPets)) return false

      return true
    } catch (error) {
      return false
    }
  }

  /**
   * 🎮 DATOS POR DEFECTO
   */
  private getDefaultGameData(): GameData {
    return {
      version: this.CURRENT_VERSION,
      timestamp: Date.now(),
      pet: {
        name: 'Mi Pou Épico',
        color: '#FF6B9D',
        level: 1,
        experience: 0,
        experienceToNext: 100,
        coins: 1000,
        gems: 50,
        accessories: ['crown'],
        background: 'gradient-1',
        stats: {
          hunger: 100,
          happiness: 100,
          energy: 100,
          cleanliness: 100,
          health: 100
        },
        mood: 'happy',
        personality: 'playful',
        lastPlayed: new Date().toISOString(),
        achievements: []
      },
      gameScores: [],
      companionPets: ['perro'],
      unlockedPets: ['perro'],
      currentAvatarId: 1,
      currentScenarioId: 1,
      currentTheme: 'default',
      achievements: [],
      ownedItems: ['basic_food'],
      playerInventory: [],
      lastPlayedTimestamp: Date.now()
    }
  }

  /**
   * 🎮 MIGRAR VERSIONES
   */
  public migrateData(data: any): GameData {
    if (!data.version) {
      // Migrar desde versión antigua
      console.log('🔄 Migrando datos desde versión antigua...')
      
      const migratedData = this.getDefaultGameData()
      
      // Preservar datos existentes si son válidos
      if (data.pet && typeof data.pet === 'object') {
        migratedData.pet = { ...migratedData.pet, ...data.pet }
      }
      
      if (Array.isArray(data.gameScores)) {
        migratedData.gameScores = data.gameScores
      }
      
      return migratedData
    }

    // Aquí se pueden agregar más migraciones para versiones futuras
    return data
  }

  /**
   * 🎮 INICIAR GUARDADO AUTOMÁTICO
   */
  public startAutoSave(dataProvider: () => Partial<GameData>): void {
    if (typeof window === 'undefined') return

    setInterval(() => {
      try {
        const data = dataProvider()
        this.saveGameData(data)
      } catch (error) {
        console.error('❌ Error en guardado automático:', error)
      }
    }, this.AUTOSAVE_INTERVAL)

    console.log('✅ Guardado automático iniciado')
  }

  /**
   * 🎮 EXPORTAR DATOS PARA BACKUP MANUAL
   */
  public exportGameData(): string {
    const data = this.loadGameData()
    return JSON.stringify(data, null, 2)
  }

  /**
   * 🎮 IMPORTAR DATOS DESDE BACKUP MANUAL
   */
  public async importGameData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData)
      if (this.validateGameData(data)) {
        return await this.saveGameData(data)
      }
      return false
    } catch (error: any) {
      console.error('❌ Error al importar datos:', error)
      return false
    }
  }

  /**
   * 🎮 LIMPIAR DATOS (RESET COMPLETO)
   */
  public clearAllData(): void {
    if (typeof window === 'undefined') return

    localStorage.removeItem(this.PRIMARY_KEY)
    localStorage.removeItem(this.BACKUP_KEY)
    
    // Limpiar también datos individuales del localStorage
    const keysToRemove = [
      'epic-pou-pet',
      'epic-pou-scores',
      'epic-pou-companions',
      'epic-pou-unlocked-pets',
      'epic-pou-avatar',
      'epic-pou-scenario',
      'epic-pou-theme',
      'epic-pou-last-played'
    ]
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    console.log('🗑️ Todos los datos han sido eliminados')
  }

  /**
   * 🎮 OBTENER ESTADÍSTICAS DE ALMACENAMIENTO
   */
  public getStorageStats(): object {
    if (typeof window === 'undefined') return {}

    try {
      const primarySize = localStorage.getItem(this.PRIMARY_KEY)?.length || 0
      const backupSize = localStorage.getItem(this.BACKUP_KEY)?.length || 0
      
      return {
        primaryDataSize: primarySize,
        backupDataSize: backupSize,
        totalSize: primarySize + backupSize,
        lastSaved: this.loadGameData().timestamp,
        hasBackups: backupSize > 0
      }
    } catch (error: any) {
      return { error: error?.message || 'Error desconocido' }
    }
  }
}

// Exportar instancia singleton
export const persistenceService = PersistenceService.getInstance()
export default persistenceService