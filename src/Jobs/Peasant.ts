import { Job, JobEntry } from './Job'
import { Harvest } from '../Tasks/Harvest'
import { Stash } from '../Tasks/Stash'
import { Collections } from '../Memory'

type PeasantEntry = JobEntry & { room: string; source: null | Id<Source> }
export class Peasant extends Job<PeasantEntry, Harvest | Stash> {
  public type: 'peasant' = 'peasant'
  public source: null | Source
  public body = [WORK, MOVE, CARRY]

  public load(memory: PeasantEntry): void {
    super.load(memory)
    this.source = memory.source ? Game.getObjectById(memory.source) : null
  }
  public save(): PeasantEntry {
    const memory = super.save()
    memory.source = this.source?.id || null
    return memory
  }

  protected getNextTask(finishedTask?: Harvest | Stash): Harvest | Stash {
    switch (finishedTask?.type) {
      case 'harvest':
        return this.getStashTask()
      case 'stash':
        if (this.creep.store.getUsedCapacity() !== 0) return this.getStashTask()
        return this.getHarvestTask()
      default:
        return this.getHarvestTask()
    }
  }
  private getHarvestTask(): Harvest {
    const harvest = Collections.tasks.create('harvest', Collections.tasks.ID()) as Harvest
    harvest.source = this.source
    harvest.job = this
    return harvest
  }
  private getStashTask(): Stash {
    const stash = Collections.tasks.create('stash', Collections.tasks.ID()) as Stash
    const target = this.getStashTarget()
    stash.target = target || null
    stash.job = this
    return stash
  }

  private getStashTarget(): void | AnyStoreStructure {
    const spawns = this.room.find(FIND_MY_SPAWNS, { filter: spawn => spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0 })
    if (spawns.length) return spawns[0]
    const extensions = this.room
      .find(FIND_MY_STRUCTURES, { filter: { structureType: STRUCTURE_EXTENSION } })
      .filter(ext => ext.structureType === STRUCTURE_EXTENSION && ext.store.getFreeCapacity(RESOURCE_ENERGY) > 0)
    if (extensions.length) return extensions[0] as AnyStoreStructure
    const storages = this.room
      .find(FIND_STRUCTURES)
      .filter(s => s.structureType === STRUCTURE_STORAGE || s.structureType === STRUCTURE_CONTAINER)
    if (storages.length) return storages[0] as AnyStoreStructure
  }

  public update(): void {
    if (!this.source) this.source = this.creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE)

    super.update()
  }
  public run(): void {
    if (this.spawning) return
    super.run()
  }
}
