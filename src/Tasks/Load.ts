import { Task, TaskEntry } from './Task'

type LoadEntry = TaskEntry & {
  storage: string
}

export class Load extends Task<LoadEntry> {
  public type = 'load'
  public storage: null | AnyStoreStructure

  public load(memory: LoadEntry): void {
    super.load(memory)
    this.storage = Game.getObjectById(memory.storage)
  }
  public save(): LoadEntry {
    const memory = super.save()
    memory.storage = this.storage?.id || ''
    return memory
  }

  public getIsFinished(): boolean {
    const creep = this.creep
    const storage = this.storage
    if (!creep || creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) return true
    if (!storage || (storage.store as Store<RESOURCE_ENERGY, false>).getUsedCapacity() === 0) return true
    return false
  }

  public run(): void {
    if (!this.storage) return

    const result = this.withdraw(this.storage)
    if (result === ERR_NOT_IN_RANGE) this.moveToTarget(this.storage.pos)
  }
}
