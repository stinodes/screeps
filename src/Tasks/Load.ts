import { Task, TaskEntry } from './Task'

type LoadEntry = TaskEntry & {
  storage: Id<AnyStoreStructure> | null
}

export class Load extends Task<LoadEntry> {
  public type = 'load'
  public storage: null | AnyStoreStructure
  public emoji = '🚚'

  public load(memory: LoadEntry): void {
    super.load(memory)
    this.storage = memory.storage ? Game.getObjectById(memory.storage) : null
  }
  public save(): LoadEntry {
    const memory = super.save()
    memory.storage = this.storage?.id || null
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    const storage = this.storage
    if (!creep || creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0)
      return true
    if (!storage) return true

    if ((storage.store as GenericStore).getUsedCapacity(RESOURCE_ENERGY) === 0)
      return true
    if (
      storage.structureType === STRUCTURE_SPAWN &&
      storage.store.getUsedCapacity(RESOURCE_ENERGY) < 10
    )
      return true

    return false
  }

  public run(): void {
    if (!this.storage) return

    const result = this.withdraw(this.storage)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.storage.pos)
  }
}
