import { Job, JobEntry } from './Job'
import { Load } from '../Tasks/Load'
import { Upgrade } from '../Tasks/Upgrade'
import { Collections } from '../Memory'
import { Harvest } from '../Tasks/Harvest'

type UpgraderEntry = JobEntry & { room: string }
export class Upgrader extends Job<UpgraderEntry, Upgrade | Load | Harvest> {
  public type: 'upgrader' = 'upgrader'
  public room: Room
  public body = [WORK, MOVE, CARRY]

  public load(memory: UpgraderEntry): void {
    super.load(memory)
    this.room = Game.rooms[memory.room]
  }
  public save(): UpgraderEntry {
    const memory = super.save()
    memory.room = this.room.name
    return memory
  }

  protected getNextTask(finishedTask?: Upgrade | Load | Harvest): Upgrade | Load | Harvest {
    const type = finishedTask?.type
    switch (type) {
      case 'load':
      case 'harvest':
        if (this.creep.store.getFreeCapacity() !== 0) return this.getLoadOrHarvestTask()
        return this.getUpgradeTask()
      default:
        return this.getLoadOrHarvestTask()
    }
  }

  private getLoadOrHarvestTask(): Harvest | Load {
    const storage = this.getStorage()
    if (storage) return this.getLoadTask()
    return this.getHarvestTask()
  }

  private getHarvestTask(): Harvest {
    const harvest = Collections.tasks.create('harvest', Collections.tasks.ID()) as Harvest
    harvest.job = this
    return harvest
  }
  private getLoadTask(): Load {
    const load = Collections.tasks.create('load', Collections.tasks.ID()) as Load
    load.storage = this.getStorage()
    load.job = this
    return load
  }
  private getUpgradeTask(): Upgrade {
    const upgrade = Collections.tasks.create('upgrade', Collections.tasks.ID()) as Upgrade
    upgrade.room = this.room
    upgrade.job = this
    return upgrade
  }

  private getStorage(): null | AnyStoreStructure {
    const storages = this.room
      .find(FIND_STRUCTURES)
      .filter(s => s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER)
    if (storages.length) return storages[0] as AnyStoreStructure
    const extensions = this.room
      .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
      .filter(ext => ext.structureType === STRUCTURE_EXTENSION && ext.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
    if (extensions.length) return extensions[0] as AnyStoreStructure
    return null
  }

  public update(): void {
    if (this.spawning) return
    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}
