import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Build } from '../Tasks/Build'
import { Collections } from '../Memory'
import { Harvest } from '../Tasks/Harvest'
import { Upgrade } from '../Tasks/Upgrade'

type BuilderEntry = JobEntry & { room: string; construction: string; storage: string }
export class Builder extends Job<BuilderEntry, Build | Upgrade | Load | Harvest> {
  public type: 'builder' = 'builder'
  public construction: null | ConstructionSite
  public storage: null | AnyStoreStructure
  public room: Room
  public body = [WORK, MOVE, CARRY]

  public load(memory: BuilderEntry): void {
    super.load(memory)
    this.construction = Game.getObjectById(memory.construction)
    this.room = Game.rooms[memory.room]
  }
  public save(): BuilderEntry {
    const memory = super.save()
    memory.construction = this.construction?.id || ''
    memory.room = this.room.name
    return memory
  }

  protected getNextTask(finishedTask?: Build | Upgrade | Load | Harvest): Build | Upgrade | Load | Harvest {
    const type = finishedTask?.type
    switch (type) {
      case 'load':
      case 'harvest': {
        if (!this.construction) {
          return this.getUpgradeTask()
        }
        return this.getBuildTask()
      }
      case 'build':
      case 'upgrade':
      default: {
        if (!this.storage) {
          return this.getHarvestTask()
        }
        return this.getLoadTask()
      }
    }
  }

  private getHarvestTask(): Harvest {
    const harvest = Collections.tasks.create('harvest', Collections.tasks.ID()) as Harvest
    harvest.job = this
    return harvest
  }
  private getLoadTask(): Load {
    const load = Collections.tasks.create('load', Load.ID()) as Load
    const store = this.storage
    load.store = store
    load.job = this
    return load
  }
  private getUpgradeTask(): Upgrade {
    const upgrade = Collections.tasks.create('upgrade', Upgrade.ID()) as Upgrade
    upgrade.job = this
    return upgrade
  }
  private getBuildTask(): Build {
    const build = Collections.tasks.create('build', Build.ID()) as Build
    build.construction = this.construction
    build.job = this
    return build
  }

  private getBuildTarget(): null | ConstructionSite {
    const constructionSites = this.room.find(FIND_MY_CONSTRUCTION_SITES)
    return constructionSites[0] || null
  }

  private getStorage(): null | AnyStoreStructure {
    const storages = this.room
      .find(FIND_STRUCTURES)
      .filter(
        s =>
          (s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER) &&
          s.store.getUsedCapacity() !== 0
      )
    if (storages.length) return storages[0] as AnyStoreStructure
    const extensions = this.room
      .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
      .filter(ext => ext.structureType === STRUCTURE_EXTENSION && ext.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    if (extensions.length) return extensions[0] as AnyStoreStructure
    return null
  }

  public update(): void {
    if (this.spawning) return
    if (this.storage && (this.storage.store as Store<RESOURCE_ENERGY, false>).getUsedCapacity() === 0)
      this.storage = null
    if (!this.storage) this.storage = this.getStorage()
    if (!this.construction) this.construction = this.getBuildTarget()
    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}
